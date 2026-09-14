import { MedusaService } from "@medusajs/framework/utils"
import OrderNote from "./models/order-note"
import OrderNotesTags from "./models/order-notes-tags"
import OrderNotesTagsEvent from "./models/order-notes-tags-event"

class OrderNotesTagsModuleService extends MedusaService({
  OrderNote,
  OrderNotesTags,
  OrderNotesTagsEvent,
}) {}

export default OrderNotesTagsModuleService
