import { defineConfig, splitVendorChunkPlugin } from "vite";
import react from "@vitejs/plugin-react";
import * as path from "path";
import checker from "vite-plugin-checker";
import vitePluginDynamicImport from "vite-plugin-dynamic-import";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import { fileURLToPath } from 'url';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({ jsxRuntime: "classic" }),
    (vitePluginDynamicImport as any)(),
    splitVendorChunkPlugin(),
    checker({ typescript: { tsconfigPath: "tsconfig.json" } }),
    nodePolyfills({
      include: [
        "stream",
        "process",
        "querystring",
        "buffer",
        "util",
        "events",
        "assert",
      ],
    }),
  ],
  resolve: {
    alias: {
      "@solidr-idl": path.resolve(
        "../../programs/solidr-program/target/idl/solidr.json"
      ),
      "@solidr": path.resolve("../../programs/solidr-program/client"),
      "@": fileURLToPath(new URL("./src", import.meta.url))
    },
    preserveSymlinks: true,
    extensions: [".ts", ".tsx", ".js", ".jsx", ".json", ".mjs", ".mts"],
  },
});
