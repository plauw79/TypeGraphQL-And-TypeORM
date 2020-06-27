import { InputType, Field } from 'type-graphql'
import { IsString } from 'class-validator'
import { Recipe } from '../../entity/Recipe'
import { Upload } from '../../types/upload'
import { GraphQLUpload } from 'graphql-upload'

@InputType()
export class RecipeInput implements Partial<Recipe> {
  @Field(() => GraphQLUpload, { nullable: true })
  image?: Upload

  @Field({ nullable: true })
  @IsString()
  imgUrl?: string

  @Field()
  @IsString()
  ingredients: string

  @Field()
  @IsString()
  content: string

  @Field({ nullable: true })
  @IsString()
  createdAt?: string

  @Field({ nullable: true })
  @IsString()
  displayOwner?: string

  @Field({ nullable: true })
  @IsString()
  owner?: string
}
