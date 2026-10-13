import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { ORDER_NOTES_TAGS_MODULE } from "../modules/order-notes-tags"
import type OrderNotesTagsModuleService from "../modules/order-notes-tags/service"

/**
 * How `tags` applies to the order's current list:
 * - "replace" (default): the list becomes exactly `tags`
 * - "add": `tags` are appended, skipping ones already present
 * - "remove": `tags` are taken out, ignoring ones not present
 */
export type SetOrderTagsMode = "replace" | "add" | "remove"

type SetOrderTagsInput = {
  order_id: string
  tags: string[]
  mode?: SetOrderTagsMode
  actor_id?: string | null
  actor_email?: string | null
}

/** Trims, drops empties and duplicates, keeping first-seen order. */
const normalizeTags = (tags: string[]) =>
  Array.from(new Set(tags.map((tag) => tag.trim()).filter(Boolean)))

export const applyTagChange = (previousTags: string[], tags: string[], mode: SetOrderTagsMode) => {
  const incoming = normalizeTags(tags)

  switch (mode) {
    case "add":
      return normalizeTags([...previousTags, ...incoming])
    case "remove":
      return previousTags.filter((tag) => !incoming.includes(tag))
    case "replace":
    default:
      return incoming
  }
}

const setOrderTagsStep = createStep(
  "set-order-tags",
  async (
    { order_id, tags: requested, mode = "replace", actor_id, actor_email }: SetOrderTagsInput,
    { container }
  ) => {
    const orderNotesTagsModuleService: OrderNotesTagsModuleService = container.resolve(
      ORDER_NOTES_TAGS_MODULE
    )

    const [existing] = await orderNotesTagsModuleService.listOrderNotesTags({ order_id })
    const previousTags = (existing?.tags ?? []) as unknown as string[]
    const tags = applyTagChange(previousTags, requested, mode)

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
