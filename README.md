# @bengower/medusa-order-notes-tags

Order notes and tags for Medusa v2 as an installable plugin: an order-detail admin widget plus
admin API routes.

- **Notes** are append-only: never edited, never deleted, each keeping its author and timestamp, so
  the record of who said what about an order stays intact.
- **Tags** are a flat list that can be added to and removed from. A removed tag leaves nothing
  behind, so every tag change is recorded in a tag history.
- The acting admin is resolved server-side from the request auth context, so the author of a note
  or history entry cannot be spoofed by the caller.

Private package on GitHub Packages (scope `@bengower`).

## Install

`.npmrc` in the consuming app:

```
@bengower:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

```bash
NODE_AUTH_TOKEN=$(gh auth token) pnpm add @bengower/medusa-order-notes-tags
```

`medusa-config.ts`:

```ts
module.exports = defineConfig({
  plugins: [{ resolve: "@bengower/medusa-order-notes-tags", options: {} }],
})
```

Then run `npx medusa db:migrate`.

### Moving from `@bengower/medusa-core`

This feature shipped inside `@bengower/medusa-core` up to 0.0.7. To switch:

1. Remove `@bengower/medusa-core` from `plugins` and from dependencies. Keeping both registers the
   `order_notes_tags` module twice.
2. Add this package as above and run `medusa db:migrate`.

Existing data is untouched. The module name, tables and migration class names are unchanged, and
Medusa records applied migrations by class name, so an existing database treats them as already run.

## Admin API

| Route | Purpose |
| :-- | :-- |
| `GET /admin/orders/:id/notes-tags` | Notes, tags and tag history for the order |
| `POST /admin/orders/:id/notes-tags/notes` | Append a note (`{ content }`) |
| `POST /admin/orders/:id/notes-tags/tags` | Replace the tag list (`{ tags }`) |
| `POST /admin/orders/:id/notes-tags/tags/add` | Add tags, keeping the rest (`{ tags }`); like Shopify's `tagsAdd` |
| `POST /admin/orders/:id/notes-tags/tags/remove` | Remove tags, keeping the rest (`{ tags }`); like Shopify's `tagsRemove` |

There is deliberately no route for editing or deleting a note.

All three tag routes respond with the resulting list, `{ tags }`, and record each tag added or
removed in the history. Tags are trimmed and de-duplicated. The add/remove routes exist so an
integration that only knows the tag it wants to add or drop (Verifico's callback engine, ported
from Shopify) does not have to read and rewrite the whole list.

## Development

```bash
pnpm install          # from the repo root (workspace)
cd packages/order-notes-tags
pnpm build            # medusa plugin:build → .medusa/server
pnpm lint
```

Generate migrations with `pnpm exec medusa plugin:db:generate` from this directory. Read the SQL
before publishing: narrowing an enum re-adds its check constraint, which fails on existing rows
unless the migration cleans them up between dropping and re-adding the constraint.

Publish from a reviewed commit, bumping `version` first:

```bash
pnpm build && NODE_AUTH_TOKEN=$(gh auth token) pnpm publish --no-git-checks
```
