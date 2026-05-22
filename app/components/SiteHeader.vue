<template>
  <header class="site-header">
    <!-- Top Bar -->
    <div class="top-bar">
      <div class="container top-bar-inner">
        <a href="#" class="logo">
          <img
            src="https://www.asadventure.com/content/dam/asadventure/logo/default.png/_jcr_content/renditions/cq5dam.web.320.320.png"
            alt="Logo A.S.Adventure"
            class="logo-img"
          />
        </a>

        <div class="search-wrapper">
          <div class="search-box">
            <input type="text" placeholder="What are you looking for?" />
            <button type="button" class="search-btn" aria-label="Search">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </button>
          </div>
        </div>

        <div class="header-actions">
          <a href="#" class="action-link">Services</a>
          <a href="#" class="action-link">Stores</a>
          <button class="lang-btn">
            EN
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          <a href="#" class="action-link action-login">
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Login
          </a>
          <button class="icon-btn" aria-label="Wishlist">
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
          <a href="#" class="cart-link" aria-label="Shopping cart">
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
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            <span class="cart-count">0</span>
          </a>
        </div>
      </div>
    </div>

    <div class="header-divider"></div>

    <!-- Main Navigation -->
    <nav class="main-nav">
      <div class="container nav-inner">
        <ul class="nav-list">
          <li v-for="item in navItems" :key="item">
            <a href="#">{{ item }}</a>
          </li>
          <li class="nav-gift">
            <a href="#"> <span class="gift-icon">🎁</span> Gift ideas </a>
          </li>
          <li><a href="#">Inspiration</a></li>
          <li><a href="#">Brands</a></li>
        </ul>
      </div>
    </nav>
  </header>
</template>

<script setup lang="ts">
const navItems = [
  "Promotions",
  "Women",
  "Men",
  "Kids",
  "Walking",
  "Beachwear",
  "Sports",
  "Cycling",
  "Travel",
  "Camping",
  "Equipment",
];
</script>

<style scoped>
.site-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: #fff;
}

/* ─── Top Bar ─────────────────────────────── */
.top-bar {
  background-color: #f7f7f7;
}

.top-bar-inner {
  display: flex;
  align-items: center;
  height: 72px;
  gap: 20px;
}

.logo {
  flex-shrink: 0;
}

.logo-img {
  height: 50px;
  width: auto;
  object-fit: contain;
}

/* Search */
.search-wrapper {
  flex: 1;
  max-width: 500px;
}

.search-box {
  display: flex;
  align-items: center;
  background: #fff;
  border: 1.5px solid #d0d0d0;
  border-radius: 6px;
  height: 42px;
  overflow: hidden;
  transition: border-color 0.2s;
}

.search-box:focus-within {
  border-color: #376253;
}

.search-box input {
  flex: 1;
  border: none;
  outline: none;
  padding: 0 14px;
  font-size: 14px;
  font-family: inherit;
  color: #404040;
  background: transparent;
}

.search-box input::placeholder {
  color: #a0a0a0;
}

.search-btn {
  padding: 0 13px;
  color: #606060;
  display: flex;
  align-items: center;
  background: none;
  border: none;
  flex-shrink: 0;
}

/* Actions */
.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-left: auto;
}

.action-link {
  font-size: 14px;
  color: #404040;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 5px;
}

.action-link:hover {
  color: #171717;
  text-decoration: underline;
}

.action-login {
  font-weight: 600;
}

.lang-btn {
  font-size: 14px;
  font-weight: 600;
  color: #404040;
  display: flex;
  align-items: center;
  gap: 3px;
  font-family: inherit;
  background: none;
  border: none;
  cursor: pointer;
}

.icon-btn {
  color: #404040;
  display: flex;
  align-items: center;
  padding: 4px;
  background: none;
  border: none;
  cursor: pointer;
}

.icon-btn:hover {
  color: #171717;
}

.cart-link {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #404040;
}

.cart-count {
  font-size: 11px;
  font-weight: 700;
  background: #376253;
  color: #fff;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Divider */
.header-divider {
  height: 1px;
  background: rgba(199, 199, 199, 0.5);
}

/* ─── Main Nav ────────────────────────────── */
.main-nav {
  background-color: #5f696b;
}

.nav-inner {
  display: flex;
  padding-top: 0;
  padding-bottom: 0;
}

.nav-list {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
}

.nav-list li a,
.nav-gift a {
  display: block;
  padding: 12px 14px;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  transition: background-color 0.15s;
}

.nav-list li a:hover,
.nav-gift a:hover {
  background: rgba(255, 255, 255, 0.12);
  text-decoration: none;
}

.gift-icon {
  font-size: 13px;
}
</style>
