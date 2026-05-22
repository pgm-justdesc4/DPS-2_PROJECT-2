<template>
  <div class="page-wrapper">
    <div class="container header-section">
      <img
        src="https://www.asadventure.com/content/dam/asadventure/logo/default.png/_jcr_content/renditions/cq5dam.web.320.320.png"
        alt="Logo A.S.Adventure"
        class="logo-img"
      />
    </div>

    <!-- Product Section -->
    <div class="container product-section">
      <!-- Left: AR Camera Section -->
      <div class="product-gallery">
        <!-- 8th Wall AR scene – camera + body tracking + clothing overlay -->
        <div class="ar-wrapper">
          <ClientOnly>
            <a-scene
              id="ar-scene"
              embedded
              xrconfig="allowedDevices: any"
              xrweb="allowedDevices: any"
              xrextras-runtime-error
              renderer="colorManagement: true; physicallyCorrectLights: true"
              vr-mode-ui="enabled: false"
              device-orientation-permission-ui="enabled: false"
            >
              <a-assets>
                <a-asset-item
                  v-if="currentProduct"
                  id="clothing-model"
                  :src="currentProduct.model"
                />
              </a-assets>

              <!-- Ambient + directional lights for realistic shading -->
              <a-light type="ambient" color="#ffffff" intensity="1.2" />
              <a-light type="directional" position="0 5 5" intensity="0.8" />

              <!-- Camera – 8th Wall drives the real camera feed as background -->
              <a-camera position="0 0 0" look-controls="enabled: false" />

              <!--
                Clothing entity (torso only).
                The `body-clothing` A-Frame component (registered in onMounted)
                listens for 8th Wall `xrbodyupdated` / `xrbodylost` events and
                snaps this entity onto the detected torso attachment point.
              -->
              <a-entity
                v-if="currentProduct"
                id="clothing-entity"
                gltf-model="#clothing-model"
                body-clothing
                scale="1 1 1"
                visible="false"
              />
            </a-scene>
          </ClientOnly>

          <!-- Overlay shown when no product has been scanned yet -->
          <div v-if="!currentProduct" class="scan-placeholder">
            <svg
              width="52"
              height="52"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect x="3" y="3" width="5" height="5" rx="1" />
              <rect x="16" y="3" width="5" height="5" rx="1" />
              <rect x="3" y="16" width="5" height="5" rx="1" />
              <path d="M21 16h-5v5M16 21v-4M21 21h-2" />
              <path d="M7 7h.01M17 7h.01M7 17h.01" />
            </svg>
            <p v-if="!serialConnected">
              Connect de Arduino en scan een product om te starten.
            </p>
            <p v-else-if="scannedTag && !currentProduct" class="scan-unknown">
              Onbekende tag: <code>{{ scannedTag }}</code>
            </p>
            <p v-else>Wachten op RFID scan…</p>
          </div>
        </div>
        <!-- RFID / Arduino controls -->
        <div class="camera-controls">
          <div class="rfid-row">
            <button
              v-if="!serialConnected"
              type="button"
              class="show-more-btn"
              @click="connectArduino"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <rect x="2" y="7" width="20" height="14" rx="2" />
                <path d="M16 3h-8M12 3v4" />
              </svg>
              Connect Arduino
            </button>
            <button
              v-else
              type="button"
              class="show-more-btn show-more-btn--stop"
              @click="disconnectArduino"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <rect x="2" y="7" width="20" height="14" rx="2" />
                <path d="M16 3h-8M12 3v4" />
              </svg>
              Disconnect Arduino
            </button>
            <span
              v-if="serialConnected"
              class="rfid-badge rfid-badge--connected"
              >Connected</span
            >
            <span v-if="serialError" class="rfid-badge rfid-badge--error">{{
              serialError
            }}</span>
          </div>

          <div v-if="scannedTag" class="rfid-tag-row">
            <span class="rfid-tag-label">Gescande tag:</span>
            <code class="rfid-tag-value">{{ scannedTag }}</code>
          </div>

          <p v-if="serialConnected && !scannedTag" class="rfid-hint">
            Wachten op RFID scan… Camera start automatisch.
          </p>
          <p v-if="!serialConnected" class="rfid-hint">
            Verbind de Arduino en scan een kledingitem.
          </p>
        </div>
      </div>

      <!-- Right: Product Info (loaded dynamically from data.json after RFID scan) -->
      <div class="product-info">
        <!-- Product loaded -->
        <template v-if="currentProduct">
          <div class="product-brand-row">
            <span class="brand-link">{{ currentProduct.brand }}</span>
          </div>
          <h1 class="product-title">{{ currentProduct.title }}</h1>

          <p class="product-short-desc">{{ currentProduct.description }}</p>

          <!-- Colour swatches (derived from variants) -->
          <div class="colour-section">
            <p class="colour-label">
              Kleur: <strong>{{ selectedColor }}</strong>
            </p>
            <div class="colour-swatches">
              <button
                v-for="color in availableColors"
                :key="color"
                type="button"
                class="swatch-btn swatch-btn--solid"
                :class="{ 'swatch-btn--selected': selectedColor === color }"
                :title="color"
                :style="{ backgroundColor: colorHexMap[color] ?? '#cccccc' }"
                @click="selectedColor = color"
              />
            </div>
          </div>

          <!-- Size buttons (derived from variants) -->
          <div class="size-section">
            <p class="size-label">Selecteer maat:</p>
            <div class="size-buttons">
              <button
                v-for="sz in availableSizes"
                :key="sz"
                type="button"
                class="size-btn"
                :class="{ 'size-btn--selected': selectedSize === sz }"
                @click="selectedSize = sz"
              >
                {{ sz }}
              </button>
            </div>
            <p class="stock-guide">
              Voorraad:
              <strong
                :class="{
                  'stock-low':
                    currentStock !== null &&
                    currentStock > 0 &&
                    currentStock <= 3,
                  'stock-none': currentStock === 0,
                }"
              >
                {{ currentStock !== null ? currentStock : "–" }}
              </strong>
            </p>
          </div>

          <!-- Price -->
          <div class="price-row">
            <span class="price">€{{ currentProduct.price.toFixed(2) }}</span>
          </div>

          <!-- Actions -->
          <div class="add-row">
            <button type="button" class="add-btn">In winkelwagen</button>
            <button type="button" class="wishlist-btn" title="Verlanglijst">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path
                  d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                />
              </svg>
            </button>
          </div>

          <!-- Benefits -->
          <div class="benefits-list">
            <div class="benefit-item">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Gratis levering vanaf €45</span>
            </div>
            <div class="benefit-item">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>30 dagen retourrecht</span>
            </div>
          </div>
        </template>

        <!-- No product scanned yet -->
        <template v-else>
          <div class="no-product-placeholder">
            <svg
              width="56"
              height="56"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ccc"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            <p>Scan een kledingitem om de productinfo te laden.</p>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import catalogData from "~/data/data.json";

// ── Product catalogue ──────────────────────────────────────────────────────
const clothes = catalogData.clothes;

// Dutch color name → hex (swatches + AR material)
const colorHexMap: Record<string, string> = {
  Zwart: "#1a1a1a",
  Donkerbruin: "#4a2c17",
  Rood: "#d62d20",
  Wit: "#f0f0f0",
  Blauw: "#1a3a6b",
  Groen: "#2d7a3a",
  Grijs: "#808080",
  Beige: "#c8a97e",
};

// ── RFID state ─────────────────────────────────────────────────────────────
const scannedTag = ref("");

// ── Current product (matched from scanned RFID tag) ───────────────────────
const currentProduct = computed(() =>
  scannedTag.value
    ? (clothes.find((c) => c.id === scannedTag.value) ?? null)
    : null,
);

// Unique colors and sizes derived from the current product's variants
const availableColors = computed(() => {
  if (!currentProduct.value) return [];
  return [...new Set(currentProduct.value.variants.map((v) => v.color))];
});

const availableSizes = computed(() => {
  if (!currentProduct.value) return [];
  return [...new Set(currentProduct.value.variants.map((v) => v.size))];
});

// ── Selection state ────────────────────────────────────────────────────────
const selectedColor = ref("");
const selectedSize = ref("");

// Reset selections whenever a new product is loaded
watch(currentProduct, (product) => {
  if (!product) return;
  const colors = [...new Set(product.variants.map((v) => v.color))];
  const sizes = [...new Set(product.variants.map((v) => v.size))];
  selectedColor.value = colors[0] ?? "";
  selectedSize.value = sizes[0] ?? "";
});

// Stock for the currently selected color + size combination
const currentStock = computed(() => {
  if (!currentProduct.value || !selectedColor.value || !selectedSize.value)
    return null;
  const variant = currentProduct.value.variants.find(
    (v) => v.color === selectedColor.value && v.size === selectedSize.value,
  );
  return variant?.stock ?? 0;
});

// ── AR: apply selected color to the GLB model materials ───────────────────
function applyColorToModel(hexColor: string) {
  if (!import.meta.client) return;
  const entity = document.getElementById("clothing-entity") as any;
  if (!entity?.object3D) return;
  entity.object3D.traverse((node: any) => {
    if (node.isMesh && node.material) {
      // Clone the material the first time so we don't mutate the shared GLB material
      if (!node.userData.materialCloned) {
        node.material = node.material.clone();
        node.userData.materialCloned = true;
      }
      node.material.color.set(hexColor);
      node.material.needsUpdate = true;
    }
  });
}

watch(selectedColor, (color) => {
  const hex = colorHexMap[color] ?? "#888888";
  // Try immediately in case the model is already loaded
  applyColorToModel(hex);
  // Also attach a one-time model-loaded listener in case it isn't loaded yet
  if (!import.meta.client) return;
  nextTick(() => {
    const entity = document.getElementById("clothing-entity") as any;
    if (!entity) return;
    entity.addEventListener("model-loaded", () => applyColorToModel(hex), {
      once: true,
    });
  });
});

// ── 8th Wall: register custom A-Frame `body-clothing` component ────────────
// This component listens for 8th Wall body-tracking pipeline events and
// anchors the clothing entity to the detected torso attachment point.
onMounted(() => {
  if (!import.meta.client) return;

  const register = () => {
    const AFRAME = (window as any).AFRAME;
    if (!AFRAME || AFRAME.components["body-clothing"]) return;

    AFRAME.registerComponent("body-clothing", {
      init(this: any) {
        const scene = this.el.sceneEl;
        const el = this.el;

        // 8th Wall fires `xrbodyupdated` with `attachmentPoints` containing
        // named joint transforms. We use `torso` for clothing (body only).
        scene.addEventListener("xrbodyupdated", (e: any) => {
          const torso = e.detail?.attachmentPoints?.torso;
          if (!torso) return;
          el.object3D.position.copy(torso.position);
          el.object3D.quaternion.copy(torso.quaternion);
          el.setAttribute("visible", true);
        });

        scene.addEventListener("xrbodylost", () => {
          el.setAttribute("visible", false);
        });

        // Apply initial color once the model has loaded
        el.addEventListener("model-loaded", () => {
          const hex = colorHexMap[selectedColor.value] ?? "#888888";
          applyColorToModel(hex);
        });
      },
    });
  };

  // A-Frame may already be available (sync) or still loading from CDN (async)
  if ((window as any).AFRAME) {
    register();
  } else {
    window.addEventListener("load", register, { once: true });
    setTimeout(register, 2000); // fallback
  }
});

// ── RFID via Web Serial API ────────────────────────────────────────────────
const serialConnected = ref(false);
const serialError = ref("");
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let serialPort: any = null;
let serialReader: ReadableStreamDefaultReader<Uint8Array> | null = null;

async function connectArduino() {
  serialError.value = "";
  if (!("serial" in navigator)) {
    serialError.value = "Web Serial not supported. Use Chrome or Edge.";
    return;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    serialPort = await (navigator as any).serial.requestPort();
    await serialPort!.open({ baudRate: 9600 });
    serialConnected.value = true;
    readSerialLoop();
  } catch (err: unknown) {
    serialError.value =
      err instanceof Error ? err.message : "Could not connect to Arduino.";
  }
}

async function disconnectArduino() {
  try {
    await serialReader?.cancel();
    serialReader = null;
    await serialPort?.close();
    serialPort = null;
  } catch (_) {}
  serialConnected.value = false;
}

async function readSerialLoop() {
  if (!serialPort?.readable) return;
  const decoder = new TextDecoder();
  let buffer = "";
  serialReader = serialPort.readable.getReader();
  try {
    while (true) {
      if (!serialReader) break;
      const { value, done } = await serialReader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      // Arduino sends one tag ID per line
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        // Strip optional "Tag ID: " prefix sent by the Arduino sketch
        const raw = line.trim();
        const tag = raw.startsWith("Tag ID:") ? raw.slice(7).trim() : raw;
        if (tag) {
          // Setting scannedTag triggers currentProduct to update,
          // which mounts the a-entity and loads the GLB – 8th Wall
          // handles the camera automatically via the <a-scene xrweb> pipeline.
          scannedTag.value = tag;
        }
      }
    }
  } catch (_) {
    // reader cancelled or port closed
  } finally {
    serialReader = null;
  }
}

onUnmounted(() => {
  disconnectArduino();
});

onUnmounted(() => {
  disconnectArduino();
});
</script>

<style scoped>
.page-wrapper {
  min-height: 100vh;
}

/* ─── Header Section ────────────────────────── */
.header-section {
  display: flex;
  justify-content: center;
}

/* ─── Product Section ─────────────────────── */
.product-section {
  display: grid;
  grid-template-columns: 1fr 420px;
  gap: 48px;
  padding-top: 32px;
  padding-bottom: 48px;
  align-items: start;
}

/* Camera */
.camera-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 4/3;
  background: #111;
  border-radius: 6px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* AR wrapper – contains the embedded <a-scene> + scan placeholder overlay */
.ar-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 4/3;
  background: #111;
  border-radius: 6px;
  overflow: hidden;
}

/* Make the A-Frame canvas fill the wrapper */
.ar-wrapper :deep(a-scene) {
  width: 100% !important;
  height: 100% !important;
}

.ar-wrapper :deep(canvas) {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover;
}

/* Overlay shown before any product is scanned */
.scan-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  color: #888;
  font-size: 14px;
  text-align: center;
  padding: 24px;
  background: #1a1a1a;
  pointer-events: none;
}

.scan-unknown {
  color: #c0392b;
}

.scan-unknown code {
  font-family: monospace;
  background: rgba(255, 255, 255, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
}

.camera-controls {
  margin-top: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* No-product placeholder in the info panel */
.no-product-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 48px 24px;
  color: #aaa;
  font-size: 15px;
  text-align: center;
}

/* Stock color helpers */
.stock-low {
  color: #e8a020;
  font-weight: 700;
}

.stock-none {
  color: #c0392b;
  font-weight: 700;
}

/* Solid color swatch (no image) */
.swatch-btn--solid {
  border-radius: 50%;
  border: 2px solid transparent;
}

/* RFID status row */
.rfid-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.rfid-badge {
  font-size: 12px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 20px;
}

.rfid-badge--connected {
  background: #e8f5ee;
  color: #376253;
}

.rfid-badge--error {
  background: #fff0f0;
  color: #c0392b;
}

.rfid-tag-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.rfid-tag-label {
  color: #707070;
}

.rfid-tag-value {
  font-family: monospace;
  background: #f3f3f3;
  padding: 2px 8px;
  border-radius: 4px;
  color: #171717;
  font-size: 13px;
  letter-spacing: 0.05em;
}

.rfid-hint {
  font-size: 13px;
  color: #909090;
  margin: 0;
}

.show-more-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #376253;
  background: none;
  border: 1.5px solid #376253;
  border-radius: 6px;
  padding: 9px 16px;
  cursor: pointer;
  transition: background-color 0.15s;
  font-family: inherit;
}

.show-more-btn:hover {
  background-color: #f0f7f4;
}

.show-more-btn--stop {
  color: #c0392b;
  border-color: #c0392b;
}

.show-more-btn--stop:hover {
  background-color: #fff0ef;
}

/* Product Info */
.product-info {
  position: sticky;
  top: 88px;
}

.product-brand-row {
  margin-bottom: 4px;
}

.brand-link {
  font-size: 14px;
  color: #606060;
  font-weight: 400;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.brand-link:hover {
  color: #171717;
}

.product-title {
  font-size: 24px;
  font-weight: 700;
  color: #171717;
  line-height: 1.25;
  margin-bottom: 10px;
}

/* Rating */
.rating-row {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
}

.stars {
  display: flex;
  align-items: center;
  gap: 1px;
}

.star--full {
  color: #e8a020;
}

.review-count {
  font-size: 13px;
  color: #606060;
  text-decoration: underline;
  text-underline-offset: 2px;
}

/* Short desc */
.product-short-desc {
  font-size: 15px;
  color: #505050;
  line-height: 1.55;
  margin-bottom: 20px;
}

/* Colour */
.colour-section {
  margin-bottom: 16px;
}

.colour-label {
  font-size: 14px;
  color: #404040;
  margin-bottom: 10px;
}

.colour-swatches {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.swatch-btn {
  width: 36px;
  height: 36px;
  padding: 2px;
  border: 2px solid transparent;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  background: none;
  transition: border-color 0.15s;
}

.swatch-btn img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  display: block;
}

.swatch-btn--selected {
  border-color: #171717;
}

.swatch-btn:hover:not(.swatch-btn--selected) {
  border-color: #909090;
}

/* Size */
.size-section {
  margin-bottom: 20px;
}

.size-label {
  font-size: 14px;
  color: #404040;
  font-weight: 600;
  margin-bottom: 10px;
}

.size-buttons {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}

.size-btn {
  min-width: 44px;
  height: 44px;
  padding: 0 8px;
  border: 1px solid #e7e5e4;
  border-radius: 6px;
  background: #fff;
  font-size: 16px;
  color: #404040;
  cursor: pointer;
  font-family: inherit;
  transition:
    border-color 0.15s,
    background-color 0.15s,
    color 0.15s;
}

.size-btn:hover {
  border-color: #376253;
}

.size-btn--selected {
  background: #376253;
  border-color: #376253;
  color: #fff;
  font-weight: 600;
}

.stock-guide {
  font-size: 13px;
  color: #606060;
  display: flex;
  align-items: center;
  gap: 6px;
}

.stock-guide a {
  color: #376253;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.stock-sep {
  color: #c0c0c0;
}

/* Price */
.price-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.price {
  font-size: 32px;
  font-weight: 700;
  color: #171717;
}

.price-info-btn {
  color: #909090;
  padding: 0;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
}

/* Add to basket */
.add-row {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
}

.add-btn {
  flex: 1;
  height: 52px;
  background: #376253;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: background-color 0.2s;
}

.add-btn:hover {
  background: #2d5245;
}

.wishlist-btn {
  width: 52px;
  height: 52px;
  border: 1.5px solid #d0d0d0;
  border-radius: 6px;
  background: #fff;
  color: #404040;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition:
    border-color 0.15s,
    color 0.15s;
  flex-shrink: 0;
}

.wishlist-btn:hover {
  border-color: #376253;
  color: #376253;
}

/* Store stock */
.store-stock-btn {
  width: 100%;
  height: 48px;
  background: #376253;
  color: #fff;
  border-radius: 6px;
  font-size: 15px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  font-family: inherit;
  margin-bottom: 14px;
  transition: background-color 0.15s;
}

.store-stock-btn:hover {
  background: #2d5245;
}

/* Compare */
.compare-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  cursor: pointer;
}

.compare-checkbox {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #376253;
}

.compare-label {
  font-size: 14px;
  color: #404040;
}

/* Benefits */
.benefits-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  border-top: 1px solid #f0f0f0;
  padding-top: 18px;
}

.benefit-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
}

.benefit-item a {
  color: #404040;
}

.benefit-item a:hover {
  text-decoration: underline;
}

/* ─── About Section ───────────────────────── */
.about-section {
  padding: 48px 0;
  border-top: 1px solid #f0f0f0;
}

.section-title {
  font-size: 22px;
  font-weight: 700;
  color: #171717;
  margin-bottom: 24px;
}

/* Tabs */
.tabs-nav {
  display: flex;
  gap: 0;
  border-bottom: 2px solid #e8e8e8;
  margin-bottom: 28px;
}

.tab-btn {
  padding: 12px 24px;
  font-size: 15px;
  font-weight: 500;
  color: #606060;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  cursor: pointer;
  font-family: inherit;
  transition:
    color 0.15s,
    border-color 0.15s;
  white-space: nowrap;
}

.tab-btn:hover {
  color: #171717;
}

.tab-btn--active {
  color: #376253;
  font-weight: 700;
  border-bottom-color: #376253;
}

.tab-content {
  max-width: 720px;
}

/* Accordion */
.accordion-item {
  border-top: 1px solid #e8e8e8;
}

.accordion-item:last-child {
  border-bottom: 1px solid #e8e8e8;
}

.accordion-header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #171717;
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
}

.accordion-header--open {
  color: #376253;
}

.accordion-icon {
  flex-shrink: 0;
  transition: transform 0.2s;
}

.accordion-icon--open {
  transform: rotate(180deg);
}

.accordion-body {
  padding-bottom: 20px;
  font-size: 15px;
  color: #505050;
  line-height: 1.6;
}

.accordion-body a {
  color: #376253;
  text-decoration: underline;
}

/* Details table */
.details-table {
  border-collapse: collapse;
  width: 100%;
  font-size: 15px;
}

.details-table tr {
  border-bottom: 1px solid #f0f0f0;
}

.details-table td {
  padding: 12px 16px 12px 0;
  color: #404040;
  vertical-align: top;
}

.dt-label {
  color: #707070;
  width: 220px;
  font-weight: 500;
}

/* Reviews */
.reviews-summary {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px 0 24px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 24px;
}

.reviews-score {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.reviews-number {
  font-size: 36px;
  font-weight: 700;
  color: #171717;
  line-height: 1;
}

.reviews-of {
  font-size: 12px;
  color: #707070;
}

.reviews-sub {
  font-size: 12px;
  color: #909090;
}

.reviews-stars-big {
  display: flex;
  gap: 2px;
}

.reviews-label {
  font-size: 14px;
  color: #707070;
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.review-card {
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.review-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.review-stars {
  display: flex;
  gap: 2px;
}

.review-author {
  font-weight: 600;
  font-size: 14px;
  color: #171717;
}

.review-date {
  font-size: 13px;
  color: #909090;
}

.review-text {
  font-size: 15px;
  color: #505050;
  line-height: 1.55;
}

/* ─── Carousel Sections ───────────────────── */
.carousel-section {
  padding: 40px 0;
  border-top: 1px solid #f0f0f0;
}

.product-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  overflow-x: auto;
}

.product-card {
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  overflow: hidden;
  transition: box-shadow 0.2s;
}

.product-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.product-card__image-wrap {
  display: block;
  position: relative;
  background: #fafafa;
  overflow: hidden;
  aspect-ratio: 2/3;
}

.product-card__image-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.3s;
}

.product-card:hover .product-card__image-wrap img {
  transform: scale(1.03);
}

.card-compare-btn {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid #d0d0d0;
  border-radius: 20px;
  padding: 5px 16px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  opacity: 0;
  transition: opacity 0.15s;
  white-space: nowrap;
}

.product-card:hover .card-compare-btn {
  opacity: 1;
}

.product-card__body {
  padding: 12px;
}

.card-brand {
  font-size: 12px;
  color: #909090;
  margin-bottom: 3px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.card-name {
  display: block;
  font-size: 14px;
  color: #171717;
  font-weight: 500;
  line-height: 1.3;
  margin-bottom: 8px;
}

.card-name:hover {
  text-decoration: underline;
}

.card-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  flex-wrap: wrap;
}

.card-rating {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #909090;
}

.card-price {
  font-size: 15px;
  font-weight: 700;
  color: #171717;
}

.card-colors {
  margin-top: 5px;
}

.card-colors-count {
  font-size: 12px;
  color: #707070;
}
</style>
