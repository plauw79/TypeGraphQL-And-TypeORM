import { EntityRepository, Repository, getConnection } from 'typeorm'
import { Profile } from '../entity/Profile'
import { User } from '../entity/User'

@EntityRepository(Profile)
export class ProfileRepo extends Repository<Profile> {
  //### QUERIES ###############################################
  async userProfileQuery() {
    let userProfileQB = await getConnection()
      .getRepository(User)
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.profile', 'profile')
      .getMany()
    return userProfileQB
  }

  //### MUTATIONS ###############################################
  //   async createRecipe({ id, ...data }: Partial<Recipe>) {
  //     let recipe = await this.save({
  //       id,
  //       ...data,
  //     })
  //     return recipe
  //   }
  // async setLoggedInStatus({ id, loggedInStatus }: Partial<User>) {
  //   let userQB = await getConnection()
  //     .getRepository(User)
  //     .createQueryBuilder('user')
  //     .update(User)
  //     .set({ loggedInStatus })
  //     .where({ id: id })
  //     .execute()
  //   return userQB
  // }
}
