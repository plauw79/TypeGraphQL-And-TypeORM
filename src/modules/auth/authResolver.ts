import { Resolver, Mutation, Arg, Query, Ctx } from 'type-graphql'
import { InjectRepository } from 'typeorm-typedi-extensions'
// import { getCustomRepository } from 'typeorm'
// import * as argon2 from 'argon2'
import * as bcrypt from 'bcryptjs'

// import { AuthYupSchema, formatYupError } from '@upfg/common'
import { Error } from '../../entity/_authTypes'
import { LoginResponse, AuthStatus } from '../../entity/_authTypes'
import { User } from '../../entity/User'
import { Context } from '../../types/context'
import { SignupInput } from './signupInput'
import { UserRepo } from '../../repos/userRepo'
import { removeAllUsersSessions } from '../../utils/removeAllUserSessions'
import { formatResponse } from '../../utils/formatResponse'
import { Response } from '../../entity/_responseTypes'
import * as constant from '../../helpers/constants'
import { ValidationResponse } from '../../entity/_validationTypes'

@Resolver(User)
export class AuthResolver {
  constructor(
    @InjectRepository(UserRepo)
    private readonly userRepo: UserRepo
  ) {}

  // userRepo = getCustomRepository(UserRepo)

  @Query(() => User, { nullable: true })
  async me(@Ctx() { req }: Context): Promise<User | undefined> {
    if (!req.session!.userId) {
      return undefined
    }
    return this.userRepo.findOne({ where: { id: req.session!.userId } })
  }

  @Query(() => AuthStatus)
  async isLoggedIn(@Ctx() ctx: Context): Promise<AuthStatus> {
    const user = await this.userRepo.findOne({
      where: { id: ctx.req.session!.userId },
    })
    // status: typeof ctx.req.session!.userId
    if (user?.loggedInStatus == true) {
      return { status: true }
    }
    return { status: false }
  }

  @Mutation(() => ValidationResponse)
  async signup(
    @Arg('email') email: string,
    @Arg('input')
    { password, ...signupInput }: SignupInput
  ): Promise<ValidationResponse | Error[]> {
    // try {
    //   await AuthYupSchema.validate(signupInput, {
    //     abortEarly: false,
    //   })
    // } catch (err) {
    //   return formatYupError(err)
    // }

    const userAlreadyExists = await this.userRepo.findOne({
      where: { email },
      select: ['id'],
    })

    if (userAlreadyExists) {
      return {
        errors: [
          formatResponse(
            new Response('email', `Signup -- ${email} -- duplicateEmail`, true)
          ),
        ],
      }
    }

    // const hashedPassword = await argon2.hash(password, {
    //   hashLength: 12,
    // })
    const hashedPassword = await bcrypt.hash(password, 12)

    await this.userRepo.createUser({
      email: email,
      password: hashedPassword,
      ...signupInput,
    })

    return {
      ok: true,
      errors: [
        formatResponse(
          new Response('authRegister:', `Admin Register ${email}`, true)
        ),
      ],
    }
  }

  @Mutation(() => LoginResponse)
  async login(
    @Arg('email') email: string,
    @Arg('password') password: string,
    @Ctx() { req, session, redis }: Context
  ): Promise<LoginResponse> {
    if (req.session!.userId) {
      formatResponse(
        new Response(
          'authLogin',
          `logged in using existing session ${req.session!.userId}`,
          false
        )
      )
    }

    const user = await this.userRepo.findOne({ where: { email } })

    if (!user) {
      return {
        errors: [
          formatResponse(
            new Response('email', `invalid User email name: ${email}`, true)
          ),
        ],
      }
    }

    // const valid = await argon2.verify(user.password, password)
    const valid = await bcrypt.compare(password, user.password)

    if (!valid) {
      return {
        errors: [
          formatResponse(
            new Response('password', `Invalid Password For: ${email} `, true)
          ),
        ],
      }
    }

    if (user.loggedInStatus == true) {
      removeAllUsersSessions(user.id, redis, session.id)
      redis.del(`${constant.userSessionIdPrefix}${user.id}`)

      this.userRepo.setLoggedInStatus({
        id: user.id,
        loggedInStatus: false,
      })

      formatResponse(
        new Response('authLogin', `loggedOUT-User by Automation ${user.email}`)
      )
    }

    const userRole = user.clientRole

    session!.userId = user.id

    if (req.sessionID) {
      const userId = user.id
      redis.del(`${constant.userSessionIdPrefix}${user.id}`)
      await redis.lpush(
        `${constant.userSessionIdPrefix}${userId}`,
        req.sessionID
      )
    }

    const sessionId = user.id

    await this.userRepo.setLoggedInStatus({
      id: sessionId,
      loggedInStatus: true,
    })

    formatResponse(new Response('authLogin', `loggedIN-User ${user.email}`))

    return { userRole, sessionId: req.sessionID }
  }

  @Mutation(() => AuthStatus)
  async logout(
    @Ctx() { req, res, session, redis, userLoader }: Context
  ): Promise<AuthStatus> {
    const { userId } = session
    try {
      const existingSession = await userLoader.load(req.session!.userId)

      if (userId) {
        if (existingSession?.loggedInStatus == true) {
          removeAllUsersSessions(userId, redis, session.id)
          session.destroy((err) => {
            if (err) {
              formatResponse(
                new Response('authLogout ', `loggedOUT-User: ${err}`, true)
              )
            }
          })
          res.clearCookie('sessionId')

          const loggedOutUser = await this.userRepo.findOne({
            where: { id: userId },
          })

          this.userRepo.setLoggedInStatus({
            id: loggedOutUser?.id,
            loggedInStatus: false,
          })

          formatResponse(
            new Response(
              'authLogout',
              `loggedOUT-User: ${loggedOutUser?.email}`
            )
          )

          return { status: false }
        }
      }
    } catch (err) {
      formatResponse(new Response('authLogout', `logout error: ${err}`, true))
    }
    return { status: true }
  }
}

// import { Resolver, Mutation, Arg, Query, Ctx } from 'type-graphql'
// import { SignupInput } from './shared/signupInput'
// import * as argon2 from 'argon2'

// import { Error } from './shared/authTypes'
// import { User } from '../../entity/User'
// import { Context } from '../../types/context'

// @Resolver()
// export class AuthResolver {
//   @Query(() => User, { nullable: true, complexity: 5 })
//   async me(@Ctx() ctx: Context): Promise<User | undefined> {
//     if (!ctx.req.session!.userId) {
//       return undefined
//     }
//     return User.findOne(ctx.req.session!.userId)
//   }

//   @Mutation(() => [Error!], { nullable: true })
//   async signup(
//     @Arg('data')
//     { password, fullname, email, serverRole, clientRole }: SignupInput
//   ): Promise<null> {
//     {
//       const hashedPassword = await argon2.hash(password, { hashLength: 12 })

//       const register = await User.create({
//         password: hashedPassword,
//         fullname,
//         email,
//         serverRole,
//         clientRole
//       }).save()

//       console.log({ 'register User': register })

//       return null
//     }
//   }
// }
