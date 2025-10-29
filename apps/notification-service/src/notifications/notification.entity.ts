import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

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
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
    default: NotificationType.SYSTEM,
  })
  type: NotificationType;

  @Column('jsonb', { nullable: true })
  metadata?: Record<string, any>;

  @Column({ name: 'recipient_id' })
  userId: string;

  @Column({ nullable: true, name: 'sender_id' })
  senderId?: string;

  @Column({ nullable: true, name: 'entity_id' })
  relatedEntityId?: string;

  @Column({
    type: 'enum',
    enum: EntityType,
    nullable: true,
    name: 'entity_type',
  })
  entityType?: EntityType;

  @Column({ name: 'is_read', default: false })
  isRead: boolean;

  @Column({ nullable: true, name: 'read_at' })
  readAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}