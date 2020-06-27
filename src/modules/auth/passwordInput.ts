import { MinLength, MaxLength, IsString } from 'class-validator'
import { Field, InputType, ClassType } from 'type-graphql'

export const PasswordMixin = <T extends ClassType>(BaseClass: T) => {
  @InputType()
  class PasswordInput extends BaseClass {
    @Field()
    @IsString()
    @MinLength(6)
    @MaxLength(255)
    password: string
  }
  return PasswordInput
}
