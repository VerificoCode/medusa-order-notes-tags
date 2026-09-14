import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import setOrderTagsWorkflow from "../../../../../../workflows/set-order-tags"
import { resolveActor } from "../actor"

/** Replaces the order's tag list. The diff against the previous list is recorded in the history. */
export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const { id } = req.params
  const { tags } = req.body as { tags?: string[] }
  const actor = await resolveActor(req)

  const { result: record } = await setOrderTagsWorkflow(req.scope).run({
    input: { order_id: id, tags: tags ?? [], ...actor },
  })

  res.json({ tags: record.tags ?? [] })
}
