import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixChangedByUuid1640000000003 implements MigrationInterface {
  name = 'FixChangedByUuid1640000000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // First, let's check if there are any invalid UUID values in the column
    await queryRunner.query(`
      UPDATE task_history 
      SET changed_by = NULL 
      WHERE changed_by IS NOT NULL AND changed_by !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    `);

    // Alter the column to UUID type
    await queryRunner.query(`
      ALTER TABLE task_history 
      ALTER COLUMN changed_by TYPE UUID USING 
      CASE 
        WHEN changed_by IS NULL THEN NULL
        WHEN changed_by ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN changed_by::UUID
        ELSE NULL
      END
    `);

    // Add foreign key constraint to users table
    await queryRunner.query(`
      ALTER TABLE task_history 
      ADD CONSTRAINT FK_task_history_user 
      FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove foreign key constraint
    await queryRunner.query(`
      ALTER TABLE task_history 
      DROP CONSTRAINT IF EXISTS FK_task_history_user
    `);

    // Convert back to varchar
    await queryRunner.query(`
      ALTER TABLE task_history 
      ALTER COLUMN changed_by TYPE VARCHAR USING 
      CASE 
        WHEN changed_by IS NULL THEN NULL
        ELSE changed_by::TEXT
      END
    `);
  }
}
