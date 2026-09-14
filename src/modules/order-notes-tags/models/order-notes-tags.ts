import { model } from "@medusajs/framework/utils"

/**
 * One row per order, holding the order's tag list. Notes live in their own
 * table (see order-note.ts) because they are appended rather than replaced.
 */
const OrderNotesTags = model.define("order_notes_tags", {
  id: model.id().primaryKey(),
  order_id: model.text().unique(),
  tags: model.json().nullable(),
})

export default OrderNotesTags
