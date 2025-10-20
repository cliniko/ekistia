import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import fs from "fs";

// Plugin to serve .gz files when .geojson is requested (for local dev)
const geojsonRewritePlugin = () => ({
  name: 'geojson-rewrite',
  configureServer(server: any) {
    server.middlewares.use((req: any, res: any, next: any) => {
      if (req.url?.endsWith('.geojson')) {
        const gzPath = req.url + '.gz';
        const publicGzPath = path.join(process.cwd(), 'public', gzPath);

        if (fs.existsSync(publicGzPath)) {
          // Serve the .gz file with proper headers
          res.setHeader('Content-Type', 'application/geo+json');
          res.setHeader('Content-Encoding', 'gzip');
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

          const readStream = fs.createReadStream(publicGzPath);
          readStream.pipe(res);
          return;
        }
      }
      next();
    });
  }
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    geojsonRewritePlugin(),
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
      output: {
        manualChunks: {
          // Vendor chunks for better caching
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-popover',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-avatar',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-collapsible',
            '@radix-ui/react-context-menu',
            '@radix-ui/react-hover-card',
            '@radix-ui/react-label',
            '@radix-ui/react-menubar',
            '@radix-ui/react-navigation-menu',
            '@radix-ui/react-progress',
            '@radix-ui/react-radio-group',
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-separator',
            '@radix-ui/react-slider',
            '@radix-ui/react-slot',
            '@radix-ui/react-switch',
            '@radix-ui/react-toggle',
            '@radix-ui/react-toggle-group',
            '@radix-ui/react-aspect-ratio'
          ],
          'charts-vendor': ['recharts'],
          'mapbox-vendor': ['mapbox-gl', 'react-map-gl'],
          'three-vendor': ['three', '@react-three/fiber', '@react-three/drei'],
          'supabase-vendor': ['@supabase/supabase-js', '@tanstack/react-query'],
          'utils-vendor': ['clsx', 'tailwind-merge', 'class-variance-authority', 'lucide-react']
        }
      }
    },
    // Increase chunk size warning limit since Mapbox is large
    chunkSizeWarningLimit: 1000,
    // Enable minification and compression
    minify: 'esbuild',
    sourcemap: false, // Disable sourcemaps for production
    // Optimize CSS
    cssCodeSplit: true,
    // Preload modules for better performance
    modulePreload: {
      polyfill: false
    }
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'mapbox-gl',
      'react-map-gl',
      '@supabase/supabase-js'
    ],
    exclude: ['@react-three/drei'] // Lazy load heavy 3D libraries
  }
}));
