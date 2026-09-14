import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { MedusaError } from "@medusajs/framework/utils"
import { ORDER_NOTES_TAGS_MODULE } from "../modules/order-notes-tags"
import type OrderNotesTagsModuleService from "../modules/order-notes-tags/service"

type AddOrderNoteInput = {
  order_id: string
  content: string
  actor_id?: string | null
  actor_email?: string | null
}

const addOrderNoteStep = createStep(
  "add-order-note",
  async ({ order_id, content, actor_id, actor_email }: AddOrderNoteInput, { container }) => {
    const trimmed = content?.trim()

    if (!trimmed) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "A note cannot be empty")
    }

    const orderNotesTagsModuleService: OrderNotesTagsModuleService = container.resolve(
      ORDER_NOTES_TAGS_MODULE
    )

    // No history event: the note row already carries its author and timestamp,
    // and it can never be edited or removed.
    const note = await orderNotesTagsModuleService.createOrderNotes({
      order_id,
      content: trimmed,
      actor_id: actor_id ?? null,
      actor_email: actor_email ?? null,
    })

    return new StepResponse(note)
  }
)

const addOrderNoteWorkflow = createWorkflow("add-order-note", (input: AddOrderNoteInput) => {
  const note = addOrderNoteStep(input)
  return new WorkflowResponse(note)
})

export default addOrderNoteWorkflow
