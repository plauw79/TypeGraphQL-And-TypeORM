import DataLoader from 'dataloader'
import { User } from '../entity/User'

type BatchUser = (ids: any) => Promise<User[]>

const batchUsers: BatchUser = async (ids) => {
  const users = await User.findByIds(ids)

  const userMap: { [key: string]: User } = {}
  users.forEach((u) => {
    userMap[u.id] = u
  })

  return ids.map((id: string | number) => userMap[id])
}

export const userLoader = () => new DataLoader<string, User>(batchUsers)
