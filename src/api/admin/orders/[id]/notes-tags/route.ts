import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ORDER_NOTES_TAGS_MODULE } from "../../../../../modules/order-notes-tags"
import type OrderNotesTagsModuleService from "../../../../../modules/order-notes-tags/service"

/** Everything the order detail widget needs: the notes, the tags and the history. */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params
  const orderNotesTagsModuleService: OrderNotesTagsModuleService = req.scope.resolve(
    ORDER_NOTES_TAGS_MODULE
  )

  const [record] = await orderNotesTagsModuleService.listOrderNotesTags({ order_id: id })

  const notes = await orderNotesTagsModuleService.listOrderNotes(
    { order_id: id },
    { order: { created_at: "DESC" } }
  )

  const events = await orderNotesTagsModuleService.listOrderNotesTagsEvents(
    { order_id: id },
    { order: { created_at: "DESC" } }
  )

  res.json({
    notes,
    tags: record?.tags ?? [],
    events,
  })
}
