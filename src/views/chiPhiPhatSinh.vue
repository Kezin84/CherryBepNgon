<template>
  <div class="chi-phi-page">
    <!-- Header -->
    <header class="page-header">
      <div class="header-glow"></div>
      <h1 class="page-title">
        <span class="title-icon">
          <i class="app-ico ri-money-dollar-box-line"></i>
        </span>
        Chi Phí & Phát Sinh
      </h1>
      <p class="page-subtitle">Quản lý chi phí nguyên liệu và các khoản phát sinh</p>
    </header>

    <div class="main-layout">
      <!-- LEFT: Form nhập -->
      <div class="form-section">
        <div class="section-card">
          <div class="card-header">
            <div class="card-icon">
              <i class="app-ico ri-add-line"></i>
            </div>
            <h2 class="section-title">Nhập Chi Phí</h2>
          </div>
          
          <form @submit.prevent="handleSubmit">
            <!-- Tên dịch vụ -->
            <div class="form-group">
              <label class="form-label">
                <span class="label-icon">
                  <i class="app-ico ri-file-text-line"></i>
                </span>
                Tên dịch vụ / Mô tả <span class="required">*</span>
              </label>
              <textarea 
                v-model="form.Ten_dich_vu"
                class="form-textarea" 
                placeholder="Ví dụ: Mua nguyên liệu đóng gói, tiền điện, tiền nước..."
                required
              ></textarea>
            </div>

            <!-- Số tiền -->
            <div class="form-group">
              <label class="form-label">
                <span class="label-icon">
                  <i class="app-ico ri-coin-line"></i>
                </span>
                Số tiền <span class="required">*</span>
              </label>
              <div class="money-input-wrapper">
                <input 
                  type="text" 
                  v-model="formattedSoTien"
                  @input="onMoneyInput"
                  class="form-input money-input" 
                  placeholder="0"
                  inputmode="numeric"
                  required
                >
                <span class="currency-symbol">{{ donViTienTe }}</span>
              </div>
            </div>

            <!-- Submit -->
            <button 
              type="submit" 
              class="btn-submit"
              :class="{ loading: isSubmitting }"
              :disabled="isSubmitting"
            >
              <span class="btn-icon">
                <i class="app-ico ri-save-3-line"></i>
              </span>
              <span class="btn-text">Lưu Chi Phí</span>
              <span class="spinner"></span>
            </button>
          </form>
        </div>
      </div>

      <!-- RIGHT: Danh sách -->
      <div class="list-section">
        <div class="section-card">
          <div class="list-header">
            <div class="header-left">
              <div class="card-icon blue">
                <i class="app-ico ri-list-check"></i>
              </div>
              <h2 class="section-title">Danh Sách Chi Phí</h2>
            </div>
            <span class="list-badge">
              <i class="app-ico ri-pulse-line"></i>
              {{ filteredEntries.length }} mục
            </span>
          </div>

          <!-- Bộ lọc -->
          <div class="filter-bar">
            <div class="filter-tabs">
              <button 
                class="filter-tab"
                :class="{ active: filter.showAll }"
                @click="toggleShowAll(true)"
              >
                <i class="app-ico ri-layout-grid-line"></i>
                Tất cả
              </button>
              <button 
                class="filter-tab"
                :class="{ active: !filter.showAll }"
                @click="toggleShowAll(false)"
              >
                <i class="app-ico ri-calendar-line"></i>
                Theo ngày
              </button>
            </div>

            <div class="filter-dates" v-show="!filter.showAll">
              <div class="filter-item">
                <label class="filter-label">Từ ngày</label>
                <input 
                  type="date" 
                  v-model="filter.fromDate"
                  class="filter-input"
                  @change="pagination.currentPage = 1"
                >
              </div>
              <div class="filter-item">
                <label class="filter-label">Đến ngày</label>
                <input 
                  type="date" 
                  v-model="filter.toDate"
                  class="filter-input"
                  @change="pagination.currentPage = 1"
                >
              </div>
              <button 
                type="button"
                class="btn-clear-filter"
                @click="clearDateFilter"
                title="Xóa bộ lọc"
              >
                <i class="app-ico ri-close-line"></i>
                Xóa
              </button>
            </div>

            <div class="filter-sort">
              <button 
                class="sort-btn"
                :class="{ active: filter.sortOrder === 'desc' }"
                @click="filter.sortOrder = 'desc'; pagination.currentPage = 1"
              >
                <i class="app-ico ri-sort-desc"></i>
                Mới nhất
              </button>
              <button 
                class="sort-btn"
                :class="{ active: filter.sortOrder === 'asc' }"
                @click="filter.sortOrder = 'asc'; pagination.currentPage = 1"
              >
                <i class="app-ico ri-sort-asc"></i>
                Cũ nhất
              </button>
            </div>
          </div>

          <!-- List -->
          <div class="entries-list">
            <div v-if="isLoadingEntries" class="loading-state">
              <div class="loading-spinner"></div>
              <p>Đang tải dữ liệu...</p>
            </div>
            <div v-else-if="filteredEntries.length === 0" class="empty-state">
              <div class="empty-icon">
                <i class="app-ico ri-inbox-line"></i>
              </div>
              <p>Chưa có chi phí nào được nhập</p>
            </div>
            <div 
              v-for="(item, index) in paginatedEntries" 
              :key="index"
              class="entry-item"
              @click="openEditModal(item)"
            >
              <div class="entry-header">
                <span class="entry-time">
                  <i class="app-ico ri-time-line"></i>
                  {{ item.Ngay_tao_duong_lich }}
                </span>
                <span class="entry-amount">-{{ formatMoney(item.so_tien) }} <small>{{ item.Don_vi_tien_te }}</small></span>
              </div>
              <div class="entry-content">
                <span class="entry-name">{{ item.Ten_dich_vu }}</span>
              </div>
              <div class="entry-actions">
                <button class="action-btn delete" @click.stop="confirmDelete(item)" title="Xóa">
                  <i class="app-ico ri-delete-bin-line"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Pagination -->
          <div class="pagination" v-if="totalPages > 1">
            <button 
              class="page-btn"
              :disabled="pagination.currentPage === 1"
              @click="prevPage"
            >
              <i class="app-ico ri-arrow-left-s-line"></i>
            </button>
            
            <div class="page-numbers">
              <button 
                v-for="page in totalPages" 
                :key="page"
                class="page-num"
                :class="{ active: page === pagination.currentPage }"
                @click="goToPage(page)"
              >
                {{ page }}
              </button>
            </div>
            
            <button 
              class="page-btn"
              :disabled="pagination.currentPage === totalPages"
              @click="nextPage"
            >
              <i class="app-ico ri-arrow-right-s-line"></i>
            </button>
            
            <span class="page-info">{{ pagination.currentPage }}/{{ totalPages }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast Container -->
    <div class="toast-container">
      <transition-group name="toast">
        <div 
          v-for="toast in toasts" 
          :key="toast.id"
          :class="['toast', toast.type]"
        >
          <i class="app-ico toast-icon" :class="toast.type === 'success' ? 'ri-checkbox-circle-line' : 'ri-error-warning-line'"></i>
          <span>{{ toast.message }}</span>
        </div>
      </transition-group>
    </div>

    <!-- Modal Sửa -->
    <div class="modal-overlay" v-if="editModal.show" @click.self="closeEditModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">
            <i class="app-ico ri-edit-line"></i>
            Chỉnh Sửa Chi Phí
          </h3>
          <button class="modal-close" @click="closeEditModal">
              <i class="app-ico ri-close-line"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Tên chi phí</label>
            <textarea 
              v-model="editModal.data.Ten_dich_vu"
              class="form-textarea"
              placeholder="Nhập tên chi phí..."
            ></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">Số tiền</label>
            <div class="money-input-wrapper">
              <input 
                type="text" 
                v-model="editModal.formattedSoTien"
                @input="onEditMoneyInput"
                class="form-input money-input"
                placeholder="0"
                inputmode="numeric"
              >
              <span class="currency-symbol">{{ editModal.data.Don_vi_tien_te || donViTienTe }}</span>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="closeEditModal">Hủy</button>
          <button 
            class="btn-save" 
            @click="handleUpdate"
            :disabled="isUpdating"
          >
            <span v-if="!isUpdating">Lưu thay đổi</span>
            <span v-else class="btn-loading">
              <span class="spinner-small"></span>
              Đang lưu...
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Xác nhận xóa -->
    <div class="modal-overlay" v-if="deleteModal.show" @click.self="closeDeleteModal">
      <div class="modal-content modal-delete">
        <div class="modal-header">
          <h3 class="modal-title delete-title">
            <i class="app-ico ri-delete-bin-line"></i>
            Xác Nhận Xóa
          </h3>
          <button class="modal-close" @click="closeDeleteModal">
              <i class="app-ico ri-close-line"></i>
          </button>
        </div>
        <div class="modal-body">
          <p class="delete-message">Bạn có chắc muốn xóa chi phí này?</p>
          <div class="delete-info">
            <span class="delete-name">{{ deleteModal.data?.Ten_dich_vu }}</span>
            <span class="delete-amount">-{{ formatMoney(deleteModal.data?.so_tien) }} {{ deleteModal.data?.Don_vi_tien_te }}</span>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="closeDeleteModal">Hủy</button>
          <button 
            class="btn-delete" 
            @click="handleDelete"
            :disabled="isDeleting"
          >
            <span v-if="!isDeleting">Xóa</span>
            <span v-else class="btn-loading">
              <span class="spinner-small"></span>
              Đang xóa...
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { API_URL, IMGBB_KEY } from '@/config/api'


export default {
  name: 'ChiPhiPhatSinh',
  
  data() {
    return {
      form: {
        So_tien: 0,
        Ten_dich_vu: ''
      },
      formattedSoTien: '',
      donViTienTe: 'VND',
      selectedNCC: null,
      danhSachNCC: [],
      entries: [],
      isLoadingEntries: false,
      filter: {
        fromDate: '',
        toDate: '',
        sortOrder: 'desc', // desc = mới->cũ, asc = cũ->mới
        showAll: false
      },
      pagination: {
        currentPage: 1,
        perPage: 10
      },
      isSubmitting: false,
      isUpdating: false,
      isDeleting: false,
      editModal: {
        show: false,
        data: {},
        formattedSoTien: '',
        originalIndex: -1
      },
      deleteModal: {
        show: false,
        data: null,
        originalIndex: -1
      },
      toasts: []
    }
  },

  computed: {
    filteredEntries() {
      let result = [...this.entries]
      
      // Nếu không phải "Tất cả" thì filter theo ngày
      if (!this.filter.showAll) {
        if (this.filter.fromDate) {
          const from = this.parseFilterDate(this.filter.fromDate)
          result = result.filter(item => {
            const itemDate = this.parseEntryDate(item.Ngay_tao_duong_lich)
            return itemDate >= from
          })
        }
        
        if (this.filter.toDate) {
          const to = this.parseFilterDate(this.filter.toDate)
          to.setHours(23, 59, 59, 999)
          result = result.filter(item => {
            const itemDate = this.parseEntryDate(item.Ngay_tao_duong_lich)
            return itemDate <= to
          })
        }
      }
      
      // Sort
      result.sort((a, b) => {
        const dateA = this.parseEntryDate(a.Ngay_tao_duong_lich)
        const dateB = this.parseEntryDate(b.Ngay_tao_duong_lich)
        return this.filter.sortOrder === 'desc' 
          ? dateB - dateA 
          : dateA - dateB
      })
      
      return result
    },

    paginatedEntries() {
      const start = (this.pagination.currentPage - 1) * this.pagination.perPage
      const end = start + this.pagination.perPage
      return this.filteredEntries.slice(start, end)
    },

    totalPages() {
      return Math.ceil(this.filteredEntries.length / this.pagination.perPage)
    }
  },

  mounted() {
    this.loadNCC()
    this.loadHangHoa()
    this.loadEntries()
    this.setDefaultDates()
  },

  methods: {
    // ===== SET DEFAULT DATES =====
    setDefaultDates() {
      const today = new Date()
      const yyyy = today.getFullYear()
      const mm = String(today.getMonth() + 1).padStart(2, '0')
      const dd = String(today.getDate()).padStart(2, '0')
      const todayStr = `${yyyy}-${mm}-${dd}`
      
      this.filter.fromDate = todayStr
      this.filter.toDate = todayStr
    },

    // ===== TOGGLE SHOW ALL =====
    toggleShowAll(showAll) {
      this.filter.showAll = showAll
      this.pagination.currentPage = 1
      if (!showAll) {
        this.setDefaultDates()
      }
    },

    // ===== CLEAR DATE FILTER =====
    clearDateFilter() {
      this.filter.fromDate = ''
      this.filter.toDate = ''
      this.pagination.currentPage = 1
    },

    // ===== PAGINATION =====
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.pagination.currentPage = page
      }
    },

    prevPage() {
      if (this.pagination.currentPage > 1) {
        this.pagination.currentPage--
      }
    },

    nextPage() {
      if (this.pagination.currentPage < this.totalPages) {
        this.pagination.currentPage++
      }
    },
    // ===== FORMAT MONEY =====
    formatMoney(num) {
      if (!num) return '0'
      return Number(num).toLocaleString('vi-VN')
    },

    parseMoney(str) {
      return Number(String(str).replace(/[^\d]/g, '')) || 0
    },

    onMoneyInput(e) {
      const val = e.target.value.replace(/[^\d]/g, '')
      this.form.So_tien = Number(val) || 0
      this.formattedSoTien = this.formatMoney(val)
    },

    // ===== DATE HELPERS =====
    parseFilterDate(dateStr) {
      // dateStr format: YYYY-MM-DD
      return new Date(dateStr)
    },

    parseEntryDate(ngayTao) {
      // ngayTao format: HH:mm:ss DD/MM/YYYY hoặc HH:mm DD/MM/YYYY
      if (!ngayTao) return new Date(0)
      const str = String(ngayTao)
      const parts = str.split(' ')
      if (parts.length < 2) return new Date(0)
      
      const dateParts = parts[1].split('/')
      if (dateParts.length < 3) return new Date(0)
      
      const timeParts = parts[0].split(':')
      
      return new Date(
        parseInt(dateParts[2]),
        parseInt(dateParts[1]) - 1,
        parseInt(dateParts[0]),
        parseInt(timeParts[0] || 0),
        parseInt(timeParts[1] || 0)
      )
    },

    // ===== TOAST =====
    showToast(message, type = 'success') {
      const id = Date.now()
      this.toasts.push({ id, message, type })
      
      setTimeout(() => {
        this.toasts = this.toasts.filter(t => t.id !== id)
      }, 3000)
    },

    // ===== LOAD NCC =====
    async loadNCC() {
      try {
        const url = `${API_URL}?action=sheet&sheet=nha_cung_cap`
        const res = await fetch(url)
        const json = await res.json()
        
        if (json.success && json.data) {
          this.danhSachNCC = json.data
          if (this.danhSachNCC.length > 0) {
            this.selectedNCC = this.danhSachNCC[0]
          }
        }
      } catch (err) {
        console.error('Load NCC error:', err)
      }
    },

    // ===== LOAD HANG HOA (để lấy đơn vị tiền tệ) =====
    async loadHangHoa() {
      try {
        const url = `${API_URL}?action=sheet&sheet=hang_hoa`
        const res = await fetch(url)
        const json = await res.json()
        
        if (json.success && json.data && json.data.length > 0) {
          // Lấy đơn vị tiền tệ từ hàng hóa đầu tiên
          const firstItem = json.data[0]
          if (firstItem.Don_vi_tien_te) {
            this.donViTienTe = firstItem.Don_vi_tien_te
          }
        }
      } catch (err) {
        console.error('Load hang_hoa error:', err)
      }
    },

    // ===== LOAD ENTRIES (REALTIME TỪ API) =====
    async loadEntries() {
      this.isLoadingEntries = true
      try {
        const url = `${API_URL}?action=sheet&sheet=so_thu_chi`
        const res = await fetch(url)
        const json = await res.json()
        
        if (json.success && json.data) {
          // Lọc chỉ lấy các chi phí phát sinh (Trang_thai = CHI_PHI_PHAT_SINH)
          this.entries = json.data.filter(item => item.Trang_thai === 'CHI_PHI_PHAT_SINH')
        }
      } catch (err) {
        console.error('Load entries error:', err)
        this.showToast('Không thể tải dữ liệu', 'error')
      } finally {
        this.isLoadingEntries = false
      }
    },

    // ===== GENERATE =====
    generateMaDichVu() {
      const now = new Date()
      const p = n => String(n).padStart(2, '0')
      
      return 'CPPS' + 
        p(now.getDate()) + 
        p(now.getMonth() + 1) + 
        now.getFullYear() + 
        p(now.getHours()) + 
        p(now.getMinutes()) + 
        p(now.getSeconds())
    },

    generateNgayTao() {
      const now = new Date()
      const p = n => String(n).padStart(2, '0')
      
      return p(now.getHours()) + ':' +
        p(now.getMinutes()) + ' ' +
        p(now.getDate()) + '/' +
        p(now.getMonth() + 1) + '/' +
        now.getFullYear()
    },

    // ===== SUBMIT =====
    async handleSubmit() {
      if (this.form.So_tien <= 0) {
        this.showToast('Vui lòng nhập số tiền hợp lệ', 'error')
        return
      }
      
      if (!this.form.Ten_dich_vu.trim()) {
        this.showToast('Vui lòng nhập tên dịch vụ', 'error')
        return
      }

      this.isSubmitting = true

      try {
        const payload = {
          action: 'addChiPhiPhatSinh',
          data: {
            So_tien: this.form.So_tien,
            Ten_dich_vu: this.form.Ten_dich_vu.trim(),
            Ma_nha_cung_cap: this.selectedNCC?.Ma_nha_cung_cap || '',
            Ten_nha_cung_cap: this.selectedNCC?.Ten_nha_cung_cap || '',
            Don_vi_tien_te: this.donViTienTe
          }
        }

        await fetch(API_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify(payload)
        })

        // Reset form
        this.form.So_tien = 0
        this.form.Ten_dich_vu = ''
        this.formattedSoTien = ''

        this.showToast('Đã lưu chi phí thành công!', 'success')
        
        // Reload data từ server
        setTimeout(() => {
          this.loadEntries()
        }, 1000)

      } catch (err) {
        console.error('Submit error:', err)
        this.showToast('Có lỗi xảy ra, vui lòng thử lại', 'error')
      } finally {
        this.isSubmitting = false
      }
    },

    // ===== EDIT MODAL =====
    openEditModal(item) {
      this.editModal = {
        show: true,
        data: { 
          Ma_dich_vu: item.Ma_dich_vu,
          Ten_dich_vu: item.Ten_dich_vu,
          so_tien: item.so_tien,
          Don_vi_tien_te: item.Don_vi_tien_te || this.donViTienTe
        },
        formattedSoTien: this.formatMoney(item.so_tien),
        originalIndex: -1
      }
    },

    closeEditModal() {
      this.editModal = {
        show: false,
        data: {},
        formattedSoTien: '',
        originalIndex: -1
      }
    },

    onEditMoneyInput(e) {
      const val = e.target.value.replace(/[^\d]/g, '')
      this.editModal.data.so_tien = Number(val) || 0
      this.editModal.formattedSoTien = this.formatMoney(val)
    },

    async handleUpdate() {
      if (!this.editModal.data.Ten_dich_vu?.trim()) {
        this.showToast('Vui lòng nhập tên chi phí', 'error')
        return
      }

      if (this.editModal.data.so_tien <= 0) {
        this.showToast('Số tiền phải lớn hơn 0', 'error')
        return
      }

      this.isUpdating = true

      try {
        const payload = {
          action: 'updateChiPhiPhatSinh',
          data: {
            Ma_dich_vu: this.editModal.data.Ma_dich_vu,
            Ten_dich_vu: this.editModal.data.Ten_dich_vu.trim(),
            So_tien: this.editModal.data.so_tien,
            Don_vi_tien_te: this.editModal.data.Don_vi_tien_te
          }
        }

        await fetch(API_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify(payload)
        })

        this.showToast('Cập nhật thành công!', 'success')
        this.closeEditModal()
        
        // Reload data từ server
        setTimeout(() => {
          this.loadEntries()
        }, 1000)

      } catch (err) {
        console.error('Update error:', err)
        this.showToast('Có lỗi xảy ra, vui lòng thử lại', 'error')
      } finally {
        this.isUpdating = false
      }
    },

    // ===== DELETE MODAL =====
    confirmDelete(item) {
      this.deleteModal = {
        show: true,
        data: item,
        originalIndex: -1
      }
    },

    closeDeleteModal() {
      this.deleteModal = {
        show: false,
        data: null,
        originalIndex: -1
      }
    },

    async handleDelete() {
      if (!this.deleteModal.data) return

      this.isDeleting = true

      try {
        const payload = {
          action: 'deleteChiPhiPhatSinh',
          Ma_dich_vu: this.deleteModal.data.Ma_dich_vu
        }

        await fetch(API_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify(payload)
        })

        this.showToast('Đã xóa chi phí!', 'success')
        this.closeDeleteModal()

        // Reload data từ server
        setTimeout(() => {
          this.loadEntries()
        }, 1000)

      } catch (err) {
        console.error('Delete error:', err)
        this.showToast('Có lỗi xảy ra, vui lòng thử lại', 'error')
      } finally {
        this.isDeleting = false
      }
    },

    // ===== SCROLL TO TOP =====
    handleScroll() {
      this.showScrollTop = window.scrollY > 300
    },

    scrollToTop() {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }
}
</script>

<style scoped>
.chi-phi-page {
  min-height: 100vh;
  background: rgb(15, 23, 42);
  padding: 24px;
  font-family: 'Be Vietnam Pro', sans-serif;
  color: #f8fafc;
  position: relative;
  color-scheme: dark;
  overflow-x: hidden;
  width: 100%;
  box-sizing: border-box;
  padding-bottom: 100px;
}

/* Header */
.page-header {
  text-align: center;
  margin-bottom: 32px;
  position: relative;
}

.header-glow {
  position: absolute;
  top: -100px;
  left: 50%;
  transform: translateX(-50%);
  width: 600px;
  max-width: 100%;
  height: 300px;
  background: radial-gradient(ellipse, rgba(59, 130, 246, 0.15) 0%, transparent 70%);
  pointer-events: none;
}

.page-title {
  font-size: 1.85rem;
  font-weight: 700;
  background: linear-gradient(135deg, #60a5fa 0%, #34d399 50%, #a78bfa 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 8px;
  display: inline-flex;
  align-items: center;
  gap: 12px;
}

.title-icon {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(52, 211, 153, 0.2));
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(96, 165, 250, 0.3);
}

.title-icon svg {
  width: 20px;
  height: 20px;
  stroke: #60a5fa;
}

.page-subtitle {
  color: #64748b;
  font-size: 0.9rem;
}

/* Main Layout */
.main-layout {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 24px;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

.form-section, .list-section {
  min-width: 0; /* Prevent grid blowout */
  width: 100%;
}

@media (max-width: 1024px) {
  .main-layout {
    grid-template-columns: 1fr;
  }
}

/* Section Card */
.section-card {
  background: linear-gradient(145deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.9));
  border: 1px solid rgba(71, 85, 105, 0.4);
  border-radius: 20px;
  padding: 24px;
  backdrop-filter: blur(10px);
  box-shadow: 
    0 4px 24px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(71, 85, 105, 0.3);
}

.card-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, rgba(52, 211, 153, 0.2), rgba(16, 185, 129, 0.1));
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(52, 211, 153, 0.3);
}

.card-icon svg {
  width: 20px;
  height: 20px;
  stroke: #34d399;
}

.card-icon.blue {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.1));
  border-color: rgba(59, 130, 246, 0.3);
}

.card-icon.blue svg {
  stroke: #60a5fa;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #f1f5f9;
  margin: 0;
}

/* Form */
.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  font-weight: 500;
  color: #94a3b8;
  margin-bottom: 10px;
}

.label-icon {
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.label-icon svg {
  width: 16px;
  height: 16px;
  stroke: #64748b;
}

.form-label .required {
  color: #f87171;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 14px 16px;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(71, 85, 105, 0.5);
  border-radius: 12px;
  color: #f8fafc;
  font-family: inherit;
  font-size: 0.95rem;
  transition: all 0.3s ease;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 
    0 0 0 3px rgba(59, 130, 246, 0.15),
    0 0 20px rgba(59, 130, 246, 0.1);
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: #475569;
}

.form-textarea {
  min-height: 90px;
  resize: vertical;
}

/* Money Input */
.money-input-wrapper {
  position: relative;
}

.money-input-wrapper .currency-symbol {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #60a5fa;
  font-weight: 600;
  font-size: 0.9rem;
  padding: 4px 10px;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 6px;
}

.money-input {
  padding-right: 70px !important;
  font-weight: 700;
  font-size: 1.2rem !important;
  letter-spacing: 0.5px;
}

/* Submit Button */
.btn-submit {
  width: 100%;
  padding: 16px 24px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%);
  border: none;
  border-radius: 12px;
  color: white;
  font-family: inherit;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  box-shadow: 
    0 4px 15px rgba(59, 130, 246, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.btn-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-icon svg {
  width: 18px;
  height: 18px;
}

.btn-submit::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.5s ease;
}

.btn-submit:hover::before {
  left: 100%;
}

.btn-submit:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 8px 25px rgba(59, 130, 246, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-submit.loading .btn-text,
.btn-submit.loading .btn-icon {
  opacity: 0;
}

.btn-submit .spinner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 22px;
  height: 22px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  display: none;
}

.btn-submit.loading .spinner {
  display: block;
}

@keyframes spin {
  to { transform: translate(-50%, -50%) rotate(360deg); }
}

/* List Header */
.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(71, 85, 105, 0.3);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.list-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(139, 92, 246, 0.15));
  color: #a5b4fc;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  border: 1px solid rgba(139, 92, 246, 0.2);
}

.list-badge svg {
  width: 14px;
  height: 14px;
}

/* Filter Bar */
.filter-bar {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
  padding: 16px;
  background: rgba(15, 23, 42, 0.5);
  border-radius: 14px;
  border: 1px solid rgba(71, 85, 105, 0.3);
  width: 100%;
  box-sizing: border-box;
}

.filter-tabs {
  display: flex;
  gap: 8px;
}

.filter-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  background: rgba(51, 65, 85, 0.3);
  border: 1px solid rgba(71, 85, 105, 0.4);
  border-radius: 10px;
  color: #94a3b8;
  font-family: inherit;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-tab svg {
  width: 16px;
  height: 16px;
}

.filter-tab:hover {
  background: rgba(59, 130, 246, 0.1);
  border-color: rgba(59, 130, 246, 0.3);
}

.filter-tab.active {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.2));
  border-color: #3b82f6;
  color: #60a5fa;
}

.filter-dates {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 12px;
  align-items: flex-end;
  width: 100%;
  box-sizing: border-box;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0; /* Important for grid responsiveness */
}

.filter-label {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;
}

.filter-input {
  width: 100%;
  box-sizing: border-box;
  padding: 10px 12px;
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(71, 85, 105, 0.5);
  border-radius: 8px;
  color: #f8fafc;
  font-family: inherit;
  font-size: 0.85rem;
  transition: all 0.2s ease;
}

.filter-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.btn-clear-filter {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 14px;
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  color: #f87171;
  font-family: inherit;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.btn-clear-filter svg {
  width: 14px;
  height: 14px;
}

.btn-clear-filter:hover {
  background: rgba(239, 68, 68, 0.25);
  border-color: rgba(239, 68, 68, 0.5);
}

.filter-sort {
  display: flex;
  gap: 8px;
}

.sort-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 14px;
  background: rgba(51, 65, 85, 0.3);
  border: 1px solid rgba(71, 85, 105, 0.4);
  border-radius: 8px;
  color: #94a3b8;
  font-family: inherit;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.sort-btn svg {
  width: 14px;
  height: 14px;
}

.sort-btn:hover {
  background: rgba(52, 211, 153, 0.1);
  border-color: rgba(52, 211, 153, 0.3);
}

.sort-btn.active {
  background: linear-gradient(135deg, rgba(52, 211, 153, 0.2), rgba(16, 185, 129, 0.2));
  border-color: #34d399;
  color: #34d399;
}

/* Entries List */
.entries-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 420px;
  overflow-y: auto;
  padding-right: 4px;
  width: 100%;
  box-sizing: border-box;
}

.entries-list::-webkit-scrollbar {
  width: 5px;
}

.entries-list::-webkit-scrollbar-track {
  background: rgba(51, 65, 85, 0.2);
  border-radius: 3px;
}

.entries-list::-webkit-scrollbar-thumb {
  background: rgba(100, 116, 139, 0.4);
  border-radius: 3px;
}

.entries-list::-webkit-scrollbar-thumb:hover {
  background: rgba(100, 116, 139, 0.6);
}

.entry-item {
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.6));
  border: 1px solid rgba(71, 85, 105, 0.3);
  border-radius: 12px;
  padding: 14px 16px;
  transition: all 0.3s ease;
  cursor: pointer;
  width: 100%;
  box-sizing: border-box;
}

.entry-item:hover {
  border-color: rgba(59, 130, 246, 0.4);
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.8));
  transform: translateX(4px);
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px 20px;
  color: #64748b;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(59, 130, 246, 0.2);
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 16px;
}

.loading-state p {
  font-size: 0.9rem;
}

.entry-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  flex-wrap: wrap; /* Allow wrapping on small screens */
  gap: 8px;
}

.entry-time {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #34d399;
}

.entry-time svg {
  width: 15px;
  height: 15px;
  stroke: #34d399;
}

.entry-amount {
  font-weight: 700;
  font-size: 1rem;
  color: #f87171;
  white-space: nowrap;
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.entry-amount small {
  font-size: 0.75rem;
  font-weight: 500;
  color: #fb7185;
  opacity: 0.8;
}

.entry-content {
  padding-left: 21px;
}

.entry-name {
  font-weight: 400;
  font-size: 0.9rem;
  color: #cbd5e1;
  line-height: 1.5;
  word-break: break-word; /* Prevent long text overflow */
}

/* Entry Actions */
.entry-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(71, 85, 105, 0.2);
  justify-content: flex-end;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn svg {
  width: 16px;
  height: 16px;
}

.action-btn.delete {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.3);
  color: #f87171;
}

.action-btn.delete:hover {
  background: rgba(239, 68, 68, 0.25);
  border-color: rgba(239, 68, 68, 0.5);
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
}

.modal-content {
  background: linear-gradient(145deg, rgba(30, 41, 59, 0.98), rgba(15, 23, 42, 0.98));
  border: 1px solid rgba(71, 85, 105, 0.5);
  border-radius: 20px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  animation: modalSlideIn 0.3s ease;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(71, 85, 105, 0.3);
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.1rem;
  font-weight: 600;
  color: #f1f5f9;
  margin: 0;
}

.modal-title svg {
  width: 22px;
  height: 22px;
  stroke: #60a5fa;
}

.modal-title.delete-title svg {
  stroke: #f87171;
}

.modal-close {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(71, 85, 105, 0.3);
  border: none;
  border-radius: 10px;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
}

.modal-close svg {
  width: 18px;
  height: 18px;
}

.modal-body {
  padding: 24px;
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid rgba(71, 85, 105, 0.3);
}

.btn-cancel {
  flex: 1;
  padding: 12px 20px;
  background: rgba(71, 85, 105, 0.3);
  border: 1px solid rgba(71, 85, 105, 0.5);
  border-radius: 10px;
  color: #94a3b8;
  font-family: inherit;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel:hover {
  background: rgba(71, 85, 105, 0.5);
  color: #f1f5f9;
}

.btn-save {
  flex: 1;
  padding: 12px 20px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border: none;
  border-radius: 10px;
  color: white;
  font-family: inherit;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-save:hover:not(:disabled) {
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
}

.btn-save:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-delete {
  flex: 1;
  padding: 12px 20px;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  border: none;
  border-radius: 10px;
  color: white;
  font-family: inherit;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-delete:hover:not(:disabled) {
  box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4);
}

.btn-delete:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* Delete Modal */
.modal-delete .modal-body {
  text-align: center;
}

.delete-message {
  color: #94a3b8;
  font-size: 0.95rem;
  margin-bottom: 16px;
}

.delete-info {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 12px;
  padding: 16px;
}

.delete-name {
  display: block;
  color: #f1f5f9;
  font-weight: 500;
  margin-bottom: 6px;
}

.delete-amount {
  color: #f87171;
  font-weight: 700;
  font-size: 1.1rem;
}

.empty-state {
  text-align: center;
  padding: 50px 20px;
  color: #475569;
}

.empty-icon {
  width: 60px;
  height: 60px;
  margin: 0 auto 16px;
  background: rgba(71, 85, 105, 0.2);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-icon svg {
  width: 30px;
  height: 30px;
  stroke: #475569;
}

.empty-state p {
  font-size: 0.9rem;
}

/* Pagination */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid rgba(71, 85, 105, 0.3);
}

.page-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(51, 65, 85, 0.4);
  border: 1px solid rgba(71, 85, 105, 0.4);
  border-radius: 8px;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s ease;
}

.page-btn svg {
  width: 18px;
  height: 18px;
}

.page-btn:hover:not(:disabled) {
  background: rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.4);
  color: #60a5fa;
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 4px;
}

.page-num {
  min-width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 8px;
  color: #94a3b8;
  font-family: inherit;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.page-num:hover {
  background: rgba(71, 85, 105, 0.3);
}

.page-num.active {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  border-color: transparent;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
}

.page-info {
  font-size: 0.8rem;
  color: #64748b;
  margin-left: 8px;
  padding: 6px 12px;
  background: rgba(51, 65, 85, 0.3);
  border-radius: 6px;
}

/* Toast */
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.toast {
  padding: 14px 18px;
  border-radius: 12px;
  color: white;
  font-size: 0.9rem;
  font-weight: 500;
  box-shadow: 0 4px 20px rgba(0,0,0,0.4);
  max-width: 340px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.toast.success {
  background: linear-gradient(135deg, #10b981, #059669);
}

.toast.error {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}

.toast-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.toast-enter-active {
  animation: slideIn 0.3s ease;
}

.toast-leave-active {
  animation: slideOut 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideOut {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .chi-phi-page {
    padding: 10px;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .section-card {
    padding: 16px;
  }

  .filter-dates {
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
  
  .filter-bar {
    padding: 12px; /* Reduce padding on mobile */
  }

  .btn-clear-filter {
    grid-column: 1 / -1;
    justify-content: center;
  }

  .entries-list {
    max-height: 350px;
  }

  .page-numbers {
    display: none;
  }
}
</style>