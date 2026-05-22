<template>
  <div class="product-info">
    <template v-if="product">
      <div class="product-brand-row">
        <span class="brand-link">{{ product.brand }}</span>
      </div>
      <h1 class="product-title">{{ product.title }}</h1>

      <p class="product-short-desc">{{ product.description }}</p>

      <!-- Colour swatches -->
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

      <!-- Size buttons -->
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
                currentStock !== null && currentStock > 0 && currentStock <= 3,
              'stock-none': currentStock === 0,
            }"
          >
            {{ currentStock !== null ? currentStock : "–" }}
          </strong>
        </p>
      </div>

      <!-- Price -->
      <div class="price-row">
        <span class="price">€{{ product.price.toFixed(2) }}</span>
      </div>
    </template>

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
</template>

<script setup lang="ts">
import catalogData from "~/data/data.json";

type ClothesItem = (typeof catalogData.clothes)[number];

const props = defineProps<{
  product: ClothesItem | null;
}>();

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

const availableColors = computed(() => {
  if (!props.product) return [];
  return [...new Set(props.product.variants.map((v) => v.color))];
});

const availableSizes = computed(() => {
  if (!props.product) return [];
  return [...new Set(props.product.variants.map((v) => v.size))];
});

const selectedColor = ref("");
const selectedSize = ref("");

watch(
  () => props.product,
  (product) => {
    if (!product) return;
    const colors = [...new Set(product.variants.map((v) => v.color))];
    const sizes = [...new Set(product.variants.map((v) => v.size))];
    selectedColor.value = colors[0] ?? "";
    selectedSize.value = sizes[0] ?? "";
  },
);

const currentStock = computed(() => {
  if (!props.product || !selectedColor.value || !selectedSize.value)
    return null;
  const variant = props.product.variants.find(
    (v) => v.color === selectedColor.value && v.size === selectedSize.value,
  );
  return variant?.stock ?? 0;
});
</script>

<style scoped>
.product-info {
  position: sticky;
  top: 88px;
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.07);
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

.product-short-desc {
  font-size: 15px;
  color: #505050;
  line-height: 1.55;
  margin-bottom: 20px;
}

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

.swatch-btn--solid {
  border-radius: 50%;
  border: 2px solid transparent;
}

.swatch-btn--selected {
  border-color: #171717;
}

.swatch-btn:hover:not(.swatch-btn--selected) {
  border-color: #909090;
}

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

.stock-low {
  color: #e8a020;
  font-weight: 700;
}

.stock-none {
  color: #c0392b;
  font-weight: 700;
}

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
</style>
