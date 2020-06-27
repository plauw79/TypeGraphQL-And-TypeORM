import { InputType, Field, ID } from 'type-graphql'
import { IsString } from 'class-validator'
import { Recipe } from '../../entity/Recipe'

@InputType()
export class SearchRecipeInput implements Partial<Recipe> {
  @Field({ nullable: true })
  @IsString()
  title: string

  @Field({ nullable: true })
  @IsString()
  ingredients: string

  @Field(() => ID, { nullable: true })
  @IsString()
  owner: string
}
