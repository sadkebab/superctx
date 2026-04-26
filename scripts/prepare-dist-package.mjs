import { copyFile, access, mkdir, readFile, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "dist");
const rootPackagePath = path.join(rootDir, "package.json");
const distPackagePath = path.join(distDir, "package.json");

const rootPackageRaw = await readFile(rootPackagePath, "utf8");
const rootPackage = JSON.parse(rootPackageRaw);

await mkdir(distDir, { recursive: true });

const publishPackage = {
  name: rootPackage.name,
  version: rootPackage.version,
  description: rootPackage.description,
  keywords: rootPackage.keywords,
  license: rootPackage.license,
  type: "module",
  repository: rootPackage.repository,
  sideEffects: rootPackage.sideEffects,
  main: "./index.js",
  module: "./index.js",
  types: "./index.d.ts",
  exports: {
    ".": {
      types: "./index.d.ts",
      import: "./index.js",
    },
  },
  peerDependencies: rootPackage.peerDependencies,
};

await writeFile(distPackagePath, `${JSON.stringify(publishPackage, null, 2)}\n`);

const readmePath = path.join(rootDir, "README.md");
const distReadmePath = path.join(distDir, "README.md");

await copyFile(readmePath, distReadmePath);

const licensePath = path.join(rootDir, "LICENSE");
const distLicensePath = path.join(distDir, "LICENSE");

try {
  await access(licensePath, constants.F_OK);
  await copyFile(licensePath, distLicensePath);
} catch {
  // LICENSE is optional for this package.
}

console.log(`Prepared ${distPackagePath} with version ${publishPackage.version}`);
