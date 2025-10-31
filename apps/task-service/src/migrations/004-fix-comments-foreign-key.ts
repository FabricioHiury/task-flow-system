import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixCommentsForeignKey1640000000004 implements MigrationInterface {
  name = 'FixCommentsForeignKey1640000000004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // First, drop the existing foreign key constraint
    await queryRunner.query(`
      ALTER TABLE comments 
      DROP CONSTRAINT IF EXISTS "FK_18c2493067c11f44efb35ca0e03"
    `);

    // Then add the foreign key constraint with CASCADE delete
    await queryRunner.query(`
      ALTER TABLE comments 
      ADD CONSTRAINT "FK_comments_task_id" 
      FOREIGN KEY ("task_id") 
      REFERENCES "tasks"("id") 
      ON DELETE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert back to the original constraint
    await queryRunner.query(`
      ALTER TABLE comments 
      DROP CONSTRAINT IF EXISTS "FK_comments_task_id"
    `);

    await queryRunner.query(`
      ALTER TABLE comments 
      ADD CONSTRAINT "FK_18c2493067c11f44efb35ca0e03" 
      FOREIGN KEY ("task_id") 
      REFERENCES "tasks"("id")
    `);
  }
}
