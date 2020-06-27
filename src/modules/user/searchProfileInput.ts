import { InputType, Field, ID } from 'type-graphql'
import { IsString } from 'class-validator'
import { Profile } from '../../entity/Profile'

@InputType()
export class SearchProfileInput implements Partial<Profile> {
  @Field({ nullable: true })
  @IsString()
  address: string

  @Field(() => [String], { nullable: true })
  @IsString()
  hobbies: string[]

  @Field(() => ID, { nullable: true })
  @IsString()
  owner: string
}
