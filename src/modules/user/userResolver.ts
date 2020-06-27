import {
  Resolver,
  Arg,
  Query,
  Mutation,
  Ctx,
  UseMiddleware,
} from 'type-graphql'
import { InjectRepository } from 'typeorm-typedi-extensions'
// import * as argon2 from 'argon2'
import * as bcrypt from 'bcryptjs'

import { User } from '../../entity/User'
import { UserRepo } from '../../repos/userRepo'
import { Error } from '../../entity/_authTypes'
import * as validations from '../../helpers/validations'
import { formatYupError } from '../../helpers/validations'
import { Context } from '../../types/context'
import { formatResponse } from '../../utils/formatResponse'
import { Response } from '../../entity/_responseTypes'
import { isAuth } from '../auth/isAuth'
import { isAdmin } from '../auth/isAdmin'

@Resolver(User)
export class UserResolver {
  constructor(
    @InjectRepository(UserRepo)
    private readonly userRepo: UserRepo
  ) {}

  // @Query(() => User, { nullable: true, complexity: 5 })
  @UseMiddleware(isAuth, isAdmin)
  @Query(() => User, { nullable: true })
  async userById(
    @Arg('userId') userId: string,
    @Ctx() { userLoader }: Context
  ): Promise<User | undefined> {
    // return this.userRepo.findOne({ where: { id: userId } })
    const user = await userLoader.load(userId)
    return user
  }

  @UseMiddleware(isAuth, isAdmin)
  @Query(() => [User], { nullable: true })
  async users(): Promise<User[] | undefined> {
    return this.userRepo.users()
  }

  @UseMiddleware(isAuth, isAdmin)
  @Mutation(() => [Error], { nullable: true })
  async adminDeleteUser(@Arg('email') email: string): Promise<[Error] | null> {
    if (!email) {
      formatResponse(
        new Response(
          'adminDeleteUser',
          `no user exists with this email ${email}`
        )
      )
      return [
        {
          path: 'adminDeleteUser',
          message: 'no user exists with this email',
        },
      ]
    }
    await this.userRepo.delete({ email })
    return null
  }

  @UseMiddleware(isAuth, isAdmin)
  @Mutation(() => [Error], { nullable: true })
  async adminUpdatePassword(
    @Arg('email') email: string,
    @Arg('newPassword') newPassword: string
  ): Promise<[Error] | Error[] | null> {
    if (!email) {
      formatResponse(
        new Response('adminUpdatePassword', `no user exists with this ${email}`)
      )
      return [
        {
          path: 'adminUpdatePassword',
          message: 'no user exists with this email',
        },
      ]
    }

    try {
      await validations.changePasswordSchema.validate(
        { newPassword },
        { abortEarly: false }
      )
    } catch (err) {
      return formatYupError(err)
    }

    // const hashedPassword = await argon2.hash(newPassword, { hashLength: 12 })
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    const userRepo = await this.userRepo.findOne({ email })
    await this.userRepo.save({
      ...userRepo,
      password: hashedPassword,
    })

    formatResponse(
      new Response(
        'adminUpdatePassword',
        `${email} : updated password by Admin`
      )
    )

    return null
  }

  @UseMiddleware(isAuth)
  @Mutation(() => [Error], { nullable: true })
  async updatePassword(
    @Arg('newPassword') newPassword: string,
    @Ctx() { req }: Context
  ): Promise<[Error] | Error[] | null> {
    const userId = req.session!.userId
    formatResponse(new Response('UpdatePassword', `${userId}`))

    if (!userId) {
      formatResponse(
        new Response(
          'UpdatePassword',
          `this user ${
            req.session!.userId
          } is trying to update password not their account's`
        )
      )
      return [
        {
          path: 'updatePassword',
          message: `this user ${
            req.session!.userId
          } is trying to update password not their account's`,
        },
      ]
    }

    try {
      await validations.changePasswordSchema.validate(
        { newPassword },
        { abortEarly: false }
      )
    } catch (err) {
      return formatYupError(err)
    }

    // const hashedPassword = await argon2.hash(newPassword, { hashLength: 12 })
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    const user = await this.userRepo.findOne(userId)
    await this.userRepo.save({
      ...user,
      password: hashedPassword,
    })

    const userUpdatePassword = await this.userRepo.findOne({ id: userId })

    formatResponse(
      new Response('UpdatePassword', `${userUpdatePassword?.email}`)
    )
    return null
  }
}
