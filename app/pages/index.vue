<template>
  <div class="page-wrapper">
    <div class="ui-overlay">
      <div class="container header-section">
        <img
          src="https://www.asadventure.com/content/dam/asadventure/logo/default.png/_jcr_content/renditions/cq5dam.web.320.320.png"
          alt="Logo A.S.Adventure"
          class="logo-img"
        />
      </div>

      <h1 class="app-title">Adventure Fit</h1>

      <div class="container product-section">
        <CameraAr v-model="scannedTag" :clothes="clothes" />
        <ProductInfo :product="currentProduct" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import catalogData from "~/data/data.json";

const clothes = catalogData.clothes;

const scannedTag = ref("");

const currentProduct = computed(() =>
  scannedTag.value
    ? (clothes.find((c) => c.id === scannedTag.value) ?? null)
    : null,
);
</script>

<style scoped>
.page-wrapper {
  min-height: 100vh;
  background: #fff;
}

.header-section {
  display: flex;
  justify-content: center;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(6px);
}

.app-title {
  text-align: center;
  font-size: 28px;
  font-weight: 700;
  margin-top: 24px;
}

.product-section {
  display: grid;
  grid-template-columns: 1fr 420px;
  gap: 48px;
  padding-top: 32px;
  padding-bottom: 48px;
  align-items: start;
}

.ui-overlay {
  position: relative;
  z-index: 1;
}
</style>
