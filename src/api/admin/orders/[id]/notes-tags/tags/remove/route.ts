import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import setOrderTagsWorkflow from "../../../../../../../workflows/set-order-tags"
import { resolveActor } from "../../actor"

/** Removes tags from the order, leaving the rest of the list as it is. Tags not present are ignored. Mirrors Shopify's `tagsRemove`. */
export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const { id } = req.params
  const { tags } = req.body as { tags?: unknown }

  if (!Array.isArray(tags) || tags.some((tag) => typeof tag !== "string")) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "tags must be an array of strings")
  }

  const actor = await resolveActor(req)

  const { result: record } = await setOrderTagsWorkflow(req.scope).run({
    input: { order_id: id, tags, mode: "remove", ...actor },
  })

  res.json({ tags: record.tags ?? [] })
}
