import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260911214747 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "order_notes_tags_event" drop constraint if exists "order_notes_tags_event_action_check";`);

    // The history is tag-only now. Note additions are not lost: every note row
    // still carries its own author and timestamp, and notes cannot be removed.
    this.addSql(`delete from "order_notes_tags_event" where "action" = 'note_added';`);

    this.addSql(`alter table if exists "order_notes_tags_event" add constraint "order_notes_tags_event_action_check" check("action" in ('tag_added', 'tag_removed'));`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "order_notes_tags_event" drop constraint if exists "order_notes_tags_event_action_check";`);

    this.addSql(`alter table if exists "order_notes_tags_event" add constraint "order_notes_tags_event_action_check" check("action" in ('note_added', 'tag_added', 'tag_removed'));`);
  }

}
