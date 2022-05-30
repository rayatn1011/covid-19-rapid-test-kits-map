import path from "path";
import mkcert from "vite-plugin-mkcert";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import Icons from "unplugin-icons/vite";
import IconsResolver from "unplugin-icons/resolver";
import Components from "unplugin-vue-components/vite";

export default defineConfig({
  server: {
    host: "0.0.0.0",
    https: true,
  },
  plugins: [
    vue(),
    mkcert(),
    Components({
      resolvers: [IconsResolver()],
    }),
    Icons({
      compiler: "vue3",
      autoInstall: true,
    }),
  ],
  resolve: {
    alias: {
      "tailwind.config.js": path.resolve(__dirname, "tailwind.config.js"),
    },
  },
  optimizeDeps: {
    include: ["tailwind.config.js"],
  },
  build: {
    commonjsOptions: {
      include: ["tailwind.config.js", "node_modules/**"],
    },
  },
});
