import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { ORDER_NOTES_TAGS_MODULE } from "../modules/order-notes-tags"
import type OrderNotesTagsModuleService from "../modules/order-notes-tags/service"

type SetOrderTagsInput = {
  order_id: string
  tags: string[]
  actor_id?: string | null
  actor_email?: string | null
}

const setOrderTagsStep = createStep(
  "set-order-tags",
  async ({ order_id, tags, actor_id, actor_email }: SetOrderTagsInput, { container }) => {
    const orderNotesTagsModuleService: OrderNotesTagsModuleService = container.resolve(
      ORDER_NOTES_TAGS_MODULE
    )

    const [existing] = await orderNotesTagsModuleService.listOrderNotesTags({ order_id })
    const previousTags = (existing?.tags ?? []) as unknown as string[]

    const actor = { actor_id: actor_id ?? null, actor_email: actor_email ?? null }
    const events = [
      ...tags
        .filter((tag) => !previousTags.includes(tag))
        .map((tag) => ({ order_id, action: "tag_added" as const, value: tag, ...actor })),
      ...previousTags
        .filter((tag) => !tags.includes(tag))
        .map((tag) => ({ order_id, action: "tag_removed" as const, value: tag, ...actor })),
    ]

    // model.json() types as Record<string, unknown> in the generated DTOs; tags is stored as a JSON array.
    const record = existing
      ? await orderNotesTagsModuleService.updateOrderNotesTags({
          id: existing.id,
          tags: tags as unknown as Record<string, unknown>,
        })
      : await orderNotesTagsModuleService.createOrderNotesTags({
          order_id,
          tags: tags as unknown as Record<string, unknown>,
        })

    if (events.length) {
      await orderNotesTagsModuleService.createOrderNotesTagsEvents(events)
    }

    return new StepResponse(record)
  }
)

const setOrderTagsWorkflow = createWorkflow("set-order-tags", (input: SetOrderTagsInput) => {
  const record = setOrderTagsStep(input)
  return new WorkflowResponse(record)
})

export default setOrderTagsWorkflow
