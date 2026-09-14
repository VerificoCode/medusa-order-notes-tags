import { defineWidgetConfig } from "@medusajs/admin-sdk"
import type { DetailWidgetProps, OrderDTO } from "@medusajs/framework/types"
import { Badge, Button, Container, Heading, Input, Text, Textarea } from "@medusajs/ui"
import { useEffect, useState } from "react"

type OrderNote = {
  id: string
  content: string
  actor_email: string | null
  created_at: string
}

type OrderNotesTagsEvent = {
  id: string
  action: "tag_added" | "tag_removed"
  value: string | null
  actor_email: string | null
  created_at: string
}

const describeEvent = (event: OrderNotesTagsEvent) =>
  event.action === "tag_added" ? `Added tag "${event.value}"` : `Removed tag "${event.value}"`

const byline = (actorEmail: string | null, createdAt: string) =>
  `${actorEmail ?? "Unknown user"} · ${new Date(createdAt).toLocaleString()}`

const OrderNotesTagsWidget = ({ data: order }: DetailWidgetProps<OrderDTO>) => {
  const [notes, setNotes] = useState<OrderNote[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [events, setEvents] = useState<OrderNotesTagsEvent[]>([])
  const [loaded, setLoaded] = useState(false)
  const [noteInput, setNoteInput] = useState("")
  const [tagInput, setTagInput] = useState("")
  const [saving, setSaving] = useState(false)

  const baseUrl = `/admin/orders/${order.id}/notes-tags`

  const fetchAll = async () => {
    const response = await fetch(baseUrl, { credentials: "include" })
    const json = await response.json()
    setNotes(json.notes ?? [])
    setTags(json.tags ?? [])
    setEvents(json.events ?? [])
    setLoaded(true)
  }

  useEffect(() => {
    fetchAll()
  }, [order.id])

  const send = async (url: string, method: string, body?: unknown) => {
    setSaving(true)
    await fetch(url, {
      method,
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      ...(body ? { body: JSON.stringify(body) } : {}),
    })
    await fetchAll()
    setSaving(false)
  }

  const addNote = async () => {
    const content = noteInput.trim()
    if (!content) return
    setNoteInput("")
    await send(`${baseUrl}/notes`, "POST", { content })
  }

  const addTag = async () => {
    const value = tagInput.trim()
    if (!value || tags.includes(value)) return
    setTagInput("")
    await send(`${baseUrl}/tags`, "POST", { tags: [...tags, value] })
  }

  const removeTag = async (tag: string) => {
    await send(`${baseUrl}/tags`, "POST", { tags: tags.filter((t) => t !== tag) })
  }

  if (!loaded) {
    return null
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">Notes & Tags</Heading>
      </div>

      <div className="flex flex-col gap-y-3 px-6 py-4">
        <Text size="small" weight="plus">
          Notes
        </Text>

        {notes.length > 0 && (
          <div className="flex flex-col gap-y-3">
            {notes.map((note) => (
              <div key={note.id} className="flex flex-col gap-y-1 border-l-2 border-ui-border-base pl-3">
                <Text size="small" leading="compact" className="whitespace-pre-wrap">
                  {note.content}
                </Text>
                <Text size="xsmall" leading="compact" className="text-ui-fg-subtle">
                  {byline(note.actor_email, note.created_at)}
                </Text>
              </div>
            ))}
          </div>
        )}

        <Textarea
          value={noteInput}
          onChange={(e) => setNoteInput(e.target.value)}
          placeholder="Add an internal note"
          disabled={saving}
        />
        <div className="flex justify-end">
          <Button
            variant="secondary"
            onClick={addNote}
            disabled={saving || !noteInput.trim()}
          >
            Add note
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-y-2 px-6 py-4">
        <Text size="small" weight="plus">
          Tags
        </Text>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.map((tag) => (
              <Badge key={tag} className="cursor-pointer" onClick={() => removeTag(tag)}>
                {tag} ×
              </Badge>
            ))}
          </div>
        )}
        <div className="flex gap-x-2">
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="Add a tag"
            disabled={saving}
          />
          <Button variant="secondary" onClick={addTag} disabled={saving}>
            Add
          </Button>
        </div>
      </div>

      {events.length > 0 && (
        <div className="flex flex-col gap-y-2 px-6 py-4">
          <Text size="small" weight="plus">
            Tag history
          </Text>
          <div className="flex flex-col gap-y-2">
            {events.map((event) => (
              <div key={event.id} className="flex flex-col">
                <Text size="small" leading="compact">
                  {describeEvent(event)}
                </Text>
                <Text size="xsmall" leading="compact" className="text-ui-fg-subtle">
                  {byline(event.actor_email, event.created_at)}
                </Text>
              </div>
            ))}
          </div>
        </div>
      )}
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "order.details.side.after",
})

export default OrderNotesTagsWidget
