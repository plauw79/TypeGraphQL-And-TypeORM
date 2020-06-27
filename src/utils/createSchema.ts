import { buildSchema } from 'type-graphql'
import { Container } from 'typedi'

import { AuthResolver } from '../modules/auth/authResolver'
import { UserResolver } from '../modules/user/userResolver'
import { RecipeResolver } from '../modules/recipe/recipeResolver'
import { ImageResolver } from '../modules/shared/imageUpload'
import { UserProfileResolver } from '../modules/user/userProfileResolver'

export const createSchema = () =>
  buildSchema({
    resolvers: [
      ImageResolver,
      AuthResolver,
      UserResolver,
      RecipeResolver,
      UserProfileResolver,
    ],
    container: Container,
    // authChecker: ({ context: { req } }) => {
    //   return !!req.session.userId
    // }
  })
