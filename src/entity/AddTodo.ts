import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  OneToOne,
  JoinColumn,
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

  @Field({ nullable: true })
  @Column({ nullable: true })
  displayOwner?: string

  @Field({ nullable: true })
  @Column({ nullable: true })
  owner?: string

  @OneToOne(() => User, (user) => user.addTodo, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'owner' })
  user: User
}
