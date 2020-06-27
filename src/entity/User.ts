import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  OneToMany,
  OneToOne,
  // JoinColumn,
} from 'typeorm'
import { ObjectType, Field, ID } from 'type-graphql'
import { Recipe } from './Recipe'
import { Profile } from './Profile'
import { AddTodo } from './AddTodo'

export enum EnumRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export enum EnumValue {
  CONFIRMADMIN = 'CONFIRMADMIN',
  CONFIRMUSER = 'CONFIRMUSER',
  // OFFLINE = 'OFFLINE',
  // ONLINE = 'ONLINE',
}

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Field()
  @Column()
  fullname: string

  @Field({ nullable: true })
  @Column('text', { nullable: true })
  googleID: string

  @Field()
  @Column('text', { unique: true })
  email: string

  @Column()
  password: string

  @Field()
  @Column({
    type: 'enum',
    enum: EnumValue,
    default: EnumValue.CONFIRMUSER,
  })
  serverRole: EnumValue

  @Field()
  @Column({
    type: 'enum',
    enum: EnumRole,
    default: EnumRole.USER,
  })
  clientRole: EnumRole

  @Field()
  @Column('bool', { default: false })
  loggedInStatus: boolean

  @OneToOne(() => Profile, (profile) => profile.user, {
    eager: true,
    // cascade: true,
    onDelete: 'CASCADE',
  })
  profile?: Profile

  @OneToOne(() => AddTodo, (addTodo) => addTodo.user, {
    // cascade: true,
    onDelete: 'CASCADE',
  })
  addTodo: AddTodo

  @OneToMany(() => Recipe, (recipe) => recipe.user, {
    // cascade: true,
    onDelete: 'CASCADE',
  })
  recipes: Promise<Recipe[]>
}
