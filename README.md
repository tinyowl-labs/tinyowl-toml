# tinyowl-toml

**Schema specification for `tinyowl.toml` — the declarative column mapping configuration.**

## Role

`tinyowl-toml` defines the canonical `tinyowl.toml` file format used by:
- `tinyowl-core` — validates import mapping configs submitted by the frontend
- `tinyowl-cli` — reads mapping files for bulk imports
- `tinyowl-native` — the `pkg/config` package consumes the TOML schema

## Dependencies

- **Depends on:** nothing
- **Depended on by:** `tinyowl-native` (conceptually — the Go struct definitions), `tinyowl-cli`, `tinyowl-core`

## Directory Structure

```
tinyowl-toml/
├── schema/
│   ├── tinyowl.schema.json           # JSON Schema for tinyowl.toml (CLI mapping format)
│   ├── import-plan.schema.json       # JSON Schema for the frontend wizard's ImportPlan
│   └── mapping-config.schema.json    # JSON Schema for mapping_config JSONB (wire format to core)
├── examples/
│   ├── csv-points.toml               # CSV with lat/lng columns
│   ├── csv-polygons.toml             # CSV with WKT geometry
│   ├── geojson-archaeology.toml      # GeoJSON with stratigraphic relations
│   └── minimal.toml                  # Minimal config (source_id + name only)
├── README.md
└── LICENSE
```

## Schema

A `tinyowl.toml` file defines how arbitrary client columns map to TinyOwl's governed entity model.

### Top-Level Sections

```toml
[database]
url = "postgres://..."             # Postgres connection string (CLI only)
max_conns = 20
min_conns = 5
statement_timeout = "30s"

[server]
listen_addr = ":8090"
cors_origin = "*"

[import]
entity_type = "place"             # Default entity kind
visibility = "private"            # Default visibility
srid = 4326                       # Coordinate reference system
date_type = "other"               # Default date type
classification_delimiter = ";"    # Default delimiter for multi-value classification columns
```

### Column Mapping

```toml
[[column]]
source = "SiteName"               # Column name in source file
target = "name"                   # Target entity field
                                  # Valid targets:
                                  #   "source_id" — unique external identifier
                                  #   "name"      — display name
                                  #   "entity_type" — governed entity kind
                                  #   "geometry:wkt" — WKT geometry string
                                  #   "geometry:lat" — latitude (paired with geometry:lng)
                                  #   "geometry:lng" — longitude (paired with geometry:lat)
                                  #   "classification" — classification term(s)
                                  #   "relation:<predicate>" — relation with predicate
                                  #   "date:from" — start date
                                  #   "date:to"   — end date
                                  #   "date:type" — date type (radiocarbon, stratigraphic, etc.)
                                  #   any other string — stored as an entity property
coerce = "auto"                   # Type coercion: "string", "number", "boolean", "auto", "wkt"
default = ""                      # Default value when column is empty
exclude = false                   # Exclude from properties block
delimiter = ","                   # Delimiter for multi-value sources
```

### Relation Extraction

```toml
[[relation]]
predicate = "above"               # Governed relation predicate
source_column = "Overlies"        # Column containing target entity source_ids
delimiter = ","                   # Separator for multiple targets
direction = "forward"             # "forward", "inverse", or "auto"
```

### Date Configuration

```toml
[[date]]
from_column = "StartDate"         # Column for date_from
to_column = "EndDate"             # Column for date_to
type_column = "DateType"          # Column for date_type
type_default = "other"            # Default date_type when column is absent
key_column = "DateLabel"          # Column for date_key
```

## Validation Rules

1. At least one `[[column]]` with `target = "source_id"` must be defined (or source_id is auto-generated from row index)
2. `target = "geometry:lat"` and `target = "geometry:lng"` must appear as a pair
3. `target` values starting with `relation:` must have a `predicate` that matches a governed relation predicate
4. `coerce` must be one of: `"string"`, `"number"`, `"boolean"`, `"auto"`, `"wkt"`
5. `delimiter` defaults to `","` for relations, `";"` for classifications

## Agent Task

1. `README.md` — this document (already provided)
2. `schema/tinyowl.schema.json` — JSON Schema (draft-07) that validates `tinyowl.toml` files. Include all constraints listed above.
3. `examples/csv-points.toml` — realistic CSV mapping with lat/lng columns, classifications, dates
4. `examples/csv-polygons.toml` — CSV mapping with WKT geometry column, relations
5. `examples/geojson-archaeology.toml` — GeoJSON mapping with stratigraphic relations (above, below, cuts, fills)
6. `examples/minimal.toml` — minimal config: just source_id and name columns
7. `LICENSE` — MIT license

The JSON Schema should be usable by IDE plugins (VS Code, JetBrains) to provide autocompletion and validation when editing `tinyowl.toml` files. Use `https://json-schema.org/draft-07/schema` as the `$schema` value.
