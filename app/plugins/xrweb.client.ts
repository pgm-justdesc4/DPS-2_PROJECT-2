// Dynamically injects the 8th Wall engine script with the required
// `data-preload-chunks` attribute, which Nuxt's static head config cannot
// reliably render as a data-* attribute.
export default defineNuxtPlugin(() => {
  const script = document.createElement("script");
  script.src =
    "https://cdn.jsdelivr.net/npm/@8thwall/engine-binary@1/dist/xr.js";
  script.async = true;
  script.setAttribute("data-preload-chunks", "slam");
  document.head.appendChild(script);
});
