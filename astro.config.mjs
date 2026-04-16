import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://scottyang.org",
  output: "static",
  integrations: [mdx(), react()],
  vite: {
    plugins: [tailwindcss()],
  },
});
