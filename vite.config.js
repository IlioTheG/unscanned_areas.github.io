import { defineConfig } from 'vite';

// Automatically adjust the base path for development and production
export default defineConfig(({ command }) => ({
    base: command === 'serve' ? '/' : '/unscanned_areas.github.io/', // '/' for local, '/your-repo-name/' for GitHub Pages
    build: {
        outDir: 'dist', // Default output folder
    }
}));

// export default {
//     server: {
//         open: true,
//     },
// };
