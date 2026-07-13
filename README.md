# tinyowl-toml

TOML schemas, JSON Schema validation, and embedded templates for [TinyOwl](https://github.com/tinyowl-labs) — distributed version control for archaeological spatial data.

This package is the **single source of truth** for how TinyOwl projects define their structure. It is imported by the CLI, server, and frontend so that schema definitions stay in sync everywhere.

## What's inside

| Path | Purpose |
|------|---------|
| `templates/embed.go` | Go `embed.FS` exporting embedded templates |
| `templates/mola-scr/` | MOLA Single Context Recording template (contexts, finds, samples) |
| `schema/project.schema.json` | JSON Schema for `project.toml` validation |
| `schema/table.schema.json` | JSON Schema for `tables/*.toml` validation |

## Embedded templates

Import the `templates` package to get an `embed.FS` containing ready-to-use project templates:

```go
import templates "github.com/tinyowl-labs/tinyowl-toml/templates"

// List available templates
entries, _ := fs.ReadDir(templates.FS, ".")

// Copy a template into a new project
data, _ := templates.FS.ReadFile("mola-scr/project.toml")
```

No network, no cloning — templates ship inside any binary that imports this package.

## JSON Schema validation

Validate `project.toml` and `tables/*.toml` files before they touch a database:

```bash
# Using a JSON Schema validator of your choice
ajv validate -s schema/project.schema.json -d my-project/project.toml
ajv validate -s schema/table.schema.json -d my-project/tables/contexts.toml
```

The schemas enforce:

- **`project.toml`**: required `name` + `slug` (kebab-case), optional ontology declarations with `prefix`, `name`, `version`, `endpoint`
- **`tables/*.toml`**: required `key` (snake_case), `label`, column definitions with types (`string`, `enum`, `media`, `geometry`, etc.), vocabulary bindings, CRM property/range mappings, and cross-table relations

## MOLA SCR template

The `mola-scr` template models a standard UK commercial archaeology workflow:

```
mola-scr/
├── project.toml      # Declares PeriodO, Getty AAT, CIDOC-CRM ontologies
├── contexts.toml     # Depositional events with soil colour, compaction, media
├── finds.toml        # Artefacts with material, period, photo
└── samples.toml      # Environmental samples with lab references
```

Every column that maps to a controlled vocabulary or ontology includes `vocabulary`, `property`, and `range` annotations — enabling the server to auto-populate its Postgres `column_mappings` index without manual configuration.

## TOML format

### `project.toml`

```toml
[project]
name = "My Excavation"
slug = "my-excavation"
description = "Roman villa excavation, summer season"
machine = "a1b"

[[ontologies]]
prefix = "crm"
name = "CIDOC-CRM"
version = "7.1.1"

[[ontologies]]
prefix = "periodo"
name = "PeriodO"
```

### `tables/contexts.toml`

```toml
[table]
key = "contexts"
label = "Stratigraphic Context"
class = "crm:E18_Physical_Thing"

[id]
prefix = "CTX"

[[columns]]
name = "soil_colour"
type = "string"
label = "Soil colour"

[[columns]]
name = "period"
type = "string"
label = "Historical period"
vocabulary = "periodo"                 # links to [[ontologies]] prefix
property = "crm:P4_has_time-span"
range = "crm:E52_Time-Span"

[[columns]]
name = "photo"
type = "media"
label = "Context photograph"
media = "image/*"

[[columns]]
name = "geom"
type = "geometry"
label = "Geometry"

[[relations]]
name = "above"
label = "Stratigraphically above"
target = "contexts"
property = "crm:P89_falls_within"
```

## Consumers

| Package | How it uses tinyowl-toml |
|---------|--------------------------|
| [tinyowl-cli](https://github.com/tinyowl-labs/tinyowl-cli) | `templates.FS` for `--template`, TOML schema generation on import |
| [tinyowl-server](https://github.com/tinyowl-labs/tinyowl-server) | Vocab annotation parsing from TOML headers on push |
| [tinyowl-native](https://github.com/tinyowl-labs/tinyowl-native) | TOML ↔ GPKG schema generation |
| [tinyowl](https://github.com/tinyowl-labs/tinyowl) | Template browsing in the web UI |

## Install

```bash
go get github.com/tinyowl-labs/tinyowl-toml@v0.1.0
```

## License

MIT
