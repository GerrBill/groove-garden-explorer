
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      external: [
        // Externalize all ProseMirror modules used by TipTap
        "@tiptap/pm/state",
        "@tiptap/pm/view",
        "@tiptap/pm/model",
        "@tiptap/pm/transform",
        "@tiptap/pm/commands",
        "@tiptap/pm/keymap",
        "@tiptap/pm/dropcursor",
        "@tiptap/pm/gapcursor",
        "@tiptap/pm/history",
        "@tiptap/pm/inputrules",
        "@tiptap/pm/schema-list",
        "@tiptap/pm/schema-basic",
        "@tiptap/pm/tables",
        "@tiptap/pm/collab",
        "@tiptap/pm/menu"
      ]
    }
  }
}));
