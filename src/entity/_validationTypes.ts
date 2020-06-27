import { ObjectType, Field } from 'type-graphql'
import { Error } from './_authTypes'

@ObjectType()
export class MessageResponse {
  @Field()
  path: string

  @Field()
  message: string
}

@ObjectType()
export class ValidationResponse {
  @Field(() => [MessageResponse], { nullable: true })
  message?: [MessageResponse]

  @Field(() => [Error], { nullable: true })
  errors?: [Error]

  @Field({ nullable: true })
  ok?: Boolean
}
