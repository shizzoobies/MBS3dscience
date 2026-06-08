import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Pages serves the contents of dist as static assets, with functions/ layered on top.
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
