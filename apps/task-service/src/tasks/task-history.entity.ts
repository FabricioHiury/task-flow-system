import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Task } from './task.entity';

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
  taskId: number;

  @Column({
    type: 'enum',
    enum: ChangeType,
  })
  changeType: ChangeType;

  @Column({ name: 'changed_by' })
  changedBy: number;

  @Column('text', { nullable: true })
  description: string;

  @Column('json', { nullable: true })
  previousValues: Record<string, any>;

  @Column('json', { nullable: true })
  newValues: Record<string, any>;

  @ManyToOne(() => Task, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'task_id' })
  task: Task;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}