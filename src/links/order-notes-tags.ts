import OrderModule from "@medusajs/medusa/order"
import { defineLink } from "@medusajs/framework/utils"
import OrderNotesTagsModule from "../modules/order-notes-tags"

export default defineLink(OrderModule.linkable.order, OrderNotesTagsModule.linkable.orderNotesTags)
