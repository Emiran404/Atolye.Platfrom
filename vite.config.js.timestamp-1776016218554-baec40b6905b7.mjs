// vite.config.js
import { defineConfig } from "file:///home/project/node_modules/vite/dist/node/index.js";
import react from "file:///home/project/node_modules/@vitejs/plugin-react/dist/index.js";
import tailwindcss from "file:///home/project/node_modules/@tailwindcss/vite/dist/index.mjs";
import obfuscator from "file:///home/project/node_modules/rollup-plugin-javascript-obfuscator/dist/rollup-plugin-javascript-obfuscator.cjs.js";
var vite_config_default = defineConfig(({ command }) => ({
  plugins: [
    react(),
    tailwindcss(),
    // Sadece build aşamasında çalışan kod karıştırıcı (obfuscator)
    command === "build" && obfuscator({
      compact: true,
      controlFlowFlattening: true,
      controlFlowFlatteningThreshold: 1,
      numbersToExpressions: true,
      simplify: true,
      stringArrayThreshold: 1,
      splitStrings: true,
      splitStringsChunkLength: 5,
      unicodeEscapeSequence: false
    })
  ],
  build: {
    sourcemap: false,
    // F12'de orijinal kodun gözükmesini engeller
    minify: "terser",
    // Daha agresif küçültme
    terserOptions: {
      compress: {
        drop_console: true,
        // Console logları temizler
        drop_debugger: true
      }
    }
  },
  server: {
    host: "0.0.0.0",
    port: process.env.PORT ? parseInt(process.env.PORT) : 80,
    watch: {
      ignored: ["**/src/uploads_student/**"]
    },
    proxy: {
      "/api": {
        target: "http://127.0.0.1:3001",
        changeOrigin: true
      },
      "/uploads": {
        target: "http://127.0.0.1:3001",
        changeOrigin: true,
        secure: false
      },
      "/socket.io": {
        target: "http://127.0.0.1:3001",
        ws: true,
        changeOrigin: true
      },
      "/polyos-socket": {
        target: "http://127.0.0.1:3001",
        ws: true,
        changeOrigin: true
      }
    }
  },
  preview: {
    port: 4173,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:3001",
        changeOrigin: true
      },
      "/uploads": {
        target: "http://127.0.0.1:3001",
        changeOrigin: true,
        secure: false
      },
      "/socket.io": {
        target: "http://127.0.0.1:3001",
        ws: true,
        changeOrigin: true
      },
      "/polyos-socket": {
        target: "http://127.0.0.1:3001",
        ws: true,
        changeOrigin: true
      }
    }
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcuanNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0J1xuaW1wb3J0IHRhaWx3aW5kY3NzIGZyb20gJ0B0YWlsd2luZGNzcy92aXRlJ1xuaW1wb3J0IG9iZnVzY2F0b3IgZnJvbSAncm9sbHVwLXBsdWdpbi1qYXZhc2NyaXB0LW9iZnVzY2F0b3InXG5cbi8vIGh0dHBzOi8vdml0ZS5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IGNvbW1hbmQgfSkgPT4gKHtcbiAgcGx1Z2luczogW1xuICAgIHJlYWN0KCksXG4gICAgdGFpbHdpbmRjc3MoKSxcbiAgICAvLyBTYWRlY2UgYnVpbGQgYVx1MDE1RmFtYXNcdTAxMzFuZGEgXHUwMEU3YWxcdTAxMzFcdTAxNUZhbiBrb2Qga2FyXHUwMTMxXHUwMTVGdFx1MDEzMXJcdTAxMzFjXHUwMTMxIChvYmZ1c2NhdG9yKVxuICAgIGNvbW1hbmQgPT09ICdidWlsZCcgJiYgb2JmdXNjYXRvcih7XG4gICAgICBjb21wYWN0OiB0cnVlLFxuICAgICAgY29udHJvbEZsb3dGbGF0dGVuaW5nOiB0cnVlLFxuICAgICAgY29udHJvbEZsb3dGbGF0dGVuaW5nVGhyZXNob2xkOiAxLFxuICAgICAgbnVtYmVyc1RvRXhwcmVzc2lvbnM6IHRydWUsXG4gICAgICBzaW1wbGlmeTogdHJ1ZSxcbiAgICAgIHN0cmluZ0FycmF5VGhyZXNob2xkOiAxLFxuICAgICAgc3BsaXRTdHJpbmdzOiB0cnVlLFxuICAgICAgc3BsaXRTdHJpbmdzQ2h1bmtMZW5ndGg6IDUsXG4gICAgICB1bmljb2RlRXNjYXBlU2VxdWVuY2U6IGZhbHNlXG4gICAgfSlcbiAgXSxcbiAgYnVpbGQ6IHtcbiAgICBzb3VyY2VtYXA6IGZhbHNlLCAvLyBGMTInZGUgb3JpamluYWwga29kdW4gZ1x1MDBGNnpcdTAwRkNrbWVzaW5pIGVuZ2VsbGVyXG4gICAgbWluaWZ5OiAndGVyc2VyJywgLy8gRGFoYSBhZ3Jlc2lmIGtcdTAwRkNcdTAwRTdcdTAwRkNsdG1lXG4gICAgdGVyc2VyT3B0aW9uczoge1xuICAgICAgY29tcHJlc3M6IHtcbiAgICAgICAgZHJvcF9jb25zb2xlOiB0cnVlLCAvLyBDb25zb2xlIGxvZ2xhclx1MDEzMSB0ZW1pemxlclxuICAgICAgICBkcm9wX2RlYnVnZ2VyOiB0cnVlXG4gICAgICB9XG4gICAgfVxuICB9LFxuICBzZXJ2ZXI6IHtcbiAgICBob3N0OiAnMC4wLjAuMCcsXG4gICAgcG9ydDogcHJvY2Vzcy5lbnYuUE9SVCA/IHBhcnNlSW50KHByb2Nlc3MuZW52LlBPUlQpIDogODAsXG4gICAgd2F0Y2g6IHtcbiAgICAgIGlnbm9yZWQ6IFsnKiovc3JjL3VwbG9hZHNfc3R1ZGVudC8qKiddXG4gICAgfSxcbiAgICBwcm94eToge1xuICAgICAgJy9hcGknOiB7XG4gICAgICAgIHRhcmdldDogJ2h0dHA6Ly8xMjcuMC4wLjE6MzAwMScsXG4gICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcbiAgICAgIH0sXG4gICAgICAnL3VwbG9hZHMnOiB7XG4gICAgICAgIHRhcmdldDogJ2h0dHA6Ly8xMjcuMC4wLjE6MzAwMScsXG4gICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcbiAgICAgICAgc2VjdXJlOiBmYWxzZSxcbiAgICAgIH0sXG4gICAgICAnL3NvY2tldC5pbyc6IHtcbiAgICAgICAgdGFyZ2V0OiAnaHR0cDovLzEyNy4wLjAuMTozMDAxJyxcbiAgICAgICAgd3M6IHRydWUsXG4gICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZVxuICAgICAgfSxcbiAgICAgICcvcG9seW9zLXNvY2tldCc6IHtcbiAgICAgICAgdGFyZ2V0OiAnaHR0cDovLzEyNy4wLjAuMTozMDAxJyxcbiAgICAgICAgd3M6IHRydWUsXG4gICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZVxuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgcHJldmlldzoge1xuICAgIHBvcnQ6IDQxNzMsXG4gICAgcHJveHk6IHtcbiAgICAgICcvYXBpJzoge1xuICAgICAgICB0YXJnZXQ6ICdodHRwOi8vMTI3LjAuMC4xOjMwMDEnLFxuICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXG4gICAgICB9LFxuICAgICAgJy91cGxvYWRzJzoge1xuICAgICAgICB0YXJnZXQ6ICdodHRwOi8vMTI3LjAuMC4xOjMwMDEnLFxuICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXG4gICAgICAgIHNlY3VyZTogZmFsc2UsXG4gICAgICB9LFxuICAgICAgJy9zb2NrZXQuaW8nOiB7XG4gICAgICAgIHRhcmdldDogJ2h0dHA6Ly8xMjcuMC4wLjE6MzAwMScsXG4gICAgICAgIHdzOiB0cnVlLFxuICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWVcbiAgICAgIH0sXG4gICAgICAnL3BvbHlvcy1zb2NrZXQnOiB7XG4gICAgICAgIHRhcmdldDogJ2h0dHA6Ly8xMjcuMC4wLjE6MzAwMScsXG4gICAgICAgIHdzOiB0cnVlLFxuICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWVcbiAgICAgIH1cbiAgICB9XG4gIH1cbn0pKVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUF5TixTQUFTLG9CQUFvQjtBQUN0UCxPQUFPLFdBQVc7QUFDbEIsT0FBTyxpQkFBaUI7QUFDeEIsT0FBTyxnQkFBZ0I7QUFHdkIsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxRQUFRLE9BQU87QUFBQSxFQUM1QyxTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUEsSUFDTixZQUFZO0FBQUE7QUFBQSxJQUVaLFlBQVksV0FBVyxXQUFXO0FBQUEsTUFDaEMsU0FBUztBQUFBLE1BQ1QsdUJBQXVCO0FBQUEsTUFDdkIsZ0NBQWdDO0FBQUEsTUFDaEMsc0JBQXNCO0FBQUEsTUFDdEIsVUFBVTtBQUFBLE1BQ1Ysc0JBQXNCO0FBQUEsTUFDdEIsY0FBYztBQUFBLE1BQ2QseUJBQXlCO0FBQUEsTUFDekIsdUJBQXVCO0FBQUEsSUFDekIsQ0FBQztBQUFBLEVBQ0g7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNMLFdBQVc7QUFBQTtBQUFBLElBQ1gsUUFBUTtBQUFBO0FBQUEsSUFDUixlQUFlO0FBQUEsTUFDYixVQUFVO0FBQUEsUUFDUixjQUFjO0FBQUE7QUFBQSxRQUNkLGVBQWU7QUFBQSxNQUNqQjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixNQUFNLFFBQVEsSUFBSSxPQUFPLFNBQVMsUUFBUSxJQUFJLElBQUksSUFBSTtBQUFBLElBQ3RELE9BQU87QUFBQSxNQUNMLFNBQVMsQ0FBQywyQkFBMkI7QUFBQSxJQUN2QztBQUFBLElBQ0EsT0FBTztBQUFBLE1BQ0wsUUFBUTtBQUFBLFFBQ04sUUFBUTtBQUFBLFFBQ1IsY0FBYztBQUFBLE1BQ2hCO0FBQUEsTUFDQSxZQUFZO0FBQUEsUUFDVixRQUFRO0FBQUEsUUFDUixjQUFjO0FBQUEsUUFDZCxRQUFRO0FBQUEsTUFDVjtBQUFBLE1BQ0EsY0FBYztBQUFBLFFBQ1osUUFBUTtBQUFBLFFBQ1IsSUFBSTtBQUFBLFFBQ0osY0FBYztBQUFBLE1BQ2hCO0FBQUEsTUFDQSxrQkFBa0I7QUFBQSxRQUNoQixRQUFRO0FBQUEsUUFDUixJQUFJO0FBQUEsUUFDSixjQUFjO0FBQUEsTUFDaEI7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ04sT0FBTztBQUFBLE1BQ0wsUUFBUTtBQUFBLFFBQ04sUUFBUTtBQUFBLFFBQ1IsY0FBYztBQUFBLE1BQ2hCO0FBQUEsTUFDQSxZQUFZO0FBQUEsUUFDVixRQUFRO0FBQUEsUUFDUixjQUFjO0FBQUEsUUFDZCxRQUFRO0FBQUEsTUFDVjtBQUFBLE1BQ0EsY0FBYztBQUFBLFFBQ1osUUFBUTtBQUFBLFFBQ1IsSUFBSTtBQUFBLFFBQ0osY0FBYztBQUFBLE1BQ2hCO0FBQUEsTUFDQSxrQkFBa0I7QUFBQSxRQUNoQixRQUFRO0FBQUEsUUFDUixJQUFJO0FBQUEsUUFDSixjQUFjO0FBQUEsTUFDaEI7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGLEVBQUU7IiwKICAibmFtZXMiOiBbXQp9Cg==
