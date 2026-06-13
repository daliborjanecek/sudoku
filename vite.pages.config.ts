import { defineConfig } from 'vite';

// App-mode build used only for the GitHub Pages demo. It bundles index.html
// (and the TypeScript it references) into a static site under docs/, which is
// committed so GitHub Pages can serve it directly via "Deploy from a branch"
// (main /docs) — no Actions runner required.
// base: './' keeps asset URLs relative so it works under /<repo>/ on Pages.
export default defineConfig({
  base: './',
  build: {
    outDir: 'docs',
    emptyOutDir: true,
  },
});
