import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import addOrderNoteWorkflow from "../../../../../../workflows/add-order-note"
import { resolveActor } from "../actor"

/** Appends a note to the order. Notes are never edited in place. */
export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const { id } = req.params
  const { content } = req.body as { content?: string }
  const actor = await resolveActor(req)

  const { result: note } = await addOrderNoteWorkflow(req.scope).run({
    input: { order_id: id, content: content ?? "", ...actor },
  })

  res.status(201).json({ note })
}
