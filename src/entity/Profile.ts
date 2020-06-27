import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  OneToOne,
} from 'typeorm'
import { ObjectType, Field, ID } from 'type-graphql'
import { User } from './User'

@ObjectType()
@Entity()
export class Profile extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Field({ nullable: true })
  @Column('text', { nullable: true })
  avatarUrl?: string

  @Field({ nullable: true })
  @Column('text')
  dateOfBirth?: string

  @Field({ nullable: true })
  @Column('text')
  address?: string

  @Field(() => [String], { nullable: true })
  @Column('text', { array: true })
  hobbies?: string[]

  @Field({ nullable: true })
  @Column('text')
  companyRank?: string

  @Field({ nullable: true })
  @Column('text')
  currentLocation?: string

  @Field({ nullable: true })
  @Column('text')
  maritalStatus?: string

  @OneToOne(() => User, (user) => user.profile, {
    nullable: true,
    onDelete: 'CASCADE',
  }) // specify inverse side as a second parameter
  user: User
}
