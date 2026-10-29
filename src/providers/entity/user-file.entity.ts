import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { User } from '../../user/entity/user.entity.js';

@Entity()
export class UserFile {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({
    unique: true,
  })
  fileName: string;
  @Index()
  @Column()
  userId: string;
  @ManyToOne(() => User, (user) => user.avatars, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: Relation<User>;
  @CreateDateColumn()
  createdAt: Date;
}
