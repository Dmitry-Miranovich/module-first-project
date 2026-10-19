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
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Index()
  @Column()
  userId: string;
  @ManyToOne(() => User, (user) => user.tokens, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: Relation<User>;
  @Column({ unique: true })
  tokenHash: string;
  @Column('timestamp')
  expiresAt: Date;
  @Column({
    default: false,
  })
  revoked: boolean;
  @CreateDateColumn()
  createdAt: Date;
}
