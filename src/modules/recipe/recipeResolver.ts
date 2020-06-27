import {
  Resolver,
  Arg,
  Query,
  Mutation,
  Ctx,
  UseMiddleware,
  FieldResolver,
  Root,
} from 'type-graphql'
import { InjectRepository } from 'typeorm-typedi-extensions'
import * as fs from 'fs'

// import { formatYupError, RecipesYupSchema } from '@upfg/common'
import { RecipeRepo } from '../../repos/recipeRepo'
import { Recipe } from '../../entity/Recipe'
import { RecipeInput } from './recipeInput'
// import { UpdateRecipeInput } from './updateRecipeInput'
import { Error } from '../../entity/_authTypes'
import { Context } from '../../types/context'
import * as constant from '../../helpers/constants'
import { formatResponse } from '../../utils/formatResponse'
import { Response } from '../../entity/_responseTypes'
import { isAuth } from '../auth/isAuth'
import { processUpload } from '../../utils/processUpload'
import { SearchRecipeInput } from './searchRecipeInput'
import { recipeDir } from '../../helpers/dirExist'
import { ValidationResponse } from '../../entity/_validationTypes'
// import { recipeLoader } from '../../loaders/recipeLoader'

@Resolver(Recipe)
export class RecipeResolver {
  constructor(
    @InjectRepository(RecipeRepo)
    private readonly recipeRepo: RecipeRepo
  ) {}

  @FieldResolver()
  async imgUrl(@Root() recipe: Recipe, @Ctx() { url }: Context): Promise<any> {
    if (!recipe.imgUrl) {
      return recipe.imgUrl
    }
    if (recipe.imgUrl.includes('http')) {
      return recipe.imgUrl
    }
    return `${url}` + process.env.RECIPE_PATH + `${recipe.imgUrl}`
  }

  @UseMiddleware(isAuth)
  @Query(() => [Recipe], { nullable: true })
  async searchRecipe(
    @Arg('searchInput', { nullable: true })
    { title, ingredients, owner }: SearchRecipeInput,
    @Arg('limit', { nullable: true }) limit: number,
    @Arg('offset', { nullable: true }) offset: number
  ): Promise<Recipe[] | undefined> {
    let recipeSearchQB = await this.recipeRepo.recipeSearchQB()
    if (title) {
      recipeSearchQB = recipeSearchQB.andWhere('r.title ilike :title', {
        title: `%${title}%`,
      })
    }
    if (ingredients) {
      recipeSearchQB = recipeSearchQB.andWhere(
        'r.ingredients ilike :ingredients',
        {
          ingredients: `%${ingredients}%`,
        }
      )
    }
    if (owner) {
      recipeSearchQB = recipeSearchQB.andWhere('r.owner ilike :owner', {
        owner: `%${owner}%`,
      })
    }
    formatResponse(
      new Response(
        'recipeSearch',
        `searchWord:( title: ${title} ) && ( ingredients: ${ingredients} ) && ( owner: ${owner} )`,
        false
      )
    )
    return recipeSearchQB.take(limit).skip(offset).getMany()
  }

  @UseMiddleware(isAuth)
  @Query(() => Recipe, { nullable: true })
  async viewRecipe(@Arg('id') id: string): Promise<Recipe | undefined> {
    formatResponse(new Response('recipeView', 'view of single recipe', false))
    return await this.recipeRepo.recipeById({ id: id })
  }

  @UseMiddleware(isAuth)
  @Query(() => [Recipe], { nullable: true })
  async listRecipes(@Ctx() { redis }: Context): Promise<Recipe[] | undefined> {
    const recipes = (await redis.lrange(constant.recipeCacheKey, 0, -1)) || []
    formatResponse(
      new Response('recipeList', 'lists of recipes with redis Cache', false)
    )
    return recipes.map((x: string) => JSON.parse(x))
  }

  @UseMiddleware(isAuth)
  @Mutation(() => ValidationResponse)
  async createRecipe(
    @Arg('title') title: string,
    @Arg('input')
    {
      owner,
      displayOwner,
      createdAt,
      imgUrl,
      ...createRecipeInput
    }: RecipeInput,
    @Ctx() { req, redis, userLoader }: Context
  ): Promise<ValidationResponse | Error[]> {
    // try {
    //   await RecipesYupSchema.validate(createRecipeInput, {
    //     abortEarly: false,
    //   })
    // } catch (err) {
    //   return formatYupError(err)
    // }
    const userId = await userLoader.load(req.session!.userId)

    const recipeAlreadyExists = await this.recipeRepo.findOne({
      where: { title: title },
      select: ['id'],
    })

    if (recipeAlreadyExists) {
      return {
        errors: [
          formatResponse(new Response('title', `${title} -- duplicateRecipe`)),
        ],
      }
    }

    const imgUrlTemp = createRecipeInput.image
      ? await processUpload(recipeDir, createRecipeInput.image)
      : null

    const recipe = this.recipeRepo
      .create({
        imgUrl: imgUrlTemp,
        title: title,
        createdAt: `${new Date()}`,
        displayOwner: userId.email,
        owner: req.session!.userId,
        ...createRecipeInput,
      })
      .save()

    const recipeForRedis = await this.recipeRepo.findOne((await recipe).id)
    await redis.lpush(constant.recipeCacheKey, JSON.stringify(recipeForRedis))

    return {
      ok: true,
      message: [
        formatResponse(
          new Response(
            `recipeCreate`,
            `title:${title} by ${userId?.email}`,
            false
          )
        ),
      ],
    }
  }

  @UseMiddleware(isAuth)
  @Mutation(() => ValidationResponse)
  async updateRecipe(
    @Arg('recipeId') recipeId: string,
    @Arg('title') title: string,
    @Arg('input')
    { owner, displayOwner, ...updateRecipeInput }: RecipeInput,
    @Ctx() { req, redis, userLoader }: Context
  ): Promise<ValidationResponse | Error[]> {
    // try {
    //   await RecipesYupSchema.validate(updateRecipeInput, {
    //     abortEarly: false,
    //   })
    // } catch (err) {
    //   return formatYupError(err)
    // }
    const userId = await userLoader.load(req.session!.userId)
    const recipe = await this.recipeRepo.findOne(recipeId)
    // const recipe = await recipeLoader.load(recipeId)

    if (req.session!.userId !== recipe!.owner) {
      return {
        errors: [
          formatResponse(
            new Response(
              'recipeUpdate',
              `this user ${userId?.email} is trying to update a recipe they don't own`
            )
          ),
        ],
      }
    }

    let prevImg = updateRecipeInput.imgUrl
    let updatedImgUrl = updateRecipeInput.imgUrl
    if (updateRecipeInput.image) {
      updatedImgUrl = await processUpload(recipeDir, updateRecipeInput.image)
      if (prevImg === updatedImgUrl) {
        prevImg
      } else if (prevImg !== updatedImgUrl) {
        if (prevImg !== null) {
          fs.unlink(recipeDir + `${prevImg}`, (err) => {
            if (err) throw err
            formatResponse(
              new Response(
                'recipeUpdate',
                `${prevImg} replacedBy ${updatedImgUrl} of ${recipe!.title}  `
              )
            )
          })
        }
        updateRecipeInput.imgUrl = updatedImgUrl
      }
    }
    const updatedRecipe = await this.recipeRepo.save({
      ...recipe,
      title: title,
      imgUrl: updateRecipeInput.imgUrl,
      ingredients: updateRecipeInput.ingredients,
      content: updateRecipeInput.content,
      createdAt: updateRecipeInput.createdAt,
      displayOwner: userId.email,
      owner: req.session!.userId,
    })
    const recipes = await redis.lrange(constant.recipeCacheKey, 0, -1)
    const idx = recipes.findIndex((x: string) => JSON.parse(x).id === recipeId)
    await redis.lset(
      constant.recipeCacheKey,
      idx,
      JSON.stringify(updatedRecipe)
    )

    return {
      ok: true,
      message: [
        formatResponse(
          new Response(
            `recipeUpdate`,
            `title: ${title} -- ${recipe?.id}`,
            false
          )
        ),
      ],
    }
  }

  @UseMiddleware(isAuth)
  @Mutation(() => Boolean)
  async deleteRecipe(
    @Arg('recipeId') recipeId: string,
    @Ctx() { req, redis, userLoader }: Context
  ): Promise<Error | boolean> {
    const userId = await userLoader.load(req.session!.userId)
    const recipe = await this.recipeRepo.findOne(recipeId)
    if (!recipe) {
      formatResponse(
        new Response('recipeDelete', `no recipe exists with id: ${recipeId}`)
      )
    }
    if (req.session!.userId !== recipe!.owner) {
      formatResponse(
        new Response(
          'recipeDelete',
          `this user ${userId?.email} is trying to delete a recipe they don't own`
        )
      )
    }
    if (recipe!.imgUrl) {
      fs.unlink(recipeDir + `${recipe!.imgUrl}`, (err) => {
        if (err) throw err
        formatResponse(
          new Response(
            'recipeDelete',
            `${recipe!.imgUrl} of ${recipe!.title} was deleted`
          )
        )
      })
    }

    await redis.lrem(constant.recipeCacheKey, 0, JSON.stringify(recipe))

    await this.recipeRepo.delete(recipeId)

    formatResponse(
      new Response('recipeDelete', `${recipe!.title} by: ${userId?.email}`)
    )
    return true
  }
}
