import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

// Copies dist/index.html → dist/404.html so GitHub Pages can serve the SPA
// for direct-route visits (e.g. /WTM_System/dashboard) and page refreshes.
function spaFallback() {
    return {
        name: 'spa-fallback-404',
        apply: 'build' as const,
        closeBundle() {
            const dist = path.resolve(__dirname, 'dist');
            const indexHtml = path.join(dist, 'index.html');
            const notFoundHtml = path.join(dist, '404.html');
            if (fs.existsSync(indexHtml)) {
                fs.copyFileSync(indexHtml, notFoundHtml);
            }
        },
    };
}

export default defineConfig({
    plugins: [react(), spaFallback()],
    base: '/WTM_System/',
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src')
        },
    },
    server: {
        port: 5173,
    },
});
