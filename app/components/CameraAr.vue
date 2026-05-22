<template>
  <div class="product-gallery">
    <div class="ar-placeholder">
      <ClientOnly>
        <a-scene
          v-if="sceneReady"
          id="ar-scene"
          mindar-face
          embedded
          color-space="sRGB"
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
          <a-camera active="false" position="0 0 0" />
          <a-entity mindar-face-target="anchorIndex: 152">
            <a-entity
              v-if="currentProduct"
              gltf-model="#clothing-model"
              position="0 -0.5 0"
              scale="0.5 0.5 0.5"
            />
          </a-entity>
        </a-scene>
      </ClientOnly>

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
        <p v-else-if="modelValue && !currentProduct" class="scan-unknown">
          Onbekende tag: <code>{{ modelValue }}</code>
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
        <span v-if="serialConnected" class="rfid-badge rfid-badge--connected"
          >Connected</span
        >
        <span v-if="serialError" class="rfid-badge rfid-badge--error">{{
          serialError
        }}</span>
      </div>

      <div v-if="modelValue" class="rfid-tag-row">
        <span class="rfid-tag-label">Gescande tag:</span>
        <code class="rfid-tag-value">{{ modelValue }}</code>
      </div>

      <p v-if="serialConnected && !modelValue" class="rfid-hint">
        Wachten op RFID scan… Camera start automatisch.
      </p>
      <p v-if="!serialConnected" class="rfid-hint">
        Verbind de Arduino en scan een kledingitem.
      </p>

      <!-- Debug panel -->
      <div class="debug-panel">
        <button
          type="button"
          class="debug-toggle"
          @click="debugOpen = !debugOpen"
        >
          🛠 Debug{{ debugOpen ? " ▲" : " ▼" }}
        </button>
        <div v-if="debugOpen" class="debug-buttons">
          <button
            v-for="item in clothes"
            :key="item.id"
            type="button"
            class="debug-btn"
            :class="{ 'debug-btn--active': modelValue === item.id }"
            @click="$emit('update:modelValue', item.id)"
          >
            {{ item.title }}
            <code>{{ item.id }}</code>
          </button>
          <button
            v-if="modelValue"
            type="button"
            class="debug-btn debug-btn--clear"
            @click="$emit('update:modelValue', '')"
          >
            ✕ Clear
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import catalogData from "~/data/data.json";

type ClothesItem = (typeof catalogData.clothes)[number];

const props = defineProps<{
  modelValue: string;
  clothes: ClothesItem[];
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

// Resolve current product for the AR model
const currentProduct = computed(() =>
  props.modelValue
    ? (props.clothes.find((c) => c.id === props.modelValue) ?? null)
    : null,
);

// ── Delay AR scene mount until layout has settled ────────────────────────
const sceneReady = ref(false);
const debugOpen = ref(false);

onMounted(async () => {
  if (!import.meta.client) return;
  await nextTick();
  setTimeout(() => {
    sceneReady.value = true;
  }, 150);
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
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        const raw = line.trim();
        const tag = raw.startsWith("Tag ID:") ? raw.slice(7).trim() : raw;
        if (tag) {
          emit("update:modelValue", tag);
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
</script>

<style scoped>
/* AR scene: fills its placeholder container */
.ar-placeholder :deep(a-scene) {
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 100% !important;
}

.ar-placeholder {
  position: relative;
  width: 100%;
  aspect-ratio: 4/3;
  clip-path: inset(0 round 6px);
  background: #111;
}

.scan-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  text-align: center;
  padding: 24px;
  background: rgba(0, 0, 0, 0.45);
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
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(6px);
  border-radius: 8px;
  padding: 12px 14px;
}

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

.debug-panel {
  border-top: 1px dashed #e0e0e0;
  padding-top: 10px;
  margin-top: 4px;
}

.debug-toggle {
  font-size: 12px;
  color: #909090;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  font-family: inherit;
}

.debug-toggle:hover {
  color: #404040;
}

.debug-buttons {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 8px;
}

.debug-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 12px;
  padding: 6px 10px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background: #fafafa;
  cursor: pointer;
  font-family: inherit;
  color: #404040;
  text-align: left;
}

.debug-btn code {
  font-family: monospace;
  color: #909090;
  font-size: 11px;
}

.debug-btn:hover {
  border-color: #376253;
  background: #f0f7f4;
}

.debug-btn--active {
  border-color: #376253;
  background: #e8f5ee;
  color: #376253;
  font-weight: 600;
}

.debug-btn--clear {
  color: #c0392b;
  border-color: #f0d0cc;
  background: #fff8f7;
}

.debug-btn--clear:hover {
  border-color: #c0392b;
  background: #fff0ef;
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
</style>
