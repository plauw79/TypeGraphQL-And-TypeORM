import 'reflect-metadata'
import 'dotenv/config'

import chalk from 'chalk'

import Redis from 'ioredis'
import Listr from 'listr'
import ms from 'ms'
import cors from 'cors'
import express from 'express'
import session from 'express-session'
import connectRedis from 'connect-redis'
import passport from 'passport'

import * as path from 'path'
import * as fs from 'fs'
import * as http from 'http'
import * as TypeORM from 'typeorm'
import morgan from 'morgan'
import { ApolloServer } from 'apollo-server-express'
import { RedisPubSub } from 'graphql-redis-subscriptions'
import { graphqlUploadExpress } from 'graphql-upload'
import { Container } from 'typedi'
import { Observable } from 'rxjs'

import logger from './utils/winstonMorganLogger'
import * as constants from './helpers/constants'
import { createSchema } from './utils/createSchema'
import { UserRepo } from './repos/userRepo'
import { User } from './entity/User'
import { Recipe } from './entity/Recipe'
import { AddTodo } from './entity/AddTodo'
import { Profile } from './entity/Profile'
import { userLoader } from './loaders/userLoader'

const isProduction = process.env.NODE_ENV === 'production'
const isTest = process.env.NODE_ENV === 'test'
const isDevelopment = process.env.NODE_ENV === 'development'

const webUrl = `${process.env.WEBPROTO}://${process.env.WEBHOST}:${process.env.WEBPORT}`
const webUrl2 = `${process.env.WEBPROTO2}://${process.env.WEBHOST2}:${process.env.WEBPORT2}${process.env.URL2}`
const GoogleStrategy = require('passport-google-oauth20').Strategy

const RedisStore = connectRedis(session as any)
const pubsub = new RedisPubSub(
  isProduction
    ? {
        connection: process.env.REDIS_URL as any,
      }
    : { connection: process.env.REDIS_URL as any }
)

// register 3rd party IOC container
TypeORM.useContainer(Container)

const startServer = new Listr(
  [
    {
      title: 'Database TypeOrm Connection to PSQL',
      task: async () => {
        if (isProduction) {
          const connectionOptions = await TypeORM.getConnectionOptions(
            process.env.NODE_ENV
          )
          TypeORM.createConnection({
            ...connectionOptions,
            url: process.env.DATABASE_URL,
            entities: [User, Recipe, Profile, AddTodo],
            name: 'default',
          } as any)
        } else if (isDevelopment) {
          await TypeORM.createConnection()
            .catch((e) => {
              return Promise.reject(e)
            })
            .then(() => Promise.resolve())
        }
      },
    },
    {
      title: 'Creating express app instance',
      task: (ctx: any) => {
        return new Observable((observer) => {
          observer.next('Creating ...')
          ctx.app = express()
          setTimeout(() => {
            observer.complete()
          }, 1300)
        })
      },
    },
    {
      title: 'Creating redis client instance',
      task: async (ctx: any) => {
        ctx.redis = isProduction
          ? new Redis(process.env.REDIS_URL)
          : new Redis(process.env.REDIS_URL)
      },
    },
    {
      title: 'Creating apollo server instance',
      task: async (ctx: any) =>
        Promise.resolve(
          (ctx.server = new ApolloServer({
            schema: await createSchema(),
            context: ({ req, res }: any) => ({
              req,
              res,
              session: req ? req.session : undefined,
              redis: ctx.redis,
              pubsub,
              url: req ? req.protocol + '://' + req.get('host') : '',
              userLoader: userLoader(),
            }),
            introspection: true,
            uploads: false,
            validationRules: [
              // queryComplexity({
              //   // The maximum allowed query complexity, queries above this threshold will be rejected
              //   maximumComplexity: 8,
              //   // The query variables. This is needed because the variables are not available
              //   // in the visitor of the graphql-js library
              //   variables: {},
              //   // Optional callback function to retrieve the determined query complexity
              //   // Will be invoked weather the query is rejected or not
              //   // This can be used for logging or to implement rate limiting
              //   onComplete: (complexity: number) => {
              //     console.log("Query Complexity:", complexity);
              //   },
              //   estimators: [
              //     // Using fieldConfigEstimator is mandatory to make it work with type-graphql
              //     fieldConfigEstimator(),
              //     // This will assign each field a complexity of 1 if no other estimator
              //     // returned a value. We can define the default value for field not explicitly annotated
              //     simpleEstimator({
              //       defaultComplexity: 1
              //     })
              //   ]
              // }) as any
            ],
            playground: {
              settings: {
                // put in entire setting object because of bug with Typscript and apollo-server (issue #1713)
                'general.betaUpdates': false,
                'editor.cursorShape': 'line',
                'editor.fontSize': 14,
                'editor.fontFamily':
                  "'Source Code Pro', 'Consolas', 'Inconsolata', 'Droid Sans Mono', 'Monaco', monospace",
                'editor.theme': 'dark',
                'editor.reuseHeaders': true,
                'request.credentials': 'include',
                'tracing.hideTracingResponse': true,
              },
            },
          }))
        ),
    },
    {
      title: 'Using Winston And Morgan For Logging',
      task: (ctx: any) => {
        if (isProduction) {
          var logDirectory = path.join(__dirname, '../logs')
          fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory)
          // ctx.app.use(morgan('combined', { stream: logger.stream }))
          ctx.app.use(morgan('short', { stream: logger.stream }))
          ctx.app.use(function (err: any, req: any, res: any, _next: any) {
            logger.error(logger.combinedFormat(err, req, res))
            res.status(err.status || 500).send('Internal server error.')
          })
        }
      },
    },
    {
      title: 'Using Cors',
      task: (ctx: any) => {
        // const whitelist = [process.env.CORS_WHITELISTS as string]
        ctx.app.use(
          // '*',
          cors({
            credentials: true,
            origin: isTest
              ? '*'
              : isProduction
              ? (process.env.FRONTEND_HOST as string)
              : [webUrl],
          })
        )
      },
    },
    {
      title: 'Using Express Static Path',
      task: async (ctx: any) => {
        ctx.app.use('/images', express.static('images'))
      },
    },
    {
      title: 'Using Express Session',
      task: async (ctx: any) => {
        ctx.app.use(
          session({
            store: new RedisStore({
              client: ctx.redis as any,
              prefix: constants.redisSessionPrefix,
            }),
            name: process.env.SESS_NAME as string,
            secret: process.env.SESS_SECRECT as string,
            resave: false,
            saveUninitialized: false,
            cookie: {
              httpOnly: isProduction ? true : true,
              secure: isProduction ? true : false,
              sameSite: isProduction ? 'none' : true,
              maxAge: ms(process.env.SESS_LIFETIME as string),
              path: isProduction ? '/' : '/graphql', // Done for testing resolvers in playground
            },
          })
        )
      },
    },
    {
      title: 'Using Google Passport Strategy',
      task: async (ctx: any) => {
        passport.use(
          new GoogleStrategy(
            {
              clientID: process.env.GOOGLE_clientID,
              clientSecret: process.env.GOOGLE_clientSecret,
              callbackURL: 'http://localhost:4000/auth/google/callback',
              includeEmail: true,
            },
            async (_: any, __: any, profile: any, cb: any) => {
              console.log(chalk.blue(JSON.stringify(profile)))
              const userRepo = TypeORM.getCustomRepository(UserRepo)

              const { id, emails } = profile

              let email: string | null = null

              if (emails) {
                email = emails[0].value
              }
              let user = await userRepo.findOne({ where: { email } })
              // let user = await userLoader.load(req.session!.userId)

              if (!user) {
                ;(res: any) => {
                  res.console.log('not authorised !!')
                  res.redirect('/public')
                }
              } else if (!user.googleID) {
                // merge account
                // we found user by email
                user.googleID = id
                await userRepo.save({
                  where: { email: user.email },
                  googleID: user.googleID,
                })
              }
              // else {
              //   we have a twitterId
              //   login
              // }

              return cb(null, { id: user?.id })
            }
          )
        )

        ctx.app.use(passport.initialize())
        ctx.app.get(
          '/auth/google',
          passport.authenticate('google', {
            scope: ['profile', 'email'],
          })
        )

        ctx.app.get(
          '/auth/google/callback',
          passport.authenticate('google', { session: false }),
          async (req: any, res: any) => {
            // (req.session as any).userId = (req.user as any).id;
            if (req.sessionID) {
              const userId = (req.user as any).id
              await ctx.redis.lpush(
                `${constants.userSessionIdPrefix}${userId}`,
                req.sessionID
              )
            }

            const sessionId = req.sessionID
            ;(req.session as any).userId = sessionId

            // res.sendStatus(200);
            // res.redirect(webUrl, 200);
            res.redirect(webUrl2)
          }
        )
      },
    },
    {
      title: 'Using Redis Cache',
      task: async (ctx: any) => {
        await ctx.redis.del(constants.recipeCacheKey)
        const recipes = await Recipe.find()
        const recipeStrings = recipes.map((x) => JSON.stringify(x))
        if (recipeStrings.length) {
          await ctx.redis.lpush(constants.recipeCacheKey, ...recipeStrings)
        }
      },
    },
    {
      title: 'Applying middleware to ApolloServer',
      task: (ctx: any) => {
        ctx.app.use(
          graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 })
        )
        ctx.server.applyMiddleware({
          app: ctx.app,
          path: isProduction ? '/' : '/graphql',
          cors: isProduction ? true : false,
        })
      },
    },
    {
      title: 'Applying RES header with CORS',
      task: (ctx: any) => {
        ctx.app.use(function (req: any, res: any, next: any) {
          res.header('Access-Control-Allow-Origin', req.header('Origin'))
          res.header('Access-Control-Allow-Credentials', true)
          res.header(
            'Access-Control-Allow-Headers',
            'Origin, X-Requested-With, Content-Type, Accept'
          )
          res.header(
            'Access-Control-Allow-Methods',
            'GET, POST, OPTIONS, PUT, DELETE'
          )
          next()
        })
      },
    },
    {
      title: 'Finishing Server',
      task: (ctx: any) => {
        const httpserver = http.createServer(ctx.app)
        ctx.server.installSubscriptionHandlers(httpserver)
        return new Observable((observer) => {
          observer.next('Starting ...')
          ctx.app_server = httpserver
            .listen({
              port: isTest ? 0 : isProduction ? process.env.PORT : 4000,
            })
            .setTimeout(5000, () => {
              observer.error('Server timed out')
            })
          observer.complete()
        })
      },
    },
  ],
  {
    concurrent: false,
    exitOnError: true,
  }
)

console.log(chalk.yellow('[*] Starting up server ...'))
startServer
  .run()
  .catch((err) => {
    console.log(
      chalk.yellow(
        `[${chalk.red.bold('!')}] ${chalk.red.bold('ERROR : ')} ${err}`
      )
    )
    process.exit(1)
  })
  .then((ctx) => {
    console.log(
      chalk.yellow(
        `[${chalk.green.bold('!')}] ${chalk.green.bold(
          `Server Started    \t[http://localhost:${process.env.PORT || 4000}]`
        )}`
      )
    )
    console.log(
      chalk.yellow(
        `[${chalk.magenta.bold('+')}] ${chalk.magenta.bold(
          `GraphQL Playground \t[http://localhost:${
            process.env.PORT || 4000
          }/graphql]`
        )}`
      )
    )
    console.log(
      chalk.yellow(
        `[${chalk.magenta.bold('+')}] ${chalk.magenta.bold(
          `Subscriptions Ready [ws://localhost:${process.env.PORT}${ctx.server.subscriptionsPath}]`
        )}`
      )
    )
    if (isProduction) {
      // to force express to recognize connection as HTTPS and receive cookie with 'secure' set
      ctx.app.set('trust proxy', 1)
      // disable leaking info of what server we're using
      ctx.app.disable('x-powered-by')
    }

    process.on('SIGINT', function () {
      console.log(chalk.yellow('\n[*] Caught Interruption signal'))
      ctx.app_server.close(() => {
        console.log(chalk.yellow('[*] Stopped Server...'))
        process.exit(0)
      })
    })
  })
