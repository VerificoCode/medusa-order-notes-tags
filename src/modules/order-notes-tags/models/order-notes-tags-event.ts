import { model } from "@medusajs/framework/utils"

/**
 * Append-only audit trail for tag changes, one row per tag added or removed.
 * Notes are not recorded here: they are permanent and already carry their own
 * author and timestamp.
 */
const OrderNotesTagsEvent = model.define("order_notes_tags_event", {
  id: model.id().primaryKey(),
  order_id: model.text(),
  action: model.enum(["tag_added", "tag_removed"]),
  value: model.text().nullable(),
  actor_id: model.text().nullable(),
  actor_email: model.text().nullable(),
})

export default OrderNotesTagsEvent
