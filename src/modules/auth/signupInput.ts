import { InputType, Field } from 'type-graphql'
// import { IsEmail } from 'class-validator'
import { registerEnumType } from 'type-graphql'

import { EnumValue, EnumRole } from '../../entity/User'
import { PasswordMixin } from './passwordInput'
// import { IsEmailAlreadyExist } from './isEmailAlreadyExist'

registerEnumType(EnumRole, {
  name: 'EnumRole',
  description: 'Range of User Roles',
})

registerEnumType(EnumValue, {
  name: 'EnumValue',
  description: "Range of User's Server Roles and Online Status",
})

@InputType()
export class SignupInput extends PasswordMixin(class {}) {
  @Field()
  fullname: string

  // @Field()
  // @IsEmail()
  // // @IsEmailAlreadyExist({ message: 'email is already taken' })
  // email: string

  @Field(() => EnumValue, { nullable: true }) // it's very important
  serverRole: EnumValue

  @Field(() => EnumRole, { nullable: true }) // it's very important
  clientRole: EnumRole
}
