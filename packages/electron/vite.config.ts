import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
      exclude: ['**/*.test.ts', '**/*.test.tsx', '**/__tests__/**/*'],
      outDir: 'dist/renderer',
      tsconfigPath: 'tsconfig.renderer.json',
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/renderer/index.ts'),
      name: 'AudioWaveElectronRenderer',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'esm' : format}.js`,
    },
    outDir: 'dist/renderer',
    rollupOptions: {
      external: ['react', 'react-dom', '@audiowave/react'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          '@audiowave/react': 'AudioWaveReact',
        },
      },
    },
    sourcemap: true,
    minify: 'esbuild',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src/renderer'),
    },
  },
});
