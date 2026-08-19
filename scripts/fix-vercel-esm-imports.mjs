import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const directories = ["server", "api"];
const sourceExtensions = new Set([".ts", ".tsx"]);

function toRuntimeSpecifier(specifier) {
  if (!specifier.startsWith(".")) return specifier;
  if (specifier.endsWith(".js") || specifier.endsWith(".json")) return specifier;
  if (specifier.endsWith(".ts") || specifier.endsWith(".tsx")) {
    return `${specifier.replace(/\.tsx?$/, "")}.js`;
  }
  return `${specifier}.js`;
}

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(path)));
    else if (sourceExtensions.has(entry.name.slice(entry.name.lastIndexOf("."))) && !entry.name.includes(".test.")) files.push(path);
  }
  return files;
}

let edited = 0;
for (const directory of directories) {
  for (const path of await walk(join(root, directory))) {
    const source = await readFile(path, "utf8");
    const updated = source
      .replace(/(from\s*["'])(\.{1,2}\/[^"]*?)(["'])/g, (_match, prefix, specifier, suffix) => `${prefix}${toRuntimeSpecifier(specifier)}${suffix}`)
      .replace(/(import\(\s*["'])(\.{1,2}\/[^"]*?)(["']\s*\))/g, (_match, prefix, specifier, suffix) => `${prefix}${toRuntimeSpecifier(specifier)}${suffix}`);
    if (updated !== source) {
      await writeFile(path, updated, "utf8");
      edited += 1;
      console.log(path.replace(`${root}/`, ""));
    }
  }
}
console.log(`Updated ${edited} runtime files.`);
