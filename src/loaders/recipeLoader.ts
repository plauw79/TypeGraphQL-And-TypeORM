import DataLoader from 'dataloader'
import { Recipe } from '../entity/Recipe'

type BatchRecipe = (ids: any) => Promise<Recipe[]>

const batchRecipes: BatchRecipe = async (ids) => {
  const recipes = await Recipe.findByIds(ids)

  const recipeMap: { [key: string]: Recipe } = {}
  recipes.forEach((u) => {
    recipeMap[u.id] = u
  })

  return ids.map((id: string | number) => recipeMap[id])
}

export const recipeLoader = () => new DataLoader<string, Recipe>(batchRecipes)

// type BatchUser = (ids: any) => Promise<User[]>

// const batchUsers: BatchUser = async (ids) => {
//   const users = await User.findByIds(ids)

//   const userMap: { [key: string]: User } = {}
//   users.forEach((u) => {
//     userMap[u.id] = u
//   })

//   return ids.map((id: string | number) => userMap[id])
// }

// export const userLoader = () => new DataLoader<string, User>(batchUsers)
