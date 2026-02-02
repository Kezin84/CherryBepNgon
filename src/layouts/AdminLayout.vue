<script setup>
import { ref, computed, onMounted, onUnmounted, provide } from 'vue'
import { RouterView, useRouter } from 'vue-router'
import { KeepAlive } from 'vue'
import { API_URL, IMGBB_KEY } from '@/config/api'
const sidebarOpen = ref(true)
const mobileSidebarOpen = ref(false)
const router = useRouter()
const menuOnlineNcc = ref(localStorage.getItem('CURRENT_NCC') || '')
const nccInfo = ref({
  name: localStorage.getItem('NCC_NAME') || 'FBC',
  logo: localStorage.getItem('NCC_LOGO') || '/Logo/FBC ONLY LOGO NO TEXT.png'
})
const pendingOrderCount = ref(0)

// Provide function để child component có thể gọi refresh
provide('refreshPendingCount', () => loadPendingOrders())
provide('updatePendingCount', (delta) => {
  pendingOrderCount.value = Math.max(0, pendingOrderCount.value + delta)
})

const menuOnlineLink = computed(() => {
  const query = menuOnlineNcc.value ? { ncc: menuOnlineNcc.value } : {}
  return { name: 'menu-online', params: { lang: 'vi' }, query }
})

const closeMobileSidebar = () => {
  mobileSidebarOpen.value = false
}

const logout = () => {
  localStorage.removeItem('user')
  mobileSidebarOpen.value = false
  router.replace('/login')
}



let expiredTimer = null
let pendingTimer = null
let checking = false

// Parse datetime từ format VN
function parseVNDateTime(str) {
  if (!str) return null
  const [time, date] = str.split(' ')
  if (!time || !date) return null
  const [hh, mm, ss] = time.split(':').map(Number)
  const [dd, MM, yyyy] = date.split('/').map(Number)
  return new Date(yyyy, MM - 1, dd, hh, mm, ss || 0)
}

// Tính trạng thái đơn hàng
function getDonStatus(dh) {
  if (!dh) return ''
  if (dh.Trang_thai === 'Hoàn thành') return 'Hoàn thành'
  const thoiGianGiao = parseVNDateTime(dh.Thoi_gian_nhan_hang)
  if (!thoiGianGiao) return dh.Trang_thai
  const endOfDay = new Date(thoiGianGiao)
  endOfDay.setHours(23, 59, 59, 999)
  const now = new Date()
  if (now > endOfDay) return 'Quá hạn'
  return dh.Trang_thai
}

// Load số đơn hàng đang xử lý
const loadPendingOrders = async () => {
  try {
    const res = await fetch(`${API_URL}?action=sheet&sheet=don_hang`)
    const json = await res.json()
    const donHangList = json.data || []
    
    // Đếm đơn "Đang xử lý" (chưa hoàn thành và chưa quá hạn)
    const count = donHangList.filter(dh => getDonStatus(dh) === 'Đang xử lý').length
    pendingOrderCount.value = count
  } catch (err) {
    console.warn('Load pending orders failed:', err)
  }
}
const loadMenuOnlineNcc = async () => {
  try {
    // Load NCC
    const resNcc = await fetch(`${API_URL}?action=sheet&sheet=nha_cung_cap`)
    const jsonNcc = await resNcc.json()
    const ncc = jsonNcc.data?.[0]
    if (ncc) {
      const maNcc = ncc.Ma_nha_cung_cap || ''
      menuOnlineNcc.value = maNcc
      localStorage.setItem('CURRENT_NCC', maNcc)
    }

    // Load Logo từ sheet logo
    const resLogo = await fetch(`${API_URL}?action=sheet&sheet=logo`)
    const jsonLogo = await resLogo.json()
    const logo = jsonLogo.data?.[0]
    if (logo) {
      const tenNcc = logo.Name || 'FBC'
      const logoNcc = logo.URL || '/Logo/FBC ONLY LOGO NO TEXT.png'
      
      nccInfo.value = { name: tenNcc, logo: logoNcc }
      localStorage.setItem('NCC_NAME', tenNcc)
      localStorage.setItem('NCC_LOGO', logoNcc)
    }
  } catch (err) {
    console.warn('Load NCC info failed:', err)
  }
}

const checkExpiredSilently = async () => {
  if (checking) return
  checking = true

  let user = null
  try {
    user = JSON.parse(localStorage.getItem('user') || 'null')
  } catch {
    checking = false
    return
  }

  if (!user?.username) {
    checking = false
    return
  }

  try {
    const form = new FormData()
    form.append('action', 'checkExpired')
    form.append('username', user.username)

    const res = await fetch(API_URL, {
      method: 'POST',
      body: form
    })

    if (!res.ok) {
      console.warn('checkExpired not ok:', res.status)
      return
    }

    const text = await res.text()
    let data = null
    try {
      data = JSON.parse(text)
    } catch {
      console.warn('checkExpired returned non-JSON:', text?.slice(0, 80))
      return
    }

    if (data?.expired === true) {
      localStorage.removeItem('user')
      router.replace('/login')
    }
  } catch (err) {
    console.warn('Expired check failed:', err)
  } finally {
    checking = false
  }
}

onMounted(() => {
  checkExpiredSilently()
  loadMenuOnlineNcc()
  loadPendingOrders()
  expiredTimer = setInterval(checkExpiredSilently, 120_000)
  pendingTimer = setInterval(loadPendingOrders, 15_000) // Refresh mỗi 15s - gần realtime
  
  // Refresh ngay khi user quay lại tab
  document.addEventListener('visibilitychange', onVisibilityChange)
})

const onVisibilityChange = () => {
  if (document.visibilityState === 'visible') {
    loadPendingOrders() // Refresh ngay khi quay lại tab
  }
}

onUnmounted(() => {
  if (expiredTimer) {
    clearInterval(expiredTimer)
    expiredTimer = null
  }
  if (pendingTimer) {
    clearInterval(pendingTimer)
    pendingTimer = null
  }
  document.removeEventListener('visibilitychange', onVisibilityChange)
})
</script>

<template>
  <div class="admin-layout" :class="{ collapsed: !sidebarOpen }">
    <!-- DESKTOP SIDEBAR (LEFT) -->
    <aside class="crm-sidebar desktop-only">
      <div class="brand">
        <div class="brand-logo">
          <img :src="nccInfo.logo" alt="Logo" class="logo-img" />
          <span class="brand-text">{{ nccInfo.name }}</span>
        </div>
        <button class="toggle-btn" @click="sidebarOpen = !sidebarOpen">
          {{ sidebarOpen ? '◀' : '▶' }}
        </button>
      </div>

      <nav class="menu">
        <!-- ========== QUẢN LÝ BÁN HÀNG ========== -->
        <div class="menu-section-title">
          <i class="ri-shopping-cart-2-fill"></i>
          <span>QUẢN LÝ BÁN HÀNG</span>
        </div>

       

        <RouterLink :to="{ name: 'nhap-hoa-don' }" class="menu-item">
          <i class="ri-file-list-3-fill"></i>
          <span>Nhập hóa đơn</span>
        </RouterLink>

        <RouterLink :to="{ name: 'nhap-hang' }" class="menu-item">
          <i class="ri-folder-add-fill"></i>
          <span>Nhập hàng ( WEB & KHO )</span>
        </RouterLink>

        <RouterLink to="/crm/chi-phi-phat-sinh" class="menu-item">
          <i class="ri-money-dollar-circle-line"></i>
          <span>Chi phí chi tiêu</span>
        </RouterLink>
 <RouterLink :to="{ name: 'admin-don-hang' }" class="menu-item">
          <i class="ri-shopping-bag-3-fill"></i>
          <span>Đơn hàng</span>
          <span v-if="pendingOrderCount > 0" class="badge-count">{{ pendingOrderCount }}</span>
        </RouterLink>
        <div class="menu-divider"></div>

        <!-- ========== QUẢN LÝ KHO & KHÁCH ========== -->
        <div class="menu-section-title">
          <i class="ri-database-2-fill"></i>
          <span>KHO & KHÁCH HÀNG</span>
        </div>

        <RouterLink :to="{ name: 'kho-hang' }" class="menu-item">
          <i class="ri-store-2-fill"></i>
          <span>Kho hàng</span>
        </RouterLink>

        <RouterLink :to="{ name: 'admin-khach-hang' }" class="menu-item">
          <i class="ri-user-3-fill"></i>
          <span>Khách hàng</span>
        </RouterLink>

        <div class="menu-divider"></div>

        <!-- ========== BÁO CÁO ========== -->
        <div class="menu-section-title">
          <i class="ri-pie-chart-2-fill"></i>
          <span>BÁO CÁO</span>
        </div>

        <RouterLink :to="{ name: 'admin-bao-cao' }" class="menu-item">
          <i class="ri-bar-chart-2-fill"></i>
          <span>Báo cáo tổng hợp</span>
        </RouterLink>

        <div class="menu-divider"></div>

        <!-- ========== NỘI DUNG WEBSITE ========== -->
        <div class="menu-section-title">
          <i class="ri-global-fill"></i>
          <span>NỘI DUNG WEBSITE</span>
        </div>

        <RouterLink :to="menuOnlineLink" class="menu-item">
          <i class="ri-layout-grid-fill"></i>
          <span>Menu Online</span>
        </RouterLink>

        <RouterLink to="/crm/banner" class="menu-item">
          <i class="ri-tv-2-fill"></i>
          <span>Banner</span>
        </RouterLink>

        <RouterLink to="/crm/thong-bao" class="menu-item">
          <i class="ri-alert-fill"></i>
          <span>Thông báo</span>
        </RouterLink>

        <RouterLink to="/crm/logo" class="menu-item">
          <i class="ri-image-line"></i>
          <span>Logo</span>
        </RouterLink>

        <RouterLink :to="{ name: 'admin-khuyen-mai' }" class="menu-item">
          <i class="ri-coupon-line"></i>
          <span>Khuyến mãi</span>
        </RouterLink>

        <div class="menu-divider"></div>

        <!-- ========== CẤU HÌNH HỆ THỐNG ========== -->
        <div class="menu-section-title">
          <i class="ri-settings-3-fill"></i>
          <span>CẤU HÌNH HỆ THỐNG</span>
        </div>

        <RouterLink :to="{ name: 'admin-open-time' }" class="menu-item">
          <i class="ri-24-hours-line"></i>
          <span>Giờ hoạt động</span>
        </RouterLink>

        <RouterLink :to="{ name: 'admin-contact-shop' }" class="menu-item">
          <i class="ri-contacts-book-2-fill"></i>
          <span>Thông tin liên hệ</span>
        </RouterLink>

        <RouterLink :to="{ name: 'admin-qr-banking' }" class="menu-item">
          <i class="ri-bank-card-fill"></i>
          <span>Ngân hàng & Tỉ giá</span>
        </RouterLink>

        <div class="menu-divider"></div>

        <button class="menu-item logout-btn" @click="logout">
          <i class="ri-logout-box-r-fill"></i>
          <span style="color: #ef4444; font-weight: bold;">ĐĂNG XUẤT</span>
        </button>
      </nav>
    </aside>

    <!-- MAIN CONTENT -->
    <main class="crm-main">
      <RouterView v-slot="{ Component }">
        <KeepAlive>
          <component :is="Component" />
        </KeepAlive>
      </RouterView>
    </main>

    <!-- MOBILE BOTTOM BAR -->
    <nav class="mobile-bottom-bar">
      <RouterLink :to="{ name: 'nhap-hoa-don' }" class="bottom-bar-item">
        <i class="ri-file-list-3-fill"></i>
        <span class="label">Nhập HĐ</span>
      </RouterLink>

      <RouterLink :to="{ name: 'admin-don-hang' }" class="bottom-bar-item">
        <div class="bottom-icon-wrap">
          <i class="ri-shopping-bag-3-fill"></i>
          <span v-if="pendingOrderCount > 0" class="badge-count-mobile">{{ pendingOrderCount }}</span>
        </div>
        <span class="label">Đơn hàng</span>
      </RouterLink>

      <RouterLink :to="{ name: 'admin-bao-cao' }" class="bottom-bar-item">
        <i class="ri-bar-chart-2-fill"></i>
        <span class="label">Báo cáo</span>
      </RouterLink>

      <button class="bottom-bar-item" @click="mobileSidebarOpen = true">
        <i class="ri-menu-fill"></i>
        <span class="label">Menu</span>
      </button>

      <div class="bottom-bar-item logo-item">
        <img :src="nccInfo.logo" alt="Logo" class="bottom-bar-logo" />
      </div>
    </nav>

    <!-- MOBILE SIDEBAR (RIGHT) - OVERLAY -->
    <div
      class="mobile-sidebar-overlay"
      :class="{ open: mobileSidebarOpen }"
      @click="closeMobileSidebar"
    ></div>

    <!-- MOBILE SIDEBAR (RIGHT) -->
    <aside class="mobile-sidebar" :class="{ open: mobileSidebarOpen }">
      <div class="mobile-sidebar-header">
        <div class="mobile-header-brand">
          <img :src="nccInfo.logo" alt="Logo" class="mobile-logo-img" />
          <h3>{{ nccInfo.name }}</h3>
        </div>
        <button class="close-btn" @click="closeMobileSidebar">✕</button>
      </div>

      <nav class="mobile-sidebar-menu">
        <!-- QUẢN LÝ BÁN HÀNG -->
        <div class="mobile-section-title">
          <i class="ri-shopping-cart-2-fill"></i>
          <span>QUẢN LÝ BÁN HÀNG</span>
        </div>

        <RouterLink :to="{ name: 'admin-don-hang' }" class="mobile-menu-item" @click="closeMobileSidebar">
          <i class="ri-shopping-bag-3-fill"></i>
          <span>Đơn hàng</span>
          <span v-if="pendingOrderCount > 0" class="badge-count">{{ pendingOrderCount }}</span>
        </RouterLink>

        <RouterLink :to="{ name: 'nhap-hoa-don' }" class="mobile-menu-item" @click="closeMobileSidebar">
          <i class="ri-file-list-3-fill"></i>
          <span>Nhập hóa đơn</span>
        </RouterLink>

        <RouterLink :to="{ name: 'nhap-hang' }" class="mobile-menu-item" @click="closeMobileSidebar">
          <i class="ri-folder-add-fill"></i>
          <span>Nhập hàng ( WEB & KHO )</span>
        </RouterLink>

        <RouterLink to="/crm/chi-phi-phat-sinh" class="mobile-menu-item" @click="closeMobileSidebar">
          <i class="ri-money-dollar-circle-line"></i>
          <span>Chi phí phát sinh</span>
        </RouterLink>

        <div class="menu-divider"></div>

        <!-- KHO & KHÁCH HÀNG -->
        <div class="mobile-section-title">
          <i class="ri-database-2-fill"></i>
          <span>KHO & KHÁCH HÀNG</span>
        </div>

        <RouterLink :to="{ name: 'kho-hang' }" class="mobile-menu-item" @click="closeMobileSidebar">
          <i class="ri-store-2-fill"></i>
          <span>Kho hàng</span>
        </RouterLink>

        <RouterLink :to="{ name: 'admin-khach-hang' }" class="mobile-menu-item" @click="closeMobileSidebar">
          <i class="ri-user-3-fill"></i>
          <span>Khách hàng</span>
        </RouterLink>

        <div class="menu-divider"></div>

        <!-- BÁO CÁO -->
        <div class="mobile-section-title">
          <i class="ri-pie-chart-2-fill"></i>
          <span>BÁO CÁO</span>
        </div>

        <RouterLink :to="{ name: 'admin-bao-cao' }" class="mobile-menu-item" @click="closeMobileSidebar">
          <i class="ri-bar-chart-2-fill"></i>
          <span>Báo cáo tổng hợp</span>
        </RouterLink>

        <div class="menu-divider"></div>

        <!-- NỘI DUNG WEBSITE -->
        <div class="mobile-section-title">
          <i class="ri-global-fill"></i>
          <span>NỘI DUNG WEBSITE</span>
        </div>

        <RouterLink :to="menuOnlineLink" class="mobile-menu-item" @click="closeMobileSidebar">
          <i class="ri-layout-grid-fill"></i>
          <span>Menu Online</span>
        </RouterLink>

        <RouterLink to="/crm/banner" class="mobile-menu-item" @click="closeMobileSidebar">
          <i class="ri-tv-2-fill"></i>
          <span>Banner</span>
        </RouterLink>

        <RouterLink to="/crm/thong-bao" class="mobile-menu-item" @click="closeMobileSidebar">
          <i class="ri-alert-fill"></i>
          <span>Thông báo</span>
        </RouterLink>

        <RouterLink to="/crm/logo" class="mobile-menu-item" @click="closeMobileSidebar">
          <i class="ri-image-line"></i>
          <span>Logo</span>
        </RouterLink>

        <RouterLink :to="{ name: 'admin-khuyen-mai' }" class="mobile-menu-item" @click="closeMobileSidebar">
          <i class="ri-coupon-line"></i>
          <span>Khuyến mãi</span>
        </RouterLink>

        <div class="menu-divider"></div>

        <!-- CẤU HÌNH HỆ THỐNG -->
        <div class="mobile-section-title">
          <i class="ri-settings-3-fill"></i>
          <span>CẤU HÌNH HỆ THỐNG</span>
        </div>

        <RouterLink :to="{ name: 'admin-open-time' }" class="mobile-menu-item" @click="closeMobileSidebar">
          <i class="ri-24-hours-line"></i>
          <span>Giờ hoạt động</span>
        </RouterLink>

        <RouterLink :to="{ name: 'admin-contact-shop' }" class="mobile-menu-item" @click="closeMobileSidebar">
          <i class="ri-contacts-book-2-fill"></i>
          <span>Thông tin liên hệ</span>
        </RouterLink>

        <RouterLink :to="{ name: 'admin-qr-banking' }" class="mobile-menu-item" @click="closeMobileSidebar">
          <i class="ri-bank-card-fill"></i>
          <span>Ngân hàng & Tỉ giá</span>
        </RouterLink>

        <div class="menu-divider"></div>

        <button class="mobile-menu-item logout-btn" @click="logout">
          <i class="ri-logout-box-r-fill"></i>
          <span>Đăng xuất</span>
        </button>
      </nav>
    </aside>
  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

.admin-layout {
  display: flex;
  height: 100vh;
  background: #f8fafc;
  position: relative;
}

/* ================= DESKTOP SIDEBAR (LEFT) ================= */
.crm-sidebar {
  width: 280px;
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #1e293b 100%);
  color: #e5e7eb;
  padding: 0;
  transform: translateX(0);
  transition: width 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: width;
  z-index: 100;
  overflow: hidden;
  border-right: 2px solid rgba(34, 197, 94, 0.2);
  box-shadow: 4px 0 20px rgba(34, 197, 94, 0.1);
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.crm-sidebar::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  background: linear-gradient(to bottom, 
    rgba(34, 197, 94, 0.05) 0%,
    transparent 20%,
    transparent 80%,
    rgba(34, 197, 94, 0.05) 100%);
  pointer-events: none;
  z-index: 0;
}

.admin-layout.collapsed .crm-sidebar {
  width: 80px;
}

.brand {
  position: relative;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  backdrop-filter: blur(10px);
  border-bottom: 2px solid rgba(34, 197, 94, 0.3);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  flex-shrink: 0;
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-img {
  width: 32px;
  height: 32px;
  object-fit: contain;
  flex-shrink: 0;
  border-radius: 8px;
  filter: drop-shadow(0 0 12px rgba(34, 197, 94, 0.6))
          drop-shadow(0 0 24px rgba(34, 197, 94, 0.4))
          drop-shadow(0 0 36px rgba(34, 197, 94, 0.2));
  animation: logoGlow 3s ease-in-out infinite;
}

@keyframes logoGlow {
  0%, 100% {
    filter: drop-shadow(0 0 12px rgba(34, 197, 94, 0.6))
            drop-shadow(0 0 24px rgba(34, 197, 94, 0.4))
            drop-shadow(0 0 36px rgba(34, 197, 94, 0.2));
  }
  50% {
    filter: drop-shadow(0 0 16px rgba(34, 197, 94, 0.8))
            drop-shadow(0 0 32px rgba(34, 197, 94, 0.6))
            drop-shadow(0 0 48px rgba(34, 197, 94, 0.3));
  }
}

.brand-text {
  font-weight: 700;
  font-size: 16px;
  color: rgb(134, 239, 172);
  white-space: nowrap;
  overflow: hidden;
  letter-spacing: 1px;
  text-shadow: 0 0 10px rgba(34, 197, 94, 0.5);
}

.toggle-btn {
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
  color: rgb(134, 239, 172);
  cursor: pointer;
  font-size: 14px;
  padding: 6px;
  flex-shrink: 0;
  transition: all 0.2s ease;
  border-radius: 6px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-btn:hover {
  background: rgba(34, 197, 94, 0.2);
  border-color: rgb(34, 197, 94);
  box-shadow: 0 0 12px rgba(34, 197, 94, 0.4);
  transform: scale(1.1);
}

.admin-layout.collapsed .brand-text {
  display: none;
}

.admin-layout.collapsed .brand-logo {
  justify-content: center;
}

.menu {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 10px;
  min-height: 0;
}

.menu::-webkit-scrollbar {
  width: 6px;
}

.menu::-webkit-scrollbar-track {
  background: rgba(15, 23, 42, 0.5);
}

.menu::-webkit-scrollbar-thumb {
  background: rgba(34, 197, 94, 0.3);
  border-radius: 3px;
}

.menu::-webkit-scrollbar-thumb:hover {
  background: rgba(34, 197, 94, 0.5);
}

.menu-divider {
  height: 1px;
  background: linear-gradient(to right, 
    transparent, 
    rgba(34, 197, 94, 0.25), 
    transparent);
  margin: 6px 0;
  border-radius: 2px;
}

.menu-section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  font-size: 10px;
  text-transform: uppercase;
  color: rgb(134, 239, 172);
  font-weight: 700;
  letter-spacing: 1px;
  text-shadow: 0 0 8px rgba(34, 197, 94, 0.4);
  background: rgba(34, 197, 94, 0.08);
  border-radius: 6px;
  border-left: 3px solid rgb(34, 197, 94);
  margin-bottom: 2px;
}

.menu-section-title i {
  font-size: 12px;
  opacity: 0.9;
}

.menu-item,
.logout-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  color: #e5e7eb;
  text-decoration: none;
  border-radius: 8px;
  font-size: 12px;
  transition: all 0.3s ease;
  white-space: nowrap;
  background: transparent;
  border: 1px solid transparent;
  cursor: pointer;
  width: 100%;
  text-align: left;
  font-family: inherit;
  font-weight: 600;
  position: relative;
  overflow: hidden;
}

.menu-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: rgb(34, 197, 94);
  transform: scaleY(0);
  transition: transform 0.3s ease;
}

.menu-item:hover::before {
  transform: scaleY(1);
}

.menu-item i {
  font-size: 16px;
  width: 20px;
  text-align: center;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.menu-item:hover,
.logout-btn:hover {
  background: rgba(34, 197, 94, 0.15);
  border: 1px solid rgba(34, 197, 94, 0.4);
  color: rgb(134, 239, 172);
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.2);
}

.menu-item:hover i,
.logout-btn:hover i {
  transform: scale(1.1);
}

.menu-item.router-link-active {
  background: linear-gradient(135deg, 
    rgba(34, 197, 94, 0.2), 
    rgba(34, 197, 94, 0.15));
  border: 1px solid rgb(34, 197, 94);
  color: #fff;
  box-shadow: 
    0 4px 12px rgba(34, 197, 94, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.menu-item.router-link-active::before {
  transform: scaleY(1);
}

/* Badge Count - Số đơn hàng đang xử lý */
.badge-count {
  margin-left: auto;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 10px;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: #fff;
  font-size: 11px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
  animation: badgePulse 2s ease-in-out infinite;
}

@keyframes badgePulse {
  0%, 100% { 
    box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
    transform: scale(1);
  }
  50% { 
    box-shadow: 0 2px 12px rgba(239, 68, 68, 0.6);
    transform: scale(1.05);
  }
}

.logout-btn:hover span {
  color: #fca5a5 !important;
}

.admin-layout.collapsed .menu-item span,
.admin-layout.collapsed .menu-section-title span {
  display: none;
}

.admin-layout.collapsed .menu-section-title {
  justify-content: center;
  padding: 6px;
}

.admin-layout.collapsed .menu-item {
  justify-content: center;
}

.admin-layout.collapsed .menu-item i {
  font-size: 18px;
}

.admin-layout.collapsed .menu-divider {
  margin: 4px 0;
}

/* ================= MAIN CONTENT ================= */
.crm-main {
  flex: 1;
  padding: 0;
  overflow: auto;
  background: #f8fafc;
  color: #0f172a;
  transition: margin-left 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

/* ================= MOBILE ELEMENTS (HIDDEN ON DESKTOP) ================= */
.mobile-bottom-bar,
.mobile-sidebar,
.mobile-sidebar-overlay {
  display: none;
}

/* ================================================= */
/* ================= MOBILE MODE =================== */
/* ================================================= */
@media (max-width: 768px) {
  .desktop-only {
    display: none !important;
  }

  .admin-layout {
    flex-direction: column;
  }

  .crm-main {
    padding: 0;
    padding-bottom: 70px;
    height: calc(100vh - 70px);
    overflow-y: auto;
  }

  /* ================= MOBILE BOTTOM BAR ================= */
  .mobile-bottom-bar {
    display: flex;
    justify-content: space-around;
    align-items: stretch;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 70px;
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #1e293b 100%);
    border-top: 2px solid rgba(34, 197, 94, 0.3);
    z-index: 1000;
    padding: 0;
    box-shadow: 0 -4px 20px rgba(34, 197, 94, 0.15);
  }

  .bottom-bar-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    flex: 1;
    padding: 10px 8px;
    color: #ffffff;
    text-decoration: none;
    border-radius: 0;
    transition: all 0.3s ease;
    background: transparent;
    border: none;
    cursor: pointer;
    font-family: inherit;
    position: relative;
  }

  .bottom-bar-item::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 3px;
    background: linear-gradient(to right, 
      transparent, 
      rgb(34, 197, 94), 
      transparent);
    transition: width 0.3s ease;
    box-shadow: 0 0 10px rgba(34, 197, 94, 0.6);
  }

  .bottom-bar-item.router-link-active::before {
    width: 80%;
  }

  .bottom-bar-item i {
    font-size: 24px;
    color: #ffffff;
    transition: all 0.3s ease;
  }

  /* Bottom bar icon wrapper for badge */
  .bottom-icon-wrap {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .bottom-icon-wrap i {
    font-size: 24px;
    color: #ffffff;
    transition: all 0.3s ease;
  }

  .badge-count-mobile {
    position: absolute;
    top: -6px;
    right: -10px;
    min-width: 18px;
    height: 18px;
    padding: 0 5px;
    border-radius: 9px;
    background: linear-gradient(135deg, #ef4444, #dc2626);
    color: #fff;
    font-size: 10px;
    font-weight: 800;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 6px rgba(239, 68, 68, 0.5);
    animation: badgePulse 2s ease-in-out infinite;
  }

  .bottom-bar-item .label {
    font-size: 11px;
    font-weight: 600;
    text-align: center;
    color: #ffffff;
    line-height: 1.2;
    white-space: nowrap;
  }

  /* Logo item trong bottom bar */
  .bottom-bar-item.logo-item {
    flex: 0.6;
    cursor: default;
  }

  .bottom-bar-item.logo-item::before {
    display: none;
  }

  .bottom-bar-logo {
    width: 40px;
    height: 40px;
    object-fit: contain;
    border-radius: 8px;
    filter: drop-shadow(0 0 8px rgba(34, 197, 94, 0.5));
  }

  .bottom-bar-item:active {
    background: rgba(34, 197, 94, 0.15);
  }

  .bottom-bar-item.router-link-active {
    background: rgba(34, 197, 94, 0.1);
  }

  .bottom-bar-item.router-link-active i {
    color: rgb(134, 239, 172);
    transform: scale(1.15);
    filter: drop-shadow(0 0 8px rgba(34, 197, 94, 0.6));
  }

  .bottom-bar-item.router-link-active .label {
    color: rgb(134, 239, 172);
    text-shadow: 0 0 8px rgba(34, 197, 94, 0.4);
  }

  /* ================= MOBILE SIDEBAR OVERLAY ================= */
  .mobile-sidebar-overlay {
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.75);
    z-index: 1100;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease;
    backdrop-filter: blur(4px);
  }

  .mobile-sidebar-overlay.open {
    opacity: 1;
    pointer-events: auto;
  }

  /* ================= MOBILE SIDEBAR (RIGHT) ================= */
  .mobile-sidebar {
    display: block;
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    width: 300px;
    max-width: 85vw;
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #1e293b 100%);
    color: #e5e7eb;
    z-index: 1200;
    transform: translateX(100%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    will-change: transform;
    overflow-y: auto;
    box-shadow: -4px 0 20px rgba(34, 197, 94, 0.2);
    border-left: 2px solid rgba(34, 197, 94, 0.3);
  }

  .mobile-sidebar.open {
    transform: translateX(0);
  }

  .mobile-sidebar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 16px;
    border-bottom: 2px solid rgba(34, 197, 94, 0.3);
    position: sticky;
    top: 0;
    background: rgba(30, 41, 59, 0.95);
    backdrop-filter: blur(10px);
    z-index: 10;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  .mobile-header-brand {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .mobile-logo-img {
    width: 50px;
    height: 50px;
    object-fit: contain;
    flex-shrink: 0;
    border-radius: 10px;
    filter: drop-shadow(0 0 10px rgba(34, 197, 94, 0.6))
            drop-shadow(0 0 20px rgba(34, 197, 94, 0.4))
            drop-shadow(0 0 30px rgba(34, 197, 94, 0.2));
    animation: logoGlowMobile 3s ease-in-out infinite;
  }

  @keyframes logoGlowMobile {
    0%, 100% {
      filter: drop-shadow(0 0 10px rgba(34, 197, 94, 0.6))
              drop-shadow(0 0 20px rgba(34, 197, 94, 0.4))
              drop-shadow(0 0 30px rgba(34, 197, 94, 0.2));
    }
    50% {
      filter: drop-shadow(0 0 14px rgba(34, 197, 94, 0.8))
              drop-shadow(0 0 28px rgba(34, 197, 94, 0.6))
              drop-shadow(0 0 42px rgba(34, 197, 94, 0.3));
    }
  }

  .mobile-sidebar-header h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
    color: rgb(134, 239, 172);
    letter-spacing: 1px;
    text-shadow: 0 0 10px rgba(34, 197, 94, 0.5);
  }

  .close-btn {
    background: rgba(34, 197, 94, 0.1);
    border: 1px solid rgba(34, 197, 94, 0.3);
    color: rgb(134, 239, 172);
    font-size: 24px;
    cursor: pointer;
    padding: 4px 8px;
    line-height: 1;
    transition: all 0.2s ease;
    border-radius: 8px;
  }

  .close-btn:active {
    background: rgba(34, 197, 94, 0.2);
    transform: scale(0.95);
  }

  .mobile-sidebar-menu {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 12px;
  }

  .mobile-section-title {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    font-size: 11px;
    text-transform: uppercase;
    color: rgb(134, 239, 172);
    font-weight: 700;
    letter-spacing: 1.2px;
    text-shadow: 0 0 8px rgba(34, 197, 94, 0.4);
    background: rgba(34, 197, 94, 0.08);
    border-radius: 8px;
    border-left: 3px solid rgb(34, 197, 94);
    margin-top: 4px;
    margin-bottom: 4px;
  }

  .mobile-section-title i {
    font-size: 14px;
    opacity: 0.9;
  }

  .mobile-menu-item {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 16px;
    color: #e5e7eb;
    text-decoration: none;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 600;
    transition: all 0.3s ease;
    background: transparent;
    border: 1px solid transparent;
    cursor: pointer;
    width: 100%;
    text-align: left;
    font-family: inherit;
    position: relative;
    overflow: hidden;
  }

  .mobile-menu-item::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: rgb(34, 197, 94);
    transform: scaleY(0);
    transition: transform 0.3s ease;
  }

  .mobile-menu-item:active::before {
    transform: scaleY(1);
  }

  .mobile-menu-item i {
    font-size: 18px;
    width: 24px;
    text-align: center;
    flex-shrink: 0;
    transition: all 0.3s ease;
  }

  .mobile-menu-item:active {
    background: rgba(34, 197, 94, 0.15);
    border: 1px solid rgba(34, 197, 94, 0.4);
    color: rgb(134, 239, 172);
    transform: translateX(4px);
  }

  .mobile-menu-item:active i {
    transform: scale(1.1);
  }

  .mobile-menu-item.router-link-active {
    background: linear-gradient(135deg, 
      rgba(34, 197, 94, 0.2), 
      rgba(34, 197, 94, 0.15));
    border: 1px solid rgb(34, 197, 94);
    color: #fff;
    box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
  }

  .mobile-menu-item.router-link-active::before {
    transform: scaleY(1);
  }

  .mobile-menu-item.logout-btn:active span {
    color: #fca5a5;
  }
}
</style>