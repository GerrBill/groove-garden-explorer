
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    strictPort: true,
    hmr: {
      timeout: 120000,
    }
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('@radix-ui')) {
              return 'vendor-radix';
            }
            if (id.includes('@tiptap')) {
              return 'vendor-tiptap';
            }
            return 'vendor';
          }
        },
      },
      external: [
        /@tiptap\/pm\/.*/,  // Externalize all ProseMirror dependencies
      ],
    },
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Add specific aliases for ProseMirror packages
      "@tiptap/pm/state": path.resolve(__dirname, "./node_modules/@tiptap/pm/state"),
      "@tiptap/pm/view": path.resolve(__dirname, "./node_modules/@tiptap/pm/view"),
      "@tiptap/pm/model": path.resolve(__dirname, "./node_modules/@tiptap/pm/model"),
      "@tiptap/pm/transform": path.resolve(__dirname, "./node_modules/@tiptap/pm/transform"),
      "@tiptap/pm/commands": path.resolve(__dirname, "./node_modules/@tiptap/pm/commands"),
      "@tiptap/pm/schema-list": path.resolve(__dirname, "./node_modules/@tiptap/pm/schema-list"),
      "@tiptap/pm/keymap": path.resolve(__dirname, "./node_modules/@tiptap/pm/keymap"),
    },
  },
  optimizeDeps: {
    exclude: ['@tiptap/pm'], // Exclude ProseMirror dependencies from optimization
    include: ['@tiptap/extension-link'],
    esbuildOptions: {
      define: {
        global: 'globalThis'
      }
    }
  }
}));
