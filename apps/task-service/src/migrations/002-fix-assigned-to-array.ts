import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixAssignedToArray1640000000002 implements MigrationInterface {
  name = 'FixAssignedToArray1640000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // First, convert existing data from string to array format
    await queryRunner.query(`
      UPDATE tasks 
      SET assigned_to = CASE 
        WHEN assigned_to IS NULL OR assigned_to = '' THEN NULL
        WHEN assigned_to LIKE '%,%' THEN ARRAY[assigned_to]
        ELSE ARRAY[assigned_to]
      END
    `);

    // Alter the column to be a text array
    await queryRunner.query(`
      ALTER TABLE tasks 
      ALTER COLUMN assigned_to TYPE TEXT[] USING 
      CASE 
        WHEN assigned_to IS NULL THEN NULL
        ELSE assigned_to
      END
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Convert array back to string for rollback
    await queryRunner.query(`
      UPDATE tasks 
      SET assigned_to = CASE 
        WHEN assigned_to IS NULL THEN NULL
        ELSE array_to_string(assigned_to, ',')
      END
    `);

    // Alter the column back to varchar
    await queryRunner.query(`
      ALTER TABLE tasks 
      ALTER COLUMN assigned_to TYPE VARCHAR USING 
      CASE 
        WHEN assigned_to IS NULL THEN NULL
        ELSE assigned_to
      END
    `);
  }
}
