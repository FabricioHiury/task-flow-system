import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('notifications')
@Index(['recipientId', 'isRead'])
@Index(['recipientId', 'createdAt'])
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ['task_assigned', 'task_updated', 'task_completed', 'comment_added', 'project_invitation', 'deadline_reminder'],
  })
  type: string;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ name: 'recipient_id' })
  @Index()
  recipientId: string;

  @Column({ name: 'sender_id', nullable: true })
  senderId?: string;

  @Column({ name: 'entity_id', nullable: true })
  entityId?: string;

  @Column({ 
    name: 'entity_type',
    type: 'enum',
    enum: ['task', 'project', 'comment'],
    nullable: true 
  })
  entityType?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @Column({ name: 'is_read', default: false })
  @Index()
  isRead: boolean;

  @Column({ name: 'read_at', type: 'timestamp', nullable: true })
  readAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}