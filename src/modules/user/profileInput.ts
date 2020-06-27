import { InputType, Field } from 'type-graphql'
import { IsString } from 'class-validator'
import { Profile } from '../../entity/Profile'
import { Upload } from '../../types/upload'
import { GraphQLUpload } from 'graphql-upload'

@InputType()
export class ProfileInput implements Partial<Profile> {
  @Field(() => GraphQLUpload, { nullable: true })
  avatar?: Upload

  @Field({ nullable: true })
  @IsString()
  avatarUrl?: string

  @Field({ nullable: true })
  @IsString()
  dateOfBirth?: string

  @Field({ nullable: true })
  @IsString()
  address?: string

  @Field(() => [String], { nullable: true })
  hobbies?: string[]

  @Field({ nullable: true })
  @IsString()
  companyRank?: string

  @Field({ nullable: true })
  @IsString()
  currentLocation?: string

  @Field({ nullable: true })
  @IsString()
  maritalStatus?: string
}
