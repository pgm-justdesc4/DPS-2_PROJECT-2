// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: false },
  css: ["~/assets/css/main.css"],
  // Tell Vue's template compiler that all `a-*` tags are A-Frame custom elements
  vue: {
    compilerOptions: {
      isCustomElement: (tag) => tag.startsWith("a-"),
    },
  },
  app: {
    head: {
      title: "AR Paskamer | A.S.Adventure",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
      ],
      link: [
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossorigin: "",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Source+Sans+3:ital,wght@0,300;0,400;0,600;0,700;1,400&display=swap",
        },
      ],
      script: [
        // 8th Wall – new open-source stack (no app key needed).
        // Load A-Frame (8-Frame compatible), then XRExtras, then the 8th Wall engine.
        // ⚠️  8th Wall requires HTTPS – run `nuxt dev --https` or deploy to a secure host.
        {
          src: "https://aframe.io/releases/1.5.0/aframe.min.js",
          defer: false,
        },
        {
          src: "https://cdn.jsdelivr.net/npm/@8thwall/xrextras@1/dist/xrextras.js",
          defer: false,
        },
        // 8th Wall engine is injected by app/plugins/xrweb.client.ts
        // so that `data-preload-chunks` is set correctly as a DOM attribute.
      ],
    },
  },
});
