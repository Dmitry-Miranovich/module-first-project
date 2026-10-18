import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { RefreshToken } from '../../passwordHasher/entity/token.entity.js';
import type { Relation } from 'typeorm';
export enum UserRole {
  USER = 'USER',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  email: string;
  @Column()
  passwordHash: string;
  @OneToMany(() => RefreshToken, (token) => token.user)
  tokens: Relation<RefreshToken[]>;
  @Column()
  age: number;
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;
  @Column({
    length: 1000,
  })
  description: string;
}
