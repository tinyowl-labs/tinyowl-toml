# tinyowl-toml — Fix Report

## Missing Deliverables

### 1. `examples/` directory is empty ✅ RESOLVED

All four example TOML files created:

- `examples/minimal.toml` — source_id + name only
- `examples/csv-points.toml` — lat/lng geometry, classifications, dates
- `examples/csv-polygons.toml` — WKT geometry, stratigraphic relations
- `examples/geojson-archaeology.toml` — GeoJSON with Harris Matrix relations

### 2. JSON Schema: `additionalProperties: true` on root ✅ RESOLVED

Changed to `"additionalProperties": false` for strict top-level validation. Unknown keys now produce validation errors.

## Minor

### 3. `column` key in schema uses `"column"` (singular) but TOML uses `[[column]]` (array of tables)

Confirmed correct — TOML's double-bracket tables become JSON arrays. No fix needed.

### 4. Add `"$comment"` fields for documentation ✅ RESOLVED

Added `$comment` fields to all top-level property sections and the root object, documenting the TOML table syntax each maps to.

## PROGRESS.md Issues (Resolved)

### 5. JSON Schema only validates the CLI mapping format ✅ RESOLVED

Created `schema/import-plan.schema.json` — validates the frontend import wizard's `ImportPlan` JSON structure (mirrors lamina's `$lib/types/import.ts`).

### 6. No schema for the `mapping_config` JSONB format ✅ RESOLVED

Created `schema/mapping-config.schema.json` — validates the JSONB payload sent to core's `staging_imports.mapping_config` column. Supports both `csvMapping` (mirrors `parser.CsvColumnMapping`) and `geoJsonMapping` (mirrors `parser.GeoJSONMapping`) dispatch keys.
