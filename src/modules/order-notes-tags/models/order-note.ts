import { model } from "@medusajs/framework/utils"

/**
 * One row per note. Notes are append-only: never edited, never deleted, so
 * the trail of who said what about an order stays intact.
 */
const OrderNote = model.define("order_note", {
  id: model.id().primaryKey(),
  order_id: model.text(),
  content: model.text(),
  actor_id: model.text().nullable(),
  actor_email: model.text().nullable(),
})

export default OrderNote
