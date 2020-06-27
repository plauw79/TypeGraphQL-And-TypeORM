import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  ManyToOne,
  JoinColumn,
} from 'typeorm'
import { ObjectType, Field, ID } from 'type-graphql'
import { User } from './User'

@ObjectType()
@Entity()
export class Recipe extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Field({ nullable: true })
  @Column('text', { nullable: true })
  imgUrl?: string

  @Field()
  // @Column('text', { unique: true })
  @Column('text')
  title: string

  @Field()
  @Column('text')
  ingredients: string

  @Field()
  @Column('text')
  content: string

  @Field({ nullable: true })
  @Column('text', { nullable: true })
  createdAt?: string

  @Field({ nullable: true })
  @Column('text', { nullable: true })
  displayOwner?: string

  @Field({ nullable: true })
  @Column('text', { nullable: true })
  owner?: string

  @ManyToOne(() => User, (user) => user.recipes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'owner' })
  user: User
}
