import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum NotificationType {
  TASK_CREATED = 'task_created',
  TASK_UPDATED = 'task_updated',
  TASK_DELETED = 'task_deleted',
  COMMENT_CREATED = 'comment_created',
  COMMENT_DELETED = 'comment_deleted',
  SYSTEM = 'system',
}

export enum EntityType {
  TASK = 'task',
  COMMENT = 'comment',
  USER = 'user',
}

@Entity('notifications')
@Index(['recipientId', 'isRead'])
@Index(['recipientId', 'createdAt'])
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
    default: NotificationType.SYSTEM,
  })
  type: NotificationType;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

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
    enum: EntityType,
    nullable: true 
  })
  entityType?: EntityType;

  @Column({ name: 'is_read', default: false })
  @Index()
  isRead: boolean;

  @Column({ name: 'read_at', type: 'timestamp', nullable: true })
  readAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}