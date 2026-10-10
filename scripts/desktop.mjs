// Optional launcher for this desktop's FUSE document portal.
import { spawn } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const command = process.argv[2] ?? "dev";
const entries = {
  dev: [
    "node_modules/next/dist/bin/next",
    "dev",
    "--webpack",
    "--hostname",
    "0.0.0.0",
  ],
  build: ["node_modules/next/dist/bin/next", "build", "--webpack"],
  start: ["scripts/serve-static.mjs"],
  test: ["node_modules/playwright/cli.js", "test"],
  lint: ["node_modules/eslint/bin/eslint.js", "."],
  typecheck: ["node_modules/typescript/bin/tsc", "--noEmit"],
  performance: ["scripts/performance.mjs"],
};
if (!(command in entries))
  throw new Error(`Choose: ${Object.keys(entries).join(", ")}`);
const [entry, ...args] = entries[command];
const env = {
  ...process.env,
  PATH: `${dirname(process.execPath)}:${process.env.PATH ?? ""}`,
  CODEX_PORTAL_WORKAROUND: "1",
  NODE_OPTIONS: `--require=${JSON.stringify(resolve(root, "scripts/portal-cwd.cjs"))}`,
  PLAYWRIGHT_BROWSERS_PATH: resolve(root, ".qa/browser"),
  TMPDIR: resolve(root, ".qa/tmp"),
};
const child = spawn(
  process.execPath,
  [resolve(root, entry), ...args, ...process.argv.slice(3)],
  { cwd: root, env, stdio: "inherit" },
);
child.on("exit", (code) => {
  if (code === 0 && command === "build") {
    const prepare = spawn(
      process.execPath,
      [resolve(root, "scripts/prepare-pages.mjs")],
      { cwd: root, env, stdio: "inherit" },
    );
    prepare.on("exit", (status) => {
      process.exitCode = status ?? 1;
    });
  } else process.exitCode = code ?? 1;
});
