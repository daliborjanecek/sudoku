import { defineConfig } from 'vite';

// App-mode build used only for the GitHub Pages demo. It bundles index.html
// (and the TypeScript it references) into a static site under _site/.
// base: './' keeps asset URLs relative so it works under /<repo>/ on Pages.
export default defineConfig({
  base: './',
  build: {
    outDir: '_site',
    emptyOutDir: true,
  },
});
