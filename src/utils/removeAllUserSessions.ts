import { Redis } from 'ioredis'
import { userSessionIdPrefix, redisSessionPrefix } from '../helpers/constants'

export const removeAllUsersSessions = async (
  userId: string,
  redis: Redis,
  prevSessionId: string
) => {
  const sessionIds = await redis.lrange(
    `${userSessionIdPrefix}${userId}`,
    0,
    -1
  )

  if (sessionIds) {
    const promises = []
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < sessionIds.length; i += 1) {
      promises.push(redis.del(`${redisSessionPrefix}${sessionIds[i]}`))
    }
    await Promise.all(promises)
  }

  await redis.lrem(
    `${userSessionIdPrefix}${userId}`,
    0,
    `${userSessionIdPrefix}${prevSessionId}`
  )
}
