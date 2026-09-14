import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260911213909 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "order_notes_tags_event" drop constraint if exists "order_notes_tags_event_action_check";`);

    // Notes can no longer be deleted, so note_deleted is not a reachable action.
    // Any such rows predate that rule and would fail the tightened constraint.
    this.addSql(`delete from "order_notes_tags_event" where "action" = 'note_deleted';`);

    this.addSql(`alter table if exists "order_notes_tags_event" add constraint "order_notes_tags_event_action_check" check("action" in ('note_added', 'tag_added', 'tag_removed'));`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "order_notes_tags_event" drop constraint if exists "order_notes_tags_event_action_check";`);

    this.addSql(`alter table if exists "order_notes_tags_event" add constraint "order_notes_tags_event_action_check" check("action" in ('note_added', 'note_deleted', 'tag_added', 'tag_removed'));`);
  }

}
