import { ObjectType, Field } from 'type-graphql'

@ObjectType()
export class Error {
  @Field()
  path: string

  @Field()
  message: string
}

@ObjectType()
export class LoginResponse {
  @Field(() => [Error], { nullable: true })
  errors?: [Error]

  @Field({ nullable: true })
  userRole?: string

  @Field({ nullable: true })
  sessionId?: string
}

@ObjectType()
export class AuthStatus {
  @Field({ nullable: true })
  status?: Boolean
}
