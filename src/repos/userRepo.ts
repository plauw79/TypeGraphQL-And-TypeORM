import { EntityRepository, Repository, getConnection } from 'typeorm'
import { User } from '../entity/User'

@EntityRepository(User)
export class UserRepo extends Repository<User> {
  //### QUERIES ###############################################
  async users() {
    return await this.find({ relations: ['profile'] })
  }

  async userFindIdByEmail({ email }: Partial<User>) {
    const user = await this.findOne({
      where: { email },
      select: ['id'],
    })
    return user
  }

  //### MUTATIONS ###############################################
  async createUser({ id, ...data }: Partial<User>) {
    let user = await this.save({
      id,
      ...data,
    })
    return user
  }

  async deleteUser({ email }: Partial<User>) {
    this.delete({ email })
    return null
  }

  async setLoggedInStatus({ id, loggedInStatus }: Partial<User>) {
    let userQB = await getConnection()
      .getRepository(User)
      .createQueryBuilder('user')
      .update(User)
      .set({ loggedInStatus })
      .where({ id: id })
      .execute()
    return userQB
  }

  // async getProfile({ id }: Partial<User>) {
  //   let profileQB = await getConnection()
  //     .getRepository(User)
  //     .createQueryBuilder('user')
  //     .leftJoinAndSelect('user.profile', 'profile')
  //     .where({ id: id })
  //     .getMany()
  //   return profileQB
  // }
}
