import { readFileSync } from "node:fs";
import { parse } from "smol-toml";
import Ajv from "ajv";
import addFormats from "ajv-formats";

function createAjv() {
  const ajv = new Ajv({
    allErrors: true,
    strict: false,
    validateFormats: true,
  });
  addFormats(ajv);
  return ajv;
}

function validatePair(schemaPath, dataPath, label) {
  const ajv = createAjv();

  // Load schema (strip $schema to avoid draft-07 URL mismatch with AJV internals)
  const schemaJson = JSON.parse(readFileSync(schemaPath, "utf8"));
  delete schemaJson["$schema"];

  let validate;
  try {
    validate = ajv.compile(schemaJson);
    console.log(`✓ Compiled ${schemaPath}`);
  } catch (err) {
    console.error(`✗ Failed to compile ${schemaPath}:`, err.message);
    return 1;
  }

  // Load and parse TOML data
  let dataObj;
  try {
    const tomlStr = readFileSync(dataPath, "utf8");
    dataObj = parse(tomlStr);
  } catch (err) {
    console.error(`✗ Failed to parse ${dataPath}:`, err.message);
    return 1;
  }

  // Validate
  const valid = validate(dataObj);
  if (valid) {
    console.log(`✓ ${dataPath} is valid against ${schemaPath}`);
    return 0;
  } else {
    console.error(`✗ ${dataPath} has validation errors against ${schemaPath}:`);
    for (const err of validate.errors) {
      console.error(
        `  - ${err.instancePath}: ${err.message} (${JSON.stringify(err.params)})`,
      );
    }
    return 1;
  }
}

const SCHEMAS = [
  {
    schema: "schema/group.schema.json",
    data: "examples/group.toml",
    name: "group",
  },
  {
    schema: "schema/type.schema.json",
    data: "examples/contexts.toml",
    name: "contexts",
  },
  {
    schema: "schema/mapping.schema.json",
    data: "examples/hes-west.csv.toml",
    name: "hes-west",
  },
];

let exitCode = 0;

for (const { schema, data, name } of SCHEMAS) {
  console.log(`\n=== ${name} ===`);
  exitCode |= validatePair(schema, data, name);
}

// Also validate finds.toml against type schema
console.log("\n=== finds (additional) ===");
exitCode |= validatePair(
  "schema/type.schema.json",
  "examples/finds.toml",
  "finds",
);

process.exit(exitCode);
