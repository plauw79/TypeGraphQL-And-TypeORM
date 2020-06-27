import { ObjectType, Field } from 'type-graphql'

@ObjectType()
export class ErrorResponse {
  @Field()
  path: string

  @Field()
  message: string
}

@ObjectType()
export class ValidationResponse {
  @Field(() => [ErrorResponse], { nullable: true })
  errors?: [ErrorResponse]

  @Field({ nullable: true })
  ok?: Boolean
}
