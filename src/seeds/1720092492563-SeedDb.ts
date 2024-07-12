import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedDb1720092492563 implements MigrationInterface {
  name = 'SeedDb1720092492563';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO tags (name) VALUES ('dragons'), ('coffee'), ('nestjs')`,
    );
  }

  public async down(): Promise<void> {}
}
