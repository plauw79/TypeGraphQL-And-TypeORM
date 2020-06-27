import { MiddlewareFn } from 'type-graphql'

import { Context } from '../../types/context'
import { User } from '../../entity/User'

export const isAdmin: MiddlewareFn<Context> = async ({ context }, next) => {
  const user = await User.findOne({
    where: { id: context.req.session!.userId }
  })
  if (user?.serverRole === 'CONFIRMUSER') {
    throw new Error('not admin')
  }

  return next()
}
