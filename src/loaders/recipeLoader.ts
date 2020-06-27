import DataLoader from 'dataloader'
import { Recipe } from '../entity/Recipe'

const formatRecipes = async (recipes: Recipe[], ids: (string | number)[]) => {
  const recipeMap: { [key: string]: Recipe } = {}
  recipes.forEach((recipe: Recipe) => {
    recipeMap[recipe.id] = recipe
  })
  return ids.map((id: string | number) => recipeMap[id])
}

const batchRecipes = async (ids: any) => {
  try {
    const recipes = await Recipe.findByIds(ids)
    return formatRecipes(recipes, ids)
  } catch (err) {
    throw new Error('There was an error getting the recipes.')
  }
}

export const recipeLoader = () => new DataLoader<string, Recipe>(batchRecipes)
