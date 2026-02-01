<template>
  <div class="page-container" ref="rootEl">
    <!-- PHẦN 1: BỘ LỌC -->
    <!-- PHẦN 1: BỘ LỌC (GRID LAYOUT 3 ROWS) -->
    <div class="filter-bar">
      
      <!-- ROW 1: SEARCH -->
      <div class="fb-row search-row">
        <div class="search-box">
          <!-- Label removed here, moved to middle bar -->
          <div class="search-wrapper">
            <i class="app-ico ri-search-line"></i>
            <input type="text" v-model="searchText" placeholder="Tìm kiếm tên khách, SĐT, mã đơn..." />
            <button v-if="searchText" class="btn-clear-search" @click="searchText = ''">
              Xóa
            </button>
          </div>
        </div>
      </div>

      <!-- ROW 2: DATES -->
      <div class="fb-row date-row">
        <div class="filter-item date-item">
          <label>Từ ngày</label>
          <input type="date" v-model="filter.fromDate" :max="filter.toDate" />
        </div>
        <div class="filter-item date-item">
          <label>Đến ngày</label>
          <input type="date" v-model="filter.toDate" :min="filter.fromDate" />
        </div>
      </div>

      <!-- ROW 3: FILTERS & ACTIONS -->
      <div class="fb-row actions-row">
        <!-- 4. Payment -->
        <div class="filter-item payment-item">
          <label>Thanh toán</label>
          <select 
            v-model="filter.payment"
            :class="{ 
              'pay-cash': filter.payment === 'TIEN_MAT',
              'pay-transfer': filter.payment === 'CHUYEN_KHOAN'
            }"
          >
            <option value="">Tất cả</option>
            <option value="TIEN_MAT">Tiền mặt</option>
            <option value="CHUYEN_KHOAN">Chuyển khoản</option>
          </select>
        </div>

        <!-- 5. Sort Buttons -->
        <div class="filter-item sort-group-item">
          <label>Sắp xếp</label>
          <div class="status-btn-group">
            <button 
              class="status-btn" 
              :class="{ active: filter.sort === 'upcoming', 'sort-gold': filter.sort === 'upcoming' }"
              @click="filter.sort = 'upcoming'"
            >
              <i class="app-ico ri-arrow-up-circle-line"></i>
              ĐƠN CẦN GIAO GẤP
            </button>

            <button 
              class="status-btn" 
              :class="{ active: filter.sort === 'newest', 'sort-blue': filter.sort === 'newest' }"
              @click="filter.sort = 'newest'"
            >
              <i class="app-ico ri-arrow-down-circle-line"></i>
              ĐƠN KHÔNG GẤP
            </button>
          </div>
        </div>

        <!-- 6. Reset -->
        <div class="filter-item reset-item">
          <button class="btn-reset" @click="resetFilter">
            <i class="app-ico ri-refresh-line" aria-hidden="true"></i> 
            Reset
          </button>
        </div>
      </div>

    </div>

    <!-- SEARCH & COUNT STATUS BAR -->
    <div class="search-result-bar">
      <div class="result-count">
        Tìm thấy <span class="highlight-count">{{ filteredOrders.length }}</span> đơn hàng
      </div>
      <div class="result-text" v-if="searchText">
        cho từ khóa <span class="highlight-text">"{{ searchText }}"</span>
      </div>
    </div>

    <!-- MAIN CONTENT -->
    <div class="main-content">
      <!-- PHẦN 2: GRID ĐƠN HÀNG -->
      <div class="orders-section">
        <div v-if="loading" class="loading">
          <div class="spinner"></div>
          <p>Đang tải đơn hàng...</p>
        </div>

        <div v-else-if="paginatedOrders.length === 0" class="empty">
          <i class="app-ico ri-inbox-archive-line" aria-hidden="true"></i> Không có đơn hàng nào
        </div>

        <template v-else>
          <!-- BULK ACTION BAR -->
          <div v-if="selectedCount > 0" class="bulk-action-bar" @click.stop>
            <div class="bulk-info">
              <i class="app-ico ri-checkbox-multiple-line"></i>
              <span v-if="!bulkLoading">Đã chọn: <strong>{{ selectedCount }}</strong> đơn</span>
              <span v-else class="bulk-progress">
                <span class="bulk-spinner"></span>
                Đang xử lý {{ bulkProgress.done }}/{{ bulkProgress.total }}...
              </span>
            </div>
            <div class="bulk-actions">
              <button 
                class="bulk-btn complete" 
                :disabled="bulkLoading" 
                @click="bulkComplete"
              >
                <i class="app-ico ri-check-double-line"></i>
                HOÀN THÀNH ĐƠN ({{ selectedCount }})
              </button>
              <button 
                class="bulk-btn cancel" 
                :disabled="bulkLoading" 
                @click="bulkCancel"
              >
                <i class="app-ico ri-close-circle-line"></i>
                HỦY ĐƠN  ({{ selectedCount }})
              </button>
              
              <!-- SELECT ALL BUTTON - INTEGRATED -->
              <button 
                v-if="selectableOnPage.length > 0 && !isAllSelected"
                class="bulk-btn select-all" 
                :disabled="bulkLoading" 
                @click="toggleSelectAll"
              >
                <i class="app-ico ri-checkbox-multiple-line"></i>
                Chọn tất cả ({{ selectableOnPage.length }})
              </button>

              <button 
                class="bulk-btn clear" 
                :disabled="bulkLoading" 
                @click="clearSelected"
              >
                <i class="app-ico ri-eraser-line"></i>
                Bỏ chọn hết
              </button>
            </div>
          </div>

          <div class="orders-grid">
          <div
            v-for="(dh, index) in paginatedOrders"
            :key="`${filter.sort}-${index}-${dh.Ma_hoa_don}`"
            class="order-card"
            :class="[getStatusClass(getDonStatus(dh)), { selected: isSelected(dh) }]"
            @click="openDetail(dh)"
          >
            <!-- Loading Overlay -->
            <div class="card-loading-overlay" v-if="loadingId === dh.Ma_hoa_don">
              <div class="spinner-sm"></div>
              <span>{{ cardLoadingAction === 'complete' ? 'Đang hoàn thành...' : 'Đang xử lý...' }}</span>
            </div>

            <div class="card-header">
              <!-- TICK BUTTON - Multi Select -->
              <button
                v-if="getDonStatus(dh) !== 'Hoàn thành'"
                class="select-tick"
                :class="{ on: isSelected(dh), disabled: !canSelect(dh) }"
                :disabled="!canSelect(dh)"
                @click.stop="toggleSelect(dh)"
                title="Chọn đơn"
              >
                <i class="app-ico" :class="isSelected(dh) ? 'ri-checkbox-circle-fill' : 'ri-checkbox-blank-circle-line'"></i>
              </button>
              <span class="status-pill" :class="getStatusClass(getDonStatus(dh))">
                {{ getDonStatus(dh) }}
              </span>
              <span class="index-pill">{{ (currentPage - 1) * itemsPerPage + index + 1 }}</span>
            </div>

            <div class="card-body">
              <div class="meta-copy-row customer-row">
                <div class="customer-title">{{ dh.Ten_khach_hang }}</div>
                <button
                  class="copy-btn"
                  :class="{ copied: copiedKey === `card-${dh.Ma_hoa_don}-name` }"
                  :disabled="isBlank(dh.Ten_khach_hang)"
                  @click.stop="copyText(dh.Ten_khach_hang, `card-${dh.Ma_hoa_don}-name`)"
                >
                  <i class="app-ico ri-file-copy-line"></i>
                  <span class="copy-label">{{ copiedKey === `card-${dh.Ma_hoa_don}-name` ? 'Copied' : 'Copy' }}</span>
                </button>
              </div>
              <div class="meta-copy-row">
                <div class="meta-line meta-text">{{ dh.So_dien_thoai }}</div>
                <button
                  class="copy-btn"
                  :class="{ copied: copiedKey === `card-${dh.Ma_hoa_don}-phone` }"
                  :disabled="isBlank(dh.So_dien_thoai)"
                  @click.stop="copyText(dh.So_dien_thoai, `card-${dh.Ma_hoa_don}-phone`)"
                >
                  <i class="app-ico ri-file-copy-line"></i>
                  <span class="copy-label">{{ copiedKey === `card-${dh.Ma_hoa_don}-phone` ? 'Copied' : 'Copy' }}</span>
                </button>
              </div>
              <div class="meta-copy-row" :title="dh.Dia_chi">
                <div class="meta-line meta-text">{{ truncate(dh.Dia_chi, 40) }}</div>
                <button
                  class="copy-btn"
                  :class="{ copied: copiedKey === `card-${dh.Ma_hoa_don}-addr` }"
                  :disabled="isBlank(dh.Dia_chi)"
                  @click.stop="copyText(dh.Dia_chi, `card-${dh.Ma_hoa_don}-addr`)"
                >
                  <i class="app-ico ri-file-copy-line"></i>
                  <span class="copy-label">{{ copiedKey === `card-${dh.Ma_hoa_don}-addr` ? 'Copied' : 'Copy' }}</span>
                </button>
              </div>

              <div class="pay-row">
                <span class="payment-badge" :class="dh.Hinh_thuc_thanh_toan === 'CHUYEN_KHOAN' ? 'transfer' : 'cash'">
                  {{ mapPayment(dh.Hinh_thuc_thanh_toan) }}
                </span>
                <div class="amount">{{ format(dh.Tong_gia_ban) }}{{ dh.Don_vi_tien_te || '' }}</div>
              </div>

              <div class="time-box" :class="getTimeClass(dh, getDonStatus(dh))">
                <div class="time-main">Thời gian nhận: {{ dh.Thoi_gian_nhan_hang }}</div>
                <div class="time-sub" v-if="getDonStatus(dh) !== 'Hoàn thành'">{{ formatTimeRemaining(dh.Thoi_gian_nhan_hang) }}</div>
              </div>

              <div v-if="dh.Ghi_chu && dh.Ghi_chu.trim()" class="note-box" :title="dh.Ghi_chu">
                {{ dh.Ghi_chu }}
              </div>
            </div>

            <div class="card-footer" v-if="getDonStatus(dh) !== 'Hoàn thành'" @click.stop>
              <button class="btn-cancel" :disabled="loadingId === dh.Ma_hoa_don && !!cardLoadingAction" @click="onCardCancel(dh)">
                <span v-if="loadingId === dh.Ma_hoa_don && cardLoadingAction === 'cancel'" class="btn-spinner"></span>
                {{ loadingId === dh.Ma_hoa_don && cardLoadingAction === 'cancel' ? 'Đang hủy...' : 'Hủy' }}
              </button>
              <button class="btn-done" :disabled="loadingId === dh.Ma_hoa_don && !!cardLoadingAction" @click="onCardComplete(dh)">
                <span v-if="loadingId === dh.Ma_hoa_don && cardLoadingAction === 'complete'" class="btn-spinner"></span>
                {{ loadingId === dh.Ma_hoa_don && cardLoadingAction === 'complete' ? 'Đang hoàn thành...' : 'Hoàn thành' }}
              </button>
            </div>
          </div>
        </div>

        <!-- PHÂN TRANG -->
        <div v-if="totalPages > 1" class="pagination">
          <button @click="currentPage--" :disabled="currentPage === 1" class="btn-page"><i class="app-ico ri-arrow-left-line" aria-hidden="true"></i></button>
          <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
          <button @click="currentPage++" :disabled="currentPage === totalPages" class="btn-page"><i class="app-ico ri-arrow-right-line" aria-hidden="true"></i></button>
        </div>
        </template>
      </div>

      <!-- PHẦN 3,4,5,6: CARD TRẠNG THÁI (RESTORED) -->
      <div class="status-cards">
        <div
          class="status-card"
          :class="{ active: filter.status === '' }"
          @click="filter.status = ''"
        >
          <div class="stat-badge neutral">Tất cả</div>
          <div class="stat-number">{{ countAll }}</div>
        </div>

        <div
          class="status-card pending"
          :class="{ active: filter.status === 'Đang xử lý' }"
          @click="filter.status = 'Đang xử lý'"
        >
          <div class="stat-badge pending">Đang xử lý</div>
          <div class="stat-number">{{ countPending }}</div>
        </div>

        <div
          class="status-card overdue"
          :class="{ active: filter.status === 'Quá hạn' }"
          @click="filter.status = 'Quá hạn'"
        >
          <div class="stat-badge overdue">Quá hạn</div>
          <div class="stat-number">{{ countOverdue }}</div>
        </div>

        <div
          class="status-card done"
          :class="{ active: filter.status === 'Hoàn thành' }"
          @click="filter.status = 'Hoàn thành'"
        >
          <div class="stat-badge done">Hoàn thành</div>
          <div class="stat-number">{{ countDone }}</div>
        </div>
      </div>
    </div>

    <!-- MODAL CHI TIẾT ĐƠN HÀNG -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <div class="modal-title">{{ selectedOrder?.Ma_hoa_don }}</div>
          <div class="modal-header-right">
            <span class="status-pill" :class="getStatusClass(getDonStatus(selectedOrder))">
              {{ getDonStatus(selectedOrder) }}
            </span>
            <button class="modal-close" @click="showModal = false"><i class="app-ico ri-close-line" aria-hidden="true"></i></button>
          </div>
        </div>

        <div class="modal-body">
          <div class="m-section">
            <div class="m-title">Khách hàng</div>
            <div class="m-row">
              <div class="m-label">Tên</div>
              <div class="m-value m-value-copy">
                <span>{{ selectedOrder?.Ten_khach_hang }}</span>
                <button
                  class="copy-btn"
                  :class="{ copied: copiedKey === 'modal-name' }"
                  :disabled="isBlank(selectedOrder?.Ten_khach_hang)"
                  @click.stop="copyText(selectedOrder?.Ten_khach_hang, 'modal-name')"
                >
                  <i class="app-ico ri-file-copy-line"></i>
                  <span class="copy-label">{{ copiedKey === 'modal-name' ? 'Copied' : 'Copy' }}</span>
                </button>
              </div>
            </div>
            <div class="m-row">
              <div class="m-label">SĐT</div>
              <div class="m-value m-value-copy">
                <span>{{ selectedOrder?.So_dien_thoai }}</span>
                <button
                  class="copy-btn"
                  :class="{ copied: copiedKey === 'modal-phone' }"
                  :disabled="isBlank(selectedOrder?.So_dien_thoai)"
                  @click.stop="copyText(selectedOrder?.So_dien_thoai, 'modal-phone')"
                >
                  <i class="app-ico ri-file-copy-line"></i>
                  <span class="copy-label">{{ copiedKey === 'modal-phone' ? 'Copied' : 'Copy' }}</span>
                </button>
              </div>
            </div>
            <div class="m-row">
              <div class="m-label">Địa chỉ</div>
              <div class="m-value m-value-copy">
                <span>{{ selectedOrder?.Dia_chi }}</span>
                <button
                  class="copy-btn"
                  :class="{ copied: copiedKey === 'modal-addr' }"
                  :disabled="isBlank(selectedOrder?.Dia_chi)"
                  @click.stop="copyText(selectedOrder?.Dia_chi, 'modal-addr')"
                >
                  <i class="app-ico ri-file-copy-line"></i>
                  <span class="copy-label">{{ copiedKey === 'modal-addr' ? 'Copied' : 'Copy' }}</span>
                </button>
              </div>
            </div>
          </div>

          <div class="m-section">
            <div class="m-title">Thời gian giao</div>
            <div class="m-row">
              <div class="m-label">Thời gian nhận</div>
              <div class="m-value m-value-inline">
                <span>{{ selectedOrder?.Thoi_gian_nhan_hang }}</span>
                <span class="m-counter" :class="modalTimeClass">
                  {{ formatTimeRemaining(selectedOrder?.Thoi_gian_nhan_hang) }}
                </span>
              </div>
            </div>
          </div>

          <div class="m-section">
            <div class="m-title">Sản phẩm</div>
            <!-- DESKTOP TABLE -->
            <div class="m-table desktop-only-table">
              <div class="m-table-head">
                <div class="m-th m-col-qty">SL</div>
                <div class="m-th m-col-name">Tên hàng</div>
                <div class="m-th m-col-price">Đơn giá</div>
                <div class="m-th m-col-total">Thành tiền</div>
              </div>
              <div
                v-for="(item, idx) in getItems(selectedOrder?.Ma_hoa_don)"
                :key="idx"
                class="m-table-row"
              >
                <div class="m-td m-col-qty">{{ item.So_luong }}</div>
                <div class="m-td m-col-name">
                  <div class="m-item-name">{{ item.Ten_hang }}</div>
                  <div v-if="getItemDvt(item)" class="m-item-dvt">ĐVT: {{ getItemDvt(item) }}</div>
                  <div v-if="item.Ghi_chu" class="m-item-note">{{ item.Ghi_chu }}</div>
                </div>
                <div class="m-td m-col-price">{{ formatMoney(getItemUnitPrice(item)) }}</div>
                <div class="m-td m-col-total">{{ formatMoney(calcItemNetTotal(item)) }}</div>
              </div>
            </div>

            <!-- MOBILE CARD LIST -->
            <div class="mobile-only-list">
              <div
                v-for="(item, idx) in getItems(selectedOrder?.Ma_hoa_don)"
                :key="idx"
                class="mm-card"
              >
                <!-- Row 1: Name -->
                <div class="mm-name">{{ item.Ten_hang }}</div>
                
                <!-- Row 2: DVT & Size (if any) -->
                <div class="mm-meta-row" v-if="getItemDvt(item)">
                   <span class="mm-tag">ĐVT: {{ getItemDvt(item) }}</span>
                   <!-- IF YOU HAD SIZE, it would go here: <span class="mm-tag">Size: ...</span> -->
                </div>

                <!-- Row 3: Price x Qty | Total -->
                <div class="mm-price-row">
                  <div class="mm-calc">
                    {{ formatMoney(getItemUnitPrice(item)) }} x <span class="mm-qty">{{ item.So_luong }}</span>
                  </div>
                  <div class="mm-total">{{ formatMoney(calcItemNetTotal(item)) }}</div>
                </div>

                <!-- Row 4: Note -->
                <div v-if="item.Ghi_chu" class="mm-note">
                  <i class="app-ico ri-sticky-note-line"></i> {{ item.Ghi_chu }}
                </div>
              </div>
            </div>
          </div>

          <div class="m-section">
            <div class="m-title">Thanh toán</div>
            <div class="m-row">
              <div class="m-label">Hình thức</div>
              <div class="m-value">
                <span class="pay-badge" :class="selectedOrder?.Hinh_thuc_thanh_toan === 'CHUYEN_KHOAN' ? 'transfer' : 'cash'">
                  {{ selectedOrder?.Hinh_thuc_thanh_toan === 'CHUYEN_KHOAN' ? 'Chuyển khoản' : 'Tiền mặt' }}
                </span>
              </div>
            </div>
            <div class="m-row total">
              <div class="m-label">Tổng cộng</div>
              <div class="m-value total-amount">{{ formatMoney(selectedOrder?.Tong_gia_ban ?? selectedOrder?.Tong_cong) }}</div>
            </div>
          </div>

          <div class="m-section" v-if="selectedOrder?.Ghi_chu">
            <div class="m-title">Ghi chú</div>
            <div class="note-box">{{ selectedOrder?.Ghi_chu }}</div>
          </div>
        </div>

        <div class="modal-footer" v-if="getDonStatus(selectedOrder) !== 'Hoàn thành'">
          <button class="btn-cancel" :disabled="isModalLoading" @click="onModalCancel">
            <span v-if="isModalCancelLoading" class="btn-spinner"></span>
            {{ isModalCancelLoading ? 'Đang hủy...' : 'Hủy đơn' }}
          </button>
          <button class="btn-complete" :disabled="isModalLoading" @click="onModalComplete">
            <span v-if="isModalCompleteLoading" class="btn-spinner"></span>
            {{ isModalCompleteLoading ? 'Đang hoàn thành...' : 'Hoàn thành đơn' }}
          </button>
        </div>
      </div>
    </div>

    <!-- CUSTOM CONFIRM MODAL -->
    <div v-if="confirmModal.show" class="confirm-overlay" @click.self="closeConfirm">
      <div class="confirm-box">
        <div class="confirm-icon danger">
          <i class="app-ico ri-question-mark"></i>
        </div>
        <div class="confirm-title">{{ confirmModal.title }}</div>
        <div class="confirm-desc">{{ confirmModal.message }}</div>
        <div class="confirm-actions">
          <button class="c-btn c-cancel" @click="closeConfirm">Hủy bỏ</button>
          <button 
            class="c-btn c-yes" 
            :class="confirmModal.type.includes('cancel') ? 'danger' : 'success'"
            @click="handleConfirm"
          >
            Đồng ý
          </button>
        </div>
      </div>
    </div>

    <!-- RESULT MODAL (SUCCESS/ERROR) -->
    <div v-if="resultModal.show" class="confirm-overlay" @click.self="closeResult">
      <div class="confirm-box">
        <div class="confirm-icon" :class="resultModal.type">
          <i class="app-ico" :class="resultModal.type === 'success' ? 'ri-checkbox-circle-line' : 'ri-error-warning-line'"></i>
        </div>
        <div class="confirm-title">{{ resultModal.title }}</div>
        <div class="confirm-desc">{{ resultModal.message }}</div>
        <div class="confirm-actions">
          <button class="c-btn c-yes" :class="resultModal.type" @click="closeResult">
            Đóng
          </button>
        </div>
      </div>
    </div>
    <!-- SCROLL TO TOP -->
    <button 
      class="btn-scroll-top" 
      :class="{ show: showScrollTop }" 
      @click="scrollToTop"
    >
      <i class="app-ico ri-arrow-up-line"></i>
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch,inject } from 'vue'
import { API_URL, IMGBB_KEY } from '@/config/api'


const loading = ref(true)
const donHangList = ref([])
const chiTietList = ref([])
const loadingId = ref(null)
const currentPage = ref(1)
const itemsPerPage = 16
const showModal = ref(false)
const selectedOrder = ref(null)
const modalLoadingAction = ref('')
const cardLoadingAction = ref('')
const copiedKey = ref('')

const updatePendingCount = inject('updatePendingCount', () => {})
// CONFIRM MODAL STATE
const confirmModal = ref({
  show: false,
  type: '', // 'complete', 'cancel', 'bulk-complete', 'bulk-cancel'
  title: '',
  message: '',
  data: null
})

// RESULT MODAL STATE
const resultModal = ref({
  show: false,
  type: 'success', // 'success' | 'error'
  title: '',
  message: ''
})

const searchText = ref('') // Search state
const showScrollTop = ref(false) // Scroll to top state
const rootEl = ref(null)
const scrollContainer = ref(null) // The element that is actually scrolling

// Reset page when searching
watch(searchText, () => { currentPage.value = 1 })


// Scroll to top when page changes
watch(currentPage, () => {
  const el = document.querySelector('.page-container')
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  else window.scrollTo({ top: 0, behavior: 'smooth' })
})

const nowTick = ref(Date.now())
let tickTimer = null
let copyTimer = null

function todayYMD() {
  const now = new Date()
  const yyyy = String(now.getFullYear())
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

const filter = ref({
  fromDate: todayYMD(),
  toDate: todayYMD(),
  payment: '',
  status: 'Đang xử lý',
  sort: 'upcoming'
})

// Reset page when filter changes
watch(() => filter.value.sort, () => { currentPage.value = 1 })
watch(() => filter.value.status, () => { currentPage.value = 1 })
watch(() => filter.value.payment, () => { currentPage.value = 1 })
watch(() => filter.value.fromDate, () => { currentPage.value = 1 })
watch(() => filter.value.toDate, () => { currentPage.value = 1 })

onMounted(async () => {
  tickTimer = setInterval(() => {
    nowTick.value = Date.now()
  }, 1000)

  // Use capture=true to detect scroll on any parent elements if window isn't scrolling
  window.addEventListener('scroll', handleScroll, true)



  if (!filter.value.fromDate) filter.value.fromDate = todayYMD()
  if (!filter.value.toDate) filter.value.toDate = todayYMD()

  try {
    const res = await fetch(`${API_URL}?action=all`)
    const json = await res.json()
    donHangList.value = json.data.don_hang || []
    chiTietList.value = json.data.hoa_don_chi_tiet || []
  } catch (e) {
    console.error('L?i t?i d? li?u:', e)
  } finally {
    loading.value = false
  }
})

onUnmounted(() => {
  if (tickTimer) {
    clearInterval(tickTimer)
    tickTimer = null
  }
  if (copyTimer) {
    clearTimeout(copyTimer)
    copyTimer = null
  }
  window.removeEventListener('scroll', handleScroll, true)
})
// ===== HELPERS =====
function handleScroll(e) {
  // 1. If event target is an element (div, etc.)
  if (e.target instanceof Element) {
    // Only care if this element contains our page content (is a wrapper)
    // or IS the root element (though less likely for page scroll)
    if (rootEl.value && (e.target.contains(rootEl.value) || e.target === rootEl.value)) {
      scrollContainer.value = e.target
      showScrollTop.value = e.target.scrollTop > 300
    }
  } 
  // 2. If event target is document (window scroll)
  else if (e.target === document) {
    scrollContainer.value = window
    showScrollTop.value = window.scrollY > 300
  }
}

function scrollToTop() {
  if (scrollContainer.value === window || !scrollContainer.value) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } else {
    scrollContainer.value.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

function getItems(maHoaDon) {
  return chiTietList.value.filter(i => i.Ma_hoa_don === maHoaDon)
}

function getOrderCurrency() {
  return selectedOrder.value?.Don_vi_tien_te || 'đ'
}

function n(v) {
  return Number(v || 0)
}

function getItemDvt(item) {
  return item?.Dvt || item?.dvt || ''
}

function getItemUnitPrice(item) {
  return Number(item?.Gia_ban ?? item?.giaBan ?? 0)
}

function calcItemNetTotal(item) {
  const qty = n(item.So_luong ?? item.soLuong ?? 0)
  const gross = item.Thanh_tien != null ? n(item.Thanh_tien) : n(item.Gia_ban ?? item.giaBan) * qty
  const ck = n(item.Tien_chiet_khau ?? item.tienChietKhau)
  const giam = n(item.Giam_gia ?? item.giamGia) * qty
  return Math.max(0, gross - ck - giam)
}

function formatMoney(v) {
  return format(v) + (getOrderCurrency() ? ' ' + getOrderCurrency() : '')
}

function getOrderTimeClass() {
  return getTimeClass(selectedOrder.value, getDonStatus(selectedOrder.value))
}

function format(n) {
  return Number(n || 0).toLocaleString('vi-VN')
}

function mapPayment(v) {
  return v === 'CHUYEN_KHOAN' ? 'Chuyển khoản' : 'Tiền mặt'
}

function isBlank(text) {
  return !String(text || '').trim()
}

function truncate(str, len) {
  if (!str) return ''
  return str.length > len ? str.slice(0, len) + '...' : str
}

function openDetail(dh) {
  selectedOrder.value = dh
  showModal.value = true
}

function formatClock(ms) {
  const totalSeconds = Math.floor(ms / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const mins = Math.floor((totalSeconds % 3600) / 60)
  const secs = totalSeconds % 60
  const pad = (n) => String(n).padStart(2, '0')
  const core = `${pad(hours)}:${pad(mins)}:${pad(secs)}`
  return days > 0 ? `${days}d ${core}` : core
}

function formatTimeRemaining(dateStr) {
  const target = parseVNDateTime(dateStr)
  if (!target) return '--'

  const now = new Date(nowTick.value)
  const diff = target - now

  if (diff < 0) {
    const absDiff = Math.abs(diff)
    return `Quá hạn ${formatClock(absDiff)}`
  }

  return `Còn lại ${formatClock(diff)}`
}

function parseVNDateTime(str) {
  if (!str) return null
  const [time, date] = str.split(' ')
  const [hh, mm, ss] = time.split(':').map(Number)
  const [dd, MM, yyyy] = date.split('/').map(Number)
  return new Date(yyyy, MM - 1, dd, hh, mm, ss)
}

function copyText(text, key) {
  const value = String(text || '').trim()
  if (!value) return

  const setCopied = () => {
    copiedKey.value = key
    if (copyTimer) clearTimeout(copyTimer)
    copyTimer = setTimeout(() => {
      if (copiedKey.value === key) copiedKey.value = ''
    }, 1200)
  }

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(value)
      .then(setCopied)
      .catch(() => {
        const ta = document.createElement('textarea')
        ta.value = value
        ta.setAttribute('readonly', '')
        ta.style.position = 'fixed'
        ta.style.top = '-9999px'
        document.body.appendChild(ta)
        ta.select()
        try {
          const ok = document.execCommand('copy')
          if (ok) setCopied()
        } finally {
          document.body.removeChild(ta)
        }
      })
    return
  }

  const ta = document.createElement('textarea')
  ta.value = value
  ta.setAttribute('readonly', '')
  ta.style.position = 'fixed'
  ta.style.top = '-9999px'
  document.body.appendChild(ta)
  ta.select()
  try {
    const ok = document.execCommand('copy')
    if (ok) setCopied()
  } finally {
    document.body.removeChild(ta)
  }
}

function parseYMDLocal(ymd, endOfDay = false) {
  if (!ymd) return null
  const [yyyy, mm, dd] = ymd.split('-').map(Number)
  if (!yyyy || !mm || !dd) return null
  const d = new Date(yyyy, mm - 1, dd)
  if (endOfDay) d.setHours(23, 59, 59, 999)
  else d.setHours(0, 0, 0, 0)
  return d
}

function matchesDateFilter(dh) {
  const hasFrom = !!filter.value.fromDate
  const hasTo = !!filter.value.toDate
  if (!hasFrom && !hasTo) return true

  const ngayNhan = parseVNDateTime(dh.Thoi_gian_nhan_hang)
  if (!ngayNhan) return false

  if (hasFrom) {
    const from = parseYMDLocal(filter.value.fromDate, false)
    if (!from) return false
    if (ngayNhan < from) return false
  }

  if (hasTo) {
    const to = parseYMDLocal(filter.value.toDate, true)
    if (!to) return false
    if (ngayNhan > to) return false
  }

  return true
}

function getDonStatus(dh) {
  if (!dh) return ''
  if (dh.Trang_thai === 'Hoàn thành') return 'Hoàn thành'
  
  const thoiGianGiao = parseVNDateTime(dh.Thoi_gian_nhan_hang)
  if (!thoiGianGiao) return dh.Trang_thai
  
  // Quá hạn sau 23:59:59 của ngày giao hàng
  const endOfDay = new Date(thoiGianGiao)
  endOfDay.setHours(23, 59, 59, 999)
  
  const now = new Date()
  if (now > endOfDay) return 'Quá hạn'
  
  return dh.Trang_thai
}

// Hiển thị thời gian tùy theo trạng thái
function formatTimeDisplay(dh, status) {
  const timeGoc = dh.Thoi_gian_nhan_hang
  if (status === 'Hoàn thành') {
    // Đã hoàn thành: chỉ hiển thị thời gian gốc
    return timeGoc
  }
  // Đang xử lý hoặc quá hạn: hiển thị thời gian gốc + (còn/quá bao lâu)
  return `${timeGoc} (${formatTimeRemaining(timeGoc)})`
}

// Class cho thời gian tùy theo trạng thái
function getTimeClass(dh, status) {
  if (status === 'Hoàn thành') return 'done'
  if (status === 'Quá hạn') return 'overdue'
  
  const target = parseVNDateTime(dh.Thoi_gian_nhan_hang)
  if (!target) return ''
  
  const now = new Date()
  const diff = target - now
  const mins = Math.floor(diff / 60000)
  
  if (mins > 60) return 'normal'
  if (mins > 30) return 'warning'
  if (mins >= 0) return 'urgent'
  return 'overdue'
}

function getStatusClass(status) {
  if (status === 'Hoàn thành') return 'done'
  if (status === 'Quá hạn') return 'overdue'
  if (status === 'Đang xử lý') return 'pending'
  return ''
}

// ===== COMPUTED =====
// ===== HELPER: Remove Tones =====
// ===== HELPER: Remove Tones =====
function removeVietnameseTones(str) {
  str = String(str || '')
  return str.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
}

// ===== REAL-TIME SEARCH COMPUTED =====
const listAfterSearch = computed(() => {
  const q = searchText.value.trim()
  if (!q) return donHangList.value

  const sNoTone = removeVietnameseTones(q)
  const sRaw = q.toLowerCase()

  return donHangList.value.filter(dh => {
    // 1. Name
    const name = String(dh.Ten_khach_hang || '')
    if (name.toLowerCase().includes(sRaw) || removeVietnameseTones(name).includes(sNoTone)) return true
    
    // 2. Phone
    const phone = String(dh.So_dien_thoai || '')
    if (phone.toLowerCase().includes(sRaw)) return true
    
    // 3. Address
    const addr = String(dh.Dia_chi || '')
    if (addr.toLowerCase().includes(sRaw) || removeVietnameseTones(addr).includes(sNoTone)) return true

    // 4. ID
    const id = String(dh.Ma_hoa_don || '')
    if (id.toLowerCase().includes(sRaw)) return true

    return false
  })
})

const baseByPayment = computed(() => {
  const list = listAfterSearch.value
  if (!filter.value.payment) return list
  return list.filter(dh => dh.Hinh_thuc_thanh_toan === filter.value.payment)
})

const baseByDateAndPayment = computed(() => {
  return baseByPayment.value.filter(dh => matchesDateFilter(dh))
})

const statsBase = computed(() => baseByDateAndPayment.value)

const ignoreDateForList = computed(() => filter.value.status === 'Quá hạn')
const listBase = computed(() => (ignoreDateForList.value ? baseByPayment.value : baseByDateAndPayment.value))

const filteredOrders = computed(() => {
  // Search respects status filter now (User Request)
  if (!filter.value.status) return listBase.value
  return listBase.value.filter(dh => getDonStatus(dh) === filter.value.status)
})

const sortedOrders = computed(() => {
  const dir = filter.value.sort === 'newest' ? -1 : 1
  const list = filteredOrders.value.map((dh, idx) => {
    const t = parseVNDateTime(dh.Thoi_gian_nhan_hang)
    return {
      dh,
      idx,
      time: t ? t.getTime() : 0
    }
  })

  list.sort((a, b) => {
    if (a.time !== b.time) return (a.time - b.time) * dir
    const maA = a.dh?.Ma_hoa_don != null ? String(a.dh.Ma_hoa_don) : ''
    const maB = b.dh?.Ma_hoa_don != null ? String(b.dh.Ma_hoa_don) : ''
    if (maA !== maB) return maA.localeCompare(maB)
    return a.idx - b.idx
  })

  return list.map(item => item.dh)
})
const totalPages = computed(() => Math.ceil(sortedOrders.value.length / itemsPerPage) || 1)

const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return sortedOrders.value.slice(start, start + itemsPerPage)
})

// Đếm số lượng theo trạng thái
const countAll = computed(() => statsBase.value.length)
const countPending = computed(() => statsBase.value.filter(dh => getDonStatus(dh) === 'Đang xử lý').length)
const countOverdue = computed(() => baseByPayment.value.filter(dh => getDonStatus(dh) === 'Quá hạn').length)
const countDone = computed(() => statsBase.value.filter(dh => getDonStatus(dh) === 'Hoàn thành').length)
const isModalLoading = computed(() => loadingId.value === selectedOrder.value?.Ma_hoa_don && !!modalLoadingAction.value)
const isModalCancelLoading = computed(() => isModalLoading.value && modalLoadingAction.value === 'cancel')
const isModalCompleteLoading = computed(() => isModalLoading.value && modalLoadingAction.value === 'complete')
const modalTimeClass = computed(() => {
  const dh = selectedOrder.value
  if (!dh) return ''
  nowTick.value
  return getTimeClass(dh, getDonStatus(dh))
})
// ===== ACTIONS =====
function resetFilter() {
  filter.value = {
    fromDate: todayYMD(),
    toDate: todayYMD(),
    payment: '',
    status: 'Đang xử lý',
    sort: 'upcoming'
  }
  currentPage.value = 1
}

function toggleStatus(st) {
  if (filter.value.status === st) {
    filter.value.status = '' // Toggle OFF
  } else {
    filter.value.status = st // Toggle ON
  }
}

// ===== MODAL LOGIC =====


// ===== MODAL LOGIC =====
function openConfirm(type, data, title, message) {
  confirmModal.value = { show: true, type, data, title, message }
}

function closeConfirm() {
  confirmModal.value.show = false
}

function openResult(title, message, type = 'success') {
  resultModal.value = { show: true, title, message, type }
}

function closeResult() {
  resultModal.value.show = false
}

async function handleConfirm() {
  const { type, data } = confirmModal.value
  closeConfirm() // Close immediately to show loading on card/modal

  if (type === 'complete') {
    await hoanThanhDonHang(data, { skipConfirm: true })
  } else if (type === 'cancel') {
    await huyDonHang(data, { skipConfirm: true })
  } else if (type === 'bulk-complete') {
    await runBulkComplete(data)
  } else if (type === 'bulk-cancel') {
    await runBulkCancel(data)
  }
}

// ✅ THÊM DÒNG NÀY Ở ĐẦU FILE (sau dòng import)


async function hoanThanhDonHang(dh, opts = {}) {
  if (!opts.skipConfirm) {
    openConfirm('complete', dh, 'Xác nhận hoàn thành?', `Bạn có chắc chắn muốn hoàn thành đơn hàng #${dh.Ma_hoa_don}?`)
    return false
  }

  const oldStatus = getDonStatus(dh) // ✅ THÊM DÒNG NÀY
  loadingId.value = dh.Ma_hoa_don

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'hoanThanhTrangThaiDon',
        Ma_hoa_don: dh.Ma_hoa_don
      })
    })

    if (res.type === 'opaque') {
      dh.Trang_thai = 'Hoàn thành'
      
      // ✅ THÊM ĐOẠN NÀY
      if (oldStatus === 'Đang xử lý') {
        updatePendingCount(-1)
      }
      
      if (!opts.silent) {
        openResult('Thành công', `Đã hoàn thành đơn hàng #${dh.Ma_hoa_don}`, 'success')
      }
      return true
    }
  } catch (e) {
    alert('❌ Lỗi kết nối server')
    return false
  } finally {
    loadingId.value = null
  }
  return false
}

async function huyDonHang(dh, opts = {}) {
  if (!opts.skipConfirm) {
    openConfirm('cancel', dh, 'Xác nhận HỦY đơn?', `Đơn hàng #${dh.Ma_hoa_don} sẽ bị xóa vĩnh viễn. Hành động này không thể hoàn tác!`)
    return false
  }

  const oldStatus = getDonStatus(dh) // ✅ THÊM DÒNG NÀY
  loadingId.value = dh.Ma_hoa_don

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'huyDonHang',
        Ma_hoa_don: dh.Ma_hoa_don
      })
    })

    if (res.type === 'opaque') {
      const idx = donHangList.value.findIndex(d => d.Ma_hoa_don === dh.Ma_hoa_don)
      if (idx > -1) donHangList.value.splice(idx, 1)
      
      // ✅ THÊM ĐOẠN NÀY
      if (oldStatus === 'Đang xử lý') {
        updatePendingCount(-1)
      }
      
      if (!opts.silent) {
        openResult('Đã hủy đơn', `Đơn hàng #${dh.Ma_hoa_don} đã được hủy thành công.`, 'success')
      }
      return true
    }
  } catch (e) {
    alert('❌ Lỗi kết nối server')
    return false
  } finally {
    loadingId.value = null
  }
  return false
}

async function onModalCancel() {
  if (!selectedOrder.value) return
  modalLoadingAction.value = 'cancel'
  try {
    const ok = await huyDonHang(selectedOrder.value, { skipConfirm: true })
    if (ok) showModal.value = false
  } finally {
    modalLoadingAction.value = ''
  }
}

async function onModalComplete() {
  if (!selectedOrder.value) return
  modalLoadingAction.value = 'complete'
  try {
    const ok = await hoanThanhDonHang(selectedOrder.value, { skipConfirm: true })
    if (ok) showModal.value = false
  } finally {
    modalLoadingAction.value = ''
  }
}

async function onCardCancel(dh) {
  if (!dh) return
  cardLoadingAction.value = 'cancel'
  try {
    await huyDonHang(dh)
  } finally {
    cardLoadingAction.value = ''
  }
}

async function onCardComplete(dh) {
  if (!dh) return
  cardLoadingAction.value = 'complete'
  try {
    await hoanThanhDonHang(dh)
  } finally {
    cardLoadingAction.value = ''
  }
}

// ===== MULTI-SELECT STATE =====
const selectedIds = ref(new Set())
const bulkLoading = ref(false)
const bulkAction = ref('') // 'complete' | 'cancel'
const bulkProgress = ref({ done: 0, total: 0 })

// Computed: số đơn đã chọn
const selectedCount = computed(() => selectedIds.value.size)

// Helper: Danh sách đơn có thể chọn trên trang hiện tại
const selectableOnPage = computed(() => paginatedOrders.value.filter(dh => canSelect(dh)))

// Helper: kiểm tra có phải tất cả đơn CÓ THỂ CHỌN trong trang hiện tại đã được chọn chưa
const isAllSelected = computed(() => {
  if (selectableOnPage.value.length === 0) return false
  return selectableOnPage.value.every(dh => selectedIds.value.has(dh.Ma_hoa_don))
})

// Toggle Select All (cho trang hiện tại)
function toggleSelectAll() {
  if (selectableOnPage.value.length === 0) return

  const newSet = new Set(selectedIds.value)
  
  if (isAllSelected.value) {
    // Bỏ chọn tất cả trong trang này
    selectableOnPage.value.forEach(dh => newSet.delete(dh.Ma_hoa_don))
  } else {
    // Chọn tất cả trong trang này
    selectableOnPage.value.forEach(dh => newSet.add(dh.Ma_hoa_don))
  }
  
  selectedIds.value = newSet
}

// Helper: kiểm tra đơn có được chọn không
function isSelected(dh) {
  return selectedIds.value.has(dh.Ma_hoa_don)
}

// Helper: kiểm tra có thể tick đơn không (chỉ đơn chưa hoàn thành và không đang loading)
function canSelect(dh) {
  if (getDonStatus(dh) === 'Hoàn thành') return false
  if (loadingId.value === dh.Ma_hoa_don) return false
  if (bulkLoading.value) return false
  return true
}

// Toggle chọn/bỏ chọn đơn
function toggleSelect(dh) {
  if (!canSelect(dh)) return
  const newSet = new Set(selectedIds.value)
  if (newSet.has(dh.Ma_hoa_don)) {
    newSet.delete(dh.Ma_hoa_don)
  } else {
    newSet.add(dh.Ma_hoa_don)
  }
  selectedIds.value = newSet
}

// Clear toàn bộ selection
function clearSelected() {
  selectedIds.value = new Set()
}

// Lấy danh sách đơn hàng đã chọn
function getSelectedOrders() {
  return donHangList.value.filter(dh => selectedIds.value.has(dh.Ma_hoa_don))
}

// Bulk: Hoàn thành nhiều đơn
async function bulkComplete() {
  const orders = getSelectedOrders().filter(dh => getDonStatus(dh) !== 'Hoàn thành')
  if (orders.length === 0) {
    openResult('Thông báo', 'Không có đơn nào để hoàn thành', 'error')
    return
  }
  
  openConfirm('bulk-complete', orders, 'Hoàn thành nhiều đơn', `Xác nhận hoàn thành ${orders.length} đơn hàng đã chọn?`)
}

async function runBulkComplete(orders) {
  
  bulkLoading.value = true
  bulkAction.value = 'complete'
  bulkProgress.value = { done: 0, total: orders.length }
  
  try {
    for (const dh of orders) {
      // Set loading state cho card này để hiển thị spinner trên card
      loadingId.value = dh.Ma_hoa_don
      cardLoadingAction.value = 'complete'
      
      await hoanThanhDonHang(dh, { skipConfirm: true, silent: true })
      
      bulkProgress.value.done++
      // Reset loading state sau khi xong đơn này
      loadingId.value = null
      cardLoadingAction.value = ''
    }
  } finally {
    bulkLoading.value = false
    bulkAction.value = ''
    clearSelected()
    loadingId.value = null
    cardLoadingAction.value = ''
    openResult('Hoàn tất', `Đã hoàn thành ${bulkProgress.value.done}/${orders.length} đơn hàng.`, 'success')
  }
}

// Bulk: Hủy nhiều đơn
async function bulkCancel() {
  const orders = getSelectedOrders().filter(dh => getDonStatus(dh) !== 'Hoàn thành')
  if (orders.length === 0) {
    openResult('Thông báo', 'Không có đơn nào để hủy', 'error')
    return
  }
  
  openConfirm('bulk-cancel', orders, 'Xác nhận hủy nhiều đơn', `Bạn có chắc chắn muốn HỦY ${orders.length} đơn hàng? Hành động này không thể hoàn tác!`)
}

async function runBulkCancel(orders) {
  
  bulkLoading.value = true
  bulkAction.value = 'cancel'
  bulkProgress.value = { done: 0, total: orders.length }
  
  try {
    for (const dh of orders) {
      // Set loading state cho card này
      loadingId.value = dh.Ma_hoa_don
      cardLoadingAction.value = 'cancel'
      
      await huyDonHang(dh, { skipConfirm: true, silent: true })
      
      bulkProgress.value.done++
      // Reset loading state sau khi xong đơn này
      loadingId.value = null
      cardLoadingAction.value = ''
    }
    openResult('Hoàn tất', `Đã hủy ${bulkProgress.value.done}/${orders.length} đơn hàng.`, 'success')
  } finally {
    bulkLoading.value = false
    bulkAction.value = ''
    clearSelected()
    loadingId.value = null
    cardLoadingAction.value = ''
  }
}

// Cleanup: Xóa ID đã bị remove khỏi list (sau khi hủy đơn)
watch(donHangList, () => {
  const validIds = new Set(donHangList.value.map(dh => dh.Ma_hoa_don))
  const newSelected = new Set()
  selectedIds.value.forEach(id => {
    if (validIds.has(id)) newSelected.add(id)
  })
  if (newSelected.size !== selectedIds.value.size) {
    selectedIds.value = newSelected
  }
}, { deep: true })

// Validate Date Range
watch(() => filter.value.fromDate, (newVal) => {
  if (newVal && filter.value.toDate && newVal > filter.value.toDate) {
    filter.value.toDate = newVal
  }
})

watch(() => filter.value.toDate, (newVal) => {
  if (newVal && filter.value.fromDate && newVal < filter.value.fromDate) {
    filter.value.fromDate = newVal
  }
})

// Reset page + clear selection khi filter thay đổi
watch(filter, () => { 
  currentPage.value = 1 
  clearSelected()
}, { deep: true })
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700;800&display=swap');
.page-container,
.page-container * {
  box-sizing: border-box;
}



.page-container {
  width: 100%;
  max-width: none;
  margin: 0;
  padding: 16px 18px;
  background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
  min-height: 100vh;
  position: relative;
}

.page-container::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(ellipse at 20% 20%, rgba(16, 185, 129, 0.08) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 80%, rgba(59, 130, 246, 0.08) 0%, transparent 50%);
  pointer-events: none;
  z-index: 0;
}

.page-container > * {
  position: relative;
  z-index: 1;
}

/* ===== FILTER BAR (PREMIUM TECH DASHBOARD) ===== */
.filter-bar {
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(16px);
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 24px;
  /* Viền 1px sáng nhẹ + Shadow mềm */
  border: 1px solid rgba(148, 163, 184, 0.1);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3), 
    inset 0 1px 0 rgba(255, 255, 255, 0.08); /* Inner highlight top */
  
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: relative;
  overflow: hidden;
}

/* Top Glow Effect */
.filter-bar::before {
  content: '';
  position: absolute;
  top: -50px;
  left: -50px;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%);
  pointer-events: none;
  z-index: 0;
}

.fb-row {
  display: flex;
  gap: 20px;
  width: 100%;
  position: relative;
  z-index: 1;
}

/* Row 1: Search */
.search-row {
  width: 100%;
}
.search-box {
  flex: 1;
}

/* Row 2: Dates */
.date-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

/* Row 3: Actions */
.actions-row {
  display: grid;
  grid-template-columns: 200px 1fr 100px; /* Payment | Sort | Reset */
  align-items: end;
  gap: 20px;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.filter-item label {
  font-size: 11px;
  font-weight: 700;
  color: #ffffff;
  opacity: 1;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-left: 2px;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
}

/* ===== CONTROLS (Unified Height 48px) ===== */
.filter-item input,
.filter-item select,
.search-wrapper input {
  width: 100%;
  height: 48px;
  padding: 0 16px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  color: #e2e8f0;
  background: rgba(30, 41, 59, 0.5); /* Semi-transparent dark */
  border: 1px solid rgba(148, 163, 184, 0.15);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  appearance: none;
  font-family: inherit;
}

.filter-item input::placeholder,
.search-wrapper input::placeholder {
  color: #64748b;
  font-weight: 500;
}

/* Hover & Focus */
.filter-item input:hover,
.filter-item select:hover,
.search-wrapper input:hover {
  border-color: rgba(148, 163, 184, 0.3);
  background: rgba(30, 41, 59, 0.7);
}

.filter-item input:focus,
.filter-item select:focus,
.search-wrapper input:focus {
  outline: none;
  background-color: rgba(15, 23, 42, 0.95); /* Use background-color to avoid resetting bg-image */
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15); /* Glow */
  color: #fff;
}

/* ===== SEARCH BOX ===== */
.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-wrapper input {
  padding-left: 48px; /* Icon space */
  padding-right: 80px; /* Clear button space */
  background: rgba(15, 23, 42, 0.6);
  /* NEON GREEN HIGHLIGHT */
  border: 1px solid #10b981;
  box-shadow: 0 0 12px rgba(16, 185, 129, 0.25);
}

.search-wrapper input:focus {
  border-color: #00ff9d;
  box-shadow: 0 0 20px rgba(0, 255, 157, 0.4);
  background: rgba(15, 23, 42, 0.85);
}

.search-wrapper i {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 18px;
  color: #10b981; /* Green icon to match */
  pointer-events: none;
  transition: color 0.3s;
}

.search-wrapper:focus-within i {
  color: #00ff9d;
  text-shadow: 0 0 10px rgba(0, 255, 157, 0.5);
}

/* Clear Button (Ghost Pill) */
.btn-clear-search {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(148, 163, 184, 0.1);
  border: 1px solid rgba(148, 163, 184, 0.1);
  color: #94a3b8;
  padding: 4px 10px;
  border-radius: 99px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-clear-search:hover {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.3);
}

/* ===== SEARCH RESULT BAR ===== */
.search-result-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 24px;
  font-family: 'JetBrains Mono', monospace;
  color: #94a3b8;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.result-count .highlight-count {
  color: #fff;
  font-weight: 800;
  font-size: 16px;
  margin: 0 4px;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}

.result-text .highlight-text {
  color: #10b981;
  font-weight: 700;
  margin-left: 4px;
}

/* ===== DATE INPUT ===== */
.filter-item input[type="date"] {
  position: relative; /* Ensure picker positions relative to this input */
  z-index: 1;
  /* Calendar Icon Trick */
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='18' height='18' fill='%2364748b'%3E%3Cpath d='M17 3H21C21.5523 3 22 3.44772 22 4V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3H7V1H9V3H15V1H17V3ZM4 9V19H20V9H4ZM6 11H8V13H6V11ZM11 11H13V13H11V11ZM16 11H18V13H16V11Z'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 16px center;
  padding-right: 48px;
}
.filter-item input[type="date"]::-webkit-calendar-picker-indicator {
  opacity: 0;
  cursor: pointer;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
}
.filter-item input[type="date"]:focus {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='18' height='18' fill='%233b82f6'%3E%3Cpath d='M17 3H21C21.5523 3 22 3.44772 22 4V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3H7V1H9V3H15V1H17V3ZM4 9V19H20V9H4ZM6 11H8V13H6V11ZM11 11H13V13H11V11ZM16 11H18V13H16V11Z'%3E%3C/path%3E%3C/svg%3E");
}

/* ===== SELECT ===== */
.filter-item select {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='16' height='16' fill='%2394a3b8'%3E%3Cpath d='M12 16L6 10H18L12 16Z'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 16px center;
  padding-right: 48px;
}
.filter-item select:focus {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='16' height='16' fill='%233b82f6'%3E%3Cpath d='M12 16L6 10H18L12 16Z'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 16px center;
}

/* ===== SORT GROUP (SEGMENTED CONTROL) ===== */
.status-btn-group {
  display: flex;
  background: rgba(15, 23, 42, 0.55);
  border: 1px solid rgba(148, 163, 184, 0.12);
  padding: 4px;
  border-radius: 12px;
  height: 48px;
  position: relative;
}

.status-btn {
  flex: 1;
  border: none;
  background: transparent;
  color: #94a3b8;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.status-btn .app-ico {
  font-size: 16px;
  opacity: 0.7;
}

.status-btn:hover {
  color: #e2e8f0;
  background: rgba(255, 255, 255, 0.03);
}

/* Active Pill Style */
.status-btn.active {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
  opacity: 1;
}

/* Red for Upcoming (Gần -> Xa) */
.status-btn.sort-gold.active {
  background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); /* Red gradient */
  text-shadow: 0 1px 2px rgba(0,0,0,0.3);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
}

/* Green for Newest (Xa -> Gần) */
.status-btn.sort-blue.active {
  background: linear-gradient(135deg, #15803d 0%, #22c55e 100%); /* Green gradient */
  text-shadow: 0 1px 2px rgba(0,0,0,0.3);
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.4);
}

/* Payment Filter Borders & Backgrounds */
.filter-item select.pay-cash {
  border-color: #22c55e !important;
  background-color: #15803d !important; /* Solid Dark Green */
  background-repeat: no-repeat !important;
  background-position: right 16px center !important;
  color: #fff !important;
  box-shadow: 0 4px 12px rgba(21, 128, 61, 0.4);
}

.filter-item select.pay-transfer {
  border-color: #3b82f6 !important;
  background-color: #1d4ed8 !important; /* Solid Dark Blue */
  background-repeat: no-repeat !important;
  background-position: right 16px center !important;
  color: #fff !important;
  box-shadow: 0 4px 12px rgba(29, 78, 216, 0.4);
}

/* ===== RESET BUTTON (GHOST) ===== */
.btn-reset {
  height: 48px;
  width: 100%;
  padding: 0 16px;
  background: transparent;
  border: 1px solid rgba(148, 163, 184, 0.15); /* Very subtle border */
  border-radius: 12px;
  color: #64748b; /* Disabled-like color by default */
  font-size: 11px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.3s;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  letter-spacing: 0.5px;
}

.btn-reset:hover {
  background: rgba(239, 68, 68, 0.05); /* Slight red tint */
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.2);
}

/* Resize responsive */
@media (max-width: 1024px) {
  .actions-row {
    grid-template-columns: 1fr;
  }
}

/* Ensure input has space for button */
.search-wrapper input {
  padding-right: 50px !important; /* More space for text */
}

/* ===== MAIN CONTENT ===== */
.main-content {
  display: grid;
  grid-template-columns: 1fr 120px; /* Restored sidebar column */
  gap: 24px;
  width: 100%;
}

/* ===== ORDERS SECTION ===== */
.orders-section {
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 24px;
  border: 1px solid rgba(16, 185, 129, 0.15);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  width: 100%;
}

.loading, .empty {
  text-align: center;
  padding: 80px 20px;
  color: #64748b;
  font-size: 15px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 3px solid rgba(16, 185, 129, 0.1);
  border-top-color: #10b981;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ===== ORDERS GRID ===== */
.orders-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

/* ===== ORDER CARD ===== */
.order-card {
  background: linear-gradient(160deg, rgba(20, 28, 45, 0.98), rgba(10, 14, 25, 0.98));
  border-radius: 16px;
  border: 1px solid transparent;
  background-clip: padding-box;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 14px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  backdrop-filter: blur(10px);
}

.order-card::before {
  content: '';
  position: absolute;
  inset: 0;
  padding: 1px;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(148, 163, 184, 0.35), rgba(148, 163, 184, 0.1));
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
  opacity: 0.8;
}

.order-card::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, rgba(148, 163, 184, 0.2), rgba(148, 163, 184, 0.05));
  opacity: 0.6;
}

.order-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.35), 0 0 22px rgba(59, 130, 246, 0.08);
}

.order-card.overdue {
  box-shadow: 0 0 22px rgba(239, 68, 68, 0.18);
}

.order-card.pending {
  box-shadow: 0 0 18px rgba(234, 179, 8, 0.12);
}

.order-card.done {
  box-shadow: 0 0 18px rgba(16, 185, 129, 0.12);
}

/* Header */
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.status-pill {
  font-size: 11px;
  font-weight: 800;
  padding: 6px 12px;
  border-radius: 999px;
  text-transform: uppercase;
  letter-spacing: 0.6px;
}

.status-pill.pending {
  background: rgba(234, 179, 8, 0.15);
  color: #fbbf24;
  border: 1px solid rgba(234, 179, 8, 0.35);
}

.status-pill.overdue {
  background: rgba(239, 68, 68, 0.15);
  color: #fecaca;
  border: 1px solid rgba(239, 68, 68, 0.35);
}

.status-pill.done {
  background: rgba(16, 185, 129, 0.15);
  color: #6ee7b7;
  border: 1px solid rgba(16, 185, 129, 0.35);
}

.index-pill {
  font-size: 12px;
  font-weight: 800;
  padding: 6px 10px;
  border-radius: 999px;
  background: #ef4444;
  color: #fff;
  border: 1px solid rgba(239, 68, 68, 0.6);
  font-family: 'JetBrains Mono', monospace;
}

/* Body */
.card-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.customer-title {
  font-size: 17px;
  font-weight: 800;
  color: #e2e8f0;
  letter-spacing: 0.2px;
}

.meta-line {
  font-size: 12px;
  color: #9aa4b2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.meta-copy-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.customer-row .customer-title {
  flex: 1;
  min-width: 0;
}

.meta-text {
  flex: 1;
  min-width: 0;
}

.copy-btn {
  height: 24px;
  min-width: 64px;
  padding: 0 8px;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.22);
  background: rgba(148, 163, 184, 0.08);
  color: #94a3b8;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  flex: 0 0 auto;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.3px;
  text-transform: uppercase;
}

.copy-btn svg {
  width: 14px;
  height: 14px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.6;
}

.copy-btn:hover:not(:disabled) {
  background: rgba(59, 130, 246, 0.16);
  border-color: rgba(59, 130, 246, 0.45);
  color: #60a5fa;
  box-shadow: 0 10px 22px rgba(59, 130, 246, 0.1);
}

.copy-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.copy-btn:active:not(:disabled) {
  background: rgba(59, 130, 246, 0.22);
  border-color: rgba(59, 130, 246, 0.55);
  color: #93c5fd;
  transform: translateY(1px);
}

.copy-btn:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.18);
}

.copy-btn.copied {
  background: rgba(34, 197, 94, 0.16);
  border-color: rgba(34, 197, 94, 0.45);
  color: #34d399;
  box-shadow: 0 10px 22px rgba(34, 197, 94, 0.1);
}

.copy-label {
  line-height: 1;
}

.m-value-copy {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pay-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.amount {
  font-size: 18px;
  font-weight: 900;
  color: #22c55e;
  font-family: 'JetBrains Mono', monospace;
}

.time-box {
  font-size: 12px;
  font-weight: 600;
  padding: 10px 12px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  line-height: 1.3;
  font-family: 'JetBrains Mono', monospace;
  background: rgba(148, 163, 184, 0.08);
  border: 1px solid rgba(148, 163, 184, 0.12);
}

.time-box .time-main {
  color: #cbd5f5;
}

.time-box .time-sub {
  font-size: 12px;
  opacity: 0.95;
  font-weight: 700;
}

.time-box.normal {
  color: #22c55e;
  background: rgba(34, 197, 94, 0.08);
  border: 1px solid rgba(34, 197, 94, 0.25);
}

.time-box.warning {
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.time-box.urgent {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.35);
  font-weight: 800;
}

.time-box.overdue {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.18);
  border: 1px solid rgba(239, 68, 68, 0.45);
  animation: overduePulse 1.6s ease-in-out infinite;
  box-shadow: 0 0 14px rgba(239, 68, 68, 0.25);
}

.time-box.done {
  color: #94a3b8;
}

@keyframes overduePulse {
  0%, 100% { box-shadow: 0 0 10px rgba(239, 68, 68, 0.2); }
  50% { box-shadow: 0 0 18px rgba(239, 68, 68, 0.35); }
}

/* Note */
.note-box {
  font-size: 12px;
  color: #e2e8f0;
  background: rgba(148, 163, 184, 0.08);
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 10px;
  padding: 10px 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.payment-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 5px 10px;
  border-radius: 6px;
}

.payment-badge.cash {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.payment-badge.transfer {
  background: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

/* Footer */
.card-footer {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.btn-cancel,
.btn-done {
  height: 40px;
  border-radius: 12px;
  border: none;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.25s ease;
  font-weight: 800;
}

.btn-done {
  background: linear-gradient(135deg, #10b981, #34d399);
  color: #fff;
}

.btn-done:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(16, 185, 129, 0.25);
}

.btn-cancel {
  background: linear-gradient(135deg, #dc2626, #ef4444);
  color: #fff;
}

.btn-cancel:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(239, 68, 68, 0.25);
}

.btn-cancel:disabled,
.btn-done:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* ===== PAGINATION ===== */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid rgba(148, 163, 184, 0.1);
}

.btn-page {
  padding: 10px 20px;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.25));
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 10px;
  color: #10b981;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-page:hover:not(:disabled) {
  background: linear-gradient(135deg, #10b981, #34d399);
  color: #fff;
  transform: scale(1.05);
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
}

.btn-page:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.page-info {
  font-size: 14px;
  color: #e2e8f0;
  font-weight: 600;
  font-family: 'JetBrains Mono', monospace;
  background: rgba(0,0,0,0.3);
  padding: 8px 16px;
  border-radius: 8px;
}

/* ===== STATUS CARDS ===== */
.status-cards {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.status-card {
  background: linear-gradient(145deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.95));
  border-radius: 16px;
  padding: 18px 12px;
  text-align: center;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.status-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, transparent, rgba(255,255,255,0.03));
  pointer-events: none;
}

.status-card:hover {
  transform: translateX(-6px) scale(1.02);
}

.status-card.active {
  background: #334155;
  border-color: #94a3b8;
  box-shadow: 0 0 30px rgba(148, 163, 184, 0.3), inset 0 0 20px rgba(148, 163, 184, 0.1);
  transform: translateX(-6px) scale(1.04);
}

.status-card.active .stat-number {
  color: #fff !important;
  text-shadow: 0 2px 10px rgba(0,0,0,0.2) !important;
}

.status-card.active .stat-badge {
  color: #fff !important;
  border-color: rgba(255,255,255,0.5) !important;
  background: rgba(255,255,255,0.2) !important;
}

.status-card.pending {
  border-color: rgba(234, 179, 8, 0.3);
}

.status-card.pending.active {
  background: #eab308;
  border-color: #facc15;
  box-shadow: 0 0 30px rgba(234, 179, 8, 0.5), inset 0 0 20px rgba(255, 255, 255, 0.2);
}

.status-card.overdue {
  border-color: rgba(239, 68, 68, 0.3);
}

.status-card.overdue.active {
  background: #ef4444;
  border-color: #fca5a5;
  box-shadow: 0 0 40px rgba(239, 68, 68, 0.5), inset 0 0 20px rgba(255, 255, 255, 0.2);
  animation: overdueGlow 2s infinite;
}

@keyframes overdueGlow {
  0%, 100% { box-shadow: 0 0 30px rgba(239, 68, 68, 0.5), inset 0 0 20px rgba(255, 255, 255, 0.2); }
  50% { box-shadow: 0 0 50px rgba(239, 68, 68, 0.7), inset 0 0 30px rgba(255, 255, 255, 0.3); }
}

.status-card.done {
  border-color: rgba(16, 185, 129, 0.3);
}

.status-card.done.active {
  background: #10b981;
  border-color: #6ee7b7;
  box-shadow: 0 0 30px rgba(16, 185, 129, 0.5), inset 0 0 20px rgba(255, 255, 255, 0.2);
}

.stat-number {
  font-size: 32px;
  font-weight: 800;
  color: #f1f5f9;
  font-family: 'JetBrains Mono', monospace;
  text-shadow: 0 2px 10px rgba(0,0,0,0.3);
}

.stat-badge {
  font-size: 10px;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.35);
  background: rgba(148, 163, 184, 0.08);
}

.stat-badge.neutral {
  color: #94a3b8;
  border-color: rgba(148, 163, 184, 0.35);
}

.status-card.pending .stat-number {
  color: #fbbf24;
  text-shadow: 0 0 20px rgba(251, 191, 36, 0.5);
}

.status-card.pending .stat-badge {
  color: #fbbf24;
  border-color: rgba(251, 191, 36, 0.45);
  background: rgba(251, 191, 36, 0.12);
}

.status-card.overdue .stat-number {
  color: #f87171;
  text-shadow: 0 0 20px rgba(248, 113, 113, 0.5);
}

.status-card.overdue .stat-badge {
  color: #f87171;
  border-color: rgba(248, 113, 113, 0.45);
  background: rgba(248, 113, 113, 0.12);
}

.status-card.done .stat-number {
  color: #34d399;
  text-shadow: 0 0 20px rgba(52, 211, 153, 0.5);
}

.status-card.done .stat-badge {
  color: #34d399;
  border-color: rgba(52, 211, 153, 0.45);
  background: rgba(52, 211, 153, 0.12);
}

/* ===== RESPONSIVE ===== */
@media (max-width: 1200px) {
  .orders-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 900px) {
  .orders-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .main-content {
    grid-template-columns: 1fr;
  }

  .status-cards {
    flex-direction: row;
    order: -1;
    margin-bottom: 0;
  }

  .status-card {
    flex: 1;
    padding: 12px 8px;
  }

  .status-card:hover {
    transform: translateY(-4px);
  }

  .filter-bar {
    flex-direction: column;
    align-items: stretch;
    padding: 16px;
    gap: 16px;
  }

  .date-row {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .filter-item {
    width: 100%;
  }

  .filter-item input,
  .filter-item select {
    width: 100%;
  }

  .orders-grid {
    grid-template-columns: 1fr;
  }
}

/* ===== SCROLL TO TOP ===== */
.btn-scroll-top {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 9990;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0;
  transform: translateY(20px) scale(0.9);
  pointer-events: none;
}

.btn-scroll-top.show {
  opacity: 1;
  transform: translateY(0) scale(1);
  pointer-events: auto;
}

.btn-scroll-top:hover {
  background: linear-gradient(135deg, #059669, #047857);
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.5);
  transform: translateY(-4px) scale(1);
}

.btn-scroll-top i {
  font-size: 24px;
}

@media (max-width: 768px) {
  .btn-scroll-top {
    bottom: 90px;
    right: 16px;
    width: 44px;
    height: 44px;
  }
}

/* ===== MOBILE MODAL PRODUCT LIST ===== */
.mobile-only-list {
  display: none;
}

.desktop-only-table {
  display: flex !important;
}

@media (max-width: 768px) {
  .desktop-only-table {
    display: none !important;
  }
  
  .mobile-only-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  /* ... (keep existing card styles) ... */

  .modal-content {
    max-height: 70vh; /* Reduced to prevent top cutoff */
    margin-bottom: 80px; /* Adjusted push */
  }

  .modal-body {
    max-height: calc(70vh - 120px); /* Adjusted scroll area */
  }

  .mm-card {
    background: rgba(148, 163, 184, 0.05);
    border: 1px solid rgba(148, 163, 184, 0.1);
    border-radius: 12px;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }


  .mm-name {
    font-size: 14px;
    font-weight: 700;
    color: #e2e8f0;
    line-height: 1.4;
  }

  .mm-meta-row {
    display: flex;
    gap: 8px;
    font-size: 11px;
  }

  .mm-tag {
    background: rgba(30, 41, 59, 0.5);
    padding: 2px 8px;
    border-radius: 4px;
    color: #94a3b8;
    border: 1px solid rgba(148, 163, 184, 0.15);
  }

  .mm-price-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px dashed rgba(148, 163, 184, 0.15);
    padding-top: 8px;
    margin-top: 2px;
  }

  .mm-calc {
    font-size: 12px;
    color: #94a3b8;
    font-family: 'JetBrains Mono', monospace;
  }

  .mm-qty {
    color: #e2e8f0;
    font-weight: 700;
  }

  .mm-total {
    font-size: 14px;
    font-weight: 800;
    color: #22c55e;
    font-family: 'JetBrains Mono', monospace;
  }

  .mm-note {
    font-size: 11px;
    color: #fbbf24;
    background: rgba(251, 191, 36, 0.1);
    padding: 6px 10px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  
  .mm-note i {
    font-size: 14px;
  }
}

/* ===== MODAL ===== */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: linear-gradient(145deg, #0f172a 0%, #1f2937 100%);
  border-radius: 18px;
  width: 100%;
  max-width: 620px;
  max-height: 90vh;
  overflow: hidden;
  position: relative;
  border: 1px solid rgba(148, 163, 184, 0.18);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.45);
}

.modal-close {
  border: none;
  background: transparent;
  color: #cbd5f5;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.2s;
  line-height: 1;
  padding: 2px 6px;
}

.modal-close:hover {
  color: #fff;
}

.modal-header {
  position: sticky;
  top: 0;
  z-index: 2;
  padding: 14px 18px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.12);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  backdrop-filter: blur(10px);
  background: rgba(15, 23, 42, 0.85);
}

.modal-title {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: #e2e8f0;
  font-family: 'JetBrains Mono', monospace;
}

.modal-header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.modal-body {
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
  max-height: calc(90vh - 120px);
}

/* Custom Scrollbar for Modal */
.modal-body::-webkit-scrollbar {
  width: 6px;
}

.modal-body::-webkit-scrollbar-track {
  background: rgba(15, 23, 42, 0.2);
  border-radius: 4px;
}

.modal-body::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.25);
  border-radius: 4px;
  transition: background 0.2s;
}

.modal-body::-webkit-scrollbar-thumb:hover {
  background: rgba(148, 163, 184, 0.4);
}

.m-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.m-title {
  font-size: 11px;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.12);
}

.m-row {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 10px;
  font-size: 13px;
}

.m-row.total .m-value {
  font-size: 15px;
}

.m-value-inline {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.m-counter {
  font-weight: 900;
  font-size: 16px;
  letter-spacing: 0.2px;
}

.m-counter.normal {
  color: #22c55e;
}

.m-counter.warning {
  color: #f59e0b;
}

.m-counter.urgent {
  color: #ef4444;
}

.m-counter.overdue {
  color: #ef4444;
  animation: overduePulse 1.6s ease-in-out infinite;
}

.m-counter.done {
  color: #94a3b8;
}

.pay-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.2px;
}

.pay-badge.cash {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.pay-badge.transfer {
  background: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.total-amount {
  color: #22c55e;
  font-weight: 900;
  font-size: 18px;
}

.m-row.total .m-value.total-amount {
  color: #22c55e;
  font-weight: 900;
  font-size: 18px;
}

.m-label {
  color: #94a3b8;
  font-size: 12px;
}

.m-value {
  color: #e2e8f0;
  font-weight: 700;
}

.m-table {
  display: flex;
  flex-direction: column;
  gap: 0;
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 10px;
  overflow: hidden;
}

.m-table-head,
.m-table-row {
  display: grid;
  grid-template-columns: 50px 1fr 120px 140px;
  gap: 12px;
  padding: 10px 12px;
  align-items: center;
}

.m-table-head {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: #94a3b8;
  background: rgba(148, 163, 184, 0.08);
  border-bottom: 1px solid rgba(148, 163, 184, 0.12);
  font-weight: 700;
}

.m-table-row {
  font-size: 13px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.08);
}

.m-table-row:last-child {
  border-bottom: none;
}

.m-col-qty,
.m-col-price,
.m-col-total {
  text-align: right;
  font-variant-numeric: tabular-nums;
  color: #e2e8f0;
}

.m-item-name {
  font-weight: 700;
  color: #e2e8f0;
}

.m-item-note {
  font-size: 11px;
  color: #fbbf24;
  margin-top: 2px;
}

.m-item-dvt {
  font-size: 11px;
  color: #9aa4b2;
  margin-top: 2px;
}

.modal-content .note-box {
  background: rgba(148, 163, 184, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.55);
  padding: 10px 12px;
  border-radius: 10px;
  color: #e2e8f0;
  font-size: 13px;
}

.modal-footer {
  position: sticky;
  bottom: 0;
  z-index: 2;
  padding: 14px 16px;
  border-top: 1px solid rgba(148, 163, 184, 0.12);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  backdrop-filter: blur(10px);
  background: rgba(15, 23, 42, 0.85);
}

.btn-complete {
  padding: 12px;
  background: linear-gradient(135deg, #10b981, #34d399);
  border: none;
  border-radius: 12px;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-complete:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
}

.btn-cancel {
  padding: 12px;
  background: linear-gradient(135deg, #dc2626, #ef4444);
  border: none;
  border-radius: 12px;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
}

.btn-cancel:disabled,
.btn-complete:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  filter: saturate(0.9);
}

.btn-spinner {
  width: 14px;
  height: 14px;
  border-radius: 999px;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-top-color: #fff;
  display: inline-block;
  margin-right: 8px;
  animation: spin 0.8s linear infinite;
  vertical-align: -2px;
}

/* ===== MULTI-SELECT & BULK ACTION CSS ===== */
.select-tick {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid rgba(148, 163, 184, 0.3);
  background: rgba(148, 163, 184, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  color: #94a3b8;
  padding: 0;
  flex-shrink: 0;
}

.select-tick:hover:not(:disabled) {
  background: rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.5);
  color: #60a5fa;
  transform: scale(1.1);
}

.select-tick.on {
  background: #10b981;
  border-color: #10b981;
  color: #ffffff;
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
}

.select-tick:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  filter: grayscale(1);
}

.select-tick i {
  font-size: 20px;
}

/* Selected Card Styling */
.order-card.selected {
  outline: 2px solid #10b981;
  outline-offset: -2px;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2), 0 8px 24px rgba(16, 185, 129, 0.15);
  background: linear-gradient(160deg, rgba(16, 185, 129, 0.05), rgba(10, 14, 25, 0.98));
}

.order-card.selected .select-tick {
  background: #10b981;
  border-color: #10b981;
  color: #ffffff;
}

/* Bulk Action Bar */
.bulk-action-bar {
  position: sticky;
  top: 16px;
  z-index: 100;
  background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 16px;
  padding: 12px 24px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05);
  animation: slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.bulk-info {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 15px;
  color: #e2e8f0;
}

.bulk-info i {
  font-size: 20px;
  color: #10b981;
}

.bulk-info strong {
  color: #10b981;
  font-weight: 800;
  font-size: 17px;
}

.bulk-progress {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #fbbf24;
  font-weight: 600;
}

.bulk-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(251, 191, 36, 0.3);
  border-top-color: #fbbf24;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.bulk-actions {
  display: flex;
  gap: 12px;
}

.bulk-btn {
  height: 38px;
  padding: 0 16px;
  border-radius: 10px;
  border: none;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.bulk-btn i { font-size: 16px; }

.bulk-btn.complete {
  background: #10b981;
  color: #fff;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.bulk-btn.complete:hover:not(:disabled) {
  background: #059669;
  transform: translateY(-1px);
}

.bulk-btn.cancel {
  background: linear-gradient(135deg, #dc2626, #ef4444);
  color: #fff;
  border: none;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.bulk-btn.cancel:hover:not(:disabled) {
  background: #b91c1c;
  transform: translateY(-1px);
  color: #fff;
}

.bulk-btn.clear {
  background: transparent;
  color: #94a3b8;
  border: 1px solid rgba(148, 163, 184, 0.3);
}

.bulk-btn.clear:hover:not(:disabled) {
  background: rgba(148, 163, 184, 0.1);
  color: #e2e8f0;
}

.bulk-btn:disabled {
  opacity: 0.5;
  cursor: wait;
}

/* New Select All Button in Bulk Bar */
.bulk-btn.select-all {
  background: rgba(56, 189, 248, 0.15);
  color: #38bdf8;
  border: 1px solid rgba(56, 189, 248, 0.4);
}

.bulk-btn.select-all:hover:not(:disabled) {
  background: rgba(56, 189, 248, 0.25);
  color: #7dd3fc;
  transform: translateY(-1px);
}

/* Card Loading Overlay */
.card-loading-overlay {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(4px);
  z-index: 50;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  border-radius: 16px;
  color: #fbbf24;
  font-weight: 700;
  font-size: 13px;
  animation: fadeIn 0.2s ease;
}

.spinner-sm {
  width: 24px;
  height: 24px;
  border: 2px solid rgba(251, 191, 36, 0.3);
  border-top-color: #fbbf24;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* ===== MODAL CONFIRM & RESULT ===== */
.confirm-overlay {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(8px);
  z-index: 9999; /* Higher than Detail Modal */
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.2s ease;
}

.confirm-box {
  background: #1e293b;
  border: 1px solid rgba(148, 163, 184, 0.1);
  box-shadow: 0 20px 50px rgba(0,0,0,0.5);
  border-radius: 20px;
  width: 90%;
  max-width: 400px;
  padding: 30px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  animation: zoomIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.confirm-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  margin-bottom: 8px;
}
.confirm-icon.success {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
  box-shadow: 0 0 20px rgba(16, 185, 129, 0.25);
}
.confirm-icon.danger, .confirm-icon.error {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  box-shadow: 0 0 20px rgba(239, 68, 68, 0.25);
}

.confirm-title {
  font-size: 20px;
  font-weight: 800;
  color: #f8fafc;
}
.confirm-desc {
  font-size: 14px;
  color: #94a3b8;
  line-height: 1.5;
}

.confirm-actions {
  display: flex;
  gap: 12px;
  width: 100%;
  margin-top: 12px;
}

.c-btn {
  flex: 1;
  height: 48px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 14px;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.c-btn.c-cancel {
  background: rgba(148, 163, 184, 0.1);
  color: #e2e8f0;
}
.c-btn.c-cancel:hover {
  background: rgba(148, 163, 184, 0.2);
}

.c-btn.c-yes.success {
  background: #10b981;
  color: #fff;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
}
.c-btn.c-yes.success:hover {
  background: #059669;
}

.c-btn.c-yes.danger, .c-btn.c-yes.error {
  background: #ef4444;
  color: #fff;
  box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
}
.c-btn.c-yes.danger:hover, .c-btn.c-yes.error:hover {
  background: #dc2626;
}</style>


















