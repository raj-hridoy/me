/* eslint-disable @typescript-eslint/no-require-imports -- Node preloads require CommonJS. */
// Optional desktop FUSE portal workaround. Not required in normal checkouts.
const root = require("node:path").resolve(__dirname, "..");
process.chdir("/");
process.chdir(root);
const original = process.cwd;
process.cwd = function () {
  try {
    return original.call(process);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    return root;
  }
};

if (process.env.CODEX_PORTAL_WORKAROUND === "1") {
  process.env.NEXT_TEST_WASM = "1";
  process.env.NEXT_TEST_WASM_DIR = require("node:path").join(
    root,
    "node_modules/@next/swc-wasm-nodejs",
  );
}
