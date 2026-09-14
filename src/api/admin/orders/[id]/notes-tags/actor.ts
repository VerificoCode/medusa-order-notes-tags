import type { AuthenticatedMedusaRequest } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

/** The signed-in admin, resolved server-side so the caller cannot spoof it. */
export async function resolveActor(req: AuthenticatedMedusaRequest) {
  const actorId = req.auth_context?.actor_id

  if (!actorId) {
    return { actor_id: null, actor_email: null }
  }

  try {
    const userModuleService = req.scope.resolve(Modules.USER)
    const user = await userModuleService.retrieveUser(actorId)
    return { actor_id: actorId, actor_email: user?.email ?? null }
  } catch {
    return { actor_id: actorId, actor_email: null }
  }
}
