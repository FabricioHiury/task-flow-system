import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Task } from './task.entity';
import { User } from '../users/user.entity';

export enum ChangeType {
  CREATED = 'created',
  UPDATED = 'updated',
  STATUS_CHANGED = 'status_changed',
  ASSIGNED = 'assigned',
  UNASSIGNED = 'unassigned',
  PRIORITY_CHANGED = 'priority_changed',
  DEADLINE_CHANGED = 'deadline_changed',
  DELETED = 'deleted',
}

@Entity('task_history')
export class TaskHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'task_id' })
  taskId: string;

  @Column({
    type: 'enum',
    enum: ChangeType,
  })
  changeType: ChangeType;

  @Column({ name: 'changed_by', nullable: false })
  changedBy: string;

  @Column('text', { nullable: true })
  description: string;

  @Column('json', { nullable: true })
  previousValues: Record<string, any>;

  @Column('json', { nullable: true })
  newValues: Record<string, any>;

  @ManyToOne(() => Task, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'task_id' })
  task: Task;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'changed_by' })
  user: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}