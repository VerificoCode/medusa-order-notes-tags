import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260911204618 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "order_notes_tags" drop constraint if exists "order_notes_tags_order_id_unique";`);
    this.addSql(`create table if not exists "order_notes_tags" ("id" text not null, "order_id" text not null, "note" text null, "tags" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "order_notes_tags_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_order_notes_tags_order_id_unique" ON "order_notes_tags" ("order_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_order_notes_tags_deleted_at" ON "order_notes_tags" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "order_notes_tags" cascade;`);
  }

}
