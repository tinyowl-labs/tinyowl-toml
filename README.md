# tinyowl-toml

**Schema specification for `tinyowl.toml` — the declarative column mapping configuration.**

Defines the canonical file format used by `tinyowl-cli` and `tinyowl-core` to map arbitrary CSV/GeoJSON columns to TinyOwl's governed entity model.

## Quick example

```toml
[import]
entity_type = "place"
srid = 4326

[[column]]
source = "SiteID"
target = "source_id"

[[column]]
source = "SiteName"
target = "name"

[[column]]
source = "Latitude"
target = "geometry:lat"

[[column]]
source = "Longitude"
target = "geometry:lng"

[[column]]
source = "Period"
target = "classification"
delimiter = ";"

[[relation]]
predicate = "above"
source_column = "Overlies"
delimiter = ","
```

## Schema

JSON Schema files for validation and IDE autocompletion:

- `schema/tinyowl.schema.json` — CLI mapping format
- `schema/import-plan.schema.json` — Frontend import wizard format
- `schema/mapping-config.schema.json` — Wire format to core

## Examples

- `examples/csv-points.toml` — CSV with lat/lng columns
- `examples/csv-polygons.toml` — CSV with WKT geometry
- `examples/geojson-archaeology.toml` — GeoJSON with stratigraphic relations
- `examples/minimal.toml` — Minimal config (source_id + name only)

## Validation rules

1. At least one `[[column]]` with `target = "source_id"` is required
2. `geometry:lat` and `geometry:lng` must appear as a pair
3. `relation:<predicate>` targets must match governed relation predicates
4. `coerce` must be one of: `string`, `number`, `boolean`, `auto`, `wkt`

## License

MIT

## Related

- [tinyowl-cli](https://github.com/tinyowl-labs/tinyowl-cli) — consumes these configs
- [tinyowl-core](https://github.com/tinyowl-labs/tinyowl-core) — validates against these schemas
