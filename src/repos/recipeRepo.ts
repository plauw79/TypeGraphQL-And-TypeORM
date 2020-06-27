import { EntityRepository, Repository, getConnection } from 'typeorm'

import { Recipe } from '../entity/Recipe'

@EntityRepository(Recipe)
export class RecipeRepo extends Repository<Recipe> {
  //### QUERIES ###############################################
  async recipeById({ id }: Partial<Recipe>) {
    return await this.findOne(id)
  }

  async recipeFindIdByTitle({ title }: Partial<Recipe>) {
    const recipeId = await this.findOne({
      where: { title },
      select: ['id'],
    })
    return recipeId
  }

  async recipeSearchQB() {
    let recipeSearchQB = getConnection()
      .getRepository(Recipe)
      .createQueryBuilder('r')
    return recipeSearchQB
  }

  //### MUTATIONS ###############################################
  async createRecipe({ id, ...data }: Partial<Recipe>) {
    let recipe = await this.save({
      id,
      ...data,
    })
    return recipe
  }

  async deleteRecipe({ title }: Partial<Recipe>) {
    this.delete({ title })
    return null
  }
}
