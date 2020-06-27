import {
  Resolver,
  Query,
  Ctx,
  Mutation,
  Arg,
  UseMiddleware,
  FieldResolver,
  Root,
} from 'type-graphql'
import { InjectRepository } from 'typeorm-typedi-extensions'
import { getConnection } from 'typeorm'
import * as fs from 'fs'

// import * as validations from '../../helpers/validations'
// import { formatYupError } from '../../helpers/validations'
// import { Error } from '../../entity/_authTypes'
import { Context } from '../../types/context'
import { formatResponse } from '../../utils/formatResponse'
import { ProfileRepo } from '../../repos/profileRepo'
import { UserRepo } from '../../repos/userRepo'
import { Response } from '../../entity/_responseTypes'
import { isAuth } from '../auth/isAuth'
import { ProfileInput } from './profileInput'
import { processUpload } from '../../utils/processUpload'
import { Profile } from '../../entity/Profile'
import { SearchProfileInput } from './searchProfileInput'
import { isAdmin } from '../auth/isAdmin'
import { avatarDir } from '../../helpers/dirExist'
import { ValidationResponse } from '../../entity/_validationTypes'

@Resolver(Profile)
export class UserProfileResolver {
  constructor(
    @InjectRepository(UserRepo)
    private readonly userRepo: UserRepo,
    @InjectRepository(ProfileRepo)
    private readonly profileRepo: ProfileRepo
  ) {}

  @FieldResolver()
  async avatarUrl(
    @Root() profile: Profile,
    @Ctx() { url }: Context
  ): Promise<any> {
    if (!profile.avatarUrl) {
      return profile.avatarUrl
    }
    if (profile.avatarUrl.includes('http')) {
      return profile.avatarUrl
    }
    return `${url}` + process.env.AVATAR_PATH + `${profile.avatarUrl}`
  }

  @UseMiddleware(isAuth)
  @Query(() => Profile, { nullable: true })
  async profileQuery(@Ctx() { req }: Context): Promise<Profile | undefined> {
    const userProfile = await this.userRepo.findOne(req.session!.userId, {
      relations: ['profile'],
    })
    formatResponse(
      new Response('profileQuery:', `profile of: ${userProfile?.email}`)
    )
    return userProfile?.profile
  }

  @UseMiddleware(isAuth, isAdmin)
  @Query(() => [Profile], { nullable: true })
  async searchProfileQuery(
    @Arg('searchInput', { nullable: true })
    { address, hobbies, owner }: SearchProfileInput,
    @Arg('limit', { nullable: true }) limit: number,
    @Arg('offset', { nullable: true }) offset: number
  ): Promise<Profile[] | undefined> {
    let profileSearchQB = getConnection()
      .getRepository(Profile)
      .createQueryBuilder('p')
    if (address) {
      profileSearchQB = profileSearchQB.andWhere('p.address ilike :address', {
        address: `%${address}%`,
      })
    }
    if (hobbies) {
      profileSearchQB = profileSearchQB.andWhere('p.hobbies ilike :hobbies', {
        hobbies: `%${hobbies}%`,
      })
    }
    if (owner) {
      profileSearchQB = profileSearchQB.andWhere('p.owner ilike :owner', {
        owner: `%${owner}%`,
      })
    }
    formatResponse(
      new Response(
        'profileSearch',
        `searchWord:( address: ${address} ) && ( hobbies: ${hobbies} ) && ( owner: ${owner} )`,
        false
      )
    )
    return profileSearchQB.take(limit).skip(offset).getMany()
  }

  @UseMiddleware(isAuth)
  @Mutation(() => ValidationResponse)
  async profileMutation(
    @Arg('profileId', { nullable: true }) profileId: string,
    @Arg('input') profileInput: ProfileInput,
    @Ctx() { req, userLoader }: Context
  ): Promise<ValidationResponse> {
    // try {
    //   await validations.ProfileYupSchema.validate(profileInput, {
    //     abortEarly: false,
    //   })
    // } catch (err) {
    //   return formatYupError(err)
    // }

    const userId = await userLoader.load(req.session!.userId)

    const userProfile = await this.userRepo.findOne(req.session!.userId, {
      relations: ['profile'],
    })

    if (userId.profileId === null) {
      const avatarUrlTemp = profileInput.avatar
        ? await processUpload(avatarDir, profileInput.avatar)
        : null
      profileInput.avatarUrl = avatarUrlTemp
      await this.profileRepo.save(profileInput)
      await this.userRepo.save({ ...userProfile, profile: profileInput })
      formatResponse(new Response('profileUpdate:', `of Null: ${userId.email}`))
      return {
        ok: true,
      }
    } else if (userId.profileId !== null) {
      if (profileId === userId.profileId) {
        let prevAvatar = profileInput.avatarUrl
        let updatedAvatar = profileInput.avatarUrl
        if (profileInput.avatar) {
          updatedAvatar = await processUpload(avatarDir, profileInput.avatar)
          if (prevAvatar === updatedAvatar) {
            prevAvatar
          } else if (prevAvatar !== updatedAvatar) {
            if (prevAvatar !== null) {
              fs.unlink(avatarDir + `${prevAvatar}`, (err) => {
                if (err) throw err
                formatResponse(
                  new Response(
                    'profileUpdate',
                    `${prevAvatar} replacedBy ${updatedAvatar}`
                  )
                )
              })
            }
            profileInput.avatarUrl = updatedAvatar
          }
        }
        await this.profileRepo.update(userProfile!.profile.id, profileInput)
        formatResponse(
          new Response('profileUpdate:', `updated: ${userProfile?.email}`)
        )
        return {
          ok: true,
        }
      }
    }

    return { ok: true }
  }
}
