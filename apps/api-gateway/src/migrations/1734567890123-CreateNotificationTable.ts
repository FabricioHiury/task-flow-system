import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateNotificationTable1734567890123
  implements MigrationInterface
{
  name = 'CreateNotificationTable1734567890123';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'notifications',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'type',
            type: 'enum',
            enum: [
              'task_assigned',
              'task_updated',
              'task_completed',
              'comment_added',
              'project_invitation',
              'deadline_reminder',
            ],
          },
          {
            name: 'title',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'message',
            type: 'text',
          },
          {
            name: 'recipient_id',
            type: 'varchar',
          },
          {
            name: 'sender_id',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'entity_id',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'entity_type',
            type: 'enum',
            enum: ['task', 'project', 'comment'],
            isNullable: true,
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'is_read',
            type: 'boolean',
            default: false,
          },
          {
            name: 'read_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Criar índices para otimizar consultas
    await queryRunner.createIndex(
      'notifications',
      new TableIndex({
        name: 'IDX_notifications_recipient_id_is_read',
        columnNames: ['recipient_id', 'is_read'],
      }),
    );

    await queryRunner.createIndex(
      'notifications',
      new TableIndex({
        name: 'IDX_notifications_recipient_id_created_at',
        columnNames: ['recipient_id', 'created_at'],
      }),
    );

    await queryRunner.createIndex(
      'notifications',
      new TableIndex({
        name: 'IDX_notifications_recipient_id',
        columnNames: ['recipient_id'],
      }),
    );

    await queryRunner.createIndex(
      'notifications',
      new TableIndex({
        name: 'IDX_notifications_is_read',
        columnNames: ['is_read'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('notifications');
  }
}
