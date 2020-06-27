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
export class AddTodo extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Field({ nullable: true })
  @Column('text', { nullable: true })
  addTodo: string

  @Field()
  @Column('text')
  completed: boolean

  @OneToOne(() => User, (user) => user.addTodo, {
    onDelete: 'CASCADE',
  }) // specify inverse side as a second parameter
  user: User
}
