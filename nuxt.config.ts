export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: false },
  css: ["~/assets/css/main.css"],
  // Tell Vue's template compiler that a-* tags are MindAR / A-Frame custom elements
  vue: {
    compilerOptions: {
      isCustomElement: (tag) => tag.startsWith("a-"),
    },
  },
  app: {
    head: {
      title: "Adventure Fit",
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
        {
          src: "https://cdn.jsdelivr.net/npm/aframe@1.4.0/dist/aframe-master.min.js",
          defer: false,
        },
        {
          src: "https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-face-aframe.prod.js",
          defer: false,
        },
      ],
    },
  },
});
