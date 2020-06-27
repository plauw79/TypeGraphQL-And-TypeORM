import { Request, Response } from 'express'
// import { createAuthorsLoader } from '../utils/authorsLoader'
import { Redis } from 'ioredis'
import { userLoader } from '../loaders/userLoader'

export interface Session extends Express.Session {
  userId?: string
}

export interface Context {
  req: Request
  res: Response
  url: string
  session: Session
  redis: Redis
  userLoader: ReturnType<typeof userLoader>
  //   authorsLoader: ReturnType<typeof createAuthorsLoader>
}
