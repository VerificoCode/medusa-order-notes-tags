import { Module } from "@medusajs/framework/utils"
import OrderNotesTagsModuleService from "./service"

export const ORDER_NOTES_TAGS_MODULE = "order_notes_tags"

export default Module(ORDER_NOTES_TAGS_MODULE, {
  service: OrderNotesTagsModuleService,
})
