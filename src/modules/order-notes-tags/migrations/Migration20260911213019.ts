import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260911213019 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "order_note" ("id" text not null, "order_id" text not null, "content" text not null, "actor_id" text null, "actor_email" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "order_note_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_order_note_deleted_at" ON "order_note" ("deleted_at") WHERE deleted_at IS NULL;`);

    // Notes were a single column; carry any existing text over as the first note on the order.
    this.addSql(`insert into "order_note" ("id", "order_id", "content", "created_at", "updated_at")
      select 'ordnote_' || replace(gen_random_uuid()::text, '-', ''), "order_id", "note", "created_at", "updated_at"
      from "order_notes_tags"
      where "note" is not null and btrim("note") <> '';`);

    // Drop the constraint before remapping: the new values are not valid under the old one.
    this.addSql(`alter table if exists "order_notes_tags_event" drop constraint if exists "order_notes_tags_event_action_check";`);

    // Existing history rows use the old action names; remap them so they stay valid under the new constraint.
    this.addSql(`update "order_notes_tags_event" set "action" = 'note_added' where "action" = 'note_updated';`);
    this.addSql(`update "order_notes_tags_event" set "action" = 'note_deleted' where "action" = 'note_cleared';`);

    this.addSql(`alter table if exists "order_notes_tags" drop column if exists "note";`);

    this.addSql(`alter table if exists "order_notes_tags_event" add constraint "order_notes_tags_event_action_check" check("action" in ('note_added', 'note_deleted', 'tag_added', 'tag_removed'));`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "order_notes_tags_event" drop constraint if exists "order_notes_tags_event_action_check";`);

    this.addSql(`alter table if exists "order_notes_tags" add column if not exists "note" text null;`);

    // Collapse the notes list back into the single column, keeping the most recent note per order.
    this.addSql(`update "order_notes_tags" t set "note" = n."content"
      from (
        select distinct on ("order_id") "order_id", "content"
        from "order_note"
        where "deleted_at" is null
        order by "order_id", "created_at" desc
      ) n
      where n."order_id" = t."order_id";`);

    this.addSql(`update "order_notes_tags_event" set "action" = 'note_updated' where "action" = 'note_added';`);
    this.addSql(`update "order_notes_tags_event" set "action" = 'note_cleared' where "action" = 'note_deleted';`);

    this.addSql(`alter table if exists "order_notes_tags_event" add constraint "order_notes_tags_event_action_check" check("action" in ('note_updated', 'note_cleared', 'tag_added', 'tag_removed'));`);

    this.addSql(`drop table if exists "order_note" cascade;`);
  }

}
