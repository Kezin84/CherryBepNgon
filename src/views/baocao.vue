<template>
  <div class="bao-cao-page" ref="rootEl">
    <!-- HEADER & FILTERS -->
    <div class="page-header">
      <h1 class="page-title">
        <i class="app-ico page-title-icon ri-bar-chart-2-line" aria-hidden="true"></i>
        Báo Cáo Thống Kê Doanh Thu
      </h1>

      <!-- BỘ LỌC -->
      <!-- BỘ LỌC NEW UI -->
      <!-- BỘ LỌC VIP BUTTON/CHIP -->
      <div class="filter-panel">
        <!-- 1. SEGMENTED CONTROL & BADGE -->
        <div class="filter-segment-row">
          <div class="filter-type-segment">
            <button class="seg-btn" :class="{ active: filterType === 'day' }" @click="filterType = 'day'; onFilterTypeChange()">
              Theo ngày
            </button>
            <button class="seg-btn" :class="{ active: filterType === 'month' }" @click="filterType = 'month'; onFilterTypeChange()">
              Theo tháng
            </button>
            <button class="seg-btn" :class="{ active: filterType === 'year' }" @click="filterType = 'year'; onFilterTypeChange()">
              Theo năm
            </button>
          </div>
        </div>

        <div class="filter-divider"></div>
        <div class="filter-segment-row">
          <div class="range-badge">
            <i class="app-ico ri-time-line"></i> Đang xem: {{ filterTimeLabel || 'Tất cả' }}
          </div>
        </div>

        <!-- 2. PICKER ROW -->
        <div class="filter-picker-row">
          <!-- DAY PICKERS -->
          <template v-if="filterType === 'day'">
            <div class="picker-group">
              <button class="picker-btn" :class="{ invalid: isRangeInvalid }" @click="openPicker(fromDateEl)" @touchstart.stop="openPicker(fromDateEl)">
                <div class="picker-icon"><i class="app-ico ri-calendar-line"></i></div>
                <div class="picker-info">
                  <span class="picker-label">Từ ngày</span>
                  <span class="picker-value">{{ fromDate ? formatDateBtn(fromDate, 'day') : 'Chọn ngày' }}</span>
                </div>
              </button>
              <!-- Hidden Native Input -->
              <input ref="fromDateEl" type="date" v-model="fromDate" :max="toDate" class="hidden-picker" />
            </div>

            <div class="picker-arrow"><i class="app-ico ri-arrow-right-line"></i></div>

            <div class="picker-group">
              <button class="picker-btn" :class="{ invalid: isRangeInvalid }" @click="openPicker(toDateEl)" @touchstart.stop="openPicker(toDateEl)">
                <div class="picker-icon"><i class="app-ico ri-calendar-check-line"></i></div>
                <div class="picker-info">
                  <span class="picker-label">Đến ngày</span>
                  <span class="picker-value">{{ toDate ? formatDateBtn(toDate, 'day') : 'Chọn ngày' }}</span>
                </div>
              </button>
              <!-- Hidden Native Input -->
              <input ref="toDateEl" type="date" v-model="toDate" :min="fromDate" class="hidden-picker" />
            </div>
          </template>

          <!-- MONTH PICKERS -->
          <template v-if="filterType === 'month'">
            <div class="picker-group">
              <button class="picker-btn" :class="{ invalid: isRangeInvalid }" @click="openPicker(fromMonthEl)" @touchstart.stop="openPicker(fromMonthEl)">
                <div class="picker-icon"><i class="app-ico ri-calendar-line"></i></div>
                <div class="picker-info">
                  <span class="picker-label">Từ tháng</span>
                  <span class="picker-value">{{ fromMonth ? formatDateBtn(fromMonth, 'month') : 'Chọn tháng' }}</span>
                </div>
              </button>
              <input ref="fromMonthEl" type="month" v-model="fromMonth" :max="toMonth" class="hidden-picker" />
            </div>
            
            <div class="picker-arrow"><i class="app-ico ri-arrow-right-line"></i></div>

            <div class="picker-group">
              <button class="picker-btn" :class="{ invalid: isRangeInvalid }" @click="openPicker(toMonthEl)" @touchstart.stop="openPicker(toMonthEl)">
                <div class="picker-icon"><i class="app-ico ri-calendar-check-line"></i></div>
                <div class="picker-info">
                  <span class="picker-label">Đến tháng</span>
                  <span class="picker-value">{{ toMonth ? formatDateBtn(toMonth, 'month') : 'Chọn tháng' }}</span>
                </div>
              </button>
              <input ref="toMonthEl" type="month" v-model="toMonth" :min="fromMonth" class="hidden-picker" />
            </div>
          </template>

          <!-- YEAR PICKERS (Custom List Picker) -->
          <template v-if="filterType === 'year'">
            <div class="picker-group">
              <button class="picker-btn" :class="{ invalid: isRangeInvalid, open: activeDropdown === 'y_from' }" @click.stop="activeDropdown = activeDropdown === 'y_from' ? '' : 'y_from'">
                <div class="picker-icon"><i class="app-ico ri-calendar-line"></i></div>
                <div class="picker-info">
                  <span class="picker-label">Từ năm</span>
                  <span class="picker-value">{{ fromYear || 'Chọn năm' }}</span>
                </div>
                <i class="ri-arrow-down-s-line arrow-icon"></i>
              </button>
              <div v-if="activeDropdown === 'y_from'" class="dropdown-list scrollable">
                <div v-for="y in availableYears" :key="y" class="dropdown-item" :class="{ selected: fromYear === y }" @click="fromYear = y; activeDropdown = ''">{{ y }}</div>
              </div>
            </div>

            <div class="picker-arrow"><i class="app-ico ri-arrow-right-line"></i></div>

            <div class="picker-group">
              <button class="picker-btn" :class="{ invalid: isRangeInvalid, open: activeDropdown === 'y_to' }" @click.stop="activeDropdown = activeDropdown === 'y_to' ? '' : 'y_to'">
                <div class="picker-icon"><i class="app-ico ri-calendar-check-line"></i></div>
                <div class="picker-info">
                  <span class="picker-label">Đến năm</span>
                  <span class="picker-value">{{ toYear || 'Chọn năm' }}</span>
                </div>
                <i class="ri-arrow-down-s-line arrow-icon"></i>
              </button>
              <div v-if="activeDropdown === 'y_to'" class="dropdown-list scrollable">
                <div v-for="y in availableYears" :key="y" class="dropdown-item" :class="{ selected: toYear === y }" @click="toYear = y; activeDropdown = ''">{{ y }}</div>
              </div>
            </div>
          </template>

          <div class="filter-reset-wrapper">
             <button @click="resetFilter" class="btn-reset-vip" title="Đặt lại bộ lọc mặc định">
              <i class="app-ico ri-refresh-line"></i> <span class="reset-text-full">Đặt lại</span>
            </button>
          </div>
        </div>

        <!-- ERROR MESSAGE INSIDE PANEL -->
        <div v-if="isRangeInvalid" class="range-error">
          <i class="app-ico ri-error-warning-line"></i> {{ rangeErrorText }}
        </div>
      </div>
    </div>

    <!-- LOADING -->
    <div v-if="loading" class="loading-overlay">
      <div class="spinner"></div>
      <p>Đang tải dữ liệu báo cáo...</p>
    </div>

    <!-- NỘI DUNG BÁO CÁO -->
    <div v-else-if="baoCao" class="report-content">
      <!-- 4 CARDS THỐNG KÊ - VIP TECH -->
      <div class="stats-cards">

        <template v-for="card in statsCards" :key="card.type">
          <div 
            class="stat-card" 
            :class="[card.type, { active: activeCard === card.type }]"
            @click="toggleCard(card.type)"
          >
            <div class="card-glow"></div>
            <div class="card-content">
              <div class="card-header">
                <i class="app-ico card-icon" :class="card.icon" aria-hidden="true"></i>
                <div class="card-head">
                  <span class="card-label">{{ card.label }}</span>
                  <div class="card-time-badge" v-if="getCardTimeBadge(card.type)">
                    {{ getCardTimeBadge(card.type) }}
                  </div>
                </div>
              </div>
              <div class="card-value">{{ card.value }}</div>
              <div class="card-sub" v-html="card.sub"></div>
              <div class="card-sub" v-if="card.sub2" v-html="card.sub2"></div>
              <div class="card-footer" v-if="card.trend">
                <span class="card-trend" v-html="card.trend"></span>
              </div>
            </div>
            <div class="card-indicator" v-if="activeCard === card.type">
              <svg width="12" height="8" viewBox="0 0 12 8"><path d="M6 8L0 0h12L6 8z" fill="currentColor"/></svg>
            </div>
          </div>
          <!-- Mobile Chart Destination -->
          <div :id="'mobile-dest-' + card.type" class="mobile-chart-dest"></div>
        </template>
      </div>


      <!-- CHARTS SECTION - KHI CLICK CARD -->
      <Teleport v-if="activeCard" :to="'#mobile-dest-' + activeCard" :disabled="!isMobile">
      <div class="charts-section">
        <button class="close-charts-btn" @click="activeCard = null" aria-label="Đóng">
          <i class="app-ico ri-close-line" aria-hidden="true"></i>
        </button>
        
        <div class="charts-header">
          <h3 class="charts-title">{{ getChartTitle }} <span class="time-badge">{{ filterTimeLabel }}</span></h3>
          <div class="charts-summary-center">
            <!-- Cost Summary (Custom) -->
            <div v-if="isCostCard" class="summary-item">
              <span class="summary-label">Tổng:</span>
              <span :class="['summary-value', costTotalClass]">{{ costTotalText }}</span>
            </div>

            <!-- Standard Summary -->
            <template v-else>
              <div class="summary-item">
                <span class="summary-label">Tổng:</span>
                <span class="summary-value">{{ getChartSummary.total }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Trung bình:</span>
                <span class="summary-value">{{ getChartSummary.average }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Tối đa:</span>
                <span class="summary-value">{{ getChartSummary.max }}</span>
              </div>
            </template>
          </div>
        </div>

        <!-- Khách hàng: Leaderboard Table + Pie Chart (ƯU TIÊN TRƯỚC) -->
        <div v-if="activeCard === 'customers'" class="charts-row">
          <!-- LEFT: Leaderboard Table -->
          <div class="chart-box">
            <div class="chart-box-title" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 16px;">
              <div><i class="app-ico ri-trophy-line" aria-hidden="true"></i> Bảng Xếp Hạng Khách Hàng</div>
              <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                <button 
                  @click="activeCustomerMetric = 'money'; currentPageCustomers = 1" 
                  :class="['btn-toggle-metric', { active: activeCustomerMetric === 'money' }]"
                >
                  <i class="app-ico ri-money-dollar-circle-line" aria-hidden="true"></i> Theo Tổng Tiền
                </button>
                <button 
                  @click="activeCustomerMetric = 'profit'; currentPageCustomers = 1" 
                  :class="['btn-toggle-metric', { active: activeCustomerMetric === 'profit' }]"
                >
                  <i class="app-ico ri-line-chart-line" aria-hidden="true"></i> Theo Lợi Nhuận
                </button>
              </div>
            </div>
            
            <div class="table-wrapper fixed-10-rows">
              <table class="data-table customer-table">
                <thead>
                  <tr>
                    <th>Hạng</th>
                    <th>Tên Khách Hàng</th>
                    <th>SĐT</th>
                    <th>Địa chỉ</th>
                    <th class="text-right">Tổng Tiền</th>
                    <th class="text-right">Tổng Lãi</th>
                  </tr>
                </thead>
                <tbody>
                  <tr 
                    v-for="customer in paginatedCustomers" 
                    :key="customer.id"
                    :class="{ 'top-10-row': customer.rank <= 10 }"
                  >
                    <td>
                      <span class="rank" :class="getRankClass(customer.rank - 1)">{{ customer.rank }}</span>
                    </td>
                    <td class="font-medium">{{ customer.name }}</td>
                    <td>{{ customer.phone }}</td>
                    <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{ customer.address }}</td>
                    <td class="text-right font-bold text-white">{{ formatMoney(customer.totalMoney) }}</td>
                    <td class="text-right font-bold" :class="getProfitClass(customer.totalProfit)">{{ formatMoney(customer.totalProfit) }} <i class="app-ico ri-arrow-up-line"></i></td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div class="pagination">
              <button @click="currentPageCustomers--" :disabled="currentPageCustomers === 1" class="btn-page" aria-label="Trang trước">
                <i class="app-ico ri-arrow-left-s-line" aria-hidden="true"></i>
              </button>
              <span class="page-info">{{ currentPageCustomers }} / {{ totalPagesCustomers }}</span>
              <button @click="currentPageCustomers++" :disabled="currentPageCustomers === totalPagesCustomers" class="btn-page" aria-label="Trang sau">
                <i class="app-ico ri-arrow-right-s-line" aria-hidden="true"></i>
              </button>
            </div>
          </div>

          <!-- RIGHT: Pie Chart -->
          <div class="chart-box customer-pie-box">
            <div class="chart-box-title">
              <i class="app-ico ri-pie-chart-2-line" aria-hidden="true"></i> 
              Phân Bố Theo {{ activeCustomerMetric === 'money' ? 'Tổng Tiền' : 'Lợi Nhuận' }}
            </div>
            <div class="chart-container pie-container large"><canvas ref="customerPieChart"></canvas></div>
          </div>
        </div>

        <!-- Chi phí: 1 biểu đồ full width (Kỳ lọc HOẶC Tất cả) -->
        <div v-else-if="activeCard === 'cost_period' || activeCard === 'cost_all'" class="charts-row cost-row">
          <div class="chart-box">
            <div class="chart-box-title">
              <i v-if="activeCard === 'cost_period'" class="app-ico ri-file-list-3-line" aria-hidden="true"></i>
              <i v-else class="app-ico ri-global-line" aria-hidden="true"></i>
              {{ activeCard === 'cost_period' ? 'Chi phí vs Doanh thu — Kỳ lọc' : 'Chi phí vs Doanh thu — Tất cả thời gian' }}
            </div>
            <div class="chart-container"><canvas ref="costBarChart"></canvas></div>
            
            <div class="chart-footnote">
              <!-- Footnote for COST PERIOD -->
              <div v-if="activeCard === 'cost_period'">
                <div class="footnote-row">
                   <span class="footnote-label" style="color: #f1f5f9;">DOANH THU <span style="color: #fff; font-weight: normal; opacity: 0.85;">({{ getCardTimeBadge('cost_period') }})</span>:</span>
                  <span class="footnote-value font-bold">{{ formatMoney(costTotals.DT_ky) }}</span>
                </div>
                <div class="footnote-row">
                   <span class="footnote-label text-success">LỢI NHUẬN <span style="color: #fff; font-weight: normal; opacity: 0.85;">({{ getCardTimeBadge('cost_period') }})</span>:</span>
                  <span class="footnote-value font-bold text-success">{{ formatMoney(baoCao.thong_ke.tong_loi_nhuan) }}</span>
                </div>
                <div class="footnote-row">
                   <span class="footnote-label text-danger">CHI PHÍ <span style="color: #fff; font-weight: normal; opacity: 0.85;">({{ getCardTimeBadge('cost_period') }})</span>:</span>
                  <span class="footnote-value font-bold text-danger">{{ formatMoney(costTotals.CPPS_ky) }}</span>
                </div>
                <div class="footnote-row">
                  <span class="footnote-label">TIẾN ĐỘ:</span>
                  <span class="footnote-value font-bold">{{ getProgressBar(costTotals.DT_ky, costTotals.CPPS_ky, 'period').match(/Tiến độ: (\d+%)/)?.[1] || '0%' }}</span>
                </div>
                <div class="footnote-row" style="margin-top: 8px; padding-top: 8px; border-top: 1px dashed rgba(148,163,184,0.2)">
                  <span class="footnote-label">TÌNH TRẠNG:</span>
                  <span class="footnote-value">
                    <span v-if="costTotals.Delta_ky > 0" class="text-green font-bold">DƯ: {{ formatMoney(costTotals.Delta_ky) }} <i class="app-ico ri-arrow-up-line" aria-hidden="true"></i></span>
                    <span v-else-if="costTotals.Delta_ky === 0" class="text-yellow font-bold">HÒA VỐN <i class="app-ico ri-equal-line" aria-hidden="true"></i></span>
                    <span v-else>
                      <span class="text-red font-bold">Cần bán thêm {{ formatMoney(Math.abs(costTotals.Delta_ky)) }} để <span class="text-green">hòa vốn</span></span>
                      <span v-if="filterType === 'day' && costTotals.N > 0" class="text-gray" style="font-size: 11px; margin-left: 6px;">
                        (~{{ formatMoney(Math.abs(costTotals.Delta_ky) / costTotals.N) }}/ngày)
                      </span>
                    </span>
                  </span>
                </div>
              </div>

              <!-- Footnote for COST ALL -->
              <div v-if="activeCard === 'cost_all'">
                <div class="footnote-row">
                   <span class="footnote-label" style="color: #f1f5f9;">DOANH THU <span style="color: #fff; font-weight: normal; opacity: 0.85;">(ALL)</span>:</span>
                  <span class="footnote-value font-bold">{{ formatMoney(costAllTotals.DT_all) }}</span>
                </div>
                <div class="footnote-row">
                   <span class="footnote-label text-success">LỢI NHUẬN <span style="color: #fff; font-weight: normal; opacity: 0.85;">(ALL)</span>:</span>
                  <span class="footnote-value font-bold text-success">{{ formatMoney(profitAllTime) }}</span>
                </div>
                <div class="footnote-row">
                   <span class="footnote-label text-danger">CHI PHÍ <span style="color: #fff; font-weight: normal; opacity: 0.85;">(ALL)</span>:</span>
                  <span class="footnote-value font-bold text-danger">{{ formatMoney(costAllTotals.CPPS_all) }}</span>
                </div>
                <div class="footnote-row">
                  <span class="footnote-label">Tiến độ:</span>
                  <span class="footnote-value font-bold">{{ getProgressBar(costAllTotals.DT_all, costAllTotals.CPPS_all, 'all').match(/Tiến độ: (\d+%)/)?.[1] || '0%' }}</span>
                </div>
                <div class="footnote-row" style="margin-top: 8px; padding-top: 8px; border-top: 1px dashed rgba(148,163,184,0.2)">
                  <span class="footnote-label">Tình trạng:</span>
                  <span class="footnote-value">
                    <span v-if="costAllTotals.Delta_all > 0" class="text-green font-bold">DƯ: {{ formatMoney(costAllTotals.Delta_all) }} <i class="app-ico ri-arrow-up-line" aria-hidden="true"></i></span>
                    <span v-else-if="costAllTotals.Delta_all === 0" class="text-yellow font-bold">HÒA VỐN <i class="app-ico ri-equal-line" aria-hidden="true"></i></span>
                    <span v-else class="text-red font-bold">
                      Cần bán thêm {{ formatMoney(Math.abs(costAllTotals.Delta_all)) }} để <span class="text-green">hòa vốn</span>
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sản phẩm: 2 biểu đồ tròn nằm ngang -->
        <div v-else-if="activeCard === 'products'" class="charts-row">
          <div class="chart-box">
            <div class="chart-box-title"><i class="app-ico ri-price-tag-3-line" aria-hidden="true"></i> Top 10 Số Lượng Bán</div>
            <div class="chart-container pie-container"><canvas ref="activeBarChart"></canvas></div>
          </div>
          <div class="chart-box">
            <div class="chart-box-title"><i class="app-ico ri-money-dollar-circle-line" aria-hidden="true"></i> Top 10 Lợi Nhuận</div>
            <div class="chart-container pie-container"><canvas ref="activePieChart"></canvas></div>
          </div>
        </div>

        <!-- Doanh thu, Lợi nhuận, Đơn hàng: DEFAULT (2 biểu đồ cùng hàng) -->
        <div v-else class="charts-row">
          <div class="chart-box">
            <div class="chart-box-title"><i class="app-ico ri-bar-chart-2-line" aria-hidden="true"></i> Biểu đồ theo {{ filterTypeLabel }}</div>
            <div class="chart-container"><canvas ref="activeBarChart"></canvas></div>
          </div>
          <div class="chart-box">
            <div class="chart-box-title"><i class="app-ico ri-pie-chart-2-line" aria-hidden="true"></i> Phân bổ theo {{ filterTypeLabel }}</div>
            <div class="chart-container pie-container"><canvas ref="activePieChart"></canvas></div>
          </div>
        </div>
        </div>

      </Teleport>

      <!-- 2 BẢNG NẰM NGANG -->
      <div class="tables-row">
        <!-- CHI TIẾT ĐƠN HÀNG -->
        <div class="section-panel">
          <div class="section-header">
            <h2><i class="app-ico ri-file-list-3-line" aria-hidden="true"></i> Chi Tiết Đơn Hàng <span class="time-badge">{{ filterTimeLabel }}</span></h2>
            <span class="count-badge">{{ baoCao.chi_tiet_don_hang.length }} đơn</span>
          </div>

          <div class="section-content">
            <div class="search-bar">
              <div class="search-wrapper">
                <i class="ri-search-line search-icon"></i>
                <input v-model="searchDonHang" type="text" placeholder="Tìm mã hóa đơn..." class="search-input-vip" />
              </div>
              <div class="sort-picker-container">
                <button
                  class="sort-pill"
                  :class="{ active: sortDonHangDate !== 'desc', open: activeDropdown === 'don_date' }"
                  @click.stop="activeDropdown = activeDropdown === 'don_date' ? '' : 'don_date'"
                >
                  <i :class="sortDonHangDate === 'asc' ? 'ri-sort-asc' : 'ri-sort-desc'"></i>
                  <span>{{ sortDonHangDate === 'asc' ? 'Cũ => Mới' : 'Mới => Cũ' }}</span>
                  <i class="ri-arrow-down-s-line arrow-icon"></i>
                </button>
                <div v-if="activeDropdown === 'don_date'" class="dropdown-list">
                  <div class="dropdown-item" :class="{ selected: sortDonHangDate === 'desc' }" @click="sortDonHangDate = 'desc'; activeDropdown = ''">Mới => Cũ</div>
                  <div class="dropdown-item" :class="{ selected: sortDonHangDate === 'asc' }" @click="sortDonHangDate = 'asc'; activeDropdown = ''">Cũ => Mới</div>
                </div>
              </div>
            </div>

            <!-- DESKTOP TABLE -->
            <div class="table-wrapper desktop-only-table">
              <table class="data-table clickable-table">
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Mã Hóa Đơn</th>
                    <th>Ngày Nhận</th>
                    <th class="text-center">Tổng Tiền</th>
                    <th class="text-center">Lợi Nhuận</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(don, index) in paginatedDonHang" :key="don.Ma_hoa_don" @click="viewChiTietDon(don.Ma_hoa_don)" class="clickable-row">
                    <td>{{ (currentPageDonHang - 1) * itemsPerPage + index + 1 }}</td>
                    <td><span class="badge">{{ don.Ma_hoa_don }}</span></td>
                    <td>{{ don.Ngay_tao }}</td>
                    <td class="text-center font-bold">{{ formatMoney(don.Tong_cong) }}</td>
                    <td class="text-center font-bold" :class="getProfitClass(don.Loi_nhuan)" v-html="formatProfit(don.Loi_nhuan)"></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- MOBILE CARD LIST -->
            <div class="mobile-order-list">
              <div 
                v-for="(don, index) in paginatedDonHang" 
                :key="don.Ma_hoa_don" 
                class="mo-card"
                @click="viewChiTietDon(don.Ma_hoa_don)"
              >
                <!-- Header: STT & Order Code -->
                <div class="mo-header">
                  <span class="mo-stt">#{{ (currentPageDonHang - 1) * itemsPerPage + index + 1 }}</span>
                  <span class="mo-code">{{ don.Ma_hoa_don }}</span>
                </div>
                
                <!-- Date Row -->
                <div class="mo-date">
                  <i class="app-ico ri-calendar-line"></i> {{ don.Ngay_tao }}
                </div>

                <!-- Money Row -->
                <div class="mo-footer">
                  <div class="mo-money">
                    <span class="mo-label">Tổng:</span>
                    <span class="mo-val">{{ formatMoney(don.Tong_cong) }}</span>
                  </div>
                  <div class="mo-profit" :class="getProfitClass(don.Loi_nhuan)">
                    <span class="mo-label">Lãi:</span>
                    <span class="mo-val" v-html="formatProfit(don.Loi_nhuan)"></span>
                  </div>
                </div>
              </div>
            </div>

            <div class="pagination">
              <button @click="currentPageDonHang--" :disabled="currentPageDonHang === 1" class="btn-page" aria-label="Trang trước"><i class="app-ico ri-arrow-left-s-line" aria-hidden="true"></i></button>
              <span class="page-info">{{ currentPageDonHang }} / {{ totalPagesDonHang }}</span>
              <button @click="currentPageDonHang++" :disabled="currentPageDonHang === totalPagesDonHang" class="btn-page" aria-label="Trang sau"><i class="app-ico ri-arrow-right-s-line" aria-hidden="true"></i></button>
            </div>
          </div>
        </div>

        <!-- HÀNG HÓA BÁN CHẠY -->
        <div class="section-panel">
          <div class="section-header">
            <h2><i class="app-ico ri-trophy-line" aria-hidden="true"></i> Thống Kê Hàng Hóa <span class="time-badge">{{ filterTimeLabel }}</span></h2>
            <span class="count-badge">{{ baoCao.hang_ban_chay.length }} SP</span>
          </div>

          <div class="section-content">
            <div class="search-filter-bar">
              <div class="search-wrapper">
                <i class="ri-search-line search-icon"></i>
                <input v-model="searchHang" type="text" placeholder="Tìm tên hàng..." class="search-input-vip" />
              </div>
              
              <div class="sort-actions">
                <div class="sort-picker-container">
                  <button 
                    class="sort-pill" 
                    :class="{ active: sortHangQty !== '', open: activeDropdown === 'qty' }" 
                    @click.stop="activeDropdown = activeDropdown === 'qty' ? '' : 'qty'"
                  >
                    <i :class="sortHangQty === 'qty_asc' ? 'ri-sort-asc' : (sortHangQty === 'qty_desc' ? 'ri-sort-desc' : 'ri-bar-chart-line')"></i>
                    <span>{{ sortHangQty === 'qty_asc' ? 'SL Tăng' : (sortHangQty === 'qty_desc' ? 'SL Giảm' : 'Số lượng') }}</span>
                    <i class="ri-arrow-down-s-line arrow-icon"></i>
                  </button>
                  <div v-if="activeDropdown === 'qty'" class="dropdown-list">
                    <div class="dropdown-item" :class="{ selected: sortHangQty === '' }" @click="sortHangQty = ''; activeDropdown = ''">Mặc định</div>
                    <div class="dropdown-item" :class="{ selected: sortHangQty === 'qty_desc' }" @click="sortHangQty = 'qty_desc'; activeDropdown = ''">SL Giảm dần</div>
                    <div class="dropdown-item" :class="{ selected: sortHangQty === 'qty_asc' }" @click="sortHangQty = 'qty_asc'; activeDropdown = ''">SL Tăng dần</div>
                  </div>
                </div>
                
                <div class="sort-picker-container">
                  <button 
                    class="sort-pill" 
                    :class="{ active: sortHangProfit !== '', open: activeDropdown === 'profit' }" 
                    @click.stop="activeDropdown = activeDropdown === 'profit' ? '' : 'profit'"
                  >
                    <i :class="sortHangProfit === 'profit_asc' ? 'ri-sort-asc' : (sortHangProfit === 'profit_desc' ? 'ri-sort-desc' : 'ri-money-dollar-circle-line')"></i>
                    <span>{{ sortHangProfit === 'profit_asc' ? 'LN Tăng' : (sortHangProfit === 'profit_desc' ? 'LN Giảm' : 'Lợi nhuận') }}</span>
                    <i class="ri-arrow-down-s-line arrow-icon"></i>
                  </button>
                  <div v-if="activeDropdown === 'profit'" class="dropdown-list">
                    <div class="dropdown-item" :class="{ selected: sortHangProfit === '' }" @click="sortHangProfit = ''; activeDropdown = ''">Mặc định</div>
                    <div class="dropdown-item" :class="{ selected: sortHangProfit === 'profit_desc' }" @click="sortHangProfit = 'profit_desc'; activeDropdown = ''">LN Giảm dần</div>
                    <div class="dropdown-item" :class="{ selected: sortHangProfit === 'profit_asc' }" @click="sortHangProfit = 'profit_asc'; activeDropdown = ''">LN Tăng dần</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="table-wrapper desktop-only-table">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Hạng</th>
                    <th>Tên Hàng</th>
                    <th>Size</th>
                    <th>ĐVT</th>
                    <th class="text-center">SL Bán</th>
                    <th class="text-center">Lợi Nhuận</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(hang, index) in paginatedHangBanChay" :key="hang.Ma_hang">
                    <td>
                      <span class="rank" :class="getRankClass(index)">{{ (currentPageHang - 1) * itemsPerPage + index + 1 }}</span>
                    </td>
                    <td class="font-medium">{{ hang.Ten_hang }}</td>
                    <td>{{ hang.Size || '-' }}</td>
                    <td>{{ hang.Dvt || '-' }}</td>
                    <td class="text-center font-bold">{{ hang.So_luong }}</td>
                    <td class="text-center font-bold" :class="getProfitClass(hang.Loi_nhuan)" v-html="formatProfit(hang.Loi_nhuan)"></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- MOBILE PRODUCT LIST -->
            <div class="mobile-product-list">
              <div v-for="(hang, index) in paginatedHangBanChay" :key="hang.Ma_hang" class="mp-card">
                <!-- Row 1: Rank | Name -->
                <div class="mp-header">
                  <span class="rank-badge" :class="getRankClass(index)">#{{ (currentPageHang - 1) * itemsPerPage + index + 1 }}</span>
                  <span class="mp-name">{{ hang.Ten_hang }}</span>
                </div>
                
                <!-- Row 2: Size (if any) -->
                <div v-if="hang.Size" class="mp-row">
                  <span class="mp-label">Size:</span>
                  <span class="mp-val">{{ hang.Size }}</span>
                </div>

                <!-- Row 3: Unit (if any) -->
                <div v-if="hang.Dvt" class="mp-row">
                  <span class="mp-label">ĐVT:</span>
                  <span class="mp-val">{{ hang.Dvt }}</span>
                </div>

                <!-- Row 4: Qty | Profit -->
                <div class="mp-footer">
                  <div class="mp-stat">
                    <span class="mp-label">Đã bán</span>
                    <span class="mp-val qty">{{ hang.So_luong }}</span>
                  </div>
                  <div class="mp-stat right">
                    <span class="mp-label">Lợi nhuận</span>
                    <span class="mp-val profit" :class="getProfitClass(hang.Loi_nhuan)" v-html="formatProfit(hang.Loi_nhuan)"></span>
                  </div>
                </div>
              </div>
            </div>

            <div class="pagination">
              <button @click="currentPageHang--" :disabled="currentPageHang === 1" class="btn-page" aria-label="Trang trước"><i class="app-ico ri-arrow-left-s-line" aria-hidden="true"></i></button>
              <span class="page-info">{{ currentPageHang }} / {{ totalPagesHang }}</span>
              <button @click="currentPageHang++" :disabled="currentPageHang === totalPagesHang" class="btn-page" aria-label="Trang sau"><i class="app-ico ri-arrow-right-s-line" aria-hidden="true"></i></button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- NO DATA -->
    <div v-else class="no-data">
      <div class="no-data-icon"><i class="app-ico ri-inbox-2-line" aria-hidden="true"></i></div>
      <h3>Chưa có dữ liệu</h3>
      <p>Vui lòng đợi dữ liệu tải...</p>
    </div>

    <!-- MODAL CHI TIẾT ĐƠN HÀNG -->
    <div v-if="showModalChiTiet" class="modal-overlay" @click.self="closeModal">
      <div class="modal-container">
        <div class="modal-header">
          <h2><i class="app-ico ri-shopping-bag-3-line" aria-hidden="true"></i> Chi Tiết: {{ selectedMaHoaDon }}</h2>
          <button @click="closeModal" class="btn-close" aria-label="Đóng">
            <i class="app-ico ri-close-line" aria-hidden="true"></i>
          </button>
        </div>
        <div class="modal-body">
          <div v-if="thongTinKhachHang" class="customer-info">
            <h3><i class="app-ico ri-user-3-line" aria-hidden="true"></i> Khách Hàng</h3>
            <div class="info-grid">
              <div class="info-item"><span class="info-label">Tên:</span><span>{{ thongTinKhachHang.Ten_khach_hang }}</span></div>
              <div class="info-item"><span class="info-label">SĐT:</span><span>{{ thongTinKhachHang.So_dien_thoai }}</span></div>
              <div class="info-item"><span class="info-label">Địa chỉ:</span><span>{{ thongTinKhachHang.Dia_chi }}</span></div>
            </div>
          </div>
          <table v-if="chiTietDon.length" class="data-table modal-table">
            <thead>
              <tr>
                <th>STT</th><th>Tên Hàng</th><th>SL</th><th class="text-right">Giá Bán</th><th class="text-right">Thành Tiền</th><th class="text-right">Lợi Nhuận</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, idx) in chiTietDon" :key="idx">
                <td>{{ idx + 1 }}</td>
                <td>{{ item.Ten_hang }}</td>
                <td>{{ item.So_luong }}</td>
                <td class="text-right">{{ formatMoney(item.Gia_ban) }}</td>
                <td class="text-right font-bold">{{ formatMoney(item.Thanh_tien) }}</td>
                <td class="text-right" :class="getProfitClass(item.Loi_nhuan)" v-html="formatProfit(item.Loi_nhuan)"></td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="total-row">
                <td colspan="4" class="text-right"><strong>TỔNG:</strong></td>
                <td class="text-right font-bold">{{ formatMoney(tongThanhTienModal) }}</td>
                <td class="text-right font-bold" :class="getProfitClass(tongLoiNhuanModal)" v-html="formatProfit(tongLoiNhuanModal)"></td>
              </tr>
            </tfoot>
          </table>
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
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { API_URL, IMGBB_KEY } from '@/config/api'


// States
const loading = ref(false)
const allData = ref(null)
const filterType = ref('day')
const fromDate = ref('')
const toDate = ref('')
const fromMonth = ref('')
const toMonth = ref('')
const fromYear = ref(null)
const toYear = ref(null)

// Scroll to Top
const showScrollTop = ref(false)
const rootEl = ref(null)
const scrollContainer = ref(null)

// Responsive for Teleport
const isMobile = ref(window.innerWidth <= 768)
const updateMobile = () => { isMobile.value = window.innerWidth <= 768 }

// Active Card & Charts
const activeCard = ref(null)
const activeDropdown = ref('') // Tracks open dropdown (qty, profit, year_from, year_to, etc.)
const activeBarChart = ref(null)
const activePieChart = ref(null)
const costBarChart = ref(null) // Dedicated ref for Cost charts
const activeAllChart = ref(null) // Chart "Tất cả" cho cost
const customerPieChart = ref(null) // Dedicated ref for Customer pie chart
let barChartInstance = null
let pieChartInstance = null
let costChartInstance = null // Instance riêng cho cost chart
let allChartInstance = null // Instance cho chart all-time
let customerPieInstance = null // Instance cho customer pie chart

// Sections
const showDonHang = ref(true)
const showHangBanChay = ref(true)

// Modal
const showModalChiTiet = ref(false)
const selectedMaHoaDon = ref('')
const chiTietDon = ref([])
const thongTinKhachHang = ref(null)

// Search & Pagination
const searchDonHang = ref('')
const searchHang = ref('')
const sortDonHangDate = ref('desc')
const sortHangQty = ref('qty_desc')
const sortHangProfit = ref('')
const currentPageDonHang = ref(1)
const currentPageHang = ref(1)
const itemsPerPage = 10

// Customer Leaderboard
const activeCustomerMetric = ref('money') // 'money' | 'profit'
const currentPageCustomers = ref(1)

// Computed
const donViTienTe = computed(() => allData.value?.hang_hoa?.[0]?.Don_vi_tien_te || 'VND')

// Label cho loại thống kê
const filterTypeLabel = computed(() => {
  const labels = { day: 'ngày', month: 'tháng', year: 'năm' }
  return labels[filterType.value]
})

// ===== COST ANALYSIS - CHI PHÍ VÀ HÒA VỐN =====
const costByTime = computed(() => {
  if (!allData.value || !baoCao.value) return []
  
  const allPeriods = []
  const pad = n => String(n).padStart(2, '0')
  
  // Tạo tất cả các mốc thời gian giống dataTheoThoiGian
  if (filterType.value === 'day' && fromDate.value && toDate.value) {
    const start = new Date(fromDate.value)
    const end = new Date(toDate.value)
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const day = pad(d.getDate())
      const month = pad(d.getMonth() + 1)
      const year = d.getFullYear()
      const key = `${day}/${month}/${year}`
      const label = `${day}/${month}`
      allPeriods.push({ key, label, doanh_thu: 0, cpps: 0 })
    }
  } else if (filterType.value === 'month' && fromMonth.value && toMonth.value) {
    const [startY, startM] = fromMonth.value.split('-').map(Number)
    const [endY, endM] = toMonth.value.split('-').map(Number)
    let y = startY, m = startM
    while (y < endY || (y === endY && m <= endM)) {
      const key = `${pad(m)}/${y}`
      const label = `T${pad(m)}/${y}`
      allPeriods.push({ key, label, doanh_thu: 0, cpps: 0 })
      m++
      if (m > 12) { m = 1; y++ }
    }
  } else if (filterType.value === 'year' && fromYear.value && toYear.value) {
    for (let y = fromYear.value; y <= toYear.value; y++) {
      allPeriods.push({ key: String(y), label: String(y), doanh_thu: 0, cpps: 0 })
    }
  }
  
  if (allPeriods.length === 0) return []
  
  const dataMap = {}
  allPeriods.forEach(p => { dataMap[p.key] = p })
  
  // Map doanh thu từ chi tiết đơn hàng (đã lọc trong baoCao)
  baoCao.value.chi_tiet_don_hang.forEach(don => {
    const ngayStr = don.Ngay_tao.trim()
    let datePart = ngayStr
    if (ngayStr.includes(' ')) {
      datePart = ngayStr.split(' ').pop()
    }
    
    const parts = datePart.split('/')
    if (parts.length !== 3) return
    
    const day = parts[0].padStart(2, '0')
    const month = parts[1].padStart(2, '0')
    const year = parts[2]
    
    let key = ''
    if (filterType.value === 'day') {
      key = `${day}/${month}/${year}`
    } else if (filterType.value === 'month') {
      key = `${month}/${year}`
    } else if (filterType.value === 'year') {
      key = year
    }
    
    if (dataMap[key]) {
      dataMap[key].doanh_thu += don.Tong_cong
    }
  })
  
  // Map chi phí từ so_thu_chi
  const soThuChi = allData.value.so_thu_chi || []
  soThuChi.forEach(item => {
    // Chuẩn hóa status để tránh lỗi khoảng trắng/case
    const status = String(item.Trang_thai || '').trim().toUpperCase()
    if (status !== 'CHI_PHI_PHAT_SINH') return
    if (!filterByDate(item.Ngay_tao_duong_lich)) return
    
    const ngayStr = String(item.Ngay_tao_duong_lich || '').trim()
    if (!ngayStr) return
    
    let datePart = ngayStr
    if (ngayStr.includes(' ')) {
      datePart = ngayStr.split(' ').pop()
    }
    
    const parts = datePart.split('/')
    if (parts.length !== 3) return
    
    const day = parts[0].padStart(2, '0')
    const month = parts[1].padStart(2, '0')
    const year = parts[2]
    
    let key = ''
    if (filterType.value === 'day') {
      key = `${day}/${month}/${year}`
    } else if (filterType.value === 'month') {
      key = `${month}/${year}`
    } else if (filterType.value === 'year') {
      key = year
    }
    
    if (dataMap[key]) {
      // FIX: Dùng so_tien (lowercase) với fallback
      const money = Number(item.so_tien ?? item.So_tien ?? 0)
      dataMap[key].cpps += money
    }
  })
  
  return allPeriods
})

const costTotals = computed(() => {
  if (!costByTime.value.length) return { DT_ky: 0, CPPS_ky: 0, Delta_ky: 0, need_ky: 0, N: 0 }
  
  const DT_ky = costByTime.value.reduce((s, p) => s + p.doanh_thu, 0)
  const CPPS_ky = costByTime.value.reduce((s, p) => s + p.cpps, 0)
  const Delta_ky = DT_ky - CPPS_ky
  const need_ky = Math.max(0, CPPS_ky - DT_ky)
  const N = costByTime.value.length
  
  return { DT_ky, CPPS_ky, Delta_ky, need_ky, N }
})

const costAllTotals = computed(() => {
  if (!allData.value?.so_thu_chi || !allData.value?.hoa_don_tong_quat || !allData.value?.don_hang) {
    return { DT_all: 0, CPPS_all: 0, Delta_all: 0, need_all: 0 }
  }
  
  // Map trạng thái đơn hàng
  const donHangMap = {}
  allData.value.don_hang.forEach(d => { donHangMap[d.Ma_hoa_don] = d.Trang_thai })
  
  // Tổng doanh thu all-time (Dựa trên hóa đơn hoàn thành)
  const dt = allData.value.hoa_don_tong_quat
    .filter(h => donHangMap[h.Ma_hoa_don] === 'Hoàn thành')
    .reduce((s, h) => s + Number(h.Tong_cong || 0), 0)

  // Tổng chi phí phát sinh all-time (Loại: CHI_PHI_PHAT_SINH)
  const cpps = allData.value.so_thu_chi
    .filter(p => (p.Trang_thai || '').trim().toUpperCase() === 'CHI_PHI_PHAT_SINH')
    .reduce((s, p) => s + Number((p.so_tien ?? p.So_tien) || 0), 0)

  const delta = dt - cpps
  const need = delta < 0 ? Math.abs(delta) : 0
  return { DT_all: dt, CPPS_all: cpps, Delta_all: delta, need_all: need }
})

const profitAllTime = computed(() => {
  if (!allData.value?.hoa_don_tong_quat || !allData.value?.don_hang) return 0
  
  const donHangMap = {}
  allData.value.don_hang.forEach(d => { donHangMap[d.Ma_hoa_don] = d.Trang_thai })

  return allData.value.hoa_don_tong_quat
    .filter(h => donHangMap[h.Ma_hoa_don] === 'Hoàn thành')
    .reduce((s, h) => s + Number(h.Tong_loi_nhuan || 0), 0)
})

const totalDaysAllTime = computed(() => {
  const dates = new Set()
  
  // From Orders
  allData.value?.don_hang?.forEach(d => {
    if (d.Trang_thai === 'Hoàn thành' && d.Thoi_gian_nhan_hang) { // Use Thoi_gian_nhan_hang
      try { 
        let datePart = d.Thoi_gian_nhan_hang.trim()
        if (datePart.includes(' ')) datePart = datePart.split(' ').pop()
        dates.add(datePart) 
      } catch(e){}
    }
  })
  
  // From Cost
  allData.value?.so_thu_chi?.forEach(s => {
    if ((s.Trang_thai || '').trim().toUpperCase() === 'CHI_PHI_PHAT_SINH' && s.Ngay_tao_duong_lich) { // Use Ngay_tao_duong_lich
       try { 
        let datePart = s.Ngay_tao_duong_lich.trim()
        if (datePart.includes(' ')) datePart = datePart.split(' ').pop()
        dates.add(datePart) 
       } catch(e){}
    }
  })
  
  return dates.size || 1
})  
// ===== TẠO TẤT CẢ CÁC MỐC THỜI GIAN TRONG KHOẢNG CHỌN =====
const dataTheoThoiGian = computed(() => {
  if (!baoCao.value) return []
  
  const allPeriods = []
  const pad = n => String(n).padStart(2, '0')
  
  if (filterType.value === 'day' && fromDate.value && toDate.value) {
    const start = new Date(fromDate.value)
    const end = new Date(toDate.value)
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const day = pad(d.getDate())
      const month = pad(d.getMonth() + 1)
      const year = d.getFullYear()
      const key = `${day}/${month}/${year}`
      const label = `${day}/${month}`
      allPeriods.push({ key, label, doanh_thu: 0, loi_nhuan: 0, so_don: 0 })
    }
  } else if (filterType.value === 'month' && fromMonth.value && toMonth.value) {
    const [startY, startM] = fromMonth.value.split('-').map(Number)
    const [endY, endM] = toMonth.value.split('-').map(Number)
    let y = startY, m = startM
    while (y < endY || (y === endY && m <= endM)) {
      const key = `${pad(m)}/${y}`
      const label = `T${pad(m)}/${y}`
      allPeriods.push({ key, label, doanh_thu: 0, loi_nhuan: 0, so_don: 0 })
      m++
      if (m > 12) { m = 1; y++ }
    }
  } else if (filterType.value === 'year' && fromYear.value && toYear.value) {
    for (let y = fromYear.value; y <= toYear.value; y++) {
      allPeriods.push({ key: String(y), label: String(y), doanh_thu: 0, loi_nhuan: 0, so_don: 0 })
    }
  }
  
  if (allPeriods.length === 0) return []
  
  const dataMap = {}
  allPeriods.forEach(p => { dataMap[p.key] = p })
  
  baoCao.value.chi_tiet_don_hang.forEach(don => {
    const ngayStr = don.Ngay_tao.trim()
    let datePart = ngayStr
    if (ngayStr.includes(' ')) {
      datePart = ngayStr.split(' ').pop()
    }
    
    const parts = datePart.split('/')
    if (parts.length !== 3) return
    
    const day = parts[0].padStart(2, '0')
    const month = parts[1].padStart(2, '0')
    const year = parts[2]
    
    let key = ''
    if (filterType.value === 'day') {
      key = `${day}/${month}/${year}`
    } else if (filterType.value === 'month') {
      key = `${month}/${year}`
    } else if (filterType.value === 'year') {
      key = year
    }
    
    if (dataMap[key]) {
      dataMap[key].doanh_thu += don.Tong_cong
      dataMap[key].loi_nhuan += don.Loi_nhuan
      dataMap[key].so_don++
    }
  })
  
  return allPeriods
})

const tongSanPhamBan = computed(() => baoCao.value?.hang_ban_chay.reduce((s, h) => s + h.So_luong, 0) || 0)

const filterTimeLabel = computed(() => {
  if (filterType.value === 'day' && fromDate.value && toDate.value) {
    const f = fromDate.value.split('-').reverse().join('/')
    const t = toDate.value.split('-').reverse().join('/')
    return `${f} - ${t}`
  }
  if (filterType.value === 'month' && fromMonth.value && toMonth.value) {
    return `${formatDateBtn(fromMonth.value, 'month')} → ${formatDateBtn(toMonth.value, 'month')}`
  }
  if (filterType.value === 'year' && fromYear.value && toYear.value) {
    return `${fromYear.value} - ${toYear.value}`
  }
  return ''
})

// ===== CUSTOM FILTER UI LOGIC =====
const fromDateEl = ref(null)
const toDateEl = ref(null)
const fromMonthEl = ref(null)
const toMonthEl = ref(null)
const fromYearEl = ref(null) 
const toYearEl = ref(null)

const availableYears = computed(() => {
  const years = []
  const currentYear = new Date().getFullYear()
  for (let y = 2020; y <= currentYear + 2; y++) {
    years.push(y)
  }
  return years.reverse() // Newest first usually better for selection
})

const openPicker = (el) => {
  if (el) {
    if (typeof el.showPicker === 'function') el.showPicker()
    else {
      el.focus()
      el.click()
    }
  }
}

const formatDateBtn = (val, type) => {
  if (!val) return 'Chọn thời gian'
  if (type === 'day') {
    if (!val.includes('-')) return val
    const [y, m, d] = val.split('-')
    return `${d}/${m}/${y}`
  }
  if (type === 'month') {
    if (!val.includes('-')) return val
    const [y, m] = val.split('-')
    return `Tháng ${m}/${y}`
  }
  return val
}

// ===== VALIDATION LOGIC =====
const isRangeInvalid = computed(() => {
  if (filterType.value === 'day' && fromDate.value && toDate.value) {
    return fromDate.value > toDate.value
  }
  if (filterType.value === 'month' && fromMonth.value && toMonth.value) {
    return fromMonth.value > toMonth.value
  }
  if (filterType.value === 'year' && fromYear.value && toYear.value) {
    return fromYear.value > toYear.value
  }
  return false
})

const rangeErrorText = computed(() => {
  if (!isRangeInvalid.value) return ''
  if (filterType.value === 'day') return 'Ngày đến phải lớn hơn hoặc bằng ngày bắt đầu'
  if (filterType.value === 'month') return 'Tháng đến phải lớn hơn hoặc bằng tháng bắt đầu'
  if (filterType.value === 'year') return 'Năm đến phải lớn hơn hoặc bằng năm bắt đầu'
  return ''
})

// Auto-fix watcher (Enforce constraints)
watch([fromDate, toDate, fromMonth, toMonth, fromYear, toYear], () => {
  if (!isRangeInvalid.value) return
  
  // Logic: Nếu range sai, reset End = Start để thoả mãn
  if (filterType.value === 'day' && fromDate.value && toDate.value) {
    if (fromDate.value > toDate.value) toDate.value = fromDate.value
  }
  if (filterType.value === 'month' && fromMonth.value && toMonth.value) {
    if (fromMonth.value > toMonth.value) toMonth.value = fromMonth.value
  }
  if (filterType.value === 'year' && fromYear.value && toYear.value) {
    if (fromYear.value > toYear.value) toYear.value = fromYear.value
  }
})

// Helper functions for cost card - REFINED (Global Scope)
const formatDeltaText = (delta) => {
  if (delta > 0) return `<span class="text-green status-text" style="font-size:13px; font-weight:800; letter-spacing:0.5px">DƯ: ${formatMoney(delta)} ↑</span>`
  if (delta === 0) return `<span class="text-yellow status-text" style="font-size:13px; font-weight:800; letter-spacing:0.5px">HÒA VỐN </span>`
  return `<span class="text-red status-text" style="font-size:13px; font-weight:800; letter-spacing:0.5px">THIẾU: ${formatMoney(Math.abs(delta))} ↓</span>`
}

const formatNeedText = (need, delta, isFiltered = true, N = 0) => {
  if (delta >= 0) {
    return `<strong style="font-size:11px; font-weight:700; color:#94a3b8">Đã <span class="text-green">hòa vốn</span></strong>`
  }
  
  let text = `Cần bán thêm ${formatMoney(need)} để <span class="text-green">hòa vốn</span>`
  let sub = ''
  if (isFiltered && filterType.value === 'day' && N > 0) {
    sub = ` <span style="opacity:0.8; font-weight:500; font-size:10px">(~${formatMoney(need / N)}/ngày)</span>`
  }
  return `<span class="text-red need-text" style="font-size:11px; font-weight:600">${text}${sub}</span>`
}

const getProgressBar = (dt, cpps, type = 'period') => {
  let pct = 0
  if (cpps > 0) {
    pct = Math.min(Math.max((dt / cpps) * 100, 0), 100).toFixed(0)
  } else {
    pct = 100
  }
  
  let levelClass = 'level-green'
  if (pct <= 30) levelClass = 'level-red'
  else if (pct <= 75) levelClass = 'level-yellow'
  
  return `
    <div class="cost-meter-wrap">
      <div class="cost-meter-label">Tiến độ: ${pct}%</div>
      <div class="cost-meter ${type}">
          <div class="meter-fill ${levelClass}" style="width:${pct}%"></div>
      </div>
    </div>
  `
}

// Custom Logic for Cost All Badge
const toYmdNum = (str) => {
  if (!str) return null
  let datePart = String(str).trim()
  if (datePart.includes(' ')) datePart = datePart.split(' ').pop() 
  const parts = datePart.split('/')
  if (parts.length !== 3) return null
  const d = Number(parts[0]), m = Number(parts[1]), y = Number(parts[2])
  if (!d || !m || !y) return null
  return y * 10000 + m * 100 + d
}

const fromYmdNum = (n) => {
  const y = Math.floor(n / 10000)
  const m = Math.floor((n % 10000) / 100)
  const d = n % 100
  const pad = (x) => String(x).padStart(2, '0')
  return `${pad(d)}/${pad(m)}/${y}`
}

const allTimeRangeLabel = computed(() => {
  if (!allData.value) return 'ALL'
  const nums = []

  // Orders all-time (Hoàn thành)
  allData.value.don_hang?.forEach(d => {
    if (d.Trang_thai === 'Hoàn thành' && d.Thoi_gian_nhan_hang) {
      const n = toYmdNum(d.Thoi_gian_nhan_hang)
      if (n) nums.push(n)
    }
  })

  // Costs all-time (CHI_PHI_PHAT_SINH)
  allData.value.so_thu_chi?.forEach(s => {
    const st = String(s.Trang_thai || '').trim().toUpperCase()
    if (st === 'CHI_PHI_PHAT_SINH' && s.Ngay_tao_duong_lich) {
      const n = toYmdNum(s.Ngay_tao_duong_lich)
      if (n) nums.push(n)
    }
  })

  if (!nums.length) return 'ALL'
  const minN = Math.min(...nums)
  const maxN = Math.max(...nums)
  if (minN === maxN) return fromYmdNum(minN)
  return `${fromYmdNum(minN)} - ${fromYmdNum(maxN)}`
})

const getCardTimeBadge = (type) => {
  let val = type === 'cost_all' ? allTimeRangeLabel.value : filterTimeLabel.value
  if (filterType.value === 'month' && val) {
    return val.replaceAll('Tháng ', '')
  }
  return val
}

const statsCards = computed(() => {
  if (!baoCao.value) return []
  
  const tk = baoCao.value.thong_ke
  const ss = soSanhKyTruoc.value
  const ct = costTotals.value
  const ca = costAllTotals.value
  
  return [
    { 
      type: 'revenue', 
      icon: 'ri-money-dollar-circle-line', 
      label: 'Tổng Doanh Thu', 
      value: formatMoney(tk.tong_doanh_thu), 
      sub: `<span class="text-green">Tiền mặt: ${formatMoney(tk.tien_mat)}</span>`, 
      sub2: `<span class="text-blue">Chuyển khoản: ${formatMoney(tk.chuyen_khoan)}</span>`,
      trend: ss.doanhThu ? getTrendHtml(ss.doanhThu.change) : null 
    },
    { 
      type: 'profit', 
      icon: 'ri-line-chart-line', 
      label: 'Tổng Lợi Nhuận', 
      value: formatMoney(tk.tong_loi_nhuan), 
      sub: `<span class="text-green">Biên lợi nhuận: ${profitMargin.value}%</span>`, 
      trend: ss.loiNhuan ? getTrendHtml(ss.loiNhuan.change) : null 
    },
    { 
      type: 'orders', 
      icon: 'ri-shopping-bag-3-line', 
      label: 'Đơn Hoàn Thành', 
      value: tk.tong_don_hoan_thanh + ' đơn', 
      sub: `<span class="text-yellow">Đang xử lý: ${tk.tong_don_dang_xu_ly} đơn</span>`, 
      sub2: `<span class="text-red">Quá hạn: ${tk.tong_don_qua_han} đơn</span>`,
      trend: ss.donHang ? getTrendHtml(ss.donHang.change) : null 
    },
    { 
      type: 'products', 
      icon: 'ri-price-tag-3-line', 
      label: 'Sản Phẩm Bán', 
      value: tongSanPhamBan.value + ' SP', 
      sub: `<span class="text-blue">${baoCao.value.hang_ban_chay.length} loại sản phẩm</span>`, 
      trend: ss.sanPham ? getTrendHtml(ss.sanPham.change) : `<span class="text-green">Top bán chạy</span>` 
    },
    {
      type: 'customers',
      icon: 'ri-user-star-line',
      label: 'Top Khách Chi Tiêu (Kỳ)',
      value: customersSorted.value.length + ' khách',
      sub: (() => {
        const top1 = customersSorted.value[0]
        if (!top1) return '<span class="text-gray">Chưa có dữ liệu</span>'
        const metric = activeCustomerMetric.value === 'money' ? top1.totalMoney : top1.totalProfit
        const metricLabel = activeCustomerMetric.value === 'money' ? 'Chi tiêu' : 'Lợi nhuận'
        return `<span class="text-yellow"><i class="app-ico ri-vip-crown-2-line"></i> ${top1.name}</span><br/><span class="text-green">${metricLabel}: ${formatMoney(metric)}</span>`
      })(),
      trend: null
    },
    {
      type: 'cost_period',
      icon: 'ri-coins-line',
      label: 'Chi phí (Kỳ lọc)',
      value: formatMoney(ct.CPPS_ky),
      sub: (() => {
        const unit = { day: 'ngày', month: 'tháng', year: 'năm' }[filterType.value] || ''
        const periodLabel = `${ct.N} ${unit.toUpperCase()}`
        
        return `
          <div class="cost-panel period">
            <div class="panel-chip period">${periodLabel}</div>
            <div style="margin-top:6px; margin-bottom:2px">${formatDeltaText(ct.Delta_ky)}</div>
            <div>${formatNeedText(ct.need_ky, ct.Delta_ky, true, ct.N)}</div>
            ${getProgressBar(ct.DT_ky, ct.CPPS_ky, 'period')}
          </div>
        `
      })(),
      trend: null
    },
    {
      type: 'cost_all',
      icon: 'ri-wallet-3-line',
      label: 'Chi phí (Tất cả)',
      value: formatMoney(ca.CPPS_all),
      sub: (() => {
         return `
          <div class="cost-panel all">
            <div class="panel-chip all">ALL · ${totalDaysAllTime.value} NGÀY</div>
            <div style="margin-top:6px; margin-bottom:2px">${formatDeltaText(ca.Delta_all)}</div>
            <div>${formatNeedText(ca.need_all, ca.Delta_all, false)}</div>
            ${getProgressBar(ca.DT_all, ca.CPPS_all, 'all')}
          </div>
         `
      })(),
      trend: null
    }
  ]
})

const getChartTitle = computed(() => {
  const t = { 
    revenue: `Doanh Thu theo ${filterTypeLabel.value.toUpperCase()}`, 
    profit: `Lợi Nhuận theo ${filterTypeLabel.value.toUpperCase()}`, 
    orders: `Đơn Hàng theo ${filterTypeLabel.value.toUpperCase()}`, 
    products: 'Top 10 Sản Phẩm Bán Chạy',
    customers: 'Top Khách Chi Tiêu (Kỳ)',
    cost_period: 'Chi phí vs Doanh thu — Kỳ lọc',
    cost_all: 'Chi phí vs Doanh thu — Tất cả thời gian'
  }
  return t[activeCard.value] || ''
})

// Watch data để auto-render chart khi vừa load xong
watch(allData, () => {
  if (activeCard.value === 'cost_period' || activeCard.value === 'cost_all') {
    nextTick(() => renderCharts())
  }
}, { deep: true })

const getChartSummary = computed(() => {
  if (!activeCard.value) return { total: '-', average: '-', max: '-' }
  
  // Customers case
  if (activeCard.value === 'customers') {
    const list = customersSorted.value || []
    const metric = activeCustomerMetric.value === 'money' ? 'totalMoney' : 'totalProfit'
    const maxVal = list.length ? Math.max(...list.map(x => Number(x[metric] || 0))) : 0
    return {
      total: `${list.length} khách`,
      average: '-',
      max: `${new Intl.NumberFormat('vi-VN').format(maxVal)} ${donViTienTe.value}`
    }
  }
  
  if (activeCard.value === 'products') {
    const top10 = baoCao.value?.hang_ban_chay.slice(0, 10) || []
    const values = top10.map(h => h.So_luong)
    const total = values.reduce((a, b) => a + b, 0)
    return {
      total: new Intl.NumberFormat('vi-VN').format(total) + ' SP',
      average: new Intl.NumberFormat('vi-VN').format(Math.round(total / (values.length || 1))) + ' SP',
      max: new Intl.NumberFormat('vi-VN').format(Math.max(...values, 0)) + ' SP'
    }
  }
  
  if (activeCard.value === 'cost_period') {
    const ct = costTotals.value
    const deltas = costByTime.value.map(p => p.doanh_thu - p.cpps)
    const maxDelta = Math.max(...deltas, 0) // Max surplus
    const avgDelta = ct.N > 0 ? ct.Delta_ky / ct.N : 0
    
    let totalText = ct.Delta_ky > 0 ? `↑ DƯ ${formatMoney(ct.Delta_ky)}` : 
                    ct.Delta_ky === 0 ? '= HÒA VỐN' : 
                    `↓ THIẾU ${formatMoney(Math.abs(ct.Delta_ky))}`
    
    return {
      total: totalText,
      average: new Intl.NumberFormat('vi-VN').format(Math.round(avgDelta)) + ` ${donViTienTe.value}`,
      max: new Intl.NumberFormat('vi-VN').format(Math.round(maxDelta)) + ` ${donViTienTe.value}`
    }
  }

  if (activeCard.value === 'cost_all') {
    const ca = costAllTotals.value
    let totalText = ca.Delta_all > 0 ? `↑ DƯ ${formatMoney(ca.Delta_all)}` : 
                    ca.Delta_all === 0 ? '= HÒA VỐN' : 
                    `↓ THIẾU ${formatMoney(Math.abs(ca.Delta_all))}`
    return {
      total: totalText,
      average: '-',
      max: '-'
    }
  }
  
  if (!dataTheoThoiGian.value.length) return { total: '-', average: '-', max: '-' }
  
  const key = { revenue: 'doanh_thu', profit: 'loi_nhuan', orders: 'so_don' }[activeCard.value]
  if (!key) return { total: '-', average: '-', max: '-' } // Prevent NaN
  
  const unit = ['revenue', 'profit'].includes(activeCard.value) ? ` ${donViTienTe.value}` : ' đơn'
  const values = dataTheoThoiGian.value.map(d => d[key])
  const total = values.reduce((a,b) => a+b, 0)
  
  return {
    total: new Intl.NumberFormat('vi-VN').format(total) + unit,
    average: new Intl.NumberFormat('vi-VN').format(Math.round(total / values.length)) + unit,
    max: new Intl.NumberFormat('vi-VN').format(Math.max(...values)) + unit
  }
})

const isCostCard = computed(() => activeCard.value === 'cost_period' || activeCard.value === 'cost_all')

const costTotalText = computed(() => {
  if (!isCostCard.value) return ''
  const delta = activeCard.value === 'cost_period' ? costTotals.value.Delta_ky : costAllTotals.value.Delta_all
  
  if (delta > 0) return `DƯ ${formatMoney(delta)} ↑`
  if (delta < 0) return `THIẾU ${formatMoney(Math.abs(delta))} ↓`
  return `HÒA VỐN =`
})

const costTotalClass = computed(() => {
  if (!isCostCard.value) return ''
  const delta = activeCard.value === 'cost_period' ? costTotals.value.Delta_ky : costAllTotals.value.Delta_all
  return delta < 0 ? 'sum-red' : 'sum-green'
})

// ===== CUSTOMER LEADERBOARD AGGREGATION =====
const customersAgg = computed(() => {
  if (!allData.value?.so_thu_chi || !allData.value?.don_hang) return {}
  
  const customerMap = {}
  
  // Step 1: Aggregate spending from so_thu_chi (primary data source)
  allData.value.so_thu_chi.forEach(item => {
    // Only process records with Ma_khach_hang (exclude supplier/service records)
    const customerId = String(item.Ma_khach_hang || '').trim()
    if (!customerId) return
    
    // Filter by period using Ngay_tao_duong_lich
    if (!filterByDate(item.Ngay_tao_duong_lich)) return
    
    // Parse money and profit safely
    const money = Number(item.so_tien || 0)
    const profit = Number(item.loi_nhuan || 0)
    
    // Only count positive spending
    if (money <= 0) return
    
    // Initialize customer entry if not exists
    if (!customerMap[customerId]) {
      customerMap[customerId] = {
        id: customerId,
        name: String(item.Ten_khach_hang || customerId).trim(),
        phone: '-',
        address: '-',
        totalMoney: 0,
        totalProfit: 0,
        orderCount: 0,
        latestOrderDate: null
      }
    }
    
    // Accumulate totals
    customerMap[customerId].totalMoney += money
    customerMap[customerId].totalProfit += profit
    customerMap[customerId].orderCount++
  })
  
  // Step 2: Get contact info (phone, address) from don_hang
  // We want the LATEST order in the filtered period for each customer
  const customerOrders = {}
  
  allData.value.don_hang.forEach(don => {
    const customerId = String(don.Ma_khach_hang || '').trim()
    if (!customerId) return
    if (don.Trang_thai !== 'Hoàn thành') return
    if (!filterByDate(don.Thoi_gian_nhan_hang)) return
    
    // Parse date to find latest order
    const dateStr = String(don.Thoi_gian_nhan_hang || '').trim()
    let datePart = dateStr
    if (dateStr.includes(' ')) {
      datePart = dateStr.split(' ').pop()
    }
    
    const parts = datePart.split('/')
    if (parts.length === 3) {
      const day = Number(parts[0])
      const month = Number(parts[1])
      const year = Number(parts[2])
      const dateNum = year * 10000 + month * 100 + day
      
      // Keep only the latest order for this customer
      if (!customerOrders[customerId] || dateNum > customerOrders[customerId].dateNum) {
        customerOrders[customerId] = {
          dateNum,
          phone: String(don.So_dien_thoai || '-').trim(),
          address: String(don.Dia_chi || '-').trim(),
          name: String(don.Ten_khach_hang || '').trim()
        }
      }
    }
  })
  
  // Step 3: Merge contact info into customer map
  Object.keys(customerMap).forEach(customerId => {
    const orderInfo = customerOrders[customerId]
    if (orderInfo) {
      customerMap[customerId].phone = orderInfo.phone
      customerMap[customerId].address = orderInfo.address
      // Update name if available from don_hang
      if (orderInfo.name) {
        customerMap[customerId].name = orderInfo.name
      }
    }
  })
  
  return customerMap
})

const customersSorted = computed(() => {
  const customers = Object.values(customersAgg.value)
  if (customers.length === 0) return []
  
  const metric = activeCustomerMetric.value === 'money' ? 'totalMoney' : 'totalProfit'
  
  // Sort descending by selected metric
  const sorted = [...customers].sort((a, b) => b[metric] - a[metric])
  
  // Add rank
  sorted.forEach((c, idx) => {
    c.rank = idx + 1
  })
  
  return sorted
})

const totalPagesCustomers = computed(() => {
  return Math.ceil(customersSorted.value.length / itemsPerPage) || 1
})

const paginatedCustomers = computed(() => {
  const start = (currentPageCustomers.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return customersSorted.value.slice(start, end)
})

const top10Customers = computed(() => {
  return customersSorted.value.slice(0, 10)
})

const pieDataCustomers = computed(() => {
  const metric = activeCustomerMetric.value === 'money' ? 'totalMoney' : 'totalProfit'
  const top10 = top10Customers.value
  
  if (top10.length === 0) return { labels: [], values: [] }
  
  const labels = top10.map(c => c.name.length > 20 ? c.name.slice(0, 20) + '...' : c.name)
  const values = top10.map(c => c[metric])
  
  // Calculate "Others" if there are more than 10 customers
  const totalAll = customersSorted.value.reduce((sum, c) => sum + c[metric], 0)
  const totalTop10 = values.reduce((sum, v) => sum + v, 0)
  const others = totalAll - totalTop10
  
  if (others > 0 && customersSorted.value.length > 10) {
    labels.push('Khác')
    values.push(others)
  }
  
  return { labels, values }
})

const baoCao = computed(() => {
  if (!allData.value) return null

  const { hoa_don_tong_quat = [], hoa_don_chi_tiet = [], don_hang = [], hang_hoa = [] } = allData.value
  const hangHoaMap = Object.fromEntries(hang_hoa.map(h => [h.Ma_hang, { Size: h.Size, Dvt: h.Dvt }]))
  
  // Map trạng thái đơn hàng
  const donHangMap = {}
  don_hang.forEach(d => {
    donHangMap[d.Ma_hoa_don] = {
      trang_thai: d.Trang_thai,
      thoi_gian_nhan: d.Thoi_gian_nhan_hang,
      hinh_thuc: d.Hinh_thuc_thanh_toan
    }
  })

  let tongDoanhThu = 0, tongLoiNhuan = 0, tongDonHoanThanh = 0
  let tienMat = 0, chuyenKhoan = 0
  const chiTietDonHang = [], chiTietSanPham = {}

  // Tính doanh thu, lợi nhuận, đơn hàng
  hoa_don_tong_quat.forEach(hd => {
    const donInfo = donHangMap[hd.Ma_hoa_don]
    if (!donInfo || donInfo.trang_thai !== 'Hoàn thành') return
    if (!filterByDate(donInfo.thoi_gian_nhan)) return
    
    const tongCong = Number(hd.Tong_cong || 0)
    tongDoanhThu += tongCong
    tongLoiNhuan += Number(hd.Tong_loi_nhuan || 0)
    tongDonHoanThanh++
    
    // Tính tiền mặt / chuyển khoản
    if (donInfo.hinh_thuc === 'TIEN_MAT') tienMat += tongCong
    else if (donInfo.hinh_thuc === 'CHUYEN_KHOAN') chuyenKhoan += tongCong
    
    chiTietDonHang.push({ 
      Ma_hoa_don: hd.Ma_hoa_don, 
      Ngay_tao: donInfo.thoi_gian_nhan,
      Tong_cong: tongCong, 
      Loi_nhuan: Number(hd.Tong_loi_nhuan || 0),
      Hinh_thuc: donInfo.hinh_thuc
    })
  })

  // ===== SẢN PHẨM BÁN CHẠY =====
  hoa_don_chi_tiet.forEach(ct => {
    if (ct.Trang_thai_don !== 'Hoàn thành') return
    const thoiGianNhan = ct.Thoi_gian_nhan_hang || ''
    if (!thoiGianNhan || !filterByDate(thoiGianNhan)) return
    
    if (!chiTietSanPham[ct.Ma_hang]) {
      chiTietSanPham[ct.Ma_hang] = { 
        Ma_hang: ct.Ma_hang, 
        Ten_hang: ct.Ten_hang, 
        Size: hangHoaMap[ct.Ma_hang]?.Size || '', 
        Dvt: hangHoaMap[ct.Ma_hang]?.Dvt || '', 
        So_luong: 0, 
        Loi_nhuan: 0 
      }
    }
    chiTietSanPham[ct.Ma_hang].So_luong += Number(ct.So_luong || 0)
    chiTietSanPham[ct.Ma_hang].Loi_nhuan += Number(ct.Loi_nhuan || 0)
  })

  // Tính đơn đang xử lý và quá hạn
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const donDangXuLy = don_hang.filter(d => d.Trang_thai === 'Đang xử lý')
  
  let tongDangXuLy = 0
  let tongQuaHan = 0
  
  donDangXuLy.forEach(d => {
    const thoiGian = d.Thoi_gian_nhan_hang
    if (!thoiGian) {
      tongDangXuLy++
      return
    }
    
    let datePart = String(thoiGian).trim()
    if (datePart.includes(' ')) datePart = datePart.split(' ').pop()
    
    const parts = datePart.split('/')
    if (parts.length !== 3) {
      tongDangXuLy++
      return
    }
    
    const [day, month, year] = parts.map(Number)
    const ngayNhan = new Date(year, month - 1, day)
    
    if (ngayNhan < today) {
      tongQuaHan++
    } else {
      tongDangXuLy++
    }
  })

  return {
    thong_ke: { 
      tong_doanh_thu: tongDoanhThu, 
      tong_loi_nhuan: tongLoiNhuan, 
      tong_don_hoan_thanh: tongDonHoanThanh, 
      tong_don_dang_xu_ly: tongDangXuLy,
      tong_don_qua_han: tongQuaHan,
      tien_mat: tienMat,
      chuyen_khoan: chuyenKhoan
    },
    chi_tiet_don_hang: chiTietDonHang,
    hang_ban_chay: Object.values(chiTietSanPham).sort((a, b) => b.So_luong - a.So_luong)
  }
})

// Filter theo ngày - định dạng: "14:04:00 01/02/2026" hoặc "01/02/2026"
function filterByDate(ngayStr) {
  if (!ngayStr) return false
  
  const str = String(ngayStr).trim()
  let datePart = str
  
  // Nếu có khoảng trắng (có giờ), lấy phần ngày (phần sau)
  if (str.includes(' ')) {
    const parts = str.split(' ')
    datePart = parts[parts.length - 1] // Lấy phần cuối: "01/02/2026"
  }
  
  const dateArr = datePart.split('/')
  if (dateArr.length !== 3) return false
  
  const [day, month, year] = dateArr.map(Number)
  if (isNaN(day) || isNaN(month) || isNaN(year)) return false
  
  const current = year * 10000 + month * 100 + day

  let from = null, to = null
  if (filterType.value === 'day' && fromDate.value) {
    const [y, m, d] = fromDate.value.split('-').map(Number)
    from = y * 10000 + m * 100 + d
  }
  if (filterType.value === 'day' && toDate.value) {
    const [y, m, d] = toDate.value.split('-').map(Number)
    to = y * 10000 + m * 100 + d
  }
  if (filterType.value === 'month' && fromMonth.value) {
    const [y, m] = fromMonth.value.split('-').map(Number)
    from = y * 10000 + m * 100 + 1
  }
  if (filterType.value === 'month' && toMonth.value) {
    const [y, m] = toMonth.value.split('-').map(Number)
    to = y * 10000 + m * 100 + new Date(y, m, 0).getDate()
  }
  if (filterType.value === 'year' && fromYear.value) from = fromYear.value * 10000 + 101
  if (filterType.value === 'year' && toYear.value) to = toYear.value * 10000 + 1231

  if (from && to) return current >= from && current <= to
  if (from) return current >= from
  return true
}

function toDateNum(ngayStr) {
  if (!ngayStr) return 0
  const str = String(ngayStr).trim()
  
  let datePart = str
  let timePart = '00:00:00'
  
  // Format: "14:04:00 01/02/2026" (time first, date last)
  if (str.includes(' ')) {
    const parts = str.split(' ')
    datePart = parts[parts.length - 1] // Last part is date
    timePart = parts[0] || '00:00:00'  // First part is time
  }
  
  // Parse date: DD/MM/YYYY
  const dateArr = datePart.split('/')
  if (dateArr.length !== 3) return 0
  const [day, month, year] = dateArr.map(Number)
  if (isNaN(day) || isNaN(month) || isNaN(year)) return 0
  
  // Parse time: HH:MM:SS
  const timeArr = timePart.split(':').map(Number)
  const hour = timeArr[0] || 0
  const minute = timeArr[1] || 0
  const second = timeArr[2] || 0
  
  // Create a number that represents date + time for precise sorting
  // Format: YYYYMMDDHHmmss (14 digits)
  return year * 10000000000 + month * 100000000 + day * 1000000 + hour * 10000 + minute * 100 + second
}

const filteredDonHang = computed(() => {
  if (!baoCao.value) return []
  const kw = searchDonHang.value.toLowerCase()
  return kw ? baoCao.value.chi_tiet_don_hang.filter(d => d.Ma_hoa_don.toLowerCase().includes(kw)) : baoCao.value.chi_tiet_don_hang
})

const sortedDonHang = computed(() => {
  const list = [...filteredDonHang.value]
  const sortOrder = sortDonHangDate.value // Read reactive dependency BEFORE sort callback
  list.sort((a, b) => {
    const aNum = toDateNum(a.Ngay_tao)
    const bNum = toDateNum(b.Ngay_tao)
    if (aNum === bNum) return 0
    return sortOrder === 'asc' ? aNum - bNum : bNum - aNum
  })
  return list
})

const filteredHangBanChay = computed(() => {
  if (!baoCao.value) return []
  let r = [...baoCao.value.hang_ban_chay]
  const kw = searchHang.value.toLowerCase()
  if (kw) r = r.filter(h => h.Ten_hang.toLowerCase().includes(kw))
  
  // Ưu tiên bộ lọc được chọn sau cùng
  if (sortHangProfit.value) {
    const asc = sortHangProfit.value === 'profit_asc'
    r.sort((a, b) => asc ? a.Loi_nhuan - b.Loi_nhuan : b.Loi_nhuan - a.Loi_nhuan)
  } else if (sortHangQty.value) {
    const asc = sortHangQty.value === 'qty_asc'
    r.sort((a, b) => asc ? a.So_luong - b.So_luong : b.So_luong - a.So_luong)
  }
  return r
})

const totalPagesDonHang = computed(() => Math.ceil(filteredDonHang.value.length / itemsPerPage) || 1)
const totalPagesHang = computed(() => Math.ceil(filteredHangBanChay.value.length / itemsPerPage) || 1)
const paginatedDonHang = computed(() => sortedDonHang.value.slice((currentPageDonHang.value - 1) * itemsPerPage, currentPageDonHang.value * itemsPerPage))
const paginatedHangBanChay = computed(() => filteredHangBanChay.value.slice((currentPageHang.value - 1) * itemsPerPage, currentPageHang.value * itemsPerPage))


const profitMargin = computed(() => {
  if (!baoCao.value || !baoCao.value.thong_ke.tong_doanh_thu) return 0
  return ((baoCao.value.thong_ke.tong_loi_nhuan / baoCao.value.thong_ke.tong_doanh_thu) * 100).toFixed(1)
})

// ===== SO SÁNH VỚI KỲ TRƯỚC =====
const soSanhKyTruoc = computed(() => {
  if (!allData.value) return { doanhThu: null, loiNhuan: null, donHang: null, sanPham: null }
  
  const { hoa_don_tong_quat = [], hoa_don_chi_tiet = [], don_hang = [] } = allData.value
  
  // Map trạng thái đơn hàng
  const donHangMap = {}
  don_hang.forEach(d => {
    donHangMap[d.Ma_hoa_don] = {
      trang_thai: d.Trang_thai,
      thoi_gian_nhan: d.Thoi_gian_nhan_hang
    }
  })
  
  // Tính khoảng thời gian kỳ trước
  let prevFrom = null, prevTo = null
  
  if (filterType.value === 'day' && fromDate.value && toDate.value) {
    const start = new Date(fromDate.value)
    const end = new Date(toDate.value)
    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1
    
    const prevEnd = new Date(start)
    prevEnd.setDate(prevEnd.getDate() - 1)
    const prevStart = new Date(prevEnd)
    prevStart.setDate(prevStart.getDate() - diff + 1)
    
    prevFrom = prevStart.getFullYear() * 10000 + (prevStart.getMonth() + 1) * 100 + prevStart.getDate()
    prevTo = prevEnd.getFullYear() * 10000 + (prevEnd.getMonth() + 1) * 100 + prevEnd.getDate()
  } else if (filterType.value === 'month' && fromMonth.value && toMonth.value) {
    const [startY, startM] = fromMonth.value.split('-').map(Number)
    const [endY, endM] = toMonth.value.split('-').map(Number)
    const totalMonths = (endY - startY) * 12 + (endM - startM) + 1
    
    let prevEndY = startY, prevEndM = startM - 1
    if (prevEndM < 1) { prevEndM = 12; prevEndY-- }
    
    let prevStartY = prevEndY, prevStartM = prevEndM - totalMonths + 1
    while (prevStartM < 1) { prevStartM += 12; prevStartY-- }
    
    prevFrom = prevStartY * 10000 + prevStartM * 100 + 1
    prevTo = prevEndY * 10000 + prevEndM * 100 + new Date(prevEndY, prevEndM, 0).getDate()
  } else if (filterType.value === 'year' && fromYear.value && toYear.value) {
    const totalYears = toYear.value - fromYear.value + 1
    prevFrom = (fromYear.value - totalYears) * 10000 + 101
    prevTo = (fromYear.value - 1) * 10000 + 1231
  }
  
  if (!prevFrom || !prevTo) return { doanhThu: null, loiNhuan: null, donHang: null, sanPham: null }
  
  // Hàm check ngày trong kỳ trước
  const isInPrevPeriod = (dateStr) => {
    if (!dateStr) return false
    let datePart = dateStr.trim()
    if (datePart.includes(' ')) datePart = datePart.split(' ').pop()
    const parts = datePart.split('/')
    if (parts.length !== 3) return false
    const [day, month, year] = parts.map(Number)
    const current = year * 10000 + month * 100 + day
    return current >= prevFrom && current <= prevTo
  }
  
  // Tính data kỳ trước
  let prevDoanhThu = 0, prevLoiNhuan = 0, prevDonHang = 0
  const prevSanPham = {}
  
  hoa_don_tong_quat.forEach(hd => {
    const donInfo = donHangMap[hd.Ma_hoa_don]
    if (!donInfo || donInfo.trang_thai !== 'Hoàn thành') return
    if (!isInPrevPeriod(donInfo.thoi_gian_nhan)) return
    
    prevDoanhThu += Number(hd.Tong_cong || 0)
    prevLoiNhuan += Number(hd.Tong_loi_nhuan || 0)
    prevDonHang++
  })
  
  hoa_don_chi_tiet.forEach(ct => {
    if (ct.Trang_thai_don !== 'Hoàn thành') return
    if (!isInPrevPeriod(ct.Thoi_gian_nhan_hang)) return
    prevSanPham[ct.Ma_hang] = (prevSanPham[ct.Ma_hang] || 0) + Number(ct.So_luong || 0)
  })
  
  const prevTongSanPham = Object.values(prevSanPham).reduce((a, b) => a + b, 0)
  
  // Tính % thay đổi
  const calcChange = (current, prev) => {
    if (prev === 0) return current > 0 ? 100 : 0
    return ((current - prev) / prev * 100).toFixed(1)
  }
  
  const tk = baoCao.value?.thong_ke || {}
  
  return {
    doanhThu: { 
      change: calcChange(tk.tong_doanh_thu || 0, prevDoanhThu),
      prev: prevDoanhThu
    },
    loiNhuan: { 
      change: calcChange(tk.tong_loi_nhuan || 0, prevLoiNhuan),
      prev: prevLoiNhuan
    },
    donHang: { 
      change: calcChange(tk.tong_don_hoan_thanh || 0, prevDonHang),
      prev: prevDonHang
    },
    sanPham: { 
      change: calcChange(tongSanPhamBan.value, prevTongSanPham),
      prev: prevTongSanPham
    }
  }
})

// Label mô tả kỳ trước cụ thể
const periodLabel = computed(() => {
  if (filterType.value === 'day' && fromDate.value && toDate.value) {
    const start = new Date(fromDate.value)
    const end = new Date(toDate.value)
    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1
    return `${diff} ngày trước`
  } else if (filterType.value === 'month' && fromMonth.value && toMonth.value) {
    const [startY, startM] = fromMonth.value.split('-').map(Number)
    const [endY, endM] = toMonth.value.split('-').map(Number)
    const totalMonths = (endY - startY) * 12 + (endM - startM) + 1
    return `${totalMonths} tháng trước`
  } else if (filterType.value === 'year' && fromYear.value && toYear.value) {
    const totalYears = toYear.value - fromYear.value + 1
    return `${totalYears} năm trước`
  }
  return 'kỳ trước'
})

// Helper tạo trend HTML với mũi tên
const getTrendHtml = (change) => {
  const num = parseFloat(change)
  const label = periodLabel.value
  if (isNaN(num)) return `<span class="text-gray">—</span>`
  if (num > 0) return `<span class="text-green"><i class="app-ico ri-arrow-up-line"></i> ${num}% so với ${label}</span>`
  if (num < 0) return `<span class="text-red"><i class="app-ico ri-arrow-down-line"></i> ${Math.abs(num)}% so với ${label}</span>`
  return `<span class="text-gray"><i class="app-ico ri-subtract-line"></i> 0% so với ${label}</span>`
}

const maxSoLuong = computed(() => Math.max(...(baoCao.value?.hang_ban_chay.map(h => h.So_luong) || [1])))
const tongThanhTienModal = computed(() => chiTietDon.value.reduce((s, i) => s + Number(i.Thanh_tien || 0), 0))
const tongLoiNhuanModal = computed(() => chiTietDon.value.reduce((s, i) => s + Number(i.Loi_nhuan || 0), 0))

// Methods
function formatMoney(v) { return `${new Intl.NumberFormat('vi-VN').format(v || 0)} ${donViTienTe.value}` }
function formatProfit(v) {
  const num = Number(v || 0)
  const formatted = new Intl.NumberFormat('vi-VN').format(Math.abs(num)) + ' ' + donViTienTe.value
  if (num > 0) return `<i class="app-ico ri-arrow-up-line"></i> ${formatted}`
  if (num < 0) return `<i class="app-ico ri-arrow-down-line"></i> ${formatted}`
  return formatted
}
function getProfitClass(v) {
  const num = Number(v || 0)
  if (num > 0) return 'text-success'
  if (num < 0) return 'text-danger'
  return 'text-gray'
}
function formatMoneyShort(v) { 
  if (v >= 1e9) return (v/1e9).toFixed(1) + 'B'
  if (v >= 1e6) return (v/1e6).toFixed(1) + 'M'
  if (v >= 1e3) return (v/1e3).toFixed(1) + 'K'
  return v.toFixed(0)
}
function getProgressWidth(sl) { return `${(sl / maxSoLuong.value) * 100}%` }
function getRankClass(index) {
  const rank = (currentPageHang.value - 1) * itemsPerPage + index + 1
  if (rank === 1) return 'rank-1'
  if (rank === 2) return 'rank-2'
  if (rank === 3) return 'rank-3'
  return ''
}
function getRankIndex(i) { const idx = (currentPageHang.value - 1) * itemsPerPage + i + 1; return idx <= 3 ? idx : 4 }
function getRankIcon(i) { const idx = (currentPageHang.value - 1) * itemsPerPage + i + 1; return idx === 1 ? 'TOP 1' : idx === 2 ? 'TOP 2' : idx === 3 ? 'TOP 3' : `#${idx}` }

function onFilterTypeChange() { fromDate.value = toDate.value = fromMonth.value = toMonth.value = ''; fromYear.value = toYear.value = null; setDefaultFilter() }

function setDefaultFilter() {
  const t = new Date()
  const pad = n => String(n).padStart(2, '0')
  
  if (filterType.value === 'day') {
    toDate.value = `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}`
    fromDate.value = toDate.value
  } else if (filterType.value === 'month') {
    const from = new Date(t)
    from.setMonth(from.getMonth() - 5)
    fromMonth.value = `${from.getFullYear()}-${pad(from.getMonth() + 1)}`
    toMonth.value = `${t.getFullYear()}-${pad(t.getMonth() + 1)}`
  } else if (filterType.value === 'year') {
    fromYear.value = t.getFullYear() - 2
    toYear.value = t.getFullYear()
  }
}

function resetFilter() { 
  filterType.value = 'day'
  setDefaultFilter()
}

function toggleCard(type) {
  activeCard.value = activeCard.value === type ? null : type
  if (type === 'customers') currentPageCustomers.value = 1
  if (activeCard.value) nextTick(() => renderCharts())
}

function renderCharts() {
  if (!activeCard.value || !window.Chart) return

  // Destroy all instances to be safe
  barChartInstance?.destroy()
  pieChartInstance?.destroy()
  costChartInstance?.destroy() // Destroy cost instance
  allChartInstance?.destroy()
  customerPieInstance?.destroy() // Destroy customer pie instance
  
  barChartInstance = null
  pieChartInstance = null
  costChartInstance = null
  allChartInstance = null
  customerPieInstance = null

  const colors = { 
    revenue: ['#fbbf24', '#f59e0b'], 
    profit: ['#34d399', '#10b981'], 
    orders: ['#60a5fa', '#3b82f6'], 
    products: ['#a78bfa', '#8b5cf6'],
    cost: ['#10b981', '#ef4444'],
    cost_period: ['#10b981', '#ef4444'],
    cost_all: ['#10b981', '#ef4444']
  }
  
  const [c1, c2] = colors[activeCard.value] || ['#ccc', '#ccc']

  // === COST CHART RENDERING (RIÊNG BIỆT) ===
  if (activeCard.value === 'cost_period' || activeCard.value === 'cost_all') {
    nextTick(() => {
      nextTick(() => { // Double nextTick để chắc chắn canvas mount
        const ctx = costBarChart.value?.getContext('2d')
        if (!ctx) {
          console.warn('[COST CHART] Missing canvas context', costBarChart.value)
          return
        }

        if (activeCard.value === 'cost_period') {
           const labels = costByTime.value.map(d => d.label)
           const dtData = costByTime.value.map(d => d.doanh_thu)
           const cppsData = costByTime.value.map(d => d.cpps)

           costChartInstance = new Chart(ctx, {
             type: 'bar',
             data: {
               labels,
               datasets: [
                 {
                   label: 'Doanh thu',
                   data: dtData,
                   backgroundColor: 'rgba(16, 185, 129, 0.7)',
                   borderColor: '#10b981',
                   borderWidth: 2,
                   borderRadius: 4
                 },
                 {
                   label: 'Chi phí',
                   data: cppsData,
                   backgroundColor: 'rgba(239, 68, 68, 0.7)',
                   borderColor: '#ef4444',
                   borderWidth: 2,
                   borderRadius: 4
                 }
               ]
             },
             options: {
               responsive: true,
               maintainAspectRatio: false,
               interaction: { mode: 'index', intersect: false },
               animation: {
                 onComplete: function() {
                   const chart = this
                   const ctx = chart.ctx
                   ctx.font = 'bold 11px Inter, sans-serif'
                   ctx.fillStyle = '#f1f5f9'
                   ctx.textAlign = 'center'
                   ctx.textBaseline = 'bottom'
                   
                   chart.data.datasets.forEach((dataset, i) => {
                     const meta = chart.getDatasetMeta(i)
                     if (!meta.hidden) {
                       meta.data.forEach((bar, index) => {
                         const data = dataset.data[index]
                         if (data > 0) ctx.fillText(formatMoneyShort(data), bar.x, bar.y - 6)
                       })
                     }
                   })
                 }
               },
               plugins: {
                 legend: {
                   display: true, position: 'top',
                   labels: { color: '#ffffff', padding: 15, font: { size: 13, weight: '600' }, usePointStyle: true }
                 },
                 tooltip: {
                   backgroundColor: 'rgba(15,23,42,0.95)',
                   titleColor: '#f1f5f9', bodyColor: '#e2e8f0', borderColor: 'rgba(148, 163, 184, 0.3)', borderWidth: 1, padding: 12, displayColors: true,
                   callbacks: {
                     footer: (tooltipItems) => {
                       const index = tooltipItems[0].dataIndex
                       const dt = dtData[index]
                       const cpps = cppsData[index]
                       const delta = dt - cpps
                       const deltaText = delta > 0 ? `↑ Dư: ${formatMoneyShort(delta)}` : delta === 0 ? '= Hòa vốn' : `↓ Thiếu: ${formatMoneyShort(Math.abs(delta))}`
                       return `\n${deltaText} ${donViTienTe.value}`
                     },
                     label: (context) => {
                       const val = new Intl.NumberFormat('vi-VN').format(context.raw)
                       return `${context.dataset.label}: ${val} ${donViTienTe.value}`
                     }
                   }
                 }
               },
               scales: {
                 x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 11 }, maxRotation: 45 } },
                 y: { grid: { color: 'rgba(148,163,184,0.1)' }, ticks: { color: '#94a3b8', callback: v => v >= 1e6 ? (v/1e6)+'M' : v >= 1e3 ? (v/1e3)+'K' : v } }
               }
             }
           })
        } else {
           // COST ALL
           const ca = costAllTotals.value
           costChartInstance = new Chart(ctx, {
             type: 'bar',
             data: {
               labels: ['Doanh thu (Tất cả)', 'Chi phí (Tất cả)'],
               datasets: [{
                 data: [ca.DT_all, ca.CPPS_all],
                 backgroundColor: ['rgba(16, 185, 129, 0.7)', 'rgba(239, 68, 68, 0.7)'], 
                 borderColor: ['#10b981', '#ef4444'],
                 borderWidth: 2,
                 borderRadius: 4
               }]
             },
             options: {
               responsive: true,
               maintainAspectRatio: false,
               animation: {
                 onComplete: function() {
                   const chart = this
                   const ctx = chart.ctx
                   ctx.font = 'bold 12px Inter, sans-serif'
                   ctx.fillStyle = '#f1f5f9'
                   ctx.textAlign = 'center'
                   ctx.textBaseline = 'bottom'
                   
                   chart.data.datasets.forEach((dataset, i) => {
                     const meta = chart.getDatasetMeta(i)
                     if (!meta.hidden) {
                       meta.data.forEach((bar, index) => {
                         const data = dataset.data[index]
                         if (data > 0) ctx.fillText(formatMoneyShort(data), bar.x, bar.y - 6)
                       })
                     }
                   })
                 }
               },
               plugins: {
                 legend: { display: false },
                 tooltip: {
                   backgroundColor: 'rgba(15,23,42,0.95)',
                   titleColor: '#f1f5f9', bodyColor: '#e2e8f0', borderColor: 'rgba(148, 163, 184, 0.3)', borderWidth: 1, padding: 12,
                   callbacks: {
                     footer: () => {
                       const delta = ca.DT_all - ca.CPPS_all
                       const deltaText = delta > 0 ? `↑ Dư: ${formatMoneyShort(delta)}` : delta === 0 ? '= Hòa vốn' : `↓ Thiếu: ${formatMoneyShort(Math.abs(delta))}`
                       return `\n${deltaText} ${donViTienTe.value}`
                     },
                     label: (context) => {
                       const val = new Intl.NumberFormat('vi-VN').format(context.raw)
                       return `${context.label}: ${val} ${donViTienTe.value}`
                     }
                   }
                 }
               },
               scales: {
                 x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 12 } } },
                 y: { grid: { color: 'rgba(148,163,184,0.1)' }, ticks: { color: '#94a3b8', callback: v => v >= 1e6 ? (v/1e6)+'M' : v >= 1e3 ? (v/1e3)+'K' : v } }
               }
             }
           })
        }
      })
    })
    return
  }



  if (activeCard.value === 'products') {
    nextTick(() => {
      const top10Qty = [...baoCao.value.hang_ban_chay].sort((a, b) => b.So_luong - a.So_luong).slice(0, 10)
      const top10Profit = [...baoCao.value.hang_ban_chay].sort((a, b) => b.Loi_nhuan - a.Loi_nhuan).slice(0, 10)

      const multiColors = [
        '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6',
        '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e'
      ]

      // Biểu đồ số lượng
      const qtyCtx = activeBarChart.value?.getContext('2d')
      if (qtyCtx) {
        const labels = top10Qty.map(h => h.Ten_hang.length > 15 ? h.Ten_hang.slice(0, 15) + '...' : h.Ten_hang)
        const data = top10Qty.map(h => h.So_luong)
        const total = data.reduce((a, b) => a + b, 0)

        barChartInstance = new Chart(qtyCtx, {
          type: 'doughnut',
          data: { labels, datasets: [{ data, backgroundColor: multiColors, borderColor: 'rgba(30,41,59,0.8)', borderWidth: 2, hoverBorderColor: '#ffffff', hoverBorderWidth: 4 }] },
          options: {
            responsive: true, maintainAspectRatio: false, cutout: '50%',
            plugins: {
              legend: { 
                position: 'right', 
                align: 'start',
                onHover: (e) => { e.native.target.style.cursor = 'pointer' },
                onLeave: (e) => { e.native.target.style.cursor = 'default' },
                onClick: (e, legendItem, legend) => {
                  const chart = legend.chart
                  const index = legendItem.index
                  const ds = chart.data.datasets[0]
                  // Reset all borders
                  ds.borderColor = multiColors.map(() => 'rgba(30,41,59,0.8)')
                  ds.borderWidth = multiColors.map(() => 2)
                  // Highlight selected
                  ds.borderColor[index] = '#ffffff'
                  ds.borderWidth[index] = 4
                  chart.update()
                },
                labels: { 
                  color: '#ffffff', 
                  padding: 10, 
                  usePointStyle: true, 
                  font: { size: 11, weight: '500' },
                  generateLabels: (chart) => {
                    const ds = chart.data.datasets[0]
                    return chart.data.labels.map((label, i) => {
                      const pct = ((ds.data[i] / total) * 100).toFixed(1)
                      return {
                        text: `${label}: ${ds.data[i]} SP (${pct}%)`,
                        fillStyle: multiColors[i],
                        strokeStyle: multiColors[i],
                        fontColor: '#ffffff',
                        pointStyle: 'circle',
                        hidden: false,
                        index: i
                      }
                    })
                  }
                } 
              },
              tooltip: { callbacks: { label: ctx => `${ctx.label}: ${ctx.raw} SP (${((ctx.raw/total)*100).toFixed(1)}%)` } }
            },
            animation: {
              duration: 800,
              onComplete() {
                const chart = this, ctx = chart.ctx
                ctx.font = 'bold 11px Inter'
                ctx.textAlign = 'center'
                ctx.textBaseline = 'middle'
                chart.getDatasetMeta(0).data.forEach((arc, i) => {
                  const pct = ((chart.data.datasets[0].data[i] / total) * 100).toFixed(0)
                  if (pct >= 5) {
                    const mid = (arc.startAngle + arc.endAngle) / 2
                    const r = (arc.innerRadius + arc.outerRadius) / 2
                    ctx.fillStyle = '#fff'
                    ctx.fillText(pct + '%', arc.x + Math.cos(mid) * r, arc.y + Math.sin(mid) * r)
                  }
                })
              }
            }
          }
        })
      }

      // Biểu đồ lợi nhuận
      const profitCtx = activePieChart.value?.getContext('2d')
      if (profitCtx) {
        const labels = top10Profit.map(h => h.Ten_hang.length > 15 ? h.Ten_hang.slice(0, 15) + '...' : h.Ten_hang)
        const data = top10Profit.map(h => h.Loi_nhuan)
        const total = data.reduce((a, b) => a + b, 0)

        pieChartInstance = new Chart(profitCtx, {
          type: 'doughnut',
          data: { labels, datasets: [{ data, backgroundColor: multiColors, borderColor: 'rgba(30,41,59,0.8)', borderWidth: 2, hoverBorderColor: '#ffffff', hoverBorderWidth: 4 }] },
          options: {
            responsive: true, maintainAspectRatio: false, cutout: '50%',
            plugins: {
              legend: { 
                position: 'right', 
                align: 'start',
                onHover: (e) => { e.native.target.style.cursor = 'pointer' },
                onLeave: (e) => { e.native.target.style.cursor = 'default' },
                onClick: (e, legendItem, legend) => {
                  const chart = legend.chart
                  const index = legendItem.index
                  const ds = chart.data.datasets[0]
                  // Reset all borders
                  ds.borderColor = multiColors.map(() => 'rgba(30,41,59,0.8)')
                  ds.borderWidth = multiColors.map(() => 2)
                  // Highlight selected
                  ds.borderColor[index] = '#ffffff'
                  ds.borderWidth[index] = 4
                  chart.update()
                },
                labels: { 
                  color: '#ffffff', 
                  padding: 10, 
                  usePointStyle: true, 
                  font: { size: 11, weight: '500' },
                  generateLabels: (chart) => {
                    const ds = chart.data.datasets[0]
                    return chart.data.labels.map((label, i) => {
                      const pct = ((ds.data[i] / total) * 100).toFixed(1)
                      return {
                        text: `${label}: ${formatMoneyShort(ds.data[i])} ${donViTienTe.value} (${pct}%)`,
                        fillStyle: multiColors[i],
                        strokeStyle: multiColors[i],
                        fontColor: '#ffffff',
                        pointStyle: 'circle',
                        hidden: false,
                        index: i
                      }
                    })
                  }
                } 
              },
              tooltip: { callbacks: { label: ctx => `${ctx.label}: ${formatMoneyShort(ctx.raw)} ${donViTienTe.value} (${((ctx.raw/total)*100).toFixed(1)}%)` } }
            },
            animation: {
              duration: 800,
              onComplete() {
                const chart = this, ctx = chart.ctx
                ctx.font = 'bold 11px Inter'
                ctx.textAlign = 'center'
                ctx.textBaseline = 'middle'
                chart.getDatasetMeta(0).data.forEach((arc, i) => {
                  const pct = ((chart.data.datasets[0].data[i] / total) * 100).toFixed(0)
                  if (pct >= 5) {
                    const mid = (arc.startAngle + arc.endAngle) / 2
                    const r = (arc.innerRadius + arc.outerRadius) / 2
                    ctx.fillStyle = '#fff'
                    ctx.fillText(pct + '%', arc.x + Math.cos(mid) * r, arc.y + Math.sin(mid) * r)
                  }
                })
              }
            }
          }
        })
      }
    })
    return
  }

  // === CUSTOMER PIE CHART RENDERING ===
  if (activeCard.value === 'customers') {
    nextTick(() => {
      const ctx = customerPieChart.value?.getContext('2d')
      if (!ctx) {
        console.warn('[CUSTOMER CHART] Canvas context not found')
        return
      }

      const pieData = pieDataCustomers.value
      
      // Handle empty data
      if (!pieData || pieData.labels.length === 0) {
        console.log('[CUSTOMER CHART] No data to display')
        return
      }

      const multiColors = [
        '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6',
        '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#84cc16'
      ]

      const total = pieData.values.reduce((a, b) => a + b, 0)
      
      // Prevent division by zero
      if (total <= 0) {
        console.log('[CUSTOMER CHART] Total is zero, no chart to display')
        return
      }

      customerPieInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: pieData.labels,
          datasets: [{
            data: pieData.values,
            backgroundColor: multiColors,
            borderColor: 'rgba(30,41,59,0.8)',
            borderWidth: 2,
            hoverBorderColor: '#ffffff',
            hoverBorderWidth: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '50%',
          plugins: {
            legend: {
              position: 'right',
              align: 'start',
              onHover: (e) => { e.native.target.style.cursor = 'pointer' },
              onLeave: (e) => { e.native.target.style.cursor = 'default' },
              onClick: (e, legendItem, legend) => {
                const chart = legend.chart
                const index = legendItem.index
                const ds = chart.data.datasets[0]
                ds.borderColor = multiColors.map(() => 'rgba(30,41,59,0.8)')
                ds.borderWidth = multiColors.map(() => 2)
                ds.borderColor[index] = '#ffffff'
                ds.borderWidth[index] = 4
                chart.update()
              },
              labels: {
                color: '#ffffff',
                padding: 15,
                usePointStyle: true,
                font: { size: 13, weight: '600' },
                generateLabels: (chart) => {
                  const ds = chart.data.datasets[0]
                  return chart.data.labels.map((label, i) => {
                    const pct = ((ds.data[i] / total) * 100).toFixed(1)
                    const val = formatMoneyShort(ds.data[i])
                    return {
                      text: `${label}: ${val} ${donViTienTe.value} (${pct}%)`,
                      fillStyle: multiColors[i],
                      strokeStyle: multiColors[i],
                      fontColor: '#ffffff',
                      pointStyle: 'circle',
                      hidden: false,
                      index: i
                    }
                  })
                }
              }
            },
            tooltip: {
              backgroundColor: 'rgba(15,23,42,0.95)',
              callbacks: {
                label: ctx => {
                  const pct = ((ctx.raw / total) * 100).toFixed(1)
                  const val = new Intl.NumberFormat('vi-VN').format(ctx.raw)
                  return `${ctx.label}: ${val} ${donViTienTe.value} (${pct}%)`
                }
              }
            }
          },
          animation: {
            duration: 800,
            onComplete() {
              const chart = this
              const ctx = chart.ctx
              ctx.font = 'bold 11px Inter'
              ctx.textAlign = 'center'
              ctx.textBaseline = 'middle'
              chart.getDatasetMeta(0).data.forEach((arc, i) => {
                const pct = ((chart.data.datasets[0].data[i] / total) * 100).toFixed(0)
                if (pct >= 5) {
                  const mid = (arc.startAngle + arc.endAngle) / 2
                  const r = (arc.innerRadius + arc.outerRadius) / 2
                  ctx.fillStyle = '#fff'
                  ctx.fillText(pct + '%', arc.x + Math.cos(mid) * r, arc.y + Math.sin(mid) * r)
                }
              })
            }
          }
        }
      })
    })
    return
  }

  if (!dataTheoThoiGian.value.length) return

  const labels = dataTheoThoiGian.value.map(d => d.label)
  const key = { revenue: 'doanh_thu', profit: 'loi_nhuan', orders: 'so_don' }[activeCard.value]
  const barData = dataTheoThoiGian.value.map(d => d[key])
  const total = barData.reduce((a, b) => a + b, 0)

  nextTick(() => {
    const barCtx = activeBarChart.value?.getContext('2d')
    if (barCtx) {
      const gradient = barCtx.createLinearGradient(0, 0, 0, 280)
      gradient.addColorStop(0, c1)
      gradient.addColorStop(1, c2 + '40')
      
      barChartInstance = new Chart(barCtx, {
        type: 'bar',
        data: { 
          labels, 
          datasets: [{ 
            data: barData, 
            backgroundColor: gradient, 
            borderColor: c1, 
            borderWidth: 2, 
            borderRadius: 6 
          }] 
        },
        options: {
          responsive: true, 
          maintainAspectRatio: false,
          layout: {
            padding: { top: 30 }
          },
          plugins: { 
            legend: { display: false }, 
            tooltip: { 
              backgroundColor: 'rgba(15,23,42,0.9)', 
              callbacks: { 
                label: ctx => {
                  const val = new Intl.NumberFormat('vi-VN').format(ctx.raw)
                  return activeCard.value === 'orders' ? val + ' đơn' : val + ' ' + donViTienTe.value
                }
              } 
            } 
          },
          scales: {
            x: { 
              grid: { display: false }, 
              ticks: { color: '#94a3b8', font: { size: 10 }, maxRotation: 45 } 
            },
            y: { 
              grid: { color: 'rgba(148,163,184,0.1)' }, 
              ticks: { 
                color: '#94a3b8', 
                callback: v => v >= 1e6 ? (v/1e6)+'M' : v >= 1e3 ? (v/1e3)+'K' : v 
              } 
            }
          },
          animation: {
            duration: 800,
            onComplete() {
              const chart = this, ctx = chart.ctx
              ctx.font = 'bold 11px Inter'
              ctx.fillStyle = '#f1f5f9'
              ctx.textAlign = 'center'
              ctx.textBaseline = 'bottom'
              chart.data.datasets.forEach((ds, i) => {
                chart.getDatasetMeta(i).data.forEach((bar, idx) => {
                  const v = ds.data[idx]
                  const text = v >= 1e6 ? (v/1e6).toFixed(1)+'M' : v >= 1e3 ? (v/1e3).toFixed(1)+'K' : v
                  ctx.fillText(text, bar.x, bar.y - 5)
                })
              })
            }
          }
        }
      })
    }

    const pieCtx = activePieChart.value?.getContext('2d')
    if (pieCtx) {
      // Nhiều màu khác nhau để phân biệt
      const multiColors = [
        '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6',
        '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e',
        '#84cc16', '#10b981', '#0ea5e9', '#6366f1', '#d946ef'
      ]
      const pieColors = barData.map((_, i) => multiColors[i % multiColors.length])
      const unit = activeCard.value === 'orders' ? ' đơn' : ' ' + donViTienTe.value

      pieChartInstance = new Chart(pieCtx, {
        type: 'doughnut',
        data: { 
          labels, 
          datasets: [{ 
            data: barData, 
            backgroundColor: pieColors,
            borderColor: 'rgba(30,41,59,0.8)', 
            borderWidth: 2,
            hoverBorderColor: '#ffffff',
            hoverBorderWidth: 4
          }] 
        },
        options: {
          responsive: true, 
          maintainAspectRatio: false, 
          cutout: '55%',
          plugins: {
            legend: { 
              position: 'bottom',
              onHover: (e) => { e.native.target.style.cursor = 'pointer' },
              onLeave: (e) => { e.native.target.style.cursor = 'default' },
              onClick: (e, legendItem, legend) => {
                const chart = legend.chart
                const index = legendItem.index
                const ds = chart.data.datasets[0]
                // Reset all borders
                ds.borderColor = pieColors.map(() => 'rgba(30,41,59,0.8)')
                ds.borderWidth = pieColors.map(() => 2)
                // Highlight selected
                ds.borderColor[index] = '#ffffff'
                ds.borderWidth[index] = 4
                chart.update()
              },
              labels: { 
                color: '#ffffff', 
                padding: 10, 
                usePointStyle: true, 
                font: { size: 11, weight: '500' },
                generateLabels: (chart) => {
                  const ds = chart.data.datasets[0]
                  return chart.data.labels.map((label, i) => {
                    const pct = ((ds.data[i] / total) * 100).toFixed(1)
                    const val = ds.data[i] >= 1e6 ? (ds.data[i]/1e6).toFixed(1)+'M' : ds.data[i] >= 1e3 ? (ds.data[i]/1e3).toFixed(1)+'K' : ds.data[i]
                    return {
                      text: `${label}: ${val}${unit} (${pct}%)`,
                      fillStyle: pieColors[i],
                      strokeStyle: pieColors[i],
                      fontColor: '#ffffff',
                      pointStyle: 'circle',
                      hidden: false,
                      index: i
                    }
                  })
                }
              } 
            },
            tooltip: { 
              callbacks: { 
                label: ctx => {
                  const pct = ((ctx.raw/total)*100).toFixed(1)
                  const val = new Intl.NumberFormat('vi-VN').format(ctx.raw)
                  return `${ctx.label}: ${val}${unit} (${pct}%)`
                }
              } 
            }
          },
          animation: {
            duration: 800,
            onComplete() {
              const chart = this, ctx = chart.ctx
              ctx.font = 'bold 10px Inter'
              ctx.textAlign = 'center'
              ctx.textBaseline = 'middle'
              chart.getDatasetMeta(0).data.forEach((arc, i) => {
                const pct = ((chart.data.datasets[0].data[i] / total) * 100).toFixed(0)
                if (pct >= 5) {
                  const mid = (arc.startAngle + arc.endAngle) / 2
                  const r = (arc.innerRadius + arc.outerRadius) / 2
                  ctx.fillStyle = '#fff'
                  ctx.fillText(pct + '%', arc.x + Math.cos(mid) * r, arc.y + Math.sin(mid) * r)
                }
              })
            }
          }
        }
      })
    }
  })
}

async function loadBaoCao() {
  loading.value = true
  try {
    const res = await fetch(`${API_URL}?action=all`)
    const data = await res.json()
    if (data.success) {
      allData.value = data.data
      // DEBUG: Kiểm tra CPPS data
      console.log('[CPPS TEST] First so_thu_chi record:', allData.value?.so_thu_chi?.[0])
      nextTick(() => {
        console.log('[CPPS SUM KY]', costTotals.value.CPPS_ky)
        console.log('[CPPS SUM ALL]', costAllTotals.value.CPPS_all)
      })
    }
    else alert('Lỗi: ' + (data.message || data.error))
  } catch (e) { console.error(e); alert('Lỗi kết nối API') }
  finally { loading.value = false }
}

function viewChiTietDon(ma) {
  selectedMaHoaDon.value = ma
  showModalChiTiet.value = true
  chiTietDon.value = (allData.value?.hoa_don_chi_tiet || []).filter(ct => ct.Ma_hoa_don === ma)
  const dh = (allData.value?.don_hang || []).find(d => d.Ma_hoa_don === ma)
  if (dh) {
    const kh = (allData.value?.khach_hang || []).find(k => k.Ma_khach_hang === dh.Ma_khach_hang)
    thongTinKhachHang.value = { Ten_khach_hang: kh?.Ten_khach_hang || dh.Ma_khach_hang, So_dien_thoai: dh.So_dien_thoai || '-', Dia_chi: dh.Dia_chi || '-' }
  }
}

function closeModal() { showModalChiTiet.value = false; selectedMaHoaDon.value = ''; chiTietDon.value = []; thongTinKhachHang.value = null }

watch([filterType, fromDate, toDate, fromMonth, toMonth, fromYear, toYear], () => { 
  if (activeCard.value) nextTick(() => renderCharts()) 
})
watch([searchDonHang, sortDonHangDate], () => currentPageDonHang.value = 1)
watch([searchHang, sortHangQty, sortHangProfit], () => currentPageHang.value = 1)

// Khi chọn 1 bộ lọc thì reset bộ lọc còn lại
watch(sortHangQty, (val) => { if (val) sortHangProfit.value = '' })
watch(sortHangProfit, (val) => { if (val) sortHangQty.value = '' })

// Watch customer metric change to re-render pie chart
watch(activeCustomerMetric, () => {
  if (activeCard.value === 'customers') {
    nextTick(() => renderCharts())
  }
})

onMounted(async () => {
  setDefaultFilter()
  // Close dropdowns on outside click
  window.addEventListener('click', () => { activeDropdown.value = '' })

  if (!window.Chart) {
    await new Promise(r => { 
      const s = document.createElement('script')
      s.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js'
      s.onload = r
      document.head.appendChild(s) 
    })
  }
  loadBaoCao()
  
  // Detect scroll on wrapper
  loadBaoCao()
  
  // Detect scroll on wrapper
  window.addEventListener('scroll', handleScroll, true)
  window.addEventListener('resize', updateMobile)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll, true)
  window.removeEventListener('resize', updateMobile)
})

function handleScroll(e) {
  if (e.target instanceof Element) {
    if (rootEl.value && (e.target.contains(rootEl.value) || e.target === rootEl.value)) {
      scrollContainer.value = e.target
      showScrollTop.value = e.target.scrollTop > 300
    }
  } 
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
</script>

<style scoped>
* { margin: 0; padding: 0; box-sizing: border-box; }
.bao-cao-page { padding: 20px; background: rgb(15, 23, 42); min-height: 100vh; color: #e2e8f0; }
.page-header { background: rgb(30, 41, 59); border-radius: 16px; padding: 20px; margin-bottom: 20px; border: 1px solid rgba(148, 163, 184, 0.1); }
.page-title { font-size: 24px; font-weight: 700; color: #f1f5f9; margin: 0 0 16px 0; display: flex; align-items: center; gap: 10px; }
/* ===== FILTER NEW UI VIP (BUTTON/CHIP) ===== */
.filter-panel {
  display: flex;
  flex-direction: column;
  background: linear-gradient(145deg, rgba(30,41,59,1) 0%, rgba(20,30,48,1) 100%);
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 16px;
  padding: 0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.filter-segment-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  gap: 16px;
  flex-wrap: wrap;
}

.filter-type-segment {
  display: inline-flex;
  padding: 4px;
  background: rgba(148, 163, 184, 0.08); /* Transparent dark slate */
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.1);
}

.seg-btn {
  border: none;
  background: transparent;
  padding: 6px 16px;
  font-size: 13px;
  font-weight: 600;
  color: #94a3b8;
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.seg-btn:hover {
  color: #e2e8f0;
  background: rgba(255, 255, 255, 0.05);
}

.seg-btn.active {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.range-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 700;
  color: #f1f5f9;
  background: rgba(30, 41, 59, 1);
  padding: 10px 24px;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.15);
  margin: 0 auto;
}
.range-badge i { color: #10b981; }

.filter-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(148,163,184,0.15) 50%, transparent 100%);
  width: 100%;
}

.filter-picker-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  flex-wrap: wrap;
}

.picker-group {
  position: relative;
  flex: 1;
  min-width: 180px;
}

.picker-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}
.picker-btn:hover {
  transform: translateY(-2px);
  border-color: rgba(16, 185, 129, 0.4);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.08);
}
.picker-btn.invalid {
  border-color: rgba(239, 68, 68, 0.6);
  background: rgba(239, 68, 68, 0.05);
}

.picker-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(148, 163, 184, 0.1);
  border-radius: 8px;
  color: #94a3b8;
  font-size: 16px;
}
.picker-btn:hover .picker-icon {
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
}
.picker-btn.invalid .picker-icon {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.15);
}

.picker-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.picker-label {
  font-size: 11px;
  color: #64748b;
  font-weight: 600;
  text-transform: uppercase;
}
.picker-value {
  font-size: 14px;
  font-weight: 700;
  color: #f1f5f9;
}

.picker-arrow {
  color: #475569;
  font-size: 18px;
}

.hidden-picker {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  opacity: 0;
  cursor: pointer;
  z-index: -1; /* Behind button but accessible via ref */
}
@media (max-width: 768px) {
  .hidden-picker {
    z-index: 10;
  }
}
.filter-reset-wrapper {
  margin-left: auto;
}
.btn-reset-vip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0 24px;
  background: linear-gradient(135deg, rgba(30,41,59,0.8), rgba(15,23,42,0.8));
  border: 1px solid rgba(16, 185, 129, 0.4);
  border-radius: 999px;
  color: #10b981;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.05);
  height: 54px; /* Match picker btn height roughly */
  white-space: nowrap;
}
.btn-reset-vip:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(16, 185, 129, 0.2);
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.1);
}

/* RESPONSIVE */
@media (max-width: 900px) {
  .filter-segment-row { flex-direction: column; align-items: stretch; gap: 12px; }
  .filter-type-segment { display: flex; text-align: center; }
  .seg-btn { flex: 1; }
  .range-badge { justify-content: center; width: 100%; }
  
  .filter-picker-row { flex-direction: column; align-items: stretch; }
  .picker-arrow { transform: rotate(90deg); align-self: center; margin: 4px 0; }
  .filter-reset-wrapper { width: 100%; margin: 10px 0 0; }
  .btn-reset-vip { width: 100%; justify-content: center; }
}

.range-error {
  padding: 12px 20px 16px;
  color: #f87171;
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  animation: fadeIn 0.3s ease;
}
@keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
.btn { padding: 8px 20px; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; }
.btn-secondary { background: rgb(30, 41, 59); color: #10b981; border: 1px solid #10b981; }
.btn-secondary:hover { background: rgba(16, 185, 129, 0.1); }
.loading-overlay { text-align: center; padding: 60px; background: rgb(30, 41, 59); border-radius: 16px; }
.spinner { width: 40px; height: 40px; border: 3px solid rgba(148, 163, 184, 0.2); border-top-color: #10b981; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 12px; }
@keyframes spin { to { transform: rotate(360deg); } }

.stats-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; margin-bottom: 20px; }
@media (max-width: 1200px) { .stats-cards { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 600px) { .stats-cards { display: flex; flex-direction: column; } }

/* VIP TECH CARD */
.stat-card { 
  background: linear-gradient(145deg, rgb(30, 41, 59) 0%, rgb(20, 30, 48) 100%); 
  border-radius: 16px; 
  padding: 0; 
  border: 1px solid rgba(148, 163, 184, 0.1); 
  cursor: pointer; 
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); 
  position: relative; 
  overflow: hidden;
}
.stat-card::before { 
  content: ''; 
  position: absolute; 
  top: 0; left: 0; right: 0; 
  height: 4px; 
}
.stat-card.revenue::before { background: linear-gradient(90deg, #fbbf24, #f59e0b, #fcd34d); }
.stat-card.profit::before { background: linear-gradient(90deg, #34d399, #10b981, #6ee7b7); }
.stat-card.orders::before { background: linear-gradient(90deg, #60a5fa, #3b82f6, #93c5fd); }
.stat-card.products::before { background: linear-gradient(90deg, #a78bfa, #8b5cf6, #c4b5fd); }
.stat-card.customers::before { background: linear-gradient(90deg, #fb923c, #f97316, #fdba74); } /* Orange */
.stat-card.cost_period::before { background: linear-gradient(90deg, #34d399, #10b981, #6ee7b7); } /* Emerald */
.stat-card.cost_all::before { background: linear-gradient(90deg, #a78bfa, #8b5cf6, #c4b5fd); } /* Violet */
.stat-card .card-glow {
  position: absolute;
  top: -50%; left: -50%;
  width: 200%; height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 60%);
  opacity: 0;
  transition: opacity 0.4s;
}
.stat-card:hover .card-glow { opacity: 1; }
.stat-card:hover { 
  transform: translateY(-6px) scale(1.02); 
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), 0 0 30px rgba(16, 185, 129, 0.1);
  border-color: rgba(148, 163, 184, 0.2);
}
/* Active state với viền màu theo header */
.stat-card.active.revenue { 
  border-color: #f59e0b; 
  box-shadow: 0 0 25px rgba(245, 158, 11, 0.4), 0 10px 30px rgba(0, 0, 0, 0.3); 
}
.stat-card.active.profit { 
  border-color: #10b981; 
  box-shadow: 0 0 25px rgba(16, 185, 129, 0.4), 0 10px 30px rgba(0, 0, 0, 0.3); 
}
.stat-card.active.orders { 
  border-color: #3b82f6; 
  box-shadow: 0 0 25px rgba(59, 130, 246, 0.4), 0 10px 30px rgba(0, 0, 0, 0.3); 
}
.stat-card.active.products { 
  border-color: #8b5cf6; 
  box-shadow: 0 0 25px rgba(139, 92, 246, 0.4), 0 10px 30px rgba(0, 0, 0, 0.3); 
}
.stat-card.active.cost { 
  border-color: #f97316; 
  box-shadow: 0 0 25px rgba(249, 115, 22, 0.4), 0 10px 30px rgba(0, 0, 0, 0.3); 
}
.stat-card .card-content { 
  padding: 20px; 
  position: relative; 
  z-index: 1; 
}
.stat-card .card-header { 
  display: flex; 
  align-items: center; 
  gap: 10px; 
  margin-bottom: 12px; 
}
.stat-card .card-icon { 
  font-size: 28px; 
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
}
.stat-card .card-label { 
  font-size: 12px; 
  font-weight: 600; 
  color: #94a3b8; 
  text-transform: uppercase; 
  letter-spacing: 0.5px;
}
.stat-card .card-value { 
  font-size: 22px; 
  font-weight: 800; 
  color: #f1f5f9; 
  margin-bottom: 8px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.2);
}
.stat-card .card-sub { 
  font-size: 12px; 
  color: #94a3b8; 
  margin-bottom: 4px;
}
.stat-card .card-footer { margin-top: 8px; }
.stat-card .card-trend { 
  font-size: 11px; 
  color: #10b981; 
  font-weight: 500;
}
/* Màu cho text trong card - dùng :deep() cho v-html */
.stat-card .card-sub :deep(.text-green), 
.stat-card .card-trend :deep(.text-green),
.text-green { color: #10b981 !important; }

.stat-card .card-sub :deep(.text-blue), 
.stat-card .card-trend :deep(.text-blue),
.text-blue { color: #3b82f6 !important; }

.stat-card .card-sub :deep(.text-red), 
.stat-card .card-trend :deep(.text-red),
.text-red { color: #ef4444 !important; }

.stat-card .card-sub :deep(.text-gray), 
.stat-card .card-trend :deep(.text-gray),
.text-gray { color: #94a3b8 !important; }

.stat-card .card-sub :deep(.text-yellow), 
.stat-card .card-trend :deep(.text-yellow),
.text-yellow { color: #eab308 !important; }

.stat-card .card-indicator { 
  position: absolute; 
  bottom: 8px; 
  left: 50%; 
  transform: translateX(-50%); 
  color: #10b981; 
  animation: bounce 1s infinite; 
}
@keyframes bounce { 0%, 100% { transform: translateX(-50%) translateY(0); } 50% { transform: translateX(-50%) translateY(3px); } }

.charts-section { background: rgb(30, 41, 59); border-radius: 14px; padding: 20px; margin-bottom: 20px; border: 1px solid rgba(16, 185, 129, 0.3); position: relative; animation: slideDown 0.3s ease; grid-column: 1 / -1; width: 100%; box-sizing: border-box; }
.mobile-chart-dest { display: none; }
@media (max-width: 768px) {
  .mobile-chart-dest { 
    display: block; 
    width: 100%; 
    grid-column: auto; /* Reset grid column if in flex */
    margin-top: 12px;
  }
  .charts-section {
    padding: 16px;
    margin-bottom: 0;
  }
}
@keyframes slideDown { from { opacity: 0; transform: translateY(-16px); } to { opacity: 1; transform: translateY(0); } }
.close-charts-btn { position: absolute; top: 12px; right: 12px; width: 28px; height: 28px; border-radius: 50%; background: rgb(15, 23, 42); border: 1px solid rgba(148, 163, 184, 0.2); color: #94a3b8; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 10; }
.close-charts-btn:hover { border-color: #ef4444; color: #ef4444; }
.charts-header { display: flex; flex-direction: column; align-items: center; margin-bottom: 16px; gap: 12px; position: relative; padding-right: 36px; width: 100%; }
.charts-title { font-size: 16px; font-weight: 700; color: #f1f5f9; margin: 0; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; justify-content: center; }
.charts-summary-center { display: flex; justify-content: center; gap: 20px; background: rgb(15, 23, 42); padding: 10px 20px; border-radius: 10px; flex-wrap: wrap; width: 100%; }
.summary-item { display: flex; align-items: center; gap: 6px; }
/* ===== MOBILE ORDER LIST (BAOCAO) ===== */
.mobile-order-list {
  display: none;
}

.desktop-only-table {
  display: block;
}

@media (max-width: 768px) {
  .desktop-only-table {
    display: none !important;
  }

  .mobile-order-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .mo-card {
    background: rgba(148, 163, 184, 0.05);
    border: 1px solid rgba(148, 163, 184, 0.1);
    border-radius: 12px;
    padding: 14px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .mo-card:active {
    background: rgba(148, 163, 184, 0.1);
  }

  .mo-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 8px;
  }

  .mo-stt {
    font-size: 11px;
    font-weight: 700;
    color: #94a3b8;
    background: rgba(148, 163, 184, 0.1);
    padding: 2px 6px;
    border-radius: 4px;
  }

  .mo-code {
    font-size: 14px;
    font-weight: 700;
    color: #10b981;
    font-family: 'JetBrains Mono', monospace;
  }

  .mo-date {
    font-size: 12px;
    color: #94a3b8;
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 12px;
  }

  .mo-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-top: 1px dashed rgba(148, 163, 184, 0.15);
    padding-top: 10px;
  }

  .mo-money, .mo-profit {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .mo-profit {
    align-items: flex-end;
  }

  .mo-label {
    font-size: 10px;
    text-transform: uppercase;
    color: #64748b;
    font-weight: 600;
  }

  .mo-val {
    font-size: 15px;
    font-weight: 800;
    font-family: 'JetBrains Mono', monospace;
  }

  .mo-money .mo-val { color: #f1f5f9; }
  .mo-profit.text-success .mo-val { color: #10b981; }
  .mo-profit.text-danger .mo-val { color: #ef4444; }
}

.summary-label { font-size: 12px; color: #94a3b8; }
.summary-value { font-size: 14px; font-weight: 700; color: #10b981; }
.charts-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
@media (max-width: 900px) { .charts-row { grid-template-columns: 1fr; } }
.chart-box { background: rgb(15, 23, 42); border-radius: 10px; padding: 16px; border: 1px solid rgba(148, 163, 184, 0.1); min-width: 0; max-width: 100%; }
.chart-box.full-width { max-width: 700px; margin: 0 auto; }
.chart-box-title { font-size: 13px; font-weight: 600; color: #94a3b8; margin-bottom: 12px; }
.chart-container { height: 260px; position: relative; width: 100%; }
.chart-container.large { height: 350px; }
.pie-container { display: flex; align-items: center; justify-content: center; width: 100%; position: relative; }

/* Chart footnotes for cost analysis */
.chart-footnote { margin-top: 16px; padding: 14px 16px; background: rgba(148, 163, 184, 0.05); border-radius: 8px; border: 1px solid rgba(148, 163, 184, 0.1); }
.footnote-row { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 8px; }
.footnote-row:last-child { margin-bottom: 0; }
.footnote-label { font-size: 12px; font-weight: 600; color: #94a3b8; min-width: 130px; }
.footnote-value { font-size: 13px; color: #cbd5e1; flex: 1; }

.section-panel { background: rgb(30, 41, 59); border-radius: 14px; margin-bottom: 20px; border: 1px solid rgba(148, 163, 184, 0.1); overflow: hidden; }
.section-header { padding: 16px 20px; border-bottom: 1px solid rgba(148, 163, 184, 0.1); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; }
.section-header h2 { font-size: 15px; font-weight: 700; color: #f1f5f9; margin: 0; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.time-badge { font-size: 11px; font-weight: 500; color: #10b981; background: rgba(16, 185, 129, 0.15); padding: 2px 8px; border-radius: 10px; }
.count-badge { font-size: 12px; font-weight: 600; color: #94a3b8; background: rgb(15, 23, 42); padding: 4px 10px; border-radius: 6px; }
.btn-toggle { padding: 6px 12px; background: rgb(15, 23, 42); border: 1px solid rgba(148, 163, 184, 0.2); border-radius: 6px; font-size: 12px; color: #94a3b8; cursor: pointer; }
.btn-toggle:hover { border-color: #10b981; color: #10b981; }
.section-content { padding: 16px; }
.search-bar, .search-filter-bar { margin-bottom: 12px; display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
.search-wrapper { position: relative; flex: 1; min-width: 150px; }
.search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #94a3b8; font-size: 14px; }
.search-input-vip { width: 100%; padding: 10px 12px 10px 36px; background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(148, 163, 184, 0.2); border-radius: 10px; color: #f1f5f9; font-size: 13px; transition: all 0.2s; }
.search-input-vip:focus { outline: none; border-color: #10b981; background: rgba(15, 23, 42, 0.8); box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.1); }

.sort-actions { display: flex; gap: 8px; }
.sort-picker-container { position: relative; }
.sort-pill { 
  display: flex; align-items: center; gap: 8px; padding: 8px 14px; 
  background: rgba(30, 41, 59, 0.6); border: 1px solid rgba(148, 163, 184, 0.2); 
  border-radius: 999px; color: #94a3b8; font-size: 12px; font-weight: 600; 
  cursor: pointer; transition: all 0.3s ease; position: relative; z-index: 10; 
}
.sort-pill:hover { border-color: rgba(16, 185, 129, 0.5); color: #f1f5f9; background: rgba(30, 41, 59, 1); }
.sort-pill.active { background: rgba(16, 185, 129, 0.1); border-color: #10b981; color: #10b981; }
.sort-pill.open { border-color: #10b981; box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.1); }
.sort-pill .arrow-icon { font-size: 14px; transition: transform 0.3s; color: #475569; }
.sort-pill.open .arrow-icon, .picker-btn.open .arrow-icon { transform: rotate(180deg); color: #10b981; }

.picker-btn .arrow-icon { margin-left: auto; color: #475569; transition: transform 0.3s; }
.picker-btn:hover .arrow-icon { color: #10b981; }

.dropdown-list { 
  position: absolute; top: calc(100% + 8px); left: 0; min-width: 140px; 
  background: rgb(30, 41, 59); border: 1px solid rgba(148, 163, 184, 0.2); 
  border-radius: 12px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5); 
  padding: 6px; z-index: 100; animation: dropdownScale 0.2s ease-out; 
}
@keyframes dropdownScale { from { opacity: 0; transform: translateY(-10px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }

.dropdown-item { 
  padding: 8px 12px; border-radius: 8px; font-size: 12px; font-weight: 500; 
  color: #94a3b8; cursor: pointer; transition: all 0.2s; 
}
.dropdown-item:hover { background: rgba(16, 185, 129, 0.1); color: #10b981; }
.dropdown-item.selected { background: rgba(16, 185, 129, 0.2); color: #10b981; font-weight: 700; }

.dropdown-list.scrollable { max-height: 200px; overflow-y: auto; }
.dropdown-list.scrollable::-webkit-scrollbar { width: 4px; }
.dropdown-list.scrollable::-webkit-scrollbar-track { background: transparent; }
.dropdown-list.scrollable::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.3); border-radius: 10px; }

.select-input.small { flex: 0 0 auto; width: auto; min-width: 110px; }
.tables-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
@media (max-width: 1100px) { .tables-row { grid-template-columns: 1fr; } }
.clickable-table tbody tr { cursor: pointer; }
.clickable-row:hover { background: rgba(16, 185, 129, 0.1) !important; }
.table-wrapper { overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table thead { background: rgb(15, 23, 42); border-bottom: 2px solid #10b981; }
.data-table th { padding: 12px 14px; text-align: left; font-size: 12px; font-weight: 600; text-transform: uppercase; color: #94a3b8; }
.data-table tbody tr { border-bottom: 1px solid rgba(148, 163, 184, 0.1); }
.data-table tbody tr:hover { background: rgb(15, 23, 42); }
.data-table td { padding: 12px 14px; font-size: 13px; color: #cbd5e1; }
.text-right { text-align: right !important; }
.text-center { text-align: center !important; }
.text-success { color: #10b981 !important; }
.text-danger { color: #ef4444 !important; }
.font-bold { font-weight: 700; }
.font-medium { font-weight: 500; }
.badge { display: inline-block; padding: 3px 10px; background: rgba(16, 185, 129, 0.2); color: #10b981; border-radius: 16px; font-size: 11px; font-weight: 600; }
.btn-detail { padding: 4px 10px; background: rgba(16, 185, 129, 0.2); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 6px; font-size: 11px; cursor: pointer; }
.btn-detail:hover { background: rgba(16, 185, 129, 0.3); }
.rank { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 50%; font-weight: 700; font-size: 12px; background: rgba(16, 185, 129, 0.2); color: #10b981; }
.rank-1 { background: linear-gradient(135deg, #ffd700, #ffed4e); color: #1e293b; font-size: 16px; }
.rank-2 { background: linear-gradient(135deg, #c0c0c0, #e8e8e8); color: #1e293b; font-size: 16px; }
.rank-3 { background: linear-gradient(135deg, #cd7f32, #daa520); color: #1e293b; font-size: 16px; }
.progress-bar { width: 100%; height: 6px; background: rgba(148, 163, 184, 0.2); border-radius: 8px; overflow: hidden; }
.progress-fill { height: 100%; background: linear-gradient(90deg, #10b981, #34d399); border-radius: 8px; transition: width 0.4s; }
.pagination { display: flex; justify-content: center; align-items: center; gap: 12px; margin-top: 16px; padding-top: 16px; border-top: 1px solid rgba(148, 163, 184, 0.1); }
.btn-page { padding: 6px 12px; background: rgba(16, 185, 129, 0.2); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 6px; font-size: 12px; cursor: pointer; }
.btn-page:hover:not(:disabled) { background: rgba(16, 185, 129, 0.3); }
.btn-page:disabled { opacity: 0.3; cursor: not-allowed; }
.page-info { font-size: 12px; color: #94a3b8; }

.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.8); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 16px; }
.modal-container { background: rgb(30, 41, 59); border-radius: 14px; max-width: 1000px; width: 100%; max-height: 90vh; display: flex; flex-direction: column; border: 1px solid rgba(148, 163, 184, 0.2); }
.modal-header { padding: 16px 20px; border-bottom: 1px solid rgba(148, 163, 184, 0.1); display: flex; justify-content: space-between; align-items: center; }
.modal-header h2 { font-size: 16px; font-weight: 700; color: #f1f5f9; margin: 0; }
.btn-close { width: 32px; height: 32px; border: 1px solid rgba(148, 163, 184, 0.2); background: rgb(15, 23, 42); border-radius: 50%; font-size: 16px; color: #94a3b8; cursor: pointer; }
.btn-close:hover { border-color: #ef4444; color: #ef4444; }
.modal-body { padding: 20px; overflow-y: auto; flex: 1; }
.customer-info { background: rgb(15, 23, 42); border-radius: 10px; padding: 16px; margin-bottom: 16px; border: 1px solid rgba(148, 163, 184, 0.1); }
.customer-info h3 { font-size: 14px; font-weight: 700; color: #f1f5f9; margin: 0 0 12px 0; }
.info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; }
.info-item { display: flex; gap: 6px; font-size: 13px; }
.info-label { font-weight: 600; color: #94a3b8; }
.modal-table th, .modal-table td { padding: 10px 12px; font-size: 12px; }
.total-row { background: rgb(15, 23, 42); }
.total-row td { font-weight: 700; color: #f1f5f9; }
.no-data { text-align: center; padding: 60px 20px; color: #94a3b8; }
.no-data-icon { font-size: 56px; margin-bottom: 12px; }
.no-data h3 { font-size: 18px; margin: 0 0 6px; color: #f1f5f9; }

/* Chart legend hover effect */
.chart-container canvas,
.pie-container canvas { cursor: default; max-width: 100%; }


/* Cost Card Visualization - VIP Style with Deep Selectors */
.stat-card.cost_period .card-sub :deep(.cost-panel),
.stat-card.cost_all .card-sub :deep(.cost-panel) {
  border-radius: 12px;
  padding: 12px;
  margin-top: 10px;
  position: relative;
  transition: all 0.3s ease;
}

/* Period Panel - Simplified (No Background) */
.stat-card.cost_period .card-sub :deep(.cost-panel.period) {
  /* Removed background/border/shadow as requested */
  padding-left: 4px; /* Slight alignment adjustment */
}

/* All-time Panel - Simplified (No Background) */
.stat-card.cost_all .card-sub :deep(.cost-panel.all) {
  /* Removed background/border/shadow as requested */
  padding-left: 4px;
}

/* Panel Chip */
.stat-card.cost_period :deep(.panel-chip),
.stat-card.cost_all :deep(.panel-chip) {
  display: inline-flex;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  margin-bottom: 2px;
}
/* Panel Chip - Minimal VIP Style */
.stat-card.cost_period :deep(.panel-chip.period) {
  border: 1px solid rgba(16, 185, 129, 0.2);
  background: rgba(16, 185, 129, 0.05); /* Very light emerald */
  color: #10b981;
}
.stat-card.cost_all :deep(.panel-chip.all) {
  border: 1px solid rgba(139, 92, 246, 0.2);
  background: rgba(139, 92, 246, 0.05); /* Very light violet */
  color: #8b5cf6;
}

/* Progress Bar Wrapper */
.stat-card.cost_period :deep(.cost-meter-wrap),
.stat-card.cost_all :deep(.cost-meter-wrap) {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

/* Meter Label */
.stat-card.cost_period :deep(.cost-meter-label),
.stat-card.cost_all :deep(.cost-meter-label) {
  font-size: 10px;
  font-weight: 700;
  color: #94a3b8;
  font-family: inherit;
}

/* Meter Track */
.stat-card.cost_period :deep(.cost-meter),
.stat-card.cost_all :deep(.cost-meter) {
  height: 7px;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.18);
  overflow: hidden;
  position: relative;
}

/* Meter Fill */
.stat-card.cost_period :deep(.meter-fill),
.stat-card.cost_all :deep(.meter-fill) {
  height: 100%;
  border-radius: 999px;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Period Fill: Emerald Glow */
.stat-card.cost_period :deep(.meter-fill.period) {
  background: linear-gradient(90deg, #10b981, #34d399);
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
}

/* All Fill: Striped Violet */
.stat-card.cost_all :deep(.meter-fill.all) {
  background: repeating-linear-gradient(
    45deg, 
    rgba(139, 92, 246, 0.9), 
    rgba(139, 92, 246, 0.9) 6px, 
    rgba(139, 92, 246, 0.55) 6px, 
    rgba(139, 92, 246, 0.55) 12px
  );
  box-shadow: 0 0 10px rgba(139, 92, 246, 0.4);
}

/* Text Colors helper for v-html */
.stat-card.cost_period :deep(.text-green), .stat-card.cost_all :deep(.text-green) { color: #10b981 !important; }
.stat-card.cost_period :deep(.text-yellow), .stat-card.cost_all :deep(.text-yellow) { color: #eab308 !important; }
.stat-card.cost_period :deep(.text-red), .stat-card.cost_all :deep(.text-red) { color: #ef4444 !important; }
.stat-card.cost_period :deep(.text-blue), .stat-card.cost_all :deep(.text-blue) { color: #3b82f6 !important; }
.stat-card.cost_period :deep(.text-gray), .stat-card.cost_all :deep(.text-gray) { color: #94a3b8 !important; }

/* Cost Chart Full Width Override */
.charts-row.cost-row {
  grid-template-columns: 1fr !important;
}

.charts-row.cost-row .chart-box {
  grid-column: 1 / -1;
  width: 100%;
  max-width: none;
}

.charts-row.cost-row .chart-container {
  height: 340px;
}

/* Card Header Layout */
.stat-card .card-header {
  display: flex !important;
  align-items: flex-start !important;
  gap: 10px;
}

.stat-card .card-icon {
  flex: 0 0 auto;
}

.stat-card .card-head {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* Card Time Badge */
.card-time-badge {
  display: inline-block;
  font-size: 10px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  background: rgba(255, 255, 255, 0.08);
  padding: 2px 8px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  white-space: nowrap;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Progress Level Colors */
.stat-card.cost_period :deep(.meter-fill.level-red), .stat-card.cost_all :deep(.meter-fill.level-red) {
  background: linear-gradient(90deg, #ef4444, #f87171);
  box-shadow: 0 0 10px rgba(239, 68, 68, 0.4);
}
.stat-card.cost_period :deep(.meter-fill.level-yellow), .stat-card.cost_all :deep(.meter-fill.level-yellow) {
  background: linear-gradient(90deg, #eab308, #facc15);
  box-shadow: 0 0 10px rgba(234, 179, 8, 0.4);
}
.stat-card.cost_period :deep(.meter-fill.level-green), .stat-card.cost_all :deep(.meter-fill.level-green) {
  background: linear-gradient(90deg, #10b981, #4ade80);
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.4);
}

/* Custom Summary Colors */
.summary-value.sum-red { color: #ef4444 !important; }
.summary-value.sum-green { color: #10b981 !important; }

/* Remix Icon Styles */
.card-icon, .page-title-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
}

.card-icon {
  font-size: 28px;
  width: 32px;
  height: 32px;
}

.page-title-icon {
  font-size: 24px;
  margin-right: 8px;
  color: #34d399;
}

/* Card Icon Colors specifically */
.stat-card.revenue .card-icon { color: #f59e0b; }
.stat-card.profit .card-icon { color: #10b981; }
.stat-card.orders .card-icon { color: #3b82f6; }
.stat-card.products .card-icon { color: #8b5cf6; }
.stat-card.cost_period .card-icon { color: #10b981; }
.stat-card.cost_all .card-icon { color: #8b5cf6; }
.stat-card.customers .card-icon { color: #f97316; }

/* Active state for customers card */
.stat-card.active.customers { 
  border-color: #f97316; 
  box-shadow: 0 0 25px rgba(249, 115, 22, 0.4), 0 10px 30px rgba(0, 0, 0, 0.3); 
}

/* Customer Metric Toggle Buttons */
.btn-toggle-metric {
  padding: 6px 12px;
  background: rgba(148, 163, 184, 0.08);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-toggle-metric:hover {
  background: rgba(249, 115, 22, 0.1);
  border-color: #f97316;
  color: #f97316;
}

.btn-toggle-metric.active {
  background: rgba(249, 115, 22, 0.2);
  border-color: #f97316;
  color: #f97316;
  box-shadow: 0 0 10px rgba(249, 115, 22, 0.3);
}

/* Customer Table Top 10 Highlighting */
.customer-table tbody tr.top-10-row {
  background: rgba(249, 115, 22, 0.05);
  border-left: 3px solid #f97316;
}

.customer-table tbody tr.top-10-row:hover {
  background: rgba(249, 115, 22, 0.12) !important;
}

@media (max-width: 768px) { .filter-row { flex-direction: column; } .filter-item { width: 100%; } .charts-header { flex-direction: column; align-items: flex-start; } }

.no-data-icon .app-ico {
  font-size: 56px;
}
.text-white { color: #f1f5f9 !important; }

/* Vertically center the customer pie chart */
.chart-box.customer-pie-box {
  display: flex;
  flex-direction: column;
}
.chart-box.customer-pie-box .pie-container {
  margin-top: auto;
  margin-bottom: auto;
  padding-bottom: 20px; /* Slight optical adjustment */
}

/* ===== FIX: KHUNG BẢNG CỐ ĐỊNH KHI PAGINATION ===== */
/* 1) Chuẩn hoá chiều cao row để tính ổn định */
.data-table th { height: 44px; }
.data-table td { height: 44px; }

/* 2) Table wrapper có chiều cao cố định + scroll dọc */
.section-panel .table-wrapper,
.table-wrapper.fixed-10-rows {
  /* 44(header) + 11 rows*44 = 528px. Cộng thêm 20px dư */
  min-height: calc(44px + 11 * 44px + 20px);
  max-height: calc(44px + 11 * 44px + 20px);
  overflow-y: auto;
  overflow-x: auto;
  border-radius: 10px;
}

/* 3) Đảm bảo table không làm co wrapper */
.section-panel .table-wrapper .data-table,
.table-wrapper.fixed-10-rows .data-table {
  width: 100%;
}

/* 4) Làm scrollbar nhìn tech */
.table-wrapper::-webkit-scrollbar {
  height: 10px;
  width: 10px;
}
.table-wrapper::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.25);
  border-radius: 999px;
}
.table-wrapper::-webkit-scrollbar-thumb:hover {
  background: rgba(148, 163, 184, 0.35);
}
</style>

<style scoped>
/* ===== MOBILE PRODUCT LIST (BAOCAO) ===== */
.mobile-product-list {
  display: none;
}

@media (max-width: 768px) {
  .mobile-product-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .mp-card {
    background: rgba(148, 163, 184, 0.05);
    border: 1px solid rgba(148, 163, 184, 0.1);
    border-radius: 12px;
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .mp-header {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    margin-bottom: 4px;
  }

  .rank-badge {
    font-size: 11px;
    font-weight: 700;
    color: #94a3b8;
    background: rgba(148, 163, 184, 0.1);
    padding: 2px 6px;
    border-radius: 4px;
    min-width: 24px;
    text-align: center;
    margin-top: 2px;
    flex-shrink: 0;
  }
  
  .rank-badge.rank-1 { background: rgba(255, 215, 0, 0.15); color: #fbbf24; border: 1px solid rgba(255, 215, 0, 0.2); }
  .rank-badge.rank-2 { background: rgba(192, 192, 192, 0.15); color: #cbd5e1; border: 1px solid rgba(192, 192, 192, 0.2); }
  .rank-badge.rank-3 { background: rgba(205, 127, 50, 0.15); color: #fdba74; border: 1px solid rgba(205, 127, 50, 0.2); }

  .mp-name {
    font-size: 14px;
    font-weight: 600;
    color: #10b981;
    line-height: 1.4;
  }

  .mp-row {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    padding-left: 34px; /* Align with name (badge width + gap) */
  }
  
  .mp-label {
    font-size: 12px;
    color: #64748b;
  }
  
  .mp-val {
    font-weight: 500;
    color: #cbd5e1;
  }

  .mp-footer {
    margin-top: 8px;
    padding-top: 10px;
    border-top: 1px dashed rgba(148, 163, 184, 0.15);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .mp-stat {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  
  .mp-stat.right {
    align-items: flex-end;
  }

  .mp-stat .mp-label {
    text-transform: uppercase;
    font-size: 10px;
    font-weight: 600;
    color: #64748b;
  }

  .mp-stat .mp-val {
    font-size: 15px;
    font-weight: 700;
    font-family: 'JetBrains Mono', monospace;
  }
  
  .mp-stat .mp-val.qty { color: #f1f5f9; }
  .mp-stat .mp-val.profit.text-success { color: #10b981; }
  .mp-stat .mp-val.profit.text-danger { color: #ef4444; }
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
</style>
