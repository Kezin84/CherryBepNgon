<template>
  <div class="page">
    

    <div class="layout-grid">

      <!-- MOBILE TABS -->
      <div v-if="isMobile" class="mobile-tabs-header">
        <div class="m-tab-item-wrapper" style="position: relative; flex: 1;">
          <button 
            class="m-tab-item" 
            :class="{ active: activeMobileTab === 'entry' }"
            @click="handleEntryTabClick"
            style="width: 100%;"
          >
            <i class="ri-add-circle-line"></i> 
            <span style="font-weight: bold;">Nhập</span>
            <i v-if="activeMobileTab === 'entry'" class="ri-arrow-down-s-fill" style="font-size: 14px; margin-left: -2px;"></i>
          </button>
          
          <!-- New Dropdown for Entry Mode -->
          <div v-if="showMobileEntryMenu" class="mobile-entry-dropdown">
            <div 
              class="me-dropdown-item" 
              :class="{ active: entryMode === 'catalog' }"
              @click="selectMobileEntryMode('catalog')"
            >
              <i class="ri-grid-fill"></i> Có sẵn
            </div>
            <div 
              class="me-dropdown-item" 
              :class="{ active: entryMode === 'manual' }"
              @click="selectMobileEntryMode('manual')"
            >
              <i class="ri-keyboard-box-line"></i> Thủ công
            </div>
          </div>
        </div>
        <button 
          class="m-tab-item" 
          :class="{ active: activeMobileTab === 'order' }"
          @click="setMobileTab('order')"
        >
          <i class="ri-file-list-3-line"></i> giỏ hàng
          <span v-if="totalItemQty > 0" class="m-badge">{{ totalItemQty }}</span>
        </button>
        <button 
          class="m-tab-item" 
          :class="{ active: activeMobileTab === 'customer' }"
          @click="setMobileTab('customer')"
        >
          <i class="ri-user-heart-line"></i> Khách
        </button>
        <button 
          class="m-tab-item" 
          :class="{ active: activeMobileTab === 'payment' }"
          @click="setMobileTab('payment')"
        >
          <i class="ri-wallet-3-line"></i> Thanh Toán
        </button>
      </div>

      <div class="left-stack" v-show="!isMobile || ['entry', 'customer'].includes(activeMobileTab)">

        <div class="box entry-box" v-show="!isMobile || activeMobileTab === 'entry'">

          <!-- HEADER REFACTORED: Unified Toolbar for Catalog Mode -->
          <!-- HEADER REFACTORED: Unified Toolbar for Catalog Mode -->
          <div class="entry-header" v-if="entryMode === 'catalog'" style="padding: 0; background: transparent; border: none; overflow: visible;">
             <div class="catalog-toolbar-unified" style="border-radius: 12px 12px 0 0; width: 100%;">
                
                <!-- === DESKTOP LAYOUT (Unchanged) === -->
                <template v-if="!isMobile">
                  <!-- Row 1: Title & Buttons & Language -->
                  <div class="toolbar-section-title">
                    <div class="header-title-text" style="color: #ffffff; font-weight: 900; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">NHẬP HÀNG</div>
                    <div class="entry-mode-toggle">
                      <button class="mode-btn mode-btn-green active"> <i class="app-ico ri-grid-fill"></i> Có sẵn </button>
                      <button class="mode-btn mode-btn-blue" @click="entryMode = 'manual'"> <i class="app-ico ri-keyboard-box-line"></i> Thủ công </button>
                      
                      <div class="custom-select-wrapper header-lang-select" style="margin-left: 8px;">
                        <select v-model="selectedLang" class="custom-select custom-select-transparent">
                          <option v-for="opt in langOptions" :key="opt.value" :value="opt.value">
                            {{ opt.label }}
                          </option>
                        </select>
                        <span class="lang-label-text">{{ currentLangLabel }}</span>
                        <img :src="currentLangFlagUrl" alt="Lang" class="lang-flag-img" />
                      </div>
                    </div>
                  </div>

                  <!-- Row 2: Search & Filters -->
                  <div class="toolbar-row-2 scrollbar-hide" style="display: flex; flex-direction: row; flex-wrap: nowrap; width: 100%; align-items: center; gap: 8px; overflow-x: auto; overflow-y: hidden; white-space: nowrap;">
                    <!-- Search -->
                    <div class="search-box-unified" style="flex: 1; min-width: 150px; flex-shrink: 0;">
                      <i class="app-ico ri-search-line search-icon"></i>
                      <input v-model="searchProduct" type="text" placeholder="Tìm kiếm..." class="search-input-unified" />
                      <button v-if="searchProduct" class="search-clear" @click="searchProduct = ''"> <i class="app-ico ri-close-line"></i> </button>
                    </div>

                    <!-- Filters -->
                    <div class="filter-item">
                      <div class="custom-select-wrapper">
                        <select v-model="selectedStockStatus" class="custom-select custom-select-cat">
                          <option value="all">Tất cả tình trạng</option>
                          <option value="in">Còn hàng</option>
                          <option value="out">Hết hàng</option>
                        </select>
                      </div>
                    </div>
                    <div class="filter-item">
                      <div class="custom-select-wrapper cat-filter-wrap">
                        <select v-model="selectedCategory" class="custom-select custom-select-cat">
                          <option value="">Danh mục</option>
                          <option v-for="cat in filteredCategories" :key="cat.value" :value="cat.value">
                            {{ cat.label }}
                          </option>
                        </select>
                        <i class="app-ico ri-list-check arrow-icon text-green-400"></i>
                      </div>
                    </div>
                    <div class="filter-item">
                      <div class="custom-select-wrapper">
                        <select v-model="selectedSize" class="custom-select custom-select-green">
                          <option value="">Size</option>
                          <option v-for="s in uniqueSizes" :key="s" :value="s"> {{ s }} </option>
                        </select>
                        <i class="app-ico ri-ruler-2-line arrow-icon text-green-400"></i>
                      </div>
                    </div>
                    <label class="filter-checkbox-btn filter-checkbox-yellow" :class="{ active: onlyPromotion }">
                      <input type="checkbox" v-model="onlyPromotion" class="chk-hidden" />
                      <i class="app-ico" :class="onlyPromotion ? 'ri-checkbox-circle-fill' : 'ri-checkbox-blank-circle-line'"></i>
                      <span>Khuyến mãi</span>
                    </label>
                    <button v-if="hasActiveFilters" class="btn-reset-icon" @click="resetCatalogFilters" title="Reset bộ lọc">
                      <i class="app-ico ri-refresh-line"></i>
                    </button>
                  </div>
                </template>

                <!-- === MOBILE LAYOUT (New Requirement) === -->
                <template v-else>
                  <!-- Row 1: Search Box + Language -->
                  <div class="toolbar-section-title" style="gap: 8px;">
                     <!-- Search Box (Fill space) -->
                     <div class="search-box-unified" style="flex: 1; min-width: 0;">
                        <i class="app-ico ri-search-line search-icon"></i>
                        <input v-model="searchProduct" type="text" placeholder="Tìm kiếm..." class="search-input-unified" />
                        <button v-if="searchProduct" class="search-clear" @click="searchProduct = ''"> <i class="app-ico ri-close-line"></i> </button>
                     </div>

                     <!-- Language Selector (Compact) -->
                     <div class="custom-select-wrapper header-lang-select" style="margin-left: 0; flex-shrink: 0; width: auto;">
                        <select v-model="selectedLang" class="custom-select custom-select-transparent">
                          <option v-for="opt in langOptions" :key="opt.value" :value="opt.value">
                            {{ opt.label }}
                          </option>
                        </select>
                        <span class="lang-label-text">{{ currentLangLabel }}</span>
                        <img :src="currentLangFlagUrl" alt="Lang" class="lang-flag-img" />
                     </div>
                  </div>

                  <!-- Row 2: Filters -->
                  <div class="toolbar-row-2 scrollbar-hide mobile-filters-row" style="display: flex; flex-direction: row; flex-wrap: nowrap; width: 100%; align-items: center; gap: 6px; overflow-x: auto; overflow-y: hidden; white-space: nowrap; padding-top: 4px;">

                     <!-- Filters (Auto width + Padding) -->
                     <div class="filter-item" style="flex: 0 0 auto;">
                       <div class="custom-select-wrapper mobile-filter-wrap mobile-filter-stock">
                         <select v-model="selectedStockStatus" class="custom-select custom-select-cat mobile-filter-select">
                           <option value="all">Tất cả</option>
                           <option value="in">Còn hàng</option>
                           <option value="out">Hết hàng</option>
                         </select>
                       </div>
                     </div>
                     <div class="filter-item" style="flex: 0 0 auto;">
                       <div class="custom-select-wrapper cat-filter-wrap mobile-filter-wrap mobile-filter-cat">
                         <select v-model="selectedCategory" class="custom-select custom-select-cat mobile-filter-select">
                           <option value="">Danh mục</option>
                           <option v-for="cat in filteredCategories" :key="cat.value" :value="cat.value">
                             {{ cat.label }}
                           </option>
                         </select>
                         <i class="app-ico ri-list-check arrow-icon text-green-400 mobile-filter-icon"></i>
                       </div>
                     </div>
                     <div class="filter-item" style="flex: 0 0 auto;">
                       <div class="custom-select-wrapper mobile-filter-wrap mobile-filter-size">
                         <select v-model="selectedSize" class="custom-select custom-select-green mobile-filter-select">
                           <option value="">Size</option>
                           <option v-for="s in uniqueSizes" :key="s" :value="s"> {{ s }} </option>
                         </select>
                         <i class="app-ico ri-ruler-2-line arrow-icon text-green-400 mobile-filter-icon"></i>
                       </div>
                     </div>
                     <label class="filter-checkbox-btn filter-checkbox-yellow mobile-filter-checkbox" :class="{ active: onlyPromotion }" style="flex: 0 0 auto;">
                       <input type="checkbox" v-model="onlyPromotion" class="chk-hidden" />
                       <i class="app-ico" :class="onlyPromotion ? 'ri-checkbox-circle-fill' : 'ri-checkbox-blank-circle-line'"></i>
                       <span>Sale</span>
                     </label>
                     <button v-if="hasActiveFilters" class="btn-reset-icon mobile-filter-reset" @click="resetCatalogFilters" style="flex: 0 0 auto;" title="Reset bộ lọc">
                       <i class="app-ico ri-refresh-line"></i>
                     </button>
                  </div>
                </template>

              </div>
          </div>

          <!-- HEADER FOR MANUAL MODE (Simple Fallback) -->
          <div class="entry-header manual-entry-header" v-else>
             <div class="entry-mode-toggle">
                <div v-if="!isMobile" class="header-title-text" style="color: #ffffff; font-weight: 800; font-size: 13px; text-transform: uppercase;">NHẬP HÀNG</div>
                <template v-if="!isMobile">
                  <button class="mode-btn" style="background: rgba(148, 163, 184, 0.1); border: 1px solid rgba(148, 163, 184, 0.1);" @click="entryMode = 'catalog'"> <i class="app-ico ri-grid-fill"></i> Có sẵn </button>
                  <button class="mode-btn" :class="{ 'active-manual': entryMode === 'manual' }" style="background: rgba(148, 163, 184, 0.1); border: 1px solid rgba(148, 163, 184, 0.1);" @click="entryMode = 'manual'"> <i class="app-ico ri-keyboard-box-line"></i> Thủ công </button>
                </template>
             </div>
          </div>

          <div class="entry-body" :class="{ 'entry-body-manual': entryMode === 'manual' }">
            <template v-if="entryMode === 'catalog'">
              <!-- Filters moved to header -->

              <div class="catalog-grid-section">
                <div class="product-grid">
                <!-- SKELETON LOADING -->
                <template v-if="isLoadingProducts">
                   <div v-for="n in 12" :key="n" class="product-card product-card-horizontal skeleton-card">
                      <div class="pc-media-horizontal skeleton-shimmer"></div>
                      <div class="pc-content-horizontal" style="padding: 12px; display: flex; flex-direction: column; gap: 8px;">
                         <div class="skeleton-line width-80 skeleton-shimmer"></div>
                         <div class="skeleton-line width-60 skeleton-shimmer"></div>
                         <div class="skeleton-line width-40 skeleton-shimmer" style="margin-top: auto;"></div>
                      </div>
                   </div>
                </template>

                <div
                  v-if="!isLoadingProducts"
                  v-for="product in filteredProducts"
                  :key="product.Ma_hang"
                  class="product-card product-card-horizontal"
                  :class="[{ 'is-out': product.So_luong_kho === 0 }, { 'is-flash': cardHighlight[product.Ma_hang] }]"
                  @click="openProductDetail(product)"
                >
                  <!-- Area 1: Product Image (Left) -->
                  <div class="pc-media-horizontal">
                    <img 
                      v-if="cardImg(product)" 
                      :src="cardImg(product)" 
                      :alt="product.Ten_hang"
                      loading="lazy"
                      @error="onCardImgError(product)"
                    />
                    <div v-else class="no-img-placeholder">
                      <i class="app-ico ri-image-2-line"></i>
                    </div>
                    
                    <div v-if="product.Gia_Giam > 0" class="badge-sale">SALE</div>
                    <div v-if="product.So_luong_kho === 0" class="badge-out">Hết hàng</div>
                  </div>

                  <!-- Right Content Wrapper (Areas 2-4) -->
                  <div class="pc-content-horizontal">
                    <!-- Area 2: Product Name -->
                    <div class="pc-name-horizontal" :title="product.Ten_hang">
                      {{ product.Ten_hang }}
                    </div>

                    <!-- Area 3: Price, Stock, Quantity Row -->
                    <div class="pc-info-group">
                      <!-- Row 1: Price + Stock -->
                      <div class="pc-price-stock-row">
                        <div class="pc-price-box-horizontal">
                          <span v-if="product.Gia_Giam > 0" class="price-sale">
                            {{ formatWithCurrency(product.Gia_Giam, product.Don_vi_tien_te) }}
                          </span>
                          <span :class="product.Gia_Giam > 0 ? 'price-old' : 'price-normal'">
                            {{ formatWithCurrency(product.Gia_ban, product.Don_vi_tien_te) }}
                          </span>
                        </div>
                        <div class="pc-stock-pill-horizontal" :class="getStockClass(product.So_luong_kho)">
                          <span class="stock-text">
                            {{ product.So_luong_kho === 0 ? 'Hết' : product.So_luong_kho <= 5 ? 'Sắp hết' : 'Còn' }}
                          </span>
                          <span class="stock-qty">{{ product.So_luong_kho }}</span>
                        </div>
                      </div>

                      <!-- Row 2: Quantity Stepper & Note -->
                      <div class="qty-note-row">
                        <div class="qty-stepper-modern" @click.stop>
                          <button 
                            class="qty-btn-circle" 
                            @click="decreaseQty(product)"
                            :disabled="productQty[product.Ma_hang] <= 1"
                          >
                            <i class="ri-subtract-line"></i>
                          </button>
                          <input 
                            type="number" 
                            v-model.number="productQty[product.Ma_hang]"
                            min="1"
                            :max="product.So_luong_kho"
                            class="qty-input-box"
                          />
                          <button 
                            class="qty-btn-circle" 
                            @click="increaseQty(product)"
                            :disabled="productQty[product.Ma_hang] >= product.So_luong_kho"
                          >
                            <i class="ri-add-line"></i>
                          </button>
                        </div>

                        <button
                          class="btn-note-text-green"
                          :class="{ 'has-note': productNotes[product.Ma_hang] }"
                          @click.stop="toggleNotePopover(product.Ma_hang)"
                          title="Ghi chú"
                        >
                          <i class="ri-file-edit-fill"></i>
                        </button>

                        <!-- Note Popover -->
                        <div
                          v-if="notePopoverOpen[product.Ma_hang]"
                          class="note-popover-horizontal"
                          @click.stop
                        >
                          <textarea
                            v-model="productNotes[product.Ma_hang]"
                            placeholder="Ghi chú..."
                            rows="2"
                          ></textarea>
                          <button class="note-save-horizontal" @click="toggleNotePopover(product.Ma_hang)">Lưu</button>
                        </div>
                      </div>
                    </div>

                    <!-- Area 4: Action Buttons -->
                    <div class="pc-actions-horizontal" @click.stop>
                      <button 
                        class="btn-add-green" 
                        :class="{ 'btn-added-success': addedSuccess[product.Ma_hang] }"
                        @click="addProductToCart(product)"
                        :disabled="product.So_luong_kho === 0"
                      >
                        <template v-if="addedSuccess[product.Ma_hang]">
                           <i class="app-ico ri-check-line"></i>
                           <span>Đã thêm</span>
                        </template>
                        <template v-else>
                           <i class="app-ico ri-shopping-cart-2-fill"></i>
                           <span>Thêm hàng</span>
                        </template>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              </div>

              <div v-if="filteredProducts.length === 0" class="no-products">
                Khong tim thay san pham nao
              </div>

              <!-- View Toggle -->

              <div v-if="totalPages > 1" class="pagination">
                <button 
                  class="page-btn" 
                  @click="currentPage = 1"
                  :disabled="currentPage === 1"
                >
                  <i class="app-ico ri-arrow-left-double-line"></i>
                </button>
                <button 
                  class="page-btn" 
                  @click="currentPage--"
                  :disabled="currentPage === 1"
                >
                  <i class="app-ico ri-arrow-left-s-line"></i>
                </button>
                
                <span class="page-info">
                  Trang {{ currentPage }} / {{ totalPages }}
                </span>
                
                <button 
                  class="page-btn" 
                  @click="currentPage++"
                  :disabled="currentPage === totalPages"
                >
                  <i class="app-ico ri-arrow-right-s-line"></i>
                </button>
                <button 
                  class="page-btn" 
                  @click="currentPage = totalPages"
                  :disabled="currentPage === totalPages"
                >
                  <i class="app-ico ri-arrow-right-double-line"></i>
                </button>
              </div>
            </template>

            <template v-else>
              <div class="manual-mobile-block-parent scroller-hide">
                <div class="manual-content premium-mode-v4">
                  <!-- HIDDEN BINDINGS (Keep for logic) -->
                  <div style="display:none">
                    <input v-model="form.maNCC" />
                    <input v-model="form.tenNCC" />
                    <input v-model="form.maHang" />
                  </div>

                  <!-- UNIFIED PRODUCT CARD -->
                  <div class="mv4-card">
                    <!-- Header -->
                    <div class="mv4-header">
                       <div class="mv4-header-left">
                          <i class="ri-box-3-line"></i>
                          <span>Nhập hàng thủ công</span>
                       </div>
                       <button v-if="hasProductData" @click="xoaHang" class="mv4-btn-clear" title="Làm mới">
                          <i class="ri-refresh-line"></i>
                       </button>
                    </div>
                    
                    <!-- Row 1: Tên sản phẩm | Đơn vị tiền tệ -->
                    <div class="mv4-row-2">
                       <div class="mv4-field flex-2">
                          <label>Tên sản phẩm <span class="req">*</span></label>
                          <div class="mv4-input-hero" style="position: relative;">
                             <input 
                                v-model="form.tenHang" 
                                list="ds-hang-ten" 
                                placeholder="Nhập hoặc chọn sản phẩm..." 
                                style="padding-left: 12px; padding-right: 60px;"
                             />
                             <button 
                                v-if="form.tenHang || form.maHang" 
                                class="btn-delete-cta"
                                @click="resetItem"
                                title="Xóa hàng đang chọn"
                             >
                                XÓA
                             </button>
                             <datalist id="ds-hang-ten">
                                <option v-for="h in hangHoaList" :key="h.Ma_hang" :value="h.Ten_hang">{{ h.Ten_hang }}</option>
                             </datalist>
                          </div>
                       </div>
                       <div class="mv4-field flex-1">
                          <label>Đơn vị tiền tệ</label>
                          <input v-model="form.donViTienTe" placeholder="VND" />
                       </div>
                    </div>

                    <!-- Row 2: Giá vốn | Giá bán | Giảm giá -->
                    <div class="mv4-row-3">
                       <div class="mv4-field">
                          <label>Giá vốn</label>
                          <div class="mv4-input-price">
                             <input type="number" v-model.number="form.giaGoc" placeholder="0" />
                             <span class="currency">{{ form.donViTienTe }}</span>
                          </div>
                       </div>
                       <div class="mv4-field highlight">
                          <label>Giá bán</label>
                          <div class="mv4-input-price">
                             <input type="number" v-model.number="form.giaBan" placeholder="0" />
                             <span class="currency">{{ form.donViTienTe }}</span>
                          </div>
                       </div>
                       <div class="mv4-field">
                          <label>Giảm giá</label>
                          <div class="mv4-input-price danger">
                             <input type="number" v-model.number="form.giamGia" placeholder="0" />
                             <span class="currency">{{ form.donViTienTe }}</span>
                          </div>
                       </div>
                    </div>

                    <!-- Row 3: Danh mục | Size | Đơn vị tính | Ngôn ngữ -->
                    <div class="mv4-row-4">
                       <div class="mv4-field">
                          <label>Danh mục</label>
                          <input v-model="form.danhMuc" list="ds-danhmuc" placeholder="Chọn..." />
                          <datalist id="ds-danhmuc"><option v-for="d in uniqueDanhMucs" :value="d">{{d}}</option></datalist>
                       </div>
                       <div class="mv4-field">
                          <label>Size</label>
                          <input v-model="form.size" list="ds-size" placeholder="Chọn..." />
                          <datalist id="ds-size"><option v-for="s in uniqueSizes" :value="s">{{s}}</option></datalist>
                       </div>
                       <div class="mv4-field">
                          <label>Đơn vị tính</label>
                          <input v-model="form.dvt" list="ds-dvt" placeholder="Cái..." />
                          <datalist id="ds-dvt"><option v-for="u in uniqueDvts" :value="u">{{u}}</option></datalist>
                       </div>
                       <div class="mv4-field">
                          <label>Ngôn ngữ</label>
                          <select v-model="form.lang">
                            <option value="vi">🇻🇳 Việt Nam</option>
                            <option value="en">🇬🇧 English</option>
                            <option value="zh-CN">🇨🇳 Trung Quốc</option>
                            <option value="tl">🇵🇭 Philippines</option>
                            <option value="ko">🇰🇷 Hàn Quốc</option>
                          </select>
                       </div>
                    </div>

                    <!-- Row 4: Ghi chú hàng hóa -->
                    <div class="mv4-row-full">
                       <div class="mv4-field">
                          <label>Ghi chú hàng hóa</label>
                          <input v-model="form.ghiChuHang" placeholder="VD: Màu đỏ, size lớn..." />
                       </div>
                    </div>

                    <!-- Row 5: Số lượng | Tồn kho -->
                    <div class="mv4-row-qty">
                       <div class="mv4-qty-section">
                          <label>Số lượng</label>
                          <div class="mv4-qty-stepper">
                             <button @click="form.soLuong > 1 ? form.soLuong-- : null" :disabled="form.soLuong <= 1">
                                <i class="ri-subtract-line"></i>
                             </button>
                             <input type="number" v-model.number="form.soLuong" min="1" />
                             <button @click="form.soLuong++">
                                <i class="ri-add-line"></i>
                             </button>
                          </div>
                       </div>
                       <div class="mv4-stock-badge" :class="stockColorClass">
                          <i class="ri-inbox-line"></i>
                          <span>Tồn kho: <strong>{{ tonKhoHienTai }}</strong></span>
                       </div>
                    </div>
                    <!-- Action Button (Inside Card) -->
                    <div class="mv4-row-full" style="padding-top: 12px; border-top: 1px dashed rgba(148, 163, 184, 0.15); margin-top: auto;">
                      <button 
                        class="mv4-btn-add-simple" 
                        :class="{ 
                          'success': addedSuccessManual,
                          'is-disabled-stock': hasProductData && tonKhoHienTai === 0
                        }"
                        :disabled="hasProductData && tonKhoHienTai === 0"
                        @click="addItem"
                      >
                        <template v-if="addedSuccessManual">
                          <i class="ri-check-line"></i>
                          <span>ĐÃ THÊM</span>
                        </template>
                        <template v-else-if="hasProductData && tonKhoHienTai === 0">
                          <i class="ri-prohibited-line"></i>
                          <span>HẾT HÀNG</span>
                        </template>
                        <template v-else>
                          <i class="ri-add-circle-fill"></i>
                          <span>THÊM VÀO ĐƠN</span>
                        </template>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>

        <div class="info-row-2col">
          <div class="customer-scroll-container">
            <div class="box customer-box" v-show="!isMobile || activeMobileTab === 'customer'">

            <h3><i class="ri-user-heart-line"></i> Thông tin khách hàng</h3>
            <!-- customer content -->
            <div class="hidden-field">
              <label>Ma khach hang (an)</label>
              <input v-model="form.maKhachHang" readonly />
            </div>

            <div class="field-row">
              <label>Ten khách hàng</label>
              <div class="field-control">
                <div style="position:relative">
                  <input 
                    v-model="form.tenKhachHang" 
                    list="ds-kh-ten"
                    @input="handleTenKhachChange"
                    style="padding-right: 70px"
                  />
                  <!-- Loading Spinner -->
                  <div v-if="isLoadingCustomer" class="input-spinner"></div>
                  <!-- Success Check (Only show when ready & empty) -->
                  <i v-if="!isLoadingCustomer && !form.tenKhachHang" class="ri-checkbox-circle-fill input-success-icon"></i>

                  <button 
                    v-if="form.tenKhachHang" 
                    class="btn-delete-cta"
                    @click="xoaKhachHang"
                    title="Xóa thông tin khách hàng"
                  >
                    XÓA
                  </button>
                </div>
                <datalist id="ds-kh-ten">
                  <option
                    v-for="kh in khachHangList"
                    :key="kh.Ma_khach_hang"
                    :value="kh.Ten_khach_hang"
                  />
                </datalist>
              </div>
            </div>

            <div class="field-row">
              <label>Số điện thoại</label>
              <div class="field-control">
                <input 
                  v-model="form.soDienThoai" 
                  type="tel"
                  pattern="[0-9]*"
                  inputmode="numeric"
                  @input="cleanPhoneInput"
                />
              </div>
            </div>

            <div class="field-row">
              <label>Địa chỉ</label>
              <div class="field-control">
                <input v-model="form.diaChi" />
              </div>
            </div>

            <!-- BỔ SUNG: THÔNG TIN TÓM TẮT KHÁCH -->
            <div v-if="selectedCustomer || form.tenKhachHang" class="cust-summary-box">
              <div class="cust-stat debt">
                <span class="cust-stat-label">Công nợ</span>
                <span class="cust-stat-value" :class="{ 'text-danger': customerDebt > 0 }">
                  {{ formatWithCurrency(customerDebt, donViTienTeChung) }}
                </span>
              </div>
              <div class="cust-stat spend">
                <span class="cust-stat-label">Chi tiêu</span>
                <span class="cust-stat-value text-primary">
                  {{ formatWithCurrency(customerTotalSpend, donViTienTeChung) }}
                </span>
              </div>
              <div class="cust-stat profit">
                <span class="cust-stat-label">Lợi nhuận</span>
                <span class="cust-stat-value text-success">
                  {{ formatWithCurrency(customerProfit, donViTienTeChung) }}
                </span>
              </div>
            </div>

            <div class="field-row" style="margin-top: 10px">
              <label>Ghi chú khách</label>
              <div class="field-control">
                <input 
                  type="text"
                  v-model="form.ghiChu" 
                  class="pm-input"
                  placeholder="Ghi chú về khách..."
                />
              </div>
            </div>
            </div>

            <div class="box delivery-box" v-show="!isMobile || activeMobileTab === 'customer'">

            <h3><i class="ri-truck-line"></i> Thông tin giao hàng</h3>

            <div class="field-row">
              <label>Ngày nhận</label>
              <div class="field-control">
                <input
                  type="date"
                  v-model="ngayNhanHang"
                  class="date-input-dark"
                />
              </div>
            </div>

            <div class="field-row">
              <label>Thời gian nhận</label>
              <div class="field-control">
                <div class="delivery-time-row">
                  <select v-model="gioNhanHang" class="time-select">
                    <option v-for="g in gioList" :key="g" :value="g">{{ g }}</option>
                  </select>
                  <span class="time-sep">:</span>
                  <select v-model="phutNhanHang" class="time-select">
                    <option v-for="p in phutList" :key="p" :value="p">{{ p }}</option>
                  </select>
                  <button class="btn-now" @click="setPlus20Min" title="Hiện tại + 20 phút">
                    <i class="ri-flashlight-fill"></i> Làm liền
                  </button>
                </div>
              </div>
            </div>

            <div class="field-row">
              <label>Ghi chú đơn</label>
              <div class="field-control">
                <textarea
                  v-model="form.ghiChuDonHang"
                  placeholder="VD: Giao giờ hành chính..."
                  rows="2"
                ></textarea>
              </div>
            </div>
            </div>
          </div>

          <div v-if="isMobile && activeMobileTab === 'customer'" class="customer-next-wrap">
            <button class="customer-back-btn" @click="setMobileTab('order')">
              <i class="ri-arrow-left-line"></i>
              <span>Quay lại</span>
            </button>
            <button v-if="hasCustomerData" class="customer-next-btn" @click="setMobileTab('payment')">
              <span>Tiếp theo</span>
              <i class="ri-arrow-right-line"></i>
            </button>
          </div>
        </div>
      </div>

      <div class="right-stack" v-show="!isMobile || ['order', 'payment'].includes(activeMobileTab)">
        <div class="box order-box" v-show="!isMobile || activeMobileTab === 'order'">

          <div
            class="order-header"
            style="display: flex; align-items: center; justify-content: space-between; position: relative; margin-bottom: 10px;"
          >
            <h3 class="text-success" style="margin: 0; font-size: 15px; text-transform: uppercase; letter-spacing: 0.5px;">
              Đơn hàng của {{ form.tenKhachHang || '...' }}
            </h3>
            <div class="order-codes">
              <span class="code-item" style="display: flex; align-items: center; font-size: 13px; color: #64748b;">
                <span class="status-dot-green"></span>
                <strong>Mã: {{ maHoaDon }}</strong>
              </span>
            </div>
          </div>

          <template v-if="isMobile">
            <div class="order-card-container">
            <div class="order-card-list">
              <div v-if="!items.length" class="order-empty">
                Chưa có sản phẩm trong đơn.
              </div>
              <div
                v-for="(i, idx) in items"
                :key="idx"
                class="order-card"
                :class="{ 'is-highlight': idx === highlightedIndex }"
                @click="openEditItem(i, idx)"
              >
                <button
                  class="order-card-delete"
                  @click.stop="deleteItem(idx)"
                  title="Xoa hang"
                >
                  <i class="app-ico ri-close-line"></i>
                </button>

                <div class="order-card-title">
                  <div class="order-card-name">{{ i.tenHang }}</div>
                  <div v-if="i.dvt || i.size" class="order-card-meta">
                    <span v-if="i.dvt">DVT: {{ i.dvt }}</span>
                    <span v-if="i.size">Size: {{ i.size }}</span>
                  </div>
                </div>

                <div class="order-card-discount" :class="{ 'item-card-discount-red': hasItemDiscount(i) }">
                  <span v-if="Number(i.chietKhau || 0) > 0">
                    CK {{ i.chietKhau || 0 }}%: -{{ formatWithCurrency(getItemChietKhauTien(i), i.donViTienTe) }}
                  </span>
                  <span v-if="Number(i.giamGia || 0) > 0">
                    Giảm: -{{ formatWithCurrency(getItemGiamGiaTien(i), i.donViTienTe) }}
                  </span>
                </div>

                <div class="order-card-pricing">
                  <div class="order-card-price-left">
                    <span
                      class="price-main"
                      :class="{ 'price-discounted': hasItemDiscount(i) }"
                    >
                      {{ formatWithCurrency(
                        hasItemDiscount(i) ? getItemUnitPriceAfterDiscount(i) : i.giaBan,
                        i.donViTienTe
                      ) }}
                    </span>
                    <span class="price-qty">x {{ i.soLuong }}</span>
                  </div>
                  <div class="order-card-price-total">
                    {{ formatWithCurrency(i.thanhTien - (i.tongGiamTru || 0), i.donViTienTe) }}
                  </div>
                </div>

                <div v-if="i.ghiChuHang" class="order-card-note">
                  <i class="app-ico ri-file-text-line"></i>
                  <span>{{ i.ghiChuHang }}</span>
                </div>
              </div>
            </div>
          </div>

            <div v-if="activeMobileTab === 'order'" class="order-next-wrap">
              <button class="order-back-btn" @click="setMobileTab('entry')">
                <i class="ri-arrow-left-line"></i>
                <span>Quay lại</span>
              </button>
              <button v-if="items.length" class="order-next-btn" @click="setMobileTab('customer')">
                <span>Tiếp theo</span>
                <i class="ri-arrow-right-line"></i>
              </button>
            </div>
          </template>

          <div v-else class="order-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>STT</th>
                  <th>SẢN PHẨM</th>
                  <th>SỐ LƯỢNG</th>
                  <th>GIÁ BÁN</th>
                  <th>GIẢM & CK%</th>
                  <th>THÀNH TIỀN</th>
                  <th>XÓA</th>
                </tr>
              </thead>

              <tbody>
                <tr
                  v-for="(i, idx) in items"
                  :key="idx"
                  :class="{ 'row-highlight': idx === highlightedIndex }"
                >
                  <td>{{ idx + 1 }}</td>
                  <td>
                    <div class="prod-cell" @click="openEditItem(i, idx)">
                      <div class="prod-name">{{ i.tenHang }}</div>
                      <div v-if="i.size" class="prod-sub">Size: {{ i.size }}</div>
                      <div v-if="i.dvt" class="prod-sub">DVT: {{ i.dvt }}</div>
                      <div v-if="i.ghiChuHang" class="prod-note">{{ i.ghiChuHang }}</div>
                    </div>
                  </td>
                  <td @click="openEditItem(i, idx)" style="cursor:pointer">{{ i.soLuong }}</td>
                  <td @click="openEditItem(i, idx)" style="cursor:pointer">
                    {{ formatWithCurrency(i.giaBan, i.donViTienTe) }}
                  </td>
                  <td @click="openEditItem(i, idx)" style="cursor:pointer">
                    <div class="disc-cell">
                      <span class="disc-ck">
                        CK ({{ i.chietKhau || 0 }}%): -{{ formatWithCurrency(i.tongChietKhauTien || 0, i.donViTienTe) }}
                      </span>
                      <span class="disc-giam">
                        Giam: -{{ formatWithCurrency(i.tongGiamGiaTien || 0, i.donViTienTe) }}
                      </span>
                    </div>
                  </td>
                  <td @click="openEditItem(i, idx)" class="total-cell" style="cursor:pointer">
                    <span class="total-amount">
                      {{ formatWithCurrency(i.thanhTien - (i.tongGiamTru || 0), i.donViTienTe) }}
                    </span>
                    <div class="profit-inline">
                      <span class="profit-arrow"><i class="app-ico ri-arrow-up-s-line"></i></span>
                      <span class="profit-value">
                        +{{ formatWithCurrency(i.loiNhuan, i.donViTienTe) }}
                      </span>
                    </div>
                  </td>
                  <td>
                    <button class="btn-delete" @click="deleteItem(idx)" title="Xoa hang">
                      <i class="app-ico ri-close-line"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="bottom-row" v-show="!isMobile || activeMobileTab === 'payment'">

          <div class="payment-scroll">
            <div class="summary-stack">
            <!-- CARD 1: TÓM TẮT ĐƠN -->
            <div class="box summary-card summary-card--order">
              <h3 class="card-title"><i class="ri-receipt-line"></i> TÓM TẮT ĐƠN</h3>

              <div class="sum-grid">
                <div class="sum-row">
                  <span class="sum-label" style="color: #ffffff !important; font-weight: 700;">Hàng tạm tính</span>
                  <span class="sum-value font-mono" style="color: #ffffff !important; font-weight: 900;">{{ formatWithCurrency(tamTinh, donViTienTeChung) }}</span>
                </div>
                
                <div class="sum-row" :class="{ 'has-value': tongGiamGia > 0 }">
                  <span class="sum-label" style="color: #ffffff !important; font-weight: 700;">Giảm giá</span>
                  <div class="sum-right-group">
                    <button class="btn-limit-red" @click="openDiscountModal('money')">Giảm thêm</button>
                    <span class="sum-value font-mono" style="color: #ff4d4d !important; font-weight: 900;">-{{ formatWithCurrency(tongGiamGia, donViTienTeChung) }}</span>
                  </div>
                </div>
                
                <div class="sum-row" :class="{ 'has-value': tongTienChietKhau > 0 }">
                  <span class="sum-label" style="color: #ffffff !important; font-weight: 700;">Chiết khấu</span>
                  <div class="sum-right-group">
                    <button class="btn-limit-red" @click="openDiscountModal('percent')">Giảm thêm</button>
                    <span class="sum-value font-mono" style="color: #ff4d4d !important; font-weight: 900;">-{{ formatWithCurrency(tongTienChietKhau, donViTienTeChung) }}</span>
                  </div>
                </div>

                <div class="sum-divider"></div>

                <div class="sum-row sub-info">
                  <span class="sum-label" style="color: #ffffff !important; font-weight: 700;">Lợi nhuận dự kiến</span>
                  <span class="sum-value font-mono" style="color: #22c55e !important; font-weight: 900;">+{{ formatWithCurrency(tongLoiNhuan, donViTienTeChung) }}</span>
                </div>
              </div>
            </div>

            <!-- CARD 2: THANH TOÁN -->
            <div class="box summary-card summary-card--payment">
              <h3 class="card-title"><i class="ri-wallet-line"></i> THANH TOÁN</h3>

              <div class="sum-grid">
                <!-- Hình thức thanh toán -->
                <div class="payment-toggle-section">
                  <span class="pm-label">Hình thức thanh toán</span>
                  <div class="pay-toggle">
                    <button 
                      class="pill-btn" 
                      :class="{ active: hinhThucThanhToan === 'TIEN_MAT' }"
                      @click="handlePaymentMethodChange('TIEN_MAT')"
                    >
                      <i class="ri-money-dollar-circle-line"></i> Tiền mặt
                    </button>
                    <button 
                      class="pill-btn pill-btn--transfer" 
                      :class="{ active: hinhThucThanhToan === 'CHUYEN_KHOAN' }"
                      @click="handlePaymentMethodChange('CHUYEN_KHOAN')"
                    >
                      <i class="ri-bank-card-line"></i> Chuyển khoản
                    </button>
                  </div>
                </div>

                <!-- Tỉ giá input (always visible) -->
                <div class="exchange-rate-section">
                  <label class="er-label">Tỉ giá</label>
                  <div class="er-input-wrapper">
                    <input type="number" v-model.number="tiGia" min="0" step="0.01" class="er-input" ref="tiGiaRef" />
                    <span v-if="donViTienTeCK && donViTienTeCK !== 'VND'" class="er-badge">1 {{ donViTienTeCK }}</span>
                  </div>
                  
                </div>

                <div class="sum-divider"></div>

                <!-- Tổng cộng -->
                <div class="sum-row total-row">
                  <span class="sum-label total-label">TỔNG CỘNG</span>
                  <span class="sum-value total-value text-primary font-mono">{{ formatWithCurrency(tongCong, donViTienTeChung) }}</span>
                </div>

                <!-- Chuyển khoản (always visible if exchange rate exists) -->
                <div class="sum-row transfer-row" v-if="tiGia && tiGia !== 1">
                  <span class="sum-label transfer-label">CHUYỂN KHOẢN (x{{ tiGia }})</span>
                  <span class="sum-value transfer-value font-mono">{{ formatWithCurrency(tongChuyenKhoan, donViTienTeCK) }}</span>
                </div>
              </div>
            </div>

          </div>
          </div>

          <div class="submit-stack" :class="{ 'mobile-fixed-bottom': isMobile }">
            <button class="btn btn-preview" :disabled="isPreviewing" @click="previewHoaDon">

              <span v-if="isPreviewing" class="btn-spinner" aria-hidden="true"></span>
              <i v-else class="app-ico ri-eye-line"></i> 
              <span>{{ isPreviewing ? 'ĐANG TẠO...' : 'XEM ẢNH HÓA ĐƠN' }}</span>
            </button>
            <button class="btn btn-text" @click="openTextInvoice">
              <i class="app-ico ri-file-text-line"></i> 
              <span>XUẤT HÓA ĐƠN (CHỮ)</span>
            </button>
            <button class="btn btn-complete" :disabled="isSubmitting" @click="hoanThanhDon">
              <span v-if="isSubmitting" class="btn-spinner" aria-hidden="true"></span>
              <i v-else class="app-ico ri-checkbox-circle-line"></i>
              <span>{{ isSubmitting ? 'ĐANG XỬ LÝ...' : 'CHỐT ĐƠN' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="toast-stack">
      <div v-for="t in toasts" :key="t.id" class="toast" :class="`t-${t.type}`">
        <div class="toast-msg">{{ t.message }}</div>
        <button class="toast-close" @click="removeToast(t.id)"><i class="app-ico ri-close-line"></i></button>
        <div class="toast-bar" :style="{ animationDuration: (t.timeout || 2500) + 'ms' }"></div>
      </div>
    </div>
  </div>
<div ref="hoaDonRef" class="hoa-don-print">
    <!-- ===== HEADER HÓA ĐƠN ===== -->
    <div class="hd-header">
      <!-- LOGO + TÊN SHOP BÊN TRÁI -->
      <div class="hd-left-group">
        <div class="hd-logo-circle">
          <img
            v-if="logoInfo && logoInfo.base64"
            :src="logoInfo.base64"
            alt="Logo"
          />
        </div>

        <div class="hd-shop-info-box">
          <div class="hd-shop-name">{{ form.tenNCC }}</div>
          <div v-if="thoiGianHoatDongShop" class="hd-shop-time">
            {{ thoiGianHoatDongShop }}
          </div>
        </div>
      </div>

      <!-- CONTACT GÓC PHẢI -->
      <div class="hd-contact-right">
        <div
          v-for="(c, idx) in shopContactList"
          :key="idx"
          class="contact-row"
        >
          <img 
            v-if="c.URL_img_base64" 
            :src="c.URL_img_base64" 
            class="contact-img"
            alt=""
          />
          <div v-else class="contact-placeholder"></div>
          <span class="contact-text">
            <span class="platform-name">{{ c.PLATFORM_name }}:</span>
            <span class="platform-info">{{ c.INFO }}</span>
          </span>
        </div>
      </div>
    </div>

    <!-- ===== TITLE (CĂN GIỮA) ===== -->
    <div class="hd-title-section">
      <h2 class="hd-title">HÓA ĐƠN BÁN HÀNG</h2>
      <div class="hd-meta">
        <span class="hd-code">{{ maHoaDon }}</span>
        <span class="hd-separator">•</span>
        <span class="hd-date">{{ formatDateTimeVN(new Date()) }}</span>
      </div>
    </div>

    <!-- ===== THÔNG TIN KHÁCH HÀNG & GIAO HÀNG (2 CARD) ===== -->
    <div class="hd-info-cards">
      <!-- CARD KHÁCH HÀNG -->
      <div class="info-card">
        <div class="card-title">THÔNG TIN KHÁCH HÀNG</div>
        <div class="card-row">
          <span class="label">Tên khách hàng:</span>
          <span class="value">{{ form.tenKhachHang || '---' }}</span>
        </div>
        <div class="card-row">
          <span class="label">Số điện thoại:</span>
          <span class="value">{{ form.soDienThoai || '---' }}</span>
        </div>
        <div class="card-row">
          <span class="label">Địa chỉ:</span>
          <span class="value">{{ form.diaChi || '---' }}</span>
        </div>
      </div>

      <!-- CARD GIAO HÀNG -->
      <div class="info-card">
        <div class="card-title">THÔNG TIN GIAO HÀNG</div>
        <div class="card-row">
          <span class="label">Thời gian nhận:</span>
          <span class="value">{{ formatDateTimeVN(new Date(thoiGianNhanHang)) }}</span>
        </div>
        <div class="card-row">
          <span class="label">Ghi chú đơn hàng:</span>
          <span class="value">{{ form.ghiChuDonHang || '---' }}</span>
        </div>
      </div>
    </div>

    <!-- ===== BẢNG SẢN PHẨM ===== -->
    <table class="hd-table">
      <thead>
        <tr>
          <th class="col-stt">STT</th>
          <th class="col-name">Tên hàng</th>
          <th v-if="hasAnySize" class="col-size">Size</th>
          <th v-if="hasAnyDvt" class="col-dvt">ĐVT</th>
          <th class="col-qty">SL</th>
          <th class="col-price">Đơn giá</th>
          <th class="col-total">Thành tiền</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(i, idx) in items" :key="idx">
          <td class="text-center">{{ idx + 1 }}</td>
          <td class="text-left">
            <div class="product-name">{{ i.tenHang }}</div>
            <div v-if="i.ghiChuHang" class="product-note">{{ i.ghiChuHang }}</div>
          </td>
          <td v-if="hasAnySize" class="text-center">{{ i.size }}</td>
          <td v-if="hasAnyDvt" class="text-center">{{ i.dvt }}</td>
          <td class="text-center">{{ i.soLuong }}</td>
          <td class="text-right">{{ formatWithCurrency(i.giaBan, i.donViTienTe) }}</td>
          <td class="text-right price-highlight">{{ formatWithCurrency(i.thanhTien - (i.tongGiamTru || 0), i.donViTienTe) }}</td>
        </tr>
      </tbody>
    </table>

    <!-- ===== TỔNG KẾT ===== -->
    <div class="hd-summary-row">
      <!-- LEFT: THÔNG TIN CHUYỂN KHOẢN -->
      <div class="hd-bank-box" v-if="ckInfoList && ckInfoList.length">
        <div class="bank-title">THÔNG TIN CHUYỂN KHOẢN</div>

        <div class="bank-list-stack">
          <div class="bank-minicard" v-for="(info, idx) in ckInfoList" :key="idx">
            <div class="bank-body">
              <div class="bank-qr" v-if="info.QR_IMG_base64 || info.QR_IMG">
                <img :src="info.QR_IMG_base64 || info.QR_IMG" alt="QR" />
              </div>

              <div class="bank-text" v-if="info.ThongTin">
                {{ info.ThongTin }}
              </div>
            </div>
          </div>
        </div>

        <div class="bank-divider"></div>

        <div class="bank-amount">
          <div class="ba-label">SỐ TIỀN CHUYỂN KHOẢN</div>
          <div class="ba-value">{{ formatWithCurrency(tongChuyenKhoan, donViTienTeCK) }}</div>
          <div class="ba-sub" v-if="tiGia"></div>
        </div>
      </div>

      <div class="hd-summary" style="margin-left:0 !important">
      <div class="summary-title">TỔNG KẾT THANH TOÁN</div>
      <div class="summary-row subtotal">
        <span class="summary-label">Tạm tính:</span>
        <span class="summary-value">{{ formatWithCurrency(tamTinh, donViTienTeChung) }}</span>
      </div>
      <div class="summary-row discount" v-if="tongGiamGia > 0">
        <span class="summary-label">Giảm giá:</span>
        <span class="summary-value">-{{ formatWithCurrency(tongGiamGia, donViTienTeChung) }}</span>
      </div>
      <div class="summary-row discount" v-if="tongTienChietKhau > 0">
        <span class="summary-label">Chiết khấu:</span>
        <span class="summary-value">-{{ formatWithCurrency(tongTienChietKhau, donViTienTeChung) }}</span>
      </div>
      <div class="summary-row payment">
        <span class="summary-label">Hình thức thanh toán:</span>
        <span class="summary-value">{{ tenHinhThucThanhToan }}</span>
      </div>
      <div class="summary-row total">
        <span class="summary-label">TỔNG CỘNG:</span>
        <span class="summary-value">{{ formatWithCurrency(tongCong, donViTienTeChung) }}</span>
      </div>
      <div v-if="khuyenMaiText" class="hd-promo">
        <span class="hd-promo-text">{{ khuyenMaiText }}</span>
      </div>
    </div>
    </div>

    <!-- ===== FOOTER ===== -->
    <div class="hd-footer-note">
      <div class="footer-line">Cảm ơn quý khách đã mua hàng!</div>
      <div class="footer-line">Vui lòng kiểm tra kỹ hàng trước khi nhận.</div>
    </div>
  </div>

  <div ref="hoaDonNCCRef" class="hoa-don-ncc">
    <h2 style="text-align:center">ĐƠN HÀNG</h2>
    <p><b>Mã hóa đơn:</b> {{ maHoaDon }}</p>

    <table class="ncc-table">
      <thead>
        <tr>
          <th>STT</th>
          <th>Số lượng</th>
          <th>Tên hàng</th>
          <th>Giá gốc</th>
          <th>Ghi chú</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(i, idx) in items" :key="idx">
          <td>{{ idx + 1 }}</td>
          <td>{{ i.soLuong }}</td>
          <td>{{ i.tenHang }}</td>
          <td>{{ formatWithCurrency(i.giaGoc, i.donViTienTe) }}</td>
          <td>{{ i.ghiChuHang }}</td>
        </tr>
      </tbody>
    </table>

    <div style="margin-top:12px">
      <p><b>Thời gian nhận:</b> {{ formatDateTimeVN(new Date(thoiGianNhanHang)) }}</p>
      <p><b>SĐT:</b> {{ form.soDienThoai }}</p>
      <p><b>Địa chỉ:</b> {{ form.diaChi }}</p>
      <p><b>Hình thức thanh toán:</b> {{ tenHinhThucThanhToan }}</p>
      <p style="font-size:16px"><b>Tổng cộng:</b> {{ formatWithCurrency(tongCong, donViTienTeChung) }}</p>
      <p><b>Ghi chú đơn hàng:</b> {{ form.ghiChuDonHang || '' }}</p>
    </div>
  </div>

  <!-- ================= POPUP HÓA ĐƠN TEXT ================= -->
  <div v-if="showTextInvoice" class="text-invoice-overlay">
    <div class="text-invoice-box">
      <h3>📄 Hóa đơn (văn bản)</h3>

      <textarea readonly rows="14" ref="textInvoiceRef">
{{ textInvoice }}
      </textarea>

      <div class="actions">
        
        <button class="btn danger" @click="showTextInvoice = false">
          <i class="app-ico ri-close-line"></i> Đóng
        </button>
        <button class="btn primary" :class="{ 'btn-copied': isTextCopied }" @click="copyTextInvoice">
          <i class="app-ico" :class="isTextCopied ? 'ri-check-line' : 'ri-file-copy-line'"></i> 
          {{ isTextCopied ? 'Đã copy' : 'Copy' }}
        </button>
      </div>
    </div>
  </div>

  <!-- ================= MODAL CHI TIẾT SẢN PHẨM ================= -->
  <div v-if="showProductDetail" class="modal" @click="showProductDetail = false">
    <div class="product-detail-box" @click.stop>
      <button class="close-btn" @click="showProductDetail = false"><i class="app-ico ri-close-line"></i></button>

      <div class="detail-grid">
        <!-- HÌNH ẢNH -->
        <div class="detail-images">
          <div class="main-image">
            <img 
              v-if="currentMainImage || selectedProduct.Main_img_base64" 
              :src="currentMainImage || selectedProduct.Main_img_base64" 
              :alt="selectedProduct.Ten_hang"
            />
            <div v-else class="no-img-large"><i class="app-ico ri-inbox-archive-line"></i></div>
          </div>

          <div v-if="productImages.length > 0" class="thumbnail-list">
            <div
              v-for="(img, idx) in productImages"
              :key="idx"
              class="thumbnail"
              @click="changeMainImage(img)"
            >
              <img :src="img" alt="Thumbnail" />
            </div>
          </div>
        </div>

        <!-- THÔNG TIN -->
        <div class="detail-info">
          <h2 class="detail-title">{{ selectedProduct.Ten_hang }}</h2>
          
          <!-- Meta Tags & Stock -->
          <div class="detail-meta-tags">
            <span class="meta-tag meta-category">
              <i class="ri-price-tag-3-line"></i>
              {{ selectedProduct.Danh_muc }}
            </span>
            <span v-if="selectedProduct.Size" class="meta-tag meta-size">
              <i class="ri-ruler-line"></i>
              {{ selectedProduct.Size }}
            </span>
            <span class="meta-tag meta-unit">
              <i class="ri-inbox-line"></i>
              {{ selectedProduct.Dvt }}
            </span>
            <span class="meta-tag" :class="`meta-status-${selectedProduct.Trang_thai?.toLowerCase()}`">
              <i class="ri-checkbox-circle-line"></i>
              {{ selectedProduct.Trang_thai }}
            </span>
            
            <!-- Stock Inline -->
            <span class="meta-tag meta-stock" :class="getStockClass(selectedProduct.So_luong_kho)">
              <i class="ri-archive-line"></i>
              <b>Tồn: {{ selectedProduct.So_luong_kho }}</b>
            </span>
          </div>

          <!-- Price Section -->
          <div class="detail-price-section">
            <div class="price-section-header">
              <i class="ri-money-dollar-circle-line"></i>
              Thông tin giá
            </div>
            
            <!-- Cost Price (Giá gốc) -->
            <div v-if="selectedProduct.Gia_goc" class="price-row price-row-cost">
              <div class="price-row-label">
                <i class="ri-price-tag-line"></i>
                Giá gốc
              </div>
              <div class="price-row-value price-cost">
                {{ formatWithCurrency(selectedProduct.Gia_goc, selectedProduct.Don_vi_tien_te) }}
              </div>
            </div>

            <!-- Selling Price (Giá bán) -->
            <div class="price-row price-row-selling">
              <div class="price-row-label">
                <i class="ri-shopping-bag-line"></i>
                Giá bán
              </div>
              <div class="price-row-value">
                <div v-if="selectedProduct.Gia_Giam > 0" class="price-with-discount">
                  <div class="price-current">
                    {{ formatWithCurrency(selectedProduct.Gia_Giam, selectedProduct.Don_vi_tien_te) }}
                  </div>
                  <div class="price-original-strike">
                    {{ formatWithCurrency(selectedProduct.Gia_ban, selectedProduct.Don_vi_tien_te) }}
                  </div>
                </div>
                <div v-else class="price-normal-large">
                  {{ formatWithCurrency(selectedProduct.Gia_ban, selectedProduct.Don_vi_tien_te) }}
                </div>
              </div>
            </div>

            <!-- Profit Indicator (if both prices available) -->
            <div v-if="selectedProduct.Gia_goc && selectedProduct.Gia_ban" class="profit-indicator">
              <div class="profit-label">
                <i class="ri-line-chart-line"></i>
                Lợi nhuận dự kiến
              </div>
              <div class="profit-value">
                <i class="ri-arrow-right-up-line" style="margin-right: 4px;"></i>
                {{ formatWithCurrency(
                  (selectedProduct.Gia_Giam > 0 ? selectedProduct.Gia_Giam : selectedProduct.Gia_ban) - selectedProduct.Gia_goc,
                  selectedProduct.Don_vi_tien_te
                ) }}
              </div>
            </div>
          </div>

          <!-- Description -->
          <div class="detail-desc">
            <div class="detail-section-title">
              <i class="ri-file-text-line"></i>
              Mô tả sản phẩm
            </div>
            <p>{{ selectedProduct.Mo_ta || 'Không có mô tả' }}</p>
          </div>

          <!-- Note Input -->
          <div class="detail-note-input">
            <label class="detail-section-title">
              <i class="ri-sticky-note-line"></i>
              Ghi chú hàng
            </label>
            <textarea 
              v-model="productNotes[selectedProduct.Ma_hang]"
              placeholder="VD: Hàng dễ vỡ, chọn size lớn, giao riêng..."
              rows="3"
            ></textarea>
          </div>

          <!-- Actions -->
          <div class="detail-actions">
            <!-- Quantity Control - Matches Card Style -->
            <div class="qty-note-row">
              <div class="qty-stepper-modern">
                <button 
                  class="qty-btn-circle" 
                  @click="decreaseQty(selectedProduct)"
                  :disabled="productQty[selectedProduct.Ma_hang] <= 1"
                >
                  <i class="ri-subtract-line"></i>
                </button>
                <input 
                  type="number" 
                  v-model.number="productQty[selectedProduct.Ma_hang]"
                  min="1"
                  :max="selectedProduct.So_luong_kho"
                  class="qty-input-box"
                />
                <button 
                  class="qty-btn-circle" 
                  @click="increaseQty(selectedProduct)"
                  :disabled="productQty[selectedProduct.Ma_hang] >= selectedProduct.So_luong_kho"
                >
                  <i class="ri-add-line"></i>
                </button>
              </div>
            </div>

            <!-- Add to Cart Button - Full Width -->
            <button 
              class="btn-add-large" 
              @click="addProductToCart(selectedProduct); showProductDetail = false"
              :disabled="selectedProduct.So_luong_kho === 0"
            >
              <i class="app-ico" :class="selectedProduct.So_luong_kho === 0 ? 'ri-close-circle-line' : 'ri-shopping-cart-line'"></i>
              {{ selectedProduct.So_luong_kho === 0 ? 'Hết hàng' : 'Thêm vào đơn' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-if="showEditModal" class="modal modal-overlay-blur">
    <div class="modal-box premium-modal-v4">
      <!-- HEADER -->
      <div class="pmv4-header">
        <div class="pmv4-header-info">
          <div class="pmv4-icon-box">
            <i class="ri-edit-2-fill"></i>
          </div>
          <div>
            <h3 class="pmv4-title">Chỉnh sửa sản phẩm</h3>
            <p class="pmv4-subtitle">{{ editItem.tenHang }}</p>
          </div>
        </div>
        <button class="pmv4-close" @click="showEditModal=false">
          <i class="ri-close-line"></i>
        </button>
      </div>

      <!-- BODY -->
      <div class="pmv4-body">
        <!-- STOCK INFO BANNER (Clean Strip) -->
        <div class="pmv4-stock-strip" :class="tonKhoInModal === 0 ? 'strip-danger' : tonKhoInModal < 10 ? 'strip-warning' : 'strip-success'">
          <div class="strip-item">
            <i :class="tonKhoInModal === 0 ? 'ri-close-circle-fill' : tonKhoInModal < 10 ? 'ri-alert-fill' : 'ri-checkbox-circle-fill'"></i>
            <span class="strip-text">Tồn kho: <b>{{ tonKhoInModal }}</b></span>
          </div>
          <div class="strip-item">
            <i class="ri-shopping-cart-2-fill"></i>
            <span class="strip-text">Trong đơn: <b>{{ items[editIndex]?.soLuong || 0 }}</b></span>
          </div>
        </div>

        <!-- MAIN FORM GRID -->
        <div class="pmv4-form-grid">
          
          <!-- Row 1: Quantity (Prominent) -->
          <div class="pmv4-field-group span-full">
            <label class="pmv4-label">Số lượng mua</label>
            <div class="pmv4-stepper">
              <button 
                class="pmv4-step-btn" 
                @click="editItem.soLuong > 1 ? editItem.soLuong-- : null"
                :disabled="editItem.soLuong <= 1"
              >
                <i class="ri-subtract-line"></i>
              </button>
              <div class="pmv4-step-input-wrap">
                <input 
                  type="number" 
                  v-model.number="editItem.soLuong" 
                  min="1"
                  :max="tonKhoInModal || 9999"
                  class="pmv4-step-input"
                />
                <span class="pmv4-input-unit">{{ editItem.dvt }}</span>
              </div>
              <button 
                class="pmv4-step-btn" 
                @click="editItem.soLuong < (tonKhoInModal || 9999) ? editItem.soLuong++ : null"
                :disabled="editItem.soLuong >= (tonKhoInModal || 9999)"
              >
                <i class="ri-add-line"></i>
              </button>
            </div>
          </div>

          <!-- Row 2: Pricing -->
          <div class="pmv4-field-group">
            <label class="pmv4-label">Giá bán</label>
            <div class="pmv4-input-wrap">
              <input type="number" v-model.number="editItem.giaBan" class="pmv4-input text-highlight" />
              <span class="pmv4-input-unit">{{ editItem.donViTienTe || 'VND' }}</span>
            </div>
          </div>
          <div class="pmv4-field-group">
            <label class="pmv4-label">Giá vốn <i class="ri-lock-line" style="opacity:0.5; font-weight:normal"></i></label>
            <div class="pmv4-static-field">
              {{ editItem.giaGoc?.toLocaleString() }} 
              <span class="pmv4-static-unit">{{ editItem.donViTienTe || 'VND' }}</span>
            </div>
          </div>

          <!-- Row 3: Discount -->
          <div class="pmv4-field-group">
            <label class="pmv4-label text-subtle">Giảm tiền</label>
            <div class="pmv4-input-wrap">
              <input type="number" v-model.number="editItem.giamGia" class="pmv4-input text-danger-soft" />
            </div>
          </div>
          <div class="pmv4-field-group">
            <label class="pmv4-label text-subtle">Chiết khấu %</label>
            <div class="pmv4-input-wrap">
              <input type="number" v-model.number="editItem.chietKhau" class="pmv4-input text-danger-soft" />
            </div>
          </div>

          <!-- Row 4: Note -->
          <div class="pmv4-field-group span-full">
            <label class="pmv4-label">Ghi chú hàng</label>
            <textarea 
              v-model="editItem.ghiChuHang" 
              rows="1" 
              class="pmv4-textarea" 
              placeholder="Nhập ghi chú..."
            ></textarea>
          </div>
        </div>
      </div>

      <!-- FOOTER -->
      <div class="pmv4-footer">
        <button class="pmv4-btn-ghost" @click="showEditModal=false">Hủy</button>
        <button class="pmv4-btn-primary" @click="saveEditItem">Xác nhận</button>
      </div>
    </div>
  </div>

  <div v-if="showSuccessModal" class="vip-modal-overlay">
     <div class="vip-success-card">
        <div class="vip-icon-box">
           <div class="vip-success-ring"></div>
           <i class="ri-check-line vip-check-icon"></i>
        </div>
        <h3 class="vip-title">HOÀN THÀNH ĐƠN</h3>
        <p class="vip-message">{{ successMessage }}</p>
        <button class="vip-btn-ok" @click="confirmSuccessReload">OK</button>
     </div>
  </div>

  <div v-if="showDiscountModal" class="modal modal-overlay-blur">
    <div class="modal-box premium-modal-v4" style="max-width: 400px">
      <div class="pmv4-header">
        <div class="pmv4-header-info">
          <div class="pmv4-icon-box">
            <i class="ri-price-tag-3-fill"></i>
          </div>
          <div>
            <h3 class="pmv4-title">{{ activeDiscountType === 'money' ? 'Giảm giá thêm' : 'Chiết khấu thêm' }}</h3>
            <p class="pmv4-subtitle">
              {{ activeDiscountType === 'money' ? 'Nhập số tiền giảm giá trực tiếp' : 'Nhập % chiết khấu' }}
            </p>
          </div>
        </div>
        <button class="pmv4-close" @click="showDiscountModal = false">
          <i class="ri-close-line"></i>
        </button>
      </div>

      <div class="pmv4-body">
        <div class="pmv4-form-grid">
          <!-- Discount Money -->
          <div v-if="activeDiscountType === 'money'" class="pmv4-field-group span-full">
            <label class="pmv4-label">Số tiền giảm</label>
            <div class="pmv4-input-wrap">
              <input 
                type="number" 
                v-model.number="tempGlobalGiamGia" 
                class="pmv4-input text-danger-soft" 
                placeholder="0"
              />
              <span class="pmv4-input-unit">{{ donViTienTeChung }}</span>
            </div>
          </div>

          <!-- Discount Rebate -->
          <div v-if="activeDiscountType === 'percent'" class="pmv4-field-group span-full">
            <label class="pmv4-label">Phần trăm chiết khấu (%)</label>
            <div class="pmv4-input-wrap">
              <input 
                type="number" 
                v-model.number="tempGlobalChietKhauPercent" 
                class="pmv4-input text-danger-soft" 
                placeholder="0"
                min="0"
                max="100"
              />
              <span class="pmv4-input-unit">%</span>
            </div>
          </div>
        </div>
      </div>

      <div class="pmv4-footer">
        <button class="pmv4-btn-ghost" @click="showDiscountModal = false">Hủy</button>
        <button class="pmv4-btn-primary" @click="applyGlobalDiscount">Áp dụng</button>
      </div>
    </div>
  </div>
</template>





<script setup>
import { reactive, ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import QrcodeVue from 'qrcode.vue'
import html2canvas from 'html2canvas'
import { API_URL, IMGBB_KEY } from '@/config/api'
const router = useRouter() // Initialize router



/* ================= MOBILE STATE ================= */
const isMobile = ref(false)
const activeMobileTab = ref('entry') // 'entry', 'order', 'customer', 'payment'
const showMobileEntryMenu = ref(false)

function checkMobile() {
  if (typeof window !== 'undefined') {
    isMobile.value = window.innerWidth < 1024 
  }
}

const handleEntryTabClick = () => {
  if (activeMobileTab.value === 'entry') {
    // Already active, toggle menu
    showMobileEntryMenu.value = !showMobileEntryMenu.value
  } else {
    // Switch to entry tab
    setMobileTab('entry')
    showMobileEntryMenu.value = false
  }
}

const selectMobileEntryMode = (mode) => {
  entryMode.value = mode
  showMobileEntryMenu.value = false
}

function setMobileTab(tab) {
  activeMobileTab.value = tab
  if(tab !== 'entry') showMobileEntryMenu.value = false
  window.scrollTo({ top: 0, behavior: 'instant' })
}

/* ================= MASTER DATA ================= */
const khachHangList = ref([])
const hangHoaList = ref([])
const nccList = ref([])
const donHangList = ref([])
const logoInfo = ref(null)
const shopContactList = ref([])
const shopContactInfo = ref(null)
const thoiGianHoatDongShop = ref('')
const soThuChiList = ref([]) // Bổ sung list thu chi để tính lợi nhuận khách
const khuyenMaiList = ref([]) // Bổ sung list chứa nội dung khuyến mãi
const thongTinChuyenKhoanList = ref([]) // Bổ sung list Chuyển khoản
const tiGia = ref(1)
const donViTienTeCK = ref('VND')

/* ================= CATALOG SẢN PHẨM ================= */
const entryMode = ref('catalog') // 'catalog' | 'manual'
const addedSuccessManual = ref(false) // Trạng thái nút thêm thủ công
const searchProduct = ref('')
// PHẦN BỔ SUNG: CATALOG FILTERS
const selectedLang = ref('vi')
const selectedCategory = ref('')
const onlyPromotion = ref(false)
const selectedSize = ref('')
const langOptions = [
  { value: 'vi', label: 'Việt Nam', flagUrl: 'https://flagcdn.com/w40/vn.png' },
  { value: 'en', label: 'English', flagUrl: 'https://flagcdn.com/w40/gb.png' },
  { value: 'zh-CN', label: 'Trung Quốc', flagUrl: 'https://flagcdn.com/w40/cn.png' },
  { value: 'fil', label: 'Philippines', flagUrl: 'https://flagcdn.com/w40/ph.png' },
]
const currentLangFlagUrl = computed(() => {
  const lang = langOptions.find(o => o.value === selectedLang.value)
  return lang ? lang.flagUrl : ''
})

const currentLangLabel = computed(() => {
  const lang = langOptions.find(o => o.value === selectedLang.value)
  return lang ? lang.label : ''
})
const selectedStockStatus = ref('all') // 'all' | 'in' | 'out'

const filteredCategories = computed(() => {
  if (!selectedLang.value) return []
  // Get unique categories for selected language
  const cats = new Set()
  hangHoaList.value.forEach(p => {
    // Check various language fields just in case: Lang, Ngon_ngu
    const pLang = p.Lang || p.Ngon_ngu || 'vi'
    if (pLang.toLowerCase() === selectedLang.value.toLowerCase() && p.Danh_muc) {
      cats.add(p.Danh_muc)
    }
  })
  return Array.from(cats).sort().map(c => ({ value: c, label: c }))
})

const productQty = reactive({})
const productNotes = reactive({}) // ✅ THÊM: Lưu ghi chú cho từng sản phẩm
const notePopoverOpen = reactive({})
const cardHighlight = reactive({})
const cardImgStep = reactive({})
const showProductDetail = ref(false)
const isLoadingCustomer = ref(false) // State loading khách hàng
const selectedProduct = ref({})
const currentMainImage = ref('')
const currentPage = ref(1)
const itemsPerPage = 16 // 4x4
const toasts = ref([])
const showSuccessModal = ref(false)
const successMessage = ref('')
const isPreviewing = ref(false) // State for preview button loading
const isPrinting = ref(false) // Logic state for printing
const isLoadingProducts = ref(true) // Loading state for skeleton

/* ================= HÓA ĐƠN ================= */
const showEditModal = ref(false)
const editIndex = ref(-1)
const editItem = reactive({})
const invoiceImageUrl = ref('')
const barcodeRef = ref(null)

const maHoaDon = ref('')
const soHoaDon = ref('')
const thoiGianNhanHang = ref('')
const ngayNhanHang = ref('')
const gioNhanHang = ref('')
const phutNhanHang = ref('')
const gioList = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
const phutList = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'))

function genMaHoaDon() {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return (
    'HD' +
    p(d.getDate()) +
    p(d.getMonth() + 1) +
    d.getFullYear() +
    p(d.getHours()) +
    p(d.getMinutes()) +
    p(d.getSeconds())
  )
}

function removeToast(id) {
  const idx = toasts.value.findIndex(t => t.id === id)
  if (idx === -1) return
  const [toastItem] = toasts.value.splice(idx, 1)
  if (toastItem?.timerId) clearTimeout(toastItem.timerId)
}

function toast(type, message, timeout = 2500) {
  const id = Date.now() + Math.random()
  const toastItem = {
    id,
    type,
    message,
    timeout,
    createdAt: Date.now(),
  }
  toastItem.timerId = setTimeout(() => removeToast(id), timeout)
  toasts.value.unshift(toastItem)
  if (toasts.value.length > 4) {
    const removed = toasts.value.pop()
    if (removed?.timerId) clearTimeout(removed.timerId)
  }
}

if (typeof window !== 'undefined') {
  window.toast = toast
}

function openSuccessModal(message) {
  successMessage.value = message
  showSuccessModal.value = true
}

function confirmSuccessReload() {
  showSuccessModal.value = false
  const route = router.resolve({ name: 'admin-don-hang' })
  window.location.assign(route.href)
}

onMounted(async () => {
  checkMobile()
  window.addEventListener('resize', checkMobile)

  isLoadingProducts.value = true
  isLoadingCustomer.value = true // Start loading customer data
  maHoaDon.value = genMaHoaDon()
  thoiGianNhanHang.value = formatDateTimeLocal()
  const split = splitDateTimeLocal(thoiGianNhanHang.value)
  ngayNhanHang.value = split.date
  const timeParts = (split.time || '00:00').split(':')
  gioNhanHang.value = timeParts[0] || '00'
  phutNhanHang.value = timeParts[1] || '00'

  try {
    const res = await fetch(`${API_URL}?action=all&_=${Date.now()}`)
    const json = await res.json()

    khachHangList.value = json.data.khach_hang || []
    hangHoaList.value = json.data.hang_hoa || []
    nccList.value = json.data.nha_cung_cap || []
    donHangList.value = json.data.don_hang || []
    khuyenMaiList.value = json.data.khuyenmai_info || []
    soThuChiList.value = json.data.so_thu_chi || []
    thongTinChuyenKhoanList.value = json.data.thong_tin_chuyen_khoan || []

    if (nccList.value.length > 0) {
      const defaultNCC = nccList.value[0]
      form.maNCC = defaultNCC.Ma_nha_cung_cap
      form.tenNCC = defaultNCC.Ten_nha_cung_cap
    }

    soHoaDon.value = genSoHoaDon()
    logoInfo.value = (json.data.logo || []).find(
      l => l.Ma_nha_cung_cap === form.maNCC
    ) || null

    if (logoInfo.value?.URL) {
      try {
        logoInfo.value.base64 = await imageToBase64(logoInfo.value.URL)
      } catch (e) {
        logoInfo.value.base64 = null
      }
    }

    shopContactList.value = (json.data.shop_contact || []).filter(
      c => c.Ma_nha_cung_cap === form.maNCC
    )

    // Convert Shop Contact Images
    for (const contact of shopContactList.value) {
      if (contact.URL_img) {
        try {
          contact.URL_img_base64 = await imageToBase64(contact.URL_img)
        } catch (e) {
          contact.URL_img_base64 = null
        }
      }
    }

    // Convert Chuyen Khoan QR Images
    for (const r of thongTinChuyenKhoanList.value) {
      if (r.QR_IMG) {
        try {
          r.QR_IMG_base64 = await imageToBase64(r.QR_IMG)
        } catch (e) {
          r.QR_IMG_base64 = null
        }
      }
    }

    // Time Data
    const timeData = (json.data.time || []).find(
      t => t.Ma_nha_cung_cap === form.maNCC
    )
    thoiGianHoatDongShop.value = timeData?.thoi_gian_hoat_dong_shop || ''

    // Convert Product Images & Init Data
    for (const product of hangHoaList.value) {
      productQty[product.Ma_hang] = 1
      productNotes[product.Ma_hang] = ''
      notePopoverOpen[product.Ma_hang] = false
      cardHighlight[product.Ma_hang] = false

      if (product.Main_img) {
        try {
          product.Main_img_base64 = await imageToBase64(product.Main_img)
        } catch (e) {
          product.Main_img_base64 = null
        }
      }

      for (let i = 1; i <= 6; i++) {
        const imgKey = `img_${i}`
        if (product[imgKey]) {
          try {
            product[`${imgKey}_base64`] = await imageToBase64(product[imgKey])
          } catch (e) {
            product[`${imgKey}_base64`] = null
          }
        }
      }
    }

    // Init Delivery Time (Now + 10 mins)
    const now = new Date()
    now.setMinutes(now.getMinutes() + 10)
    
    const y = now.getFullYear()
    const m = String(now.getMonth() + 1).padStart(2, '0')
    const d = String(now.getDate()).padStart(2, '0')
    ngayNhanHang.value = `${y}-${m}-${d}`
    
    gioNhanHang.value = String(now.getHours()).padStart(2, '0')
    phutNhanHang.value = String(now.getMinutes()).padStart(2, '0')

  } catch (error) {
    console.error('Error fetching data:', error)
    toast('error', 'Lỗi tải dữ liệu')
  } finally {
    isLoadingProducts.value = false
    isLoadingCustomer.value = false // Data fetch complete
  }
})

async function imageToBase64(url) {
  const res = await fetch(url)
  const blob = await res.blob()

  return await new Promise((resolve) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result)
    reader.readAsDataURL(blob)
  })
}



function genSoHoaDon() {
  if (!donHangList.value.length) return 'OD-0001'

  const max = Math.max(
    ...donHangList.value
      .map((d) => {
        if (!d.So_hoa_don) return 0
        const num = parseInt(d.So_hoa_don.replace('OD-', ''))
        return isNaN(num) ? 0 : num
      })
  )

  return 'OD-' + String(max + 1).padStart(4, '0')
}

/* ================= GEN MÃ KHÁCH HÀNG ================= */
function genMaKhachHang(ten, sdt, diaChi) {
  const t = ten ? String(ten).toLowerCase().replace(/\s+/g, '') : ''
  const s = sdt ? String(sdt).replace(/\D/g, '') : ''
  const d = diaChi ? String(diaChi).toLowerCase().replace(/\s+/g, '') : ''
  
  const partTen = t || 'ten'
  const partSdt = s || 'sdt'
  const partDc = d || 'dc'
  
  return `${partTen}_${partSdt}_${partDc}`
}

const tonKhoHienTai = computed(() => {
  if (!form.maHang) return 999 // ✅ Mặc định 999 cho hàng mới
  
  const hang = hangHoaList.value.find(h => h.Ma_hang === form.maHang)
  return hang ? Number(hang.So_luong_kho || 0) : 999 // ✅ Trả về 999 nếu không tìm thấy
})

const tonKhoStatus = computed(() => {
  if (!form.maHang) return { color: '#16a34a', text: '✅ Hàng mới (999)' }
  
  const ton = tonKhoHienTai.value
  
  if (ton === 0) {
    return { color: '#dc2626', text: '❌ Hết hàng' }
  }
  
  if (ton < 10) {
    return { color: '#f59e0b', text: `⚠️ Sắp hết (${ton})` }
  }
  
  return { color: '#16a34a', text: `✅ Còn ${ton}` }
})

const stockColorClass = computed(() => {
  const ton = tonKhoHienTai.value
  
  if (ton === 0) return 'text-danger' // Đỏ - Hết hàng
  if (ton < 10) return 'text-warning' // Vàng - Sắp hết
  return 'text-success' // Xanh - Còn hàng
})

const tonKhoInModal = computed(() => {
  if (!editItem.maHang) return 0
  
  const hang = hangHoaList.value.find(h => h.Ma_hang === editItem.maHang)
  return hang ? Number(hang.So_luong_kho || 0) : 0
})

const stockColorInModal = computed(() => {
  const ton = tonKhoInModal.value
  
  if (ton === 0) return '#dc2626'
  if (ton < 10) return '#f59e0b'
  return '#16a34a'
})

/* ================= FORM ================= */
const form = reactive({
  maKhachHang: '',
  tenKhachHang: '',
  soDienThoai: '',
  diaChi: '',
  ghiChu: '',
  ghiChuDonHang: '',
  maNCC: '',
  tenNCC: '',
  maHang: '',
  tenHang: '',
  danhMuc: '',
  size: '',
  dvt: '',
  lang: 'vi',
  donViTienTe: 'VND',
  giaGoc: 0,
  chietKhau: 0,
  giamGia: 0,
  giaBan: 0,
  soLuong: 1,
  trangThai: '',
  ghiChuHang: '',
})

/* ================= TỈ GIÁ & CHUYỂN KHOẢN (AUTO) ================= */
const ckInfoList = computed(() => {
  return thongTinChuyenKhoanList.value.filter(x => x.Ma_nha_cung_cap === form.maNCC)
})

watch(() => form.maNCC, (newMa) => {
  const info = thongTinChuyenKhoanList.value.find(x => x.Ma_nha_cung_cap === newMa)
  tiGia.value = Number(info?.Ti_gia || 1)
  donViTienTeCK.value = info?.Don_vi_tien_te || 'VND'
}, { immediate: true })

const tongChuyenKhoan = computed(() => {
  const rate = Number(tiGia.value || 1)
  return tongCong.value * rate
})

/* ================= RESET ================= */
function xoaKhachHang() {
  // Removed confirm as requested
  
  isExistingCustomer = false
  form.maKhachHang = ''
  form.tenKhachHang = ''
  form.soDienThoai = ''
  form.diaChi = ''
  form.ghiChu = ''
  form.ghiChuDonHang = ''
}

/* ================= AUTO UPDATE MÃ KHÁCH HÀNG (CHỈ KHI KHÁCH MỚI) ================= */
let isExistingCustomer = false

watch(
  () => [form.tenKhachHang, form.soDienThoai, form.diaChi],
  () => {
    if (!isExistingCustomer) {
      form.maKhachHang = genMaKhachHang(
        form.tenKhachHang,
        form.soDienThoai,
        form.diaChi
      )
    }
  },
  { deep: true }
)

function xoaHang() {
  if (!confirm('Xóa toàn bộ thông tin hàng đang nhập?')) return
  
  form.maHang = ''
  form.tenHang = ''
  form.danhMuc = ''
  form.size = ''
  form.dvt = ''
  form.giaGoc = 0
  form.chietKhau = 0
  form.giamGia = 0
  form.giaBan = 0
  form.soLuong = 1
  form.trangThai = ''
  form.ghiChuHang = ''
}

/* ================= AUTO FILL KHÁCH (CHỈ KHI CHỌN TỪ DATALIST) ================= */
let lastCheckedName = ''

function handleTenKhachChange(event) {
  const inputName = event.target.value.trim()
  if (inputName === lastCheckedName) return
  lastCheckedName = inputName
  
  const kh = khachHangList.value.find((k) => k.Ten_khach_hang === inputName)

  if (kh) {
    isExistingCustomer = true
    form.soDienThoai = kh.So_dien_thoai
    form.diaChi = kh.Dia_chi
    form.ghiChu = kh.Ghi_chu
    form.maKhachHang = kh.Ma_khach_hang
  } else {
    isExistingCustomer = false
  }
}

/* ================= AUTO FILL HÀNG ================= */
watch(
  () => form.tenHang,
  () => {
    const h = hangHoaList.value.find((x) => x.Ten_hang === form.tenHang)

    if (!h) return

    form.maHang = h.Ma_hang
    form.maNCC = h.Ma_nha_cung_cap
    form.tenNCC = nccList.value.find(n => n.Ma_nha_cung_cap === h.Ma_nha_cung_cap)?.Ten_nha_cung_cap || ''
    form.danhMuc = h.Danh_muc
    form.size = h.Size
    form.dvt = h.Dvt
    form.giaGoc = Number(h.Gia_goc) || 0
    
    if (h.Gia_Giam && Number(h.Gia_Giam) > 0) {
      form.giaBan = Number(h.Gia_Giam)
    } else {
      form.giaBan = Number(h.Gia_ban) || 0
    }
    
    form.trangThai = h.Trang_thai
    form.lang = h.Lang || 'vi'
    form.donViTienTe = h.Don_vi_tien_te || 'VND'
  }
)

/* ================= TRẠNG THÁI ================= */
const trangThaiList = computed(() => {
  return [
    ...new Set(hangHoaList.value.map((h) => h.Trang_thai).filter(Boolean)),
  ]
})

/* ================= ITEMS ================= */
const items = ref([])
const highlightedIndex = ref(-1)

function highlightRow(index) {
  if (index === -1) return
  highlightedIndex.value = index
  
  // Update scroll with nextTick
  nextTick(() => {
    const tableWrap = document.querySelector('.order-table-wrap')
    if (tableWrap) {
      const rows = tableWrap.querySelectorAll('tbody tr')
      const targetRow = rows[index]
      if (targetRow) {
        // Precise scroll within the overflow container
        targetRow.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  })

  // Clear highlight after animation
  setTimeout(() => {
    highlightedIndex.value = -1
  }, 1600)
}

/* ================= ĐƠN VỊ TIỀN TỆ CHUNG ================= */
const donViTienTeChung = computed(() => {
  if (!items.value.length) return 'VND'
  return items.value[0].donViTienTe || 'VND'
})

/* ================= KIỂM TRA SIZE/DVT CÓ GIÁ TRỊ ================= */
const hasAnySize = computed(() => {
  return items.value.some(i => i.size && i.size.trim())
})

const hasAnyDvt = computed(() => {
  return items.value.some(i => i.dvt && i.dvt.trim())
})

const totalItemQty = computed(() => {
  return items.value.reduce((sum, item) => sum + Number(item.soLuong || 0), 0)
})

const hasCustomerData = computed(() => {
  return form.tenKhachHang || form.soDienThoai || form.diaChi || form.ghiChu
})

const hasProductData = computed(() => {
  return !!(form.tenHang && form.tenHang.trim())
})

const uniqueSizes = computed(() => {
  const sizes = new Set()
  hangHoaList.value.forEach(h => {
    if (h.Size) sizes.add(h.Size)
  })
  return Array.from(sizes).sort()
})

const uniqueDvts = computed(() => {
  const s = new Set()
  hangHoaList.value.forEach(h => { if (h.Dvt) s.add(h.Dvt) })
  return Array.from(s).sort()
})

const uniqueDanhMucs = computed(() => {
  const s = new Set()
  hangHoaList.value.forEach(h => { if (h.Danh_muc) s.add(h.Danh_muc) })
  return Array.from(s).sort()
})

/* ================= CUSTOMER INFO COMPUTED ================= */
const selectedCustomer = computed(() => {
  if (form.maKhachHang) {
    return khachHangList.value.find(k => k.Ma_khach_hang === form.maKhachHang) || null
  }
  return khachHangList.value.find(k => k.Ten_khach_hang === form.tenKhachHang) || null
})

const customerDebt = computed(() => Number(selectedCustomer.value?.Cong_no_hien_tai || 0))
const customerTotalSpend = computed(() => Number(selectedCustomer.value?.Tong_chi_tieu || 0))
const customerProfit = computed(() => {
  const mkh = form.maKhachHang
  if (!mkh) return 0
  return soThuChiList.value
    .filter(tc => tc.Ma_khach_hang === mkh && tc.Trang_thai === 'BAN_HANG')
    .reduce((sum, tc) => sum + Number(tc.loi_nhuan || 0), 0)
})

const khuyenMaiText = computed(() => {
  if (!form.maNCC) return ''
  const kms = khuyenMaiList.value
    .filter(km => km.Ma_nha_cung_cap === form.maNCC)
    .map(km => km.Noi_dung)
    .filter(Boolean)
  
  return kms.map(k => `* ${k}`).join('\n')
})

const hasActiveFilters = computed(() => {
  return !!(
    searchProduct.value ||
    (selectedLang.value && selectedLang.value.toLowerCase() !== 'vi') ||
    selectedCategory.value ||
    selectedSize.value ||
    onlyPromotion.value
  )
})

const allFilteredProducts = computed(() => {
  let products = hangHoaList.value

  // 1. Search
  if (searchProduct.value) {
    const search = searchProduct.value.toLowerCase()
    products = products.filter(p => 
      p.Ten_hang?.toLowerCase().includes(search) ||
      p.Mo_ta?.toLowerCase().includes(search) ||
      p.Ma_hang?.toLowerCase().includes(search)
    )
  }

  // 2. Filter Language
  if (selectedLang.value) {
    products = products.filter(p => (p.Lang || 'vi') === selectedLang.value)
  }

  // 3. Filter Category
  if (selectedCategory.value) {
    products = products.filter(p => p.Danh_muc === selectedCategory.value)
  }

  // 4. Filter Promotion
  if (onlyPromotion.value) {
    products = products.filter(p => Number(p.Gia_Giam || 0) > 0)
  }

  // 5. Filter Size
  if (selectedSize.value) {
    products = products.filter(p => p.Size === selectedSize.value)
  }

  // 6. Filter Stock Status
  if (selectedStockStatus.value !== 'all') {
    if (selectedStockStatus.value === 'in') {
      products = products.filter(p => Number(p.So_luong_kho || 0) > 0)
    } else if (selectedStockStatus.value === 'out') {
      products = products.filter(p => Number(p.So_luong_kho || 0) === 0)
    }
  }

  return products
})

const filteredProducts = computed(() => {
  // Pagination based on filtered results
  return allFilteredProducts.value
})

const totalPages = computed(() => 1)

// Reset page when any filter changes
watch([searchProduct, selectedLang, onlyPromotion, selectedSize], () => {
  currentPage.value = 1
})

const productImages = computed(() => {
  if (!selectedProduct.value) return []
  
  const images = []
  const mainImg = selectedProduct.value.Main_img_base64 || selectedProduct.value.Main_img
  if (mainImg) images.push(mainImg)
  
  for (let i = 1; i <= 6; i++) {
    const base64Key = `img_${i}_base64`
    const urlKey = `img_${i}`
    const img = selectedProduct.value[base64Key] || selectedProduct.value[urlKey]
    if (img) images.push(img)
  }
  
  return images
})

function calcDiscount(giaBan, soLuong, giamGia, chietKhau) {
  const qty = Number(soLuong || 0)
  const price = Number(giaBan || 0)
  const giamGiaTien = Number(giamGia || 0) * qty
  const ck1sp = price * (Number(chietKhau || 0) / 100)
  const chietKhauTien = ck1sp * qty
  return {
    giamGiaTien,
    chietKhauTien,
    tongGiamTru: giamGiaTien + chietKhauTien,
    ck1sp,
  }
}

function hasItemDiscount(item) {
  return Number(item?.chietKhau || 0) > 0 || Number(item?.giamGia || 0) > 0
}

function getItemChietKhauTien(item) {
  const cached = Number(item?.tongChietKhauTien)
  if (Number.isFinite(cached)) return cached
  const d = calcDiscount(item?.giaBan, item?.soLuong, item?.giamGia, item?.chietKhau)
  return d.chietKhauTien
}

function getItemGiamGiaTien(item) {
  const cached = Number(item?.tongGiamGiaTien)
  if (Number.isFinite(cached)) return cached
  const d = calcDiscount(item?.giaBan, item?.soLuong, item?.giamGia, item?.chietKhau)
  return d.giamGiaTien
}

function getItemUnitPriceAfterDiscount(item) {
  const price = Number(item?.giaBan || 0)
  if (!price) return 0
  const d = calcDiscount(item?.giaBan, item?.soLuong, item?.giamGia, item?.chietKhau)
  const unit = price - d.ck1sp - Number(item?.giamGia || 0)
  return Math.max(0, unit)
}

const manualPreview = computed(() => {
  const soLuong = Number(form.soLuong || 0)
  const giaBan = Number(form.giaBan || 0)
  const giaGoc = Number(form.giaGoc || 0)
  const d = calcDiscount(giaBan, soLuong, form.giamGia, form.chietKhau)
  const thanhTien = giaBan * soLuong
  const sauGiam = thanhTien - d.tongGiamTru
  const loiNhuan =
    (giaBan - d.ck1sp - giaGoc - Number(form.giamGia || 0)) * soLuong
  return {
    thanhTien,
    chietKhauTien: d.chietKhauTien,
    giamGiaTien: d.giamGiaTien,
    tongGiamTru: d.tongGiamTru,
    sauGiam,
    loiNhuan,
  }
})

function resetCatalogFilters() {
  searchProduct.value = ''
  selectedLang.value = 'vi'
  selectedCategory.value = ''
  selectedSize.value = ''
  onlyPromotion.value = false
  currentPage.value = 1
}


function setPlus20Min() {
  const now = new Date()
  now.setMinutes(now.getMinutes() + 20)
  
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  ngayNhanHang.value = `${y}-${m}-${d}`
  
  gioNhanHang.value = String(now.getHours()).padStart(2, '0')
  phutNhanHang.value = String(now.getMinutes()).padStart(2, '0')
  
  form.ghiChuDonHang = 'Làm xong ship liền'
  
  toast('success', 'Đã cập nhật thời gian: +20 phút')
}

function toggleNotePopover(maHang) {
  notePopoverOpen[maHang] = !notePopoverOpen[maHang]
}

function highlightCard(maHang) {
  cardHighlight[maHang] = true
  setTimeout(() => {
    cardHighlight[maHang] = false
  }, 600)
}

function addItem() {
  const tenHangTrim = (form.tenHang || '').trim()
  if (!tenHangTrim) {
    toast('warn', '?? Vui long nhap ten hang')
    return
  }

  form.tenHang = tenHangTrim

  const hasMaHang = !!form.maHang
  const tonKho = tonKhoHienTai.value

  if (hasMaHang) {
    if (tonKho === 0) {
      toast('error', '? S?n ph?m n…y da H?T HANG trong kho!')
      return
    }

    if (form.soLuong > tonKho) {
      toast(
        'error',
        `? KHONG D? HANG TRONG KHO!\n\n` +
        `T?n kho hi?n t?i: ${tonKho} ${form.dvt}\n` +
        `B?n dang nh?p: ${form.soLuong} ${form.dvt}\n\n` +
        `Vui l•ng gi?m s? lu?ng ho?c nh?p thˆm h…ng v…o kho.`
      )
      return
    }
  }

  /* ===== CHECK EXISTS & AGGREGATE ===== */
  let existingItemIndex = -1
  if (hasMaHang) {
    const maHangKey = form.maHang
    const sizeKey = form.size
    const dvtKey = form.dvt
    
    existingItemIndex = items.value.findIndex(i => 
      (i.Ma_hang || i.maHang) === maHangKey && 
      i.Size === sizeKey && 
      i.Dvt === dvtKey
    )
  }
  if (existingItemIndex > -1) {
    // Aggregation Logic
    const existingItem = items.value[existingItemIndex]
    
    // Calculate new total quantity
    const qtyToAdd = form.soLuong || 1
    const newQty = existingItem.So_luong + qtyToAdd
    
    // Check stock limit
    if (newQty > tonKho) {
      toast(
        'error',
        `❌ KHÔNG ĐỦ HÀNG TRONG KHO!\n\n` +
        `Tồn kho hiện tại: ${tonKho} ${form.dvt}\n` +
        `Đã có trong đơn: ${existingItem.So_luong} ${form.dvt}\n` +
        `Bạn thêm: ${qtyToAdd} ${form.dvt}\n` +
        `Tổng cộng: ${newQty} ${form.dvt} (Vượt quá tồn kho)\n\n`
      )
      return
    }

    // Recalculate financial fields
    const giaBan = form.giaBan
    const chietKhau = Number(existingItem.chietKhau ?? existingItem.Chiet_khau ?? 0)
    const giamGia = Number(existingItem.giamGia ?? existingItem.Giam_gia ?? 0)
    const giaGoc = form.giaGoc

    const d = calcDiscount(giaBan, newQty, giamGia, chietKhau)
    const Thanh_tien = giaBan * newQty
    const Loi_nhuan = (giaBan - d.ck1sp - giaGoc - giamGia) * newQty

    // Update existing item fields (UI & Sheet sync)
    existingItem.So_luong = newQty
    existingItem.soLuong = newQty
    existingItem.Tien_chiet_khau = d.chietKhauTien
    existingItem.Thanh_tien = Thanh_tien
    existingItem.thanhTien = Thanh_tien
    existingItem.tongGiamGiaTien = d.giamGiaTien
    existingItem.tongChietKhauTien = d.chietKhauTien
    existingItem.tongGiamTru = d.tongGiamTru
    existingItem.tongGiamGiaDong = d.tongGiamTru
    existingItem.Loi_nhuan = Loi_nhuan
    existingItem.loiNhuan = Loi_nhuan
    
    // Merge Notes
    if (form.ghiChuHang && form.ghiChuHang !== existingItem.Ghi_chu) {
      existingItem.Ghi_chu = existingItem.Ghi_chu 
        ? `${existingItem.Ghi_chu}, ${form.ghiChuHang}`
        : form.ghiChuHang
      existingItem.ghiChuHang = existingItem.Ghi_chu
    }

    toast('success', `✅ Đã cộng dồn +${qtyToAdd} vào ${form.tenHang}`)
    highlightRow(existingItemIndex)

  } else {
    // Add new item (existing logic)
    const d = calcDiscount(form.giaBan, form.soLuong, form.giamGia, form.chietKhau)
  
    const loiNhuan =
      (form.giaBan - d.ck1sp - form.giaGoc - form.giamGia) * form.soLuong
  
    const thanhTien = form.giaBan * form.soLuong
  
    items.value.push({
      Ma_hoa_don: maHoaDon.value,
      So_hoa_don: soHoaDon.value,
      Ngay_tao_duong_lich: formatDateTimeVN(),
      Ma_hang: form.maHang,
      Ten_hang: form.tenHang,
      Ma_nha_cung_cap: form.maNCC,
      Ten_nha_cung_cap: form.tenNCC,
      Trang_thai: form.trangThai,
      Danh_muc: form.danhMuc,
      Size: form.size,
      Dvt: form.dvt,
      Lang: form.lang,
      Don_vi_tien_te: form.donViTienTe,
      lang: form.lang,
      donViTienTe: form.donViTienTe,
      So_luong: form.soLuong,
      Gia_goc: form.giaGoc,
      Gia_ban: form.giaBan,
      Giam_gia: form.giamGia,
      Tien_chiet_khau: d.chietKhauTien,
      Thanh_tien: thanhTien,
      Loi_nhuan: loiNhuan,
      Ghi_chu: form.ghiChuHang || '',
      ghiChuHang: form.ghiChuHang,
      soLuong: form.soLuong,
      giaGoc: form.giaGoc,
      giaBan: form.giaBan,
      chietKhau: form.chietKhau,
      giamGia: form.giamGia,
      thanhTien,
      loiNhuan,
      tongGiamGiaTien: d.giamGiaTien,
      tongChietKhauTien: d.chietKhauTien,
      tongGiamTru: d.tongGiamTru,
      tongGiamGiaDong: d.tongGiamTru,
      maHang: form.maHang,
      tenHang: form.tenHang,
      size: form.size,
      dvt: form.dvt,
      maNCC: form.maNCC,
      tenNCC: form.tenNCC,
      danhMuc: form.danhMuc,
      trangThai: form.trangThai,
    })
    const newIndex = items.value.length - 1
    highlightRow(newIndex)
  }

  // Visual success feedback
  addedSuccessManual.value = true
  setTimeout(() => {
    addedSuccessManual.value = false
  }, 1200)

  resetItem()
}

function resetItem() {
  form.maHang = ''
  form.tenHang = ''
  form.soLuong = 1
  form.giaGoc = 0
  form.chietKhau = 0
  form.giamGia = 0
  form.giaBan = 0
  form.ghiChuHang = ''
}

/* ================= THANH TOÁN ================= */
const hinhThucThanhToan = ref('TIEN_MAT')
const tiGiaRef = ref(null)

function handlePaymentMethodChange(method) {
  hinhThucThanhToan.value = method
  if (method === 'CHUYEN_KHOAN') {
    nextTick(() => {
      tiGiaRef.value?.focus()
    })
  }
}

const tenHinhThucThanhToan = computed(() => {
  if (hinhThucThanhToan.value === 'CHUYEN_KHOAN') return 'Chuyển khoản'
  return 'Tiền mặt'
})

/* ================= GLOBAL DISCOUNT INTERFACE ================= */
const showDiscountModal = ref(false)
const activeDiscountType = ref('money') // 'money' | 'percent'
const globalGiamGia = ref(0)
const globalChietKhauPercent = ref(0)
const tempGlobalGiamGia = ref(0)
const tempGlobalChietKhauPercent = ref(0)

function openDiscountModal(type) {
  activeDiscountType.value = type
  if (type === 'money') {
    tempGlobalGiamGia.value = globalGiamGia.value
  } else {
    tempGlobalChietKhauPercent.value = globalChietKhauPercent.value
  }
  showDiscountModal.value = true
}

function applyGlobalDiscount() {
  if (activeDiscountType.value === 'money') {
    globalGiamGia.value = tempGlobalGiamGia.value
    toast('success', 'Đã cập nhật giảm giá thêm')
  } else {
    globalChietKhauPercent.value = tempGlobalChietKhauPercent.value
    toast('success', 'Đã cập nhật chiết khấu thêm')
  }
  showDiscountModal.value = false
}

const tamTinh = computed(() =>
  items.value.reduce((s, i) => s + i.thanhTien, 0)
)

const tongGiamGia = computed(() => {
  const itemTotal = items.value.reduce((s, i) => {
    const giamGiaTien = Number(i.tongGiamGiaTien)
    if (Number.isFinite(giamGiaTien)) return s + giamGiaTien
    const d = calcDiscount(i.giaBan, i.soLuong, i.giamGia, i.chietKhau)
    return s + d.giamGiaTien
  }, 0)
  // Global Discount (Money) is added here
  return itemTotal + (globalGiamGia.value || 0)
})

const tongTienChietKhau = computed(() => {
  const itemTotal = items.value.reduce((s, i) => {
    const chietKhauTien = Number(i.tongChietKhauTien)
    if (Number.isFinite(chietKhauTien)) return s + chietKhauTien
    const d = calcDiscount(i.giaBan, i.soLuong, i.giamGia, i.chietKhau)
    return s + d.chietKhauTien
  }, 0)
  
  // Calculate Global Percent Amount
  // Base: (TamTinh - TongGiamGia_Items - GlobalGiamGia_Money) + Item_ChietKhau? 
  // Simplified: (Tam Tinh - Total Giam Gia) * Percent
  const baseAmount = tamTinh.value - tongGiamGia.value
  const globalPercentAmount = baseAmount > 0 
    ? baseAmount * ((globalChietKhauPercent.value || 0) / 100) 
    : 0

  return itemTotal + globalPercentAmount
})

const tongCong = computed(() => tamTinh.value - tongGiamGia.value - tongTienChietKhau.value)
const tongLoiNhuan = computed(() => {
  const itemProfit = items.value.reduce((s, i) => s + i.loiNhuan, 0)
  // Deduct global discount amount and global rebate amount
  const globalRebateAmount = (tongTienChietKhau.value - items.value.reduce((s, i) => s + (i.tongChietKhauTien || 0), 0))
  return itemProfit - (globalGiamGia.value || 0) - globalRebateAmount
})

/* ================= UTILS ================= */
function format(n) {
  return Number(n || 0).toLocaleString('vi-VN')
}

function formatWithCurrency(n, currency) {
  return format(n) + ' ' + (currency || 'VND')
}

function formatDateTimeLocal(date = new Date()) {
  const p = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(
    date.getDate()
  )}T${p(date.getHours())}:${p(date.getMinutes())}`
}

function splitDateTimeLocal(value) {
  if (!value || !value.includes('T')) return { date: '', time: '' }
  const [date, time] = value.split('T')
  return { date, time: time?.slice(0, 5) || '' }
}

function formatDateTimeVN(date = new Date()) {
  const p = (n) => String(n).padStart(2, '0')
  return `${p(date.getHours())}:${p(date.getMinutes())}:${p(
    date.getSeconds()
  )} ${p(date.getDate())}/${p(date.getMonth() + 1)}/${date.getFullYear()}`
}

const isSubmitting = ref(false)

watch(
  () => [ngayNhanHang.value, gioNhanHang.value, phutNhanHang.value],
  ([date, gio, phut]) => {
    if (!date || !gio || !phut) return
    thoiGianNhanHang.value = `${date}T${gio}:${phut}`
  }
)

async function hoanThanhDon() {
  if (!items.value.length) {
    toast('warn', 'Chưa có hàng trong đơn')
    return
  }

  if (isSubmitting.value) return
  isSubmitting.value = true

  const payload = {
    action: 'hoanThanhDon',
    hoa_don: {
      Ma_hoa_don: maHoaDon.value,
      So_hoa_don: soHoaDon.value,
      Ngay_tao_duong_lich: formatDateTimeVN(),
      Thoi_gian_nhan_hang: formatDateTimeVN(new Date(thoiGianNhanHang.value)),
      Ma_khach_hang: form.maKhachHang,
      Ten_khach_hang: form.tenKhachHang,
      Ma_nha_cung_cap: form.maNCC,
      Ten_nha_cung_cap: form.tenNCC,
      Tra_tien: tongCong.value,
      Tam_tinh: tamTinh.value,
      Tong_giam_gia: tongGiamGia.value,
      Tong_tien_chiet_khau: tongTienChietKhau.value,
      Tong_cong: tongCong.value,
      Tong_loi_nhuan: tongLoiNhuan.value,
      Hinh_thuc_thanh_toan: hinhThucThanhToan.value,
      Dia_chi: form.diaChi,
      So_dien_thoai: String(form.soDienThoai),
      Ghi_chu_don_hang: form.ghiChuDonHang,
      Ti_gia: tiGia.value,
      Don_vi_tien_te_ck: donViTienTeCK.value,
    },
    items: items.value,
    khach_hang: {
      Ma_khach_hang: form.maKhachHang,
      Ten_khach_hang: form.tenKhachHang,
      So_dien_thoai: String(form.soDienThoai),
      Dia_chi: form.diaChi,
      Tong_chi_tieu: tongCong.value,
      Ghi_chu: form.ghiChu,
    },
    nha_cung_cap: {
      Ma_nha_cung_cap: form.maNCC,
      Tong_loi_nhuan: tongLoiNhuan.value,
      Tong_cong: tongCong.value,
      Hinh_thuc_thanh_toan: hinhThucThanhToan.value,
    },
  }

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (res.type === 'opaque') {
      openSuccessModal('Hoàn thành đơn ')
      return
    }

    const json = await res.json()

    if (json.success) {
      openSuccessModal('✅ Hoàn thành đơn thành công')
    } else {
      toast('error', '❌ Lỗi: ' + json.message)
    }
  } catch (e) {
    toast('error', '❌ Lỗi kết nối server')
  } finally {
    isSubmitting.value = false
  }
}

function cleanPhoneInput(event) {
  const cleaned = event.target.value.replace(/\D/g, '')
  form.soDienThoai = cleaned
}

const hoaDonRef = ref(null)

async function previewHoaDon() {
  if (!items.value.length) {
    toast('warn', 'Chưa có hàng trong đơn')
    return
  }

  if (isPreviewing.value) return
  isPreviewing.value = true
  
  // Give UI time to update before heavy computation
  await nextTick()

  try {
    const canvas = await html2canvas(hoaDonRef.value, {
      scale: 1.5, // Reduced from 2 to optimize speed while keeping good quality
      backgroundColor: '#ffffff',
      useCORS: true,
      logging: false,
    })

    const img = canvas.toDataURL('image/png', 0.85) // Compressed PNG quality
    invoiceImageUrl.value = img

  const win = window.open('', '_blank')
  win.document.write(`
    <html>
    <head>
      <title>Xem hóa đơn</title>
      <link href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css" rel="stylesheet">
      <style>
        body { margin:0; text-align:center; background:#eee; font-family: system-ui, -apple-system, sans-serif; }
        img { max-width:100%; margin-top:10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .bar {
          position: sticky;
          top: 0;
          background: white;
          padding: 12px;
          border-bottom: 1px solid #ddd;
          display: flex;
          justify-content: center;
          gap: 10px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        .btn {
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          color: white;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          transition: transform 0.1s, opacity 0.2s;
        }
        .btn:hover { opacity: 0.9; transform: translateY(-1px); }
        .btn:active { transform: translateY(0); }
        
        .btn-download { background-color: #22c55e; } /* Green */
        .btn-copy { background-color: #f59e0b; } /* Orange */
        .btn-print { background-color: #3b82f6; } /* Blue */

        @media print {
          .bar { display: none !important; }
          title { display: none !important; }
          body { 
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }
          img { margin: 0; box-shadow: none; }
        }
      </style>
    </head>
    <body>
      <div class="bar">
        <button class="btn btn-download" onclick="download()"><i class="ri-download-line"></i> Tải ảnh</button>
        <button class="btn btn-copy" onclick="copyImage()"><i class="ri-file-copy-line"></i> Copy ảnh</button>
        <button class="btn btn-print" onclick="window.print()"><i class="ri-printer-line"></i> In</button>
      </div>
      <img id="img" src="${img}" />
      <script>
        function download() {
          const a = document.createElement('a')
          a.href = document.getElementById('img').src
          a.download = 'hoa-don.png'
          a.click()
        }
        async function copyImage() {
          try {
            const img = document.getElementById('img')
            const response = await fetch(img.src)
            const blob = await response.blob()
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob })
            ])
            window.opener?.toast?.('success', 'Đã copy ảnh vào clipboard')
          } catch (err) {
            window.opener?.toast?.('error', 'Lỗi copy ảnh: ' + err.message)
          }
        }
      <\/script>
    </body>
    </html>
  `)
  } catch (err) {
    console.error('Lỗi tạo ảnh hóa đơn:', err)
    toast('error', 'Không thể tạo ảnh hóa đơn. Vui lòng thử lại.')
  } finally {
    isPreviewing.value = false
  }
}

const showTextInvoice = ref(false)
const textInvoiceRef = ref(null)
const isTextCopied = ref(false)

const textInvoice = computed(() => {
  const lines = []

  items.value.forEach((i) => {
    const ghiChu = i.ghiChuHang ? ` (${i.ghiChuHang})` : ''
    lines.push(
      `${i.soLuong} ${i.tenHang} : ${formatWithCurrency(i.giaBan, i.donViTienTe)}${ghiChu}`
    )
  })

  return `
${lines.join('\n')}

Địa chỉ: ${form.diaChi}
SĐT: ${form.soDienThoai}
Thời gian nhận: ${formatDateTimeVN(new Date(thoiGianNhanHang.value))}
Tổng cộng: ${formatWithCurrency(tongCong.value, donViTienTeChung.value)}
Ghi chú đơn hàng : ${form.ghiChuDonHang || ''}
`.trim()
})

function openTextInvoice() {
  if (!items.value.length) {
    toast('warn', 'Chưa có hàng trong đơn')
    return
  }
  showTextInvoice.value = true
}

function copyTextInvoice() {
  navigator.clipboard.writeText(textInvoice.value)
  toast('success', 'Đã copy hóa đơn')
  
  isTextCopied.value = true
  setTimeout(() => {
    isTextCopied.value = false
  }, 2000)
}

function openEditItem(item, idx) {
  editIndex.value = idx
  Object.assign(editItem, JSON.parse(JSON.stringify(item)))
  showEditModal.value = true
}

function deleteItem(idx) {
  if (confirm(`Xóa hàng "${items.value[idx].tenHang}" khỏi đơn?`)) {
    items.value.splice(idx, 1)
  }
}

function saveEditItem() {
  const i = editItem

  const hang = hangHoaList.value.find(h => h.Ma_hang === i.maHang)
  const tonKho = hang ? Number(hang.So_luong_kho || 0) : 0

  if (tonKho === 0) {
    toast('error', '❌ Sản phẩm này đã HẾT HÀNG trong kho!')
    return
  }

  if (i.soLuong > tonKho) {
    toast(
      'error',
      `❌ KHÔNG ĐỦ HÀNG TRONG KHO!\n\n` +
      `Tồn kho hiện tại: ${tonKho} ${i.dvt}\n` +
      `Bạn đang nhập: ${i.soLuong} ${i.dvt}\n\n` +
      `Vui lòng giảm số lượng hoặc nhập thêm hàng vào kho.`
    )
    return
  }

  const d = calcDiscount(i.giaBan, i.soLuong, i.giamGia, i.chietKhau)

  i.thanhTien = i.giaBan * i.soLuong
  i.tongGiamGiaTien = d.giamGiaTien
  i.tongChietKhauTien = d.chietKhauTien
  i.tongGiamTru = d.tongGiamTru
  i.tongGiamGiaDong = d.tongGiamTru

  i.loiNhuan =
    (i.giaBan - d.ck1sp - i.giaGoc - i.giamGia) * i.soLuong

  i.Tien_chiet_khau = d.chietKhauTien
  i.Thanh_tien = i.thanhTien
  i.Loi_nhuan = i.loiNhuan
  i.So_luong = i.soLuong
  i.Gia_goc = i.giaGoc
  i.Gia_ban = i.giaBan
  i.Giam_gia = i.giamGia
  i.Ghi_chu = i.ghiChuHang || '' // ✅ CẬP NHẬT GHI CHÚ HÀNG

  items.value[editIndex.value] = { ...i }

  showEditModal.value = false
}

const hoaDonNCCRef = ref(null)

const giaGiamHienThi = computed(() => {
  if (!form.maHang) return 0
  
  const h = hangHoaList.value.find(x => x.Ma_hang === form.maHang)
  return h ? Number(h.Gia_Giam || 0) : 0
})

const giaGocBan = computed(() => {
  if (!form.maHang) return 0
  
  const h = hangHoaList.value.find(x => x.Ma_hang === form.maHang)
  return h ? Number(h.Gia_ban || 0) : 0
})

// ✨ FUNCTION LẤY ICON CHO CONTACT
function getContactIcon(platform) {
  const iconMap = {
    'Zalo': 'ri-smartphone-line',
    'Facebook': 'ri-facebook-box-line',
    'Telegram': 'ri-telegram-line',
    'WhatsApp': 'ri-whatsapp-line',
    'Instagram': 'ri-instagram-line',
    'TikTok': 'ri-tiktok-line',
    'Phone': 'ri-phone-line',
    'Email': 'ri-mail-line',
    'Website': 'ri-global-line'
  }
  return iconMap[platform] || 'ri-customer-service-2-line'
}

/* ================= CATALOG FUNCTIONS ================= */
function decreaseQty(product) {
  if (productQty[product.Ma_hang] > 1) {
    productQty[product.Ma_hang]--
  }
}

function increaseQty(product) {
  if (productQty[product.Ma_hang] < product.So_luong_kho) {
    productQty[product.Ma_hang]++
  }
}

function getStockClass(stock) {
  if (stock === 0) return 'stock-out'
  if (stock <= 5) return 'stock-low' // Updated threshold to 5
  return 'stock-ok'
}

const addedSuccess = reactive({})

function addProductToCart(product) {
  const qtyToAdd = productQty[product.Ma_hang] || 1
  const ghiChuMoi = productNotes[product.Ma_hang] || ''

  if (product.So_luong_kho === 0) {
    toast('error', 'Sản phẩm đã HẾT HÀNG trong kho!')
    return
  }

  /* ===== CHECK EXISTS & AGGREGATE ===== */
  const maHangKey = product.Ma_hang
  const sizeKey = product.Size
  const dvtKey = product.Dvt

  const existingItemIndex = items.value.findIndex(i => 
    (i.Ma_hang || i.maHang) === maHangKey && 
    i.Size === sizeKey && 
    i.Dvt === dvtKey
  )

  if (existingItemIndex > -1) {
    // Aggregation Logic
    const existingItem = items.value[existingItemIndex]
    const newQty = existingItem.So_luong + qtyToAdd

    // Check stock limit
    if (newQty > product.So_luong_kho) {
      toast('error', `Số lượng vượt quá tồn kho (Đã có: ${existingItem.So_luong}, Thêm: ${qtyToAdd}, Tồn: ${product.So_luong_kho})`)
      return
    }

    // Calculations
    const giaGoc = Number(product.Gia_goc) || 0
    const giaBan = (product.Gia_Giam && Number(product.Gia_Giam) > 0) 
      ? Number(product.Gia_Giam) 
      : Number(product.Gia_ban) || 0
    
    const chietKhau = Number(existingItem.chietKhau ?? existingItem.Chiet_khau ?? 0)
    const giamGia = Number(existingItem.giamGia ?? existingItem.Giam_gia ?? 0)
    
    const d = calcDiscount(giaBan, newQty, giamGia, chietKhau)
    const Thanh_tien = giaBan * newQty
    const Loi_nhuan = (giaBan - d.ck1sp - giaGoc - giamGia) * newQty

    // Update existing item fields
    existingItem.So_luong = newQty
    existingItem.soLuong = newQty
    existingItem.Tien_chiet_khau = d.chietKhauTien
    existingItem.Thanh_tien = Thanh_tien
    existingItem.thanhTien = Thanh_tien
    existingItem.tongGiamGiaTien = d.giamGiaTien
    existingItem.tongChietKhauTien = d.chietKhauTien
    existingItem.tongGiamTru = d.tongGiamTru
    existingItem.tongGiamGiaDong = d.tongGiamTru
    existingItem.Loi_nhuan = Loi_nhuan
    existingItem.loiNhuan = Loi_nhuan
    
    // Merge Notes
    if (ghiChuMoi && ghiChuMoi !== existingItem.Ghi_chu) {
      existingItem.Ghi_chu = existingItem.Ghi_chu 
        ? `${existingItem.Ghi_chu}, ${ghiChuMoi}`
        : ghiChuMoi
      existingItem.ghiChuHang = existingItem.Ghi_chu
    }

    toast('success', `✅ Đã cộng dồn +${qtyToAdd} vào ${product.Ten_hang}`)
    highlightRow(existingItemIndex)

    // Trigger Success State
    addedSuccess[product.Ma_hang] = true
    setTimeout(() => {
      addedSuccess[product.Ma_hang] = false
    }, 1500)

  } else {
    // Add new item (existing logic)
    const giaGoc = Number(product.Gia_goc) || 0
    const giaBan = (product.Gia_Giam && Number(product.Gia_Giam) > 0) 
      ? Number(product.Gia_Giam) 
      : Number(product.Gia_ban) || 0
    
    const chietKhau = 0 
    const giamGia = 0 
    
    const d = calcDiscount(giaBan, qtyToAdd, giamGia, chietKhau)
  
    const loiNhuan = (giaBan - d.ck1sp - giaGoc - giamGia) * qtyToAdd
    const thanhTien = giaBan * qtyToAdd
  
    items.value.push({
      Ma_hoa_don: maHoaDon.value,
      So_hoa_don: soHoaDon.value,
      Ngay_tao_duong_lich: formatDateTimeVN(),
      Ma_hang: product.Ma_hang,
      Ten_hang: product.Ten_hang,
      Ma_nha_cung_cap: product.Ma_nha_cung_cap,
      Ten_nha_cung_cap: product.Ten_nha_cung_cap,
      Trang_thai: product.Trang_thai,
      Danh_muc: product.Danh_muc,
      Size: product.Size,
      Dvt: product.Dvt,
      Lang: product.Lang || 'vi',
      Don_vi_tien_te: product.Don_vi_tien_te || 'VND',
      lang: product.Lang || 'vi',
      donViTienTe: product.Don_vi_tien_te || 'VND',
      So_luong: qtyToAdd,
      Gia_goc: giaGoc,
      Gia_ban: giaBan,
      Giam_gia: giamGia,
      Tien_chiet_khau: d.chietKhauTien,
      Thanh_tien: thanhTien,
      Loi_nhuan: loiNhuan,
      Ghi_chu: ghiChuMoi,
      ghiChuHang: ghiChuMoi,
      soLuong: qtyToAdd,
      giaGoc: giaGoc,
      giaBan: giaBan,
      chietKhau: chietKhau,
      giamGia: giamGia,
      thanhTien,
      loiNhuan,
      tongGiamGiaTien: d.giamGiaTien,
      tongChietKhauTien: d.chietKhauTien,
      tongGiamTru: d.tongGiamTru,
      tongGiamGiaDong: d.tongGiamTru,
      maHang: product.Ma_hang,
      tenHang: product.Ten_hang,
      size: product.Size,
      dvt: product.Dvt,
      maNCC: product.Ma_nha_cung_cap,
      tenNCC: product.Ten_nha_cung_cap,
      danhMuc: product.Danh_muc,
      trangThai: product.Trang_thai,
    })
    const newIndex = items.value.length - 1
    highlightRow(newIndex)
  }

  // Trigger Success State
  addedSuccess[product.Ma_hang] = true
  setTimeout(() => {
    addedSuccess[product.Ma_hang] = false
  }, 1500)

  // Reset local state
  productQty[product.Ma_hang] = 1
  productNotes[product.Ma_hang] = ''
  notePopoverOpen[product.Ma_hang] = false
  highlightCard(product.Ma_hang)
}

function openProductDetail(product) {
  selectedProduct.value = product
  currentMainImage.value = product.Main_img_base64 || product.Main_img || ''
  showProductDetail.value = true
}

function changeMainImage(imgSrc) {
  currentMainImage.value = imgSrc
}

function cardImg(product) {
  if (!product) return ''
  const steps = [
    product.Main_img_base64,
    product.Main_img,
    product.img_1_base64,
    product.img_1,
    product.img_2_base64,
    product.img_2,
    product.img_3_base64,
    product.img_3,
    product.img_4_base64,
    product.img_4,
    product.img_5_base64,
    product.img_5,
    product.img_6_base64,
    product.img_6,
  ].filter(Boolean)
  const step = cardImgStep[product.Ma_hang] || 0
  return steps[step] || ''
}

function onCardImgError(product) {
  if (!product) return
  const current = cardImgStep[product.Ma_hang] || 0
  cardImgStep[product.Ma_hang] = current + 1
}
</script>





<style scoped>
/* ===== COLOR VARIABLES (GREEN ACCENT THEME) ===== */
.page {
  --accent-green: #22c55e;
  --accent-green-dark: #16a34a;
  --accent-green-darker: #15803d;
  --accent-green-glow: rgba(34, 197, 94, 0.25);
  --accent-green-light: rgba(34, 197, 94, 0.15);
}

.status-dot-green {
  width: 8px;
  height: 8px;
  background-color: var(--accent-green);
  border-radius: 50%;
  margin-right: 8px;
  box-shadow: 0 0 12px var(--accent-green);
  animation: dot-pulse-green 2s infinite;
  flex-shrink: 0;
}

@keyframes dot-pulse-green {
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
  70% { transform: scale(1.2); box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
}

.page {
  max-width: none !important;
  width: 100% !important;
  margin: 0 !important;
  padding: 12px; /* Reduced padding */
  background: rgb(15, 23, 42);
  color: #e2e8f0;
  box-sizing: border-box;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.page * {
  box-sizing: border-box;
}

.box {
  background: rgba(2, 6, 23, 0.72);
  padding: 18px;
  margin-bottom: 0;
  border-radius: 14px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  box-shadow: 0 12px 32px rgba(2, 6, 23, 0.45);
  backdrop-filter: blur(8px);
}

/* Section Headers: Customer, Delivery, Summary, Payment */
.box h3,
h3.card-title {
  margin: 0 0 14px 0;
  font-size: 16px;
  font-weight: 700;
  color: #10b981 !important; /* Green text */
  display: flex !important;
  align-items: center !important;
  justify-content: flex-start !important; /* Left align */
  gap: 10px !important;
  text-align: left !important;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px dashed rgba(16, 185, 129, 0.2);
  padding-bottom: 8px;
}

.box h3 i,
h3.card-title i {
  color: #ffffff !important; /* White icon */
  font-size: 18px;
  margin-right: 0 !important;
  margin-left: 0 !important;
  flex: 0 0 auto !important;
}

/* Specific overrides for each section */
.customer-box h3,
.delivery-box h3 {
  color: #10b981 !important;
  display: flex !important;
  justify-content: flex-start !important;
  align-items: center !important;
  gap: 10px !important;
}

.summary-card h3,
.summary-card h3.card-title,
.summary-card--order h3,
.summary-card--payment h3 {
  color: #ffffff !important;
  display: flex !important;
  justify-content: flex-start !important;
  align-items: center !important;
  gap: 10px !important;
}

.customer-box h3 i,
.delivery-box h3 i,
.summary-card h3 i,
.summary-card h3.card-title i {
  color: #ffffff !important;
  flex-shrink: 0 !important;
}

.layout-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px; /* Reduced gap */
  align-items: stretch;
  flex: 1;
  min-height: 0;
  height: 100%;
}

.left-stack,
.right-stack {
  display: flex;
  flex-direction: column;
  gap: 12px; /* Reduced gap */
  height: 100%;
  min-height: 0;
}

.entry-box {
  padding: 12px;
  display: flex;
  flex-direction: column;
  min-height: 0;
  flex: 1; /* Take remaining space */
}

/* ===== PREMIUM ENTRY HEADER ===== */
.entry-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.14);
}

.entry-header-left {
  flex-shrink: 0;
}

.entry-title {
  margin: 0;
  font-size: 24px;
  font-weight: 800;
  letter-spacing: 0.5px;
  background: linear-gradient(135deg, #e2e8f0, #94a3b8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.entry-subtitle {
  margin: 4px 0 0 0;
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
}

.entry-header-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.segmented-tabs {
  display: inline-flex;
  padding: 4px;
  background: rgba(15, 23, 42, 0.8);
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.14);
}

.tabs-track {
  position: relative;
  display: flex;
  gap: 4px;
}

.tabs-slider {
  position: absolute;
  top: 0;
  left: 0;
  width: calc(50% - 2px);
  height: 100%;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border-radius: 999px;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 0;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.tabs-slider.slider-manual {
  transform: translateX(calc(100% + 4px));
}

.seg-tab {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 20px;
  border: none;
  background: transparent;
  border-radius: 999px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  color: #94a3b8;
  transition: color 0.3s;
  white-space: nowrap;
}

.seg-tab.active {
  color: #ffffff;
}

.seg-tab:not(.active):hover {
  color: #cbd5e1;
}

.seg-tab i {
  font-size: 16px;
}

.entry-header-right {
  flex-shrink: 0;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.context-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid rgba(148, 163, 184, 0.14);
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  color: #94a3b8;
  white-space: nowrap;
}

.context-chip i {
  font-size: 14px;
  opacity: 0.7;
}

.context-chip.chip-tien_mat {
  background: rgba(16, 185, 129, 0.15);
  border-color: rgba(16, 185, 129, 0.3);
  color: #10b981;
}

.context-chip.chip-chuyen_khoan {
  background: rgba(59, 130, 246, 0.15);
  border-color: rgba(59, 130, 246, 0.3);
  color: #3b82f6;
}

@media (max-width: 1200px) {
  .entry-header {
    flex-wrap: wrap;
  }
  
  .entry-header-left {
    order: 1;
    flex-basis: 100%;
  }
  
  .entry-header-center {
    order: 3;
    flex-basis: 100%;
    justify-content: flex-start;
  }
  
  .entry-header-right {
    order: 2;
    flex-basis: 100%;
    margin-top: 8px;
  }
}

@media (max-width: 768px) {
  .entry-title {
    font-size: 20px;
  }
  
  .seg-tab span {
    display: none;
  }
  
  .context-chip span {
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.entry-body {
  background: linear-gradient(180deg, rgba(2, 6, 23, 0.7) 0%, rgba(15, 23, 42, 0.4) 100%);
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 16px;
  padding: 16px;
  flex: 1;
  min-height: 0;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
  box-shadow: 
    inset 0 1px 0 rgba(255, 255, 255, 0.03),
    0 8px 32px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(8px);
}

.inline-group {
  display: flex;
  gap: 8px;
  margin-top: 6px;
}

/* ===== STICKY SEARCH TOOLBAR ===== */
.catalog-toolbar-sticky {
  position: sticky;
  top: -12px;
  z-index: 10;
  background: rgba(2, 6, 23, 0.95);
  border-radius: 10px;
  padding: 12px;
  margin: -12px -12px 12px;
  border: 1px solid rgba(148, 163, 184, 0.14);
  backdrop-filter: blur(12px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.toolbar-row-1 {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

/* ===== NON-STICKY FILTERS ===== */
.catalog-filters {
  background: rgba(2, 6, 23, 0.7);
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 16px;
  border: 1px solid rgba(148, 163, 184, 0.14);
}

.toolbar-row-2 {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 200px;
  max-width: 400px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
  font-size: 18px;
  pointer-events: none;
}

.search-input {
  width: 100%;
  height: 42px;
  padding: 0 40px 0 40px;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.14);
  border-radius: 10px;
  color: #e2e8f0;
  font-size: 14px;
  transition: all 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: rgba(34, 197, 94, 0.5);
  box-shadow: 0 0 0 3px var(--accent-green-glow);
}

.search-clear {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.search-clear:hover {
  background: rgba(148, 163, 184, 0.15);
  color: #e2e8f0;
}

.toolbar-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.meta-count {
  padding: 8px 14px;
  background: rgba(59, 130, 246, 0.12);
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  color: #60a5fa;
  white-space: nowrap;
}

.btn-reset {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 10px;
  color: #94a3b8;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-reset:hover {
  background: rgba(30, 41, 59, 0.9);
  border-color: rgba(148, 163, 184, 0.3);
  color: #cbd5e1;
  transform: translateY(-1px);
}

.toolbar-row-2 .filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-label {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.pill-group {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.pill {
  padding: 6px 12px;
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 999px;
  color: #94a3b8;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.pill:hover {
  background: rgba(30, 41, 59, 0.9);
  border-color: rgba(34, 197, 94, 0.3);
  color: #cbd5e1;
}

.pill.active {
  background: linear-gradient(135deg, var(--accent-green), var(--accent-green-dark));
  border-color: transparent;
  color: #ffffff;
  box-shadow: 0 4px 10px var(--accent-green-glow);
}

.pill-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
}

.size-dropdown {
  height: 34px;
  padding: 0 12px;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 10px;
  color: #e2e8f0;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  min-width: 120px;
  transition: all 0.2s;
}

.size-dropdown:hover {
  border-color: rgba(148, 163, 184, 0.3);
}

.size-dropdown:focus {
  outline: none;
  border-color: rgba(34, 197, 94, 0.5);
  box-shadow: 0 0 0 3px var(--accent-green-glow);
}

/* ===== PRODUCT GRID ===== */
.product-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  padding: 4px;
}

@media (max-width: 1200px) {
  .product-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .product-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}

/* ===== PRODUCT CARD (PREMIUM) ===== */
.product-card {
  background: linear-gradient(145deg, rgba(15, 23, 42, 0.9), rgba(2, 6, 23, 0.8));
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
}

.product-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(59, 130, 246, 0) 0%, rgba(59, 130, 246, 0) 100%);
  border-radius: 16px;
  transition: all 0.35s;
  z-index: 0;
  pointer-events: none;
}

.product-card:hover {
  transform: translateY(-6px) scale(1.01);
  border-color: rgba(59, 130, 246, 0.4);
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.35),
    0 0 0 1px rgba(59, 130, 246, 0.2),
    0 0 60px rgba(59, 130, 246, 0.08);
}

.product-card:hover::before {
  background: linear-gradient(180deg, rgba(59, 130, 246, 0.05) 0%, rgba(59, 130, 246, 0) 50%);
}

.product-card.is-flash {
  animation: cardFlashPremium 0.7s ease-out;
}

@keyframes cardFlashPremium {
  0% { box-shadow: 0 0 0 rgba(59, 130, 246, 0); }
  50% { box-shadow: 0 0 30px rgba(59, 130, 246, 0.5), inset 0 0 20px rgba(59, 130, 246, 0.1); }
  100% { box-shadow: 0 12px 28px rgba(0,0,0,0.25); }
}

.product-card.is-out {
  opacity: 0.5;
  filter: grayscale(40%);
  pointer-events: none;
}

.pc-media {
  position: relative;
  width: 100%;
  padding-top: 75%;
  background: rgba(15, 23, 42, 0.6);
  overflow: hidden;
}

.pc-media img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-img-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #475569;
  font-size: 48px;
}

.badge-sale,
.badge-out {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge-sale {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
}

.badge-out {
  background: rgba(71, 85, 105, 0.9);
  color: #cbd5e1;
}

.pc-body {
  padding: 14px;
}

.pc-header {
  margin-bottom: 12px;
}

.pc-name {
  font-size: 15px;
  font-weight: 600;
  color: #e2e8f0;
  margin-bottom: 8px;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-clamp: 2; /* Standard property for compatibility */
}

.pc-price-box {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.price-sale {
  font-size: 17px;
  font-weight: 700;
  color: #10b981;
}

.price-normal {
  font-size: 15px;
  font-weight: 600;
  color: #94a3b8;
}

.price-old {
  font-size: 13px;
  color: #64748b;
  text-decoration: line-through;
}

.pc-stock-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
}

.pc-stock-pill.stock-ok {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
}

.pc-stock-pill.stock-low {
  background: rgba(251, 191, 36, 0.15);
  color: #fbbf24;
}

.pc-stock-pill.stock-out {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

.pc-footer {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.footer-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Compact Stepper */
.qty-stepper-compact {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
}

.qty-btn-compact {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 8px;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.qty-btn-compact:hover:not(:disabled) {
  background: rgba(30, 41, 59, 0.9);
  border-color: rgba(59, 130, 246, 0.4);
  color: #60a5fa;
}

.qty-btn-compact:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.qty-input-compact {
  flex: 1;
  min-width: 40px;
  height: 32px;
  text-align: center;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 8px;
  color: #e2e8f0;
  font-size: 14px;
  font-weight: 600;
}

.qty-input-compact:focus {
  outline: none;
  border-color: rgba(59, 130, 246, 0.5);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.15);
}

/* Note Icon-Only with Popover */
.note-icon-wrapper {
  position: relative;
}

.btn-note-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 8px;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-note-icon:hover {
  background: rgba(30, 41, 59, 0.9);
  border-color: rgba(251, 191, 36, 0.4);
  color: #fbbf24;
}

.btn-note-icon.has-note {
  background: rgba(251, 191, 36, 0.15);
  border-color: rgba(251, 191, 36, 0.4);
  color: #fbbf24;
}

.note-popover-modern {
  position: absolute;
  bottom: 100%;
  right: 0;
  margin-bottom: 8px;
  min-width: 260px;
  padding: 12px;
  background: rgba(2, 6, 23, 0.98);
  border: 1px solid rgba(148, 163, 184, 0.25);
  border-radius: 10px;
  box-shadow: 0 12px 32px rgba(0,0,0,0.4);
  z-index: 100;
  animation: popoverSlide 0.2s ease-out;
}

@keyframes popoverSlide {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.note-popover-modern::after {
  content: '';
  position: absolute;
  bottom: -6px;
  right: 12px;
  width: 12px;
  height: 12px;
  background: rgba(2, 6, 23, 0.98);
  border-right: 1px solid rgba(148, 163, 184, 0.25);
  border-bottom: 1px solid rgba(148, 163, 184, 0.25);
  transform: rotate(45deg);
}

.note-popover-modern textarea {
  width: 100%;
  padding: 8px;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 8px;
  color: #e2e8f0;
  font-size: 13px;
  resize: vertical;
  margin-bottom: 8px;
}

.note-popover-modern textarea:focus {
  outline: none;
  border-color: rgba(59, 130, 246, 0.5);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.15);
}

.note-save-modern {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px;
  background: #3b82f6;
  border: none;
  border-radius: 8px;
  color: #ffffff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.note-save-modern:hover {
  background: #2563eb;
}

/* Prominent Add Button (PREMIUM) */
.btn-add-prominent {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px;
  background: linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%);
  border: none;
  border-radius: 12px;
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.3px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    0 4px 14px rgba(16, 185, 129, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
  position: relative;
  overflow: hidden;
}

.btn-add-prominent::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.5s;
}

.btn-add-prominent:hover:not(:disabled)::before {
  left: 100%;
}

.btn-add-prominent:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 
    0 8px 24px rgba(16, 185, 129, 0.5),
    0 0 40px rgba(16, 185, 129, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.btn-add-prominent:active:not(:disabled) {
  transform: translateY(-1px);
}

.btn-add-prominent:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Pagination */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid rgba(148, 163, 184, 0.1);
}

.page-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 8px;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  background: rgba(30, 41, 59, 0.9);
  border-color: rgba(59, 130, 246, 0.4);
  color: #60a5fa;
  transform: translateY(-1px);
}

.page-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.page-info {
  padding: 8px 16px;
  background: rgba(59, 130, 246, 0.08);
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  color: #60a5fa;
}

/* No Products Empty State */
.no-products {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  padding: 40px 20px;
  text-align: center;
  font-size: 16px;
  color: #64748b;
  font-weight: 500;
}

.manual-content {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.manual-scroll-container {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.manual-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr);
  gap: 16px;
}

.manual-section {
  background: rgba(2, 6, 23, 0.68);
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 14px;
  padding: 16px;
  box-shadow: 0 12px 24px rgba(2, 6, 23, 0.35);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
}

.section-head span {
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #e2e8f0;
}

.section-sub {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0;
  text-transform: none;
  color: #94a3b8;
}

.manual-fields {
  display: grid;
  gap: 12px;
}

.manual-fields.info-grid,
.manual-fields.price-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.span-2 {
  grid-column: span 2;
}

.manual-section .field label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #94a3b8;
}

.manual-section input,
.manual-section select {
  height: 40px;
  border-radius: 10px;
  border: 1px solid rgba(148, 163, 184, 0.16);
}

.manual-section textarea {
  border-radius: 10px;
  border: 1px solid rgba(148, 163, 184, 0.16);
}

.input-with-badge {
  position: relative;
  display: flex;
  align-items: center;
}

.input-with-badge input {
  width: 100%;
  padding-right: 64px;
}

.clear-badge {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  border: none;
  background: #ef4444;
  color: #ffffff;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 6px 14px rgba(239, 68, 68, 0.35);
}

.clear-badge:hover {
  background: #dc2626;
}

.clear-badge i {
  font-size: 12px;
}

.manual-preview {
  margin-top: 6px;
  padding: 12px;
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid rgba(148, 163, 184, 0.16);
  box-shadow: inset 0 0 0 1px rgba(2, 6, 23, 0.35);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.preview-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #cbd5f5;
}

.preview-row span:last-child {
  font-weight: 700;
  color: #e2e8f0;
}

.preview-total {
  padding-top: 6px;
  border-top: 1px dashed rgba(148, 163, 184, 0.2);
}

.preview-final {
  font-size: 14px;
  color: #3b82f6;
}

.preview-final span:last-child {
  color: #3b82f6;
  font-weight: 800;
}

.preview-profit {
  font-size: 12px;
  color: #22c55e;
}

.preview-profit span:last-child {
  color: #22c55e;
}

/* ===== MANUAL MODE: INFO CHIPS ===== */
.product-info-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 6px;
}

.info-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(59, 130, 246, 0.12);
  border: 1px solid rgba(59, 130, 246, 0.25);
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  color: #60a5fa;
}

.info-chip i {
  font-size: 14px;
  opacity: 0.8;
}

/* ===== MANUAL MODE: ADVANCED ACCORDION ===== */
.manual-accordion {
  margin-top: 12px;
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid rgba(148, 163, 184, 0.14);
  border-radius: 10px;
  overflow: hidden;
}

.accordion-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  cursor: pointer;
  user-select: none;
  font-size: 12px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  list-style: none;
  transition: all 0.2s;
}

.accordion-trigger::-webkit-details-marker {
  display: none;
}

.accordion-trigger:hover {
  background: rgba(30, 41, 59, 0.5);
  color: #cbd5e1;
}

.accordion-arrow {
  margin-left: auto;
  transition: transform 0.2s;
}

.manual-accordion[open] .accordion-arrow {
  transform: rotate(180deg);
}

.accordion-content {
  padding: 12px;
  border-top: 1px solid rgba(148, 163, 184, 0.1);
  display: grid;
  gap: 12px;
  animation: accordionSlide 0.2s ease-out;
}

@keyframes accordionSlide {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ===== MANUAL MODE: HERO PREVIEW ===== */
.manual-preview-hero {
  position: relative;
  padding: 20px 16px;
}

.hero-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 20px;
}

.hero-label {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: #64748b;
}

.hero-value {
  font-size: 32px;
  font-weight: 800;
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
}

.hero-final .hero-value {
  color: #3b82f6;
}

.hero-profit .hero-value {
  color: #10b981;
}

/* Preview Details Accordion */
.preview-details {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(148, 163, 184, 0.14);
}

.preview-details summary {
  cursor: pointer;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #64748b;
  list-style: none;
  padding: 8px 0;
  user-select: none;
  transition: color 0.2s;
}

.preview-details summary::-webkit-details-marker {
  display: none;
}

.preview-details summary:hover {
  color: #94a3b8;
}

.preview-details summary::after {
  content: ' ▼';
  font-size: 10px;
  margin-left: 6px;
  transition: transform 0.2s;
  display: inline-block;
}

.preview-details[open] summary::after {
  transform: rotate(180deg);
}

.detail-grid {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(148, 163, 184, 0.08);
}

.detail-grid .preview-row {
  font-size: 12px;
  color: #94a3b8;
}

.detail-grid .preview-row span:last-child {
  color: #cbd5e1;
  font-weight: 600;
}

.manual-note-field textarea {
  min-height: 72px;
}

.manual-footer {
  margin-top: auto;
  display: flex;
  gap: 10px;
  padding: 12px 0 4px;
  border-top: 1px solid rgba(148, 163, 184, 0.12);
}
.manual-footer .btn {
  flex: 1;
  height: 44px;
}

@media (max-width: 1024px) {
  .manual-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .manual-fields.info-grid,
  .manual-fields.price-grid {
    grid-template-columns: 1fr;
  }

  .span-2 {
    grid-column: span 1;
  }
}

.bottom-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 240px;
  gap: 16px;
  align-items: stretch;
}

.payment-scroll {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.payment-block {
  display: none;
}

.date-time-row {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.delivery-time-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: nowrap;
}

.delivery-time-row .time-sep {
  color: #94a3b8;
  font-weight: 700;
}

.submit-stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
  min-width: 240px;
  align-self: stretch;
}

.btn-preview,
.btn-text {
  flex: 1;
  width: 100%;
  font-weight: 900;
  border-radius: 12px;
  position: relative;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  border: none;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  -webkit-text-stroke: 0.6px #ffffff; /* Increased artificial thickness */
  paint-order: markers fill stroke;
}

.btn-complete {
  flex: 2;
  width: 100%;
  border-radius: 16px;
  font-size: 18px;
  font-weight: 900;
  position: relative;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  border: none;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  -webkit-text-stroke: 1px #ffffff; /* Heavier stroke for main button */
  paint-order: markers fill stroke;
}

/* Internal Shine Effect for all 3D buttons */
.btn-preview::after, .btn-text::after, .btn-complete::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 50%;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.15) 0%, transparent 100%);
  pointer-events: none;
}

.info-box {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px 16px;
}

.order-box {
  display: flex;
  flex-direction: column;
  min-height: 0;
  flex: 1; /* Take remaining space to push summary to bottom */
}

.order-table-wrap {
  flex: 1;
  min-height: 0;
  overflow: auto;
  /* Standard Scrollbar */
  scrollbar-width: thin;
  scrollbar-color: rgba(148, 163, 184, 0.3) rgba(15, 23, 42, 0.4);
}

/* WebKit Scrollbar (Chrome/Edge/Safari) */
.order-table-wrap::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.order-table-wrap::-webkit-scrollbar-track {
  background: rgba(15, 23, 42, 0.4);
  border-radius: 4px;
}

.order-table-wrap::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.3);
  border-radius: 4px;
}

.order-table-wrap::-webkit-scrollbar-thumb:hover {
  background: rgba(148, 163, 184, 0.5);
}

.order-card-container {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.order-card-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 4px 2px 12px;
}

.order-empty {
  text-align: center;
  color: #64748b;
  padding: 24px 12px;
  border: 1px dashed rgba(148, 163, 184, 0.2);
  border-radius: 12px;
  font-size: 13px;
}

.order-card {
  position: relative;
  background: rgba(15, 23, 42, 0.65);
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 14px;
  padding: 14px 14px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.25);
  cursor: pointer;
}

.order-card.is-highlight {
  border-color: rgba(34, 197, 94, 0.7);
  box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.2);
}

.order-card-title {
  padding-right: 32px;
}

.order-card-name {
  font-size: 14px;
  font-weight: 700;
  color: #e2e8f0;
}

.order-card-meta {
  display: flex;
  gap: 10px;
  font-size: 11px;
  color: #94a3b8;
  margin-top: 2px;
}

.order-card-discount {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 11px;
  color: #fca5a5;
}

.order-card-pricing {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-top: 8px;
  border-top: 1px dashed rgba(148, 163, 184, 0.2);
}

.order-card-price-left {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 6px;
  font-size: 12px;
  color: #cbd5e1;
}

.order-card-price-left .price-main {
  font-weight: 700;
  color: #e2e8f0;
}

.order-card-price-left .price-main.price-discounted {
  color: #4ade80;
}

.order-card-price-left .price-qty {
  color: #94a3b8;
  font-weight: 600;
}

.order-card-price-total {
  font-size: 13px;
  font-weight: 800;
  color: #01f716;
  font-family: 'JetBrains Mono', monospace;
}

.order-card-note {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  font-size: 11px;
  color: #94a3b8;
  border-top: 1px dashed rgba(148, 163, 184, 0.15);
  padding-top: 6px;
  margin-top: 2px;
}

.order-card-note i {
  font-size: 14px;
  color: #60a5fa;
}

.order-card-delete {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.25);
  color: #f87171;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.order-card-delete:hover {
  background: rgba(239, 68, 68, 0.2);
}

.summary-box {
  height: 100%;
  padding: 14px 16px;
}

.summary-stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex-shrink: 0; /* Don't squash summary */
}

.action-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}
.action-row .btn {
  width: 100%;
}

@media (max-width: 1024px) {
  .layout-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .left-stack,
  .right-stack {
    gap: 16px;
  }

  .entry-box {
    order: 1;
    height: auto;
  }

  .order-box {
    order: 2;
    height: auto;
  }

  .info-box {
    order: 3;
  }

  .bottom-row {
    order: 4;
    grid-template-columns: 1fr;
  }

  .summary-stack {
    width: 100%;
  }

  .submit-stack {
    width: 100%;
    min-width: 0;
  }

  .customer-delivery-grid {
    grid-template-columns: 1fr;
  }

  .action-row {
    grid-template-columns: 1fr;
  }

  .btn-complete {
    min-height: 64px;
  }
}

.entry-body .pagination {
  margin-top: 16px;
}

/* Obsolete grid styles removed */

.section-title {
  font-size: 13px;
  font-weight: 700;
  color: #e2e8f0;
  margin: 0 0 8px 0;
  padding-bottom: 6px;
  border-bottom: 2px solid rgba(148, 163, 184, 0.2);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid rgba(148, 163, 184, 0.2);
}

.order-codes {
  display: flex;
  gap: 20px;
}

.code-item {
  font-size: 14px;
  color: #94a3b8;
}

.code-item strong {
  color: #e2e8f0;
}

.btn-small {
  padding: 6px 12px;
  font-size: 13px;
}

@media (max-width: 768px) {
  .customer-delivery-grid {
    grid-template-columns: 1fr;
  }
  
  .order-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .order-codes {
    flex-direction: column;
    gap: 8px;
  }
}

@media (max-width: 900px) {
  .col-profit {
    display: none;
  }
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
.field label {
  font-size: 13px;
  display: block;
  margin-bottom: 4px;
  color: #cbd5f5;
}

.hidden-field {
  display: none;
}

.price-inline {
  display: flex;
  align-items: center;
  gap: 8px;
}

.price-old-inline {
  color: #f87171;
  font-size: 12px;
  text-decoration: line-through;
}

.hint-text {
  color: #94a3b8;
  font-size: 12px;
}

input,
select,
textarea {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid rgba(148, 163, 184, 0.24);
  border-radius: 6px;
  background: rgba(2, 6, 23, 0.7);
  color: #e2e8f0;
  font-size: 13px;
}
input:focus,
select:focus,
textarea:focus {
  outline: none;
  border-color: rgba(59, 130, 246, 0.8);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.25);
}
.order-box table {
  width: 100%;
  border-collapse: collapse;
}
.order-box table thead th {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.95), rgba(22, 163, 74, 0.95)); /* Glassy Green */
  backdrop-filter: blur(8px); /* Glassmorphism */
  color: #ffffff;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  font-weight: 800;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 14px 10px;
  position: sticky; /* ADDED STICKY */
  top: 0;
  z-index: 20;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1); /* Softer shadow */
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  border-bottom: none; /* Removed for full rounded look */
}

.order-box table thead th:first-child {
  border-top-left-radius: 10px;
  border-bottom-left-radius: 10px;
}

.order-box table thead th:last-child {
  border-top-right-radius: 10px;
  border-bottom-right-radius: 10px;
}

.order-box table tbody tr:last-child td:first-child {
  border-bottom-left-radius: 10px;
}

.order-box table tbody tr:last-child td:last-child {
  border-bottom-right-radius: 10px;
}


.row-highlight {
  animation: highlight-fade 1.5s ease-out forwards;
}

@keyframes highlight-fade {
  0% { background: rgba(34, 197, 94, 0.35); }
  70% { background: rgba(34, 197, 94, 0.05); }
  100% { background: transparent; }
}
.order-box th,
.order-box td {
  padding: 14px 10px; /* More breathing room */
  border-bottom: 1px solid rgba(148, 163, 184, 0.08); /* Lighter, more subtle border */
  color: #e2e8f0;
  vertical-align: middle;
}

/* Professional Table Rows */
.order-box table tbody tr {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border-left: 2px solid transparent; /* Prepare for hover accent */
}

.order-box table tbody tr:nth-child(even) {
  background: rgba(255, 255, 255, 0.01); /* Very subtle striping */
}

.order-box table tbody tr:hover {
  background: rgba(34, 197, 94, 0.05) !important; /* Soft Green Glow */
  border-left-color: #22c55e; /* Accent Border */
  transform: translateX(2px); /* Micro-interaction */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  z-index: 10;
  position: relative;
}

/* High-End Scrollbar (Ultra-Slim & Floating) */
.order-table-wrap::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

.order-table-wrap::-webkit-scrollbar-track {
  background: transparent; /* Floating feel */
}

.order-table-wrap::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.3);
  border-radius: 10px;
  backdrop-filter: blur(4px);
}

.order-table-wrap:hover::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.5);
}

.order-table-wrap::-webkit-scrollbar-corner {
  background: transparent;
}

/* Align specific columns to center as requested */
.order-box th:nth-child(1), .order-box td:nth-child(1), /* STT */
.order-box th:nth-child(3), .order-box td:nth-child(3), /* SO LUONG */
.order-box th:nth-child(4), .order-box td:nth-child(4), /* GIA BAN */
.order-box th:nth-child(5), .order-box td:nth-child(5), /* GIAM & CK% */
.order-box th:nth-child(6), .order-box td:nth-child(6), /* THANH TIEN */
.order-box th:nth-child(7), .order-box td:nth-child(7)  /* XOA */ {
  text-align: center;
}

/* Bold Specific Columns (STT, Qty, Price, Disc, Total) */
.order-box td:nth-child(1),
.order-box td:nth-child(3),
.order-box td:nth-child(4),
.order-box td:nth-child(5) .disc-cell, 
.order-box td:nth-child(6) .total-amount {
  font-weight: 700;
  color: #f8fafc; /* Brighter white for bold text */
}

/* Ensure Discount/Total sub-text remains normal if needed */
.order-box td:nth-child(5) .disc-cell span {
  font-weight: 700;
}
.prod-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.prod-name {
  font-weight: 700;
  font-size: 14px;
  color: #f8fafc;
  line-height: 1.3;
}

.prod-sub {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 2px;
}

.prod-note {
  font-size: 13px;
  color: #ef4444;
  font-weight: 600;
  margin-top: 6px;
  white-space: pre-wrap;
}

.disc-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
}

.disc-ck {
  color: #e2e8f0;
}

.disc-giam {
  color: #fb7185;
}
.total-cell {
  text-align: center; /* Changed from right to center as requested */
  vertical-align: middle;
}
.total-amount {
  display: block;
  line-height: 1.2;
}
.profit-inline {
  margin-top: 4px;
  font-size: 11px;
  font-weight: 700;
  color: #22c55e;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  opacity: 0.9;
  line-height: 1.2;
}
.profit-arrow {
  font-size: 11px;
  line-height: 1;
}
.profit-value {
  font-size: 11px;
  line-height: 1.2;
}
.profit {
  color: #22c55e;
  font-weight: bold;
}

.text-danger {
  color: #f87171 !important;
}

.text-success {
  color: #22c55e !important;
}

.text-primary {
  color: #3b82f6 !important;
}

.btn {
  padding: 10px 16px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s;
}
.primary {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: #e2e8f0;
  box-shadow: 0 6px 16px rgba(37, 99, 235, 0.35);
}
.danger {
  background: #ef4444;
  color: #0f172a;
}
.cash {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: #0f172a;
}
.personal {
  background: linear-gradient(135deg, #38bdf8, #0ea5e9);
  color: #0f172a;
}
.supplier {
  background: #6366f1;
  color: #e2e8f0;
}
.payment {
  display: flex;
  gap: 8px;
}
.secondary {
  background: #0f172a;
  color: #e2e8f0;
  border: 1px solid rgba(148, 163, 184, 0.35);
}

.info-box .field label {
  font-size: 12px;
}

.info-box input,
.info-box select {
  height: 36px;
}

.info-box textarea {
  min-height: 80px;
  height: auto;
}

.pill-btn {
  height: 32px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: rgba(2, 6, 23, 0.6);
  color: #e2e8f0;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.pill-btn.active {
  background: linear-gradient(135deg, var(--accent-green), var(--accent-green-dark));
  border-color: var(--accent-green);
  box-shadow: 0 6px 14px var(--accent-green-glow);
  color: #ffffff;
}

.pill-btn:not(.active):hover {
  border-color: rgba(34, 197, 94, 0.3);
  background: rgba(15, 23, 42, 0.8);
}

.summary-grid {
  display: grid;
  gap: 10px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-row .summary-label {
  font-size: 12px;
  color: #94a3b8;
}

.summary-row .summary-value {
  font-size: 13px;
  font-weight: 700;
  color: #e2e8f0;
}

.summary-row.total .summary-label {
  color: #cbd5f5;
}

.summary-row.total .summary-value {
  font-size: 15px;
  font-weight: 800;
}

.summary-chip {
  padding: 4px 8px;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.35);
  background: rgba(15, 23, 42, 0.7);
  font-size: 11px;
  font-weight: 700;
  color: #e2e8f0;
}

.sum-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.sum-row {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 12px;
  padding: 4px 8px;
  margin: 0 -8px;
  border-radius: 6px;
  transition: background 0.2s;
}

.sum-row:hover:not(.sum-total) {
  background: rgba(148, 163, 184, 0.05);
}

.sum-label {
  font-size: 11px;
  font-weight: 700;
  color: rgba(148, 163, 184, 0.75);
  letter-spacing: 0.05em;
}

.sum-value {
  font-size: 14px;
  font-weight: 800;
  color: #e2e8f0;
  text-align: right;
}

.sum-total {
  margin-top: 8px;
  padding: 10px 12px;
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 10px;
  background: rgba(59, 130, 246, 0.1);
}

.sum-total .sum-label {
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #94a3b8;
}

.sum-total .sum-value {
  font-size: 22px;
  font-weight: 900;
}

.sum-chip {
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: rgba(2, 6, 23, 0.55);
  font-size: 12px;
  font-weight: 700;
  color: #e2e8f0;
}

.btn-outline {
  height: 40px;
  background: transparent;
  border: 1px solid rgba(148, 163, 184, 0.35);
  color: #e2e8f0;
  border-radius: 10px;
  transition: all 0.2s;
}

.btn-outline:hover {
  border-color: rgba(148, 163, 184, 0.75);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.2);
}

.btn-preview {
  background: linear-gradient(135deg, #10b981, #059669);
  color: #ffffff !important;
  font-weight: 950 !important;
  text-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.4),
    0 0 1px rgba(0,0,0,0.5); /* extra definition */
  box-shadow: 
    0 4px 0 #064e3b,
    0 8px 15px rgba(0, 0, 0, 0.3),
    inset 0 1px 1px rgba(255, 255, 255, 0.3);
}

.btn-preview:hover:not(:disabled) {
  background: linear-gradient(135deg, #34d399, #10b981);
  transform: translateY(-2px) scale(1.02);
  box-shadow: 
    0 6px 0 #064e3b,
    0 12px 25px rgba(0, 0, 0, 0.4),
    0 0 20px rgba(16, 185, 129, 0.3);
}

.btn-preview:active:not(:disabled) {
  transform: translateY(2px) scale(0.98);
  box-shadow: 
    0 2px 0 #064e3b,
    0 4px 10px rgba(0, 0, 0, 0.3);
}

.btn-text {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: #ffffff !important;
  font-weight: 950 !important;
  text-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.4),
    0 0 1px rgba(0,0,0,0.5);
  box-shadow: 
    0 4px 0 #78350f,
    0 8px 15px rgba(0, 0, 0, 0.3),
    inset 0 1px 1px rgba(255, 255, 255, 0.4);
}

.btn-text:hover:not(:disabled) {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  transform: translateY(-2px) scale(1.02);
  box-shadow: 
    0 6px 0 #78350f,
    0 12px 25px rgba(0, 0, 0, 0.4),
    0 0 20px rgba(245, 158, 11, 0.3);
}

.btn-text:active:not(:disabled) {
  transform: translateY(2px) scale(0.98);
  box-shadow: 
    0 2px 0 #78350f,
    0 4px 10px rgba(0, 0, 0, 0.3);
}

.btn-complete {
  background: linear-gradient(135deg, #ef4444, #b91c1c);
  color: #ffffff !important;
  font-weight: 950 !important;
  font-size: 20px; /* Slightly larger for impact */
  text-shadow: 
    0 3px 6px rgba(0, 0, 0, 0.5),
    0 0 2px rgba(0,0,0,0.4);
  box-shadow: 
    0 6px 0 #7f1d1d,
    0 10px 25px rgba(0, 0, 0, 0.45),
    inset 0 1px 1px rgba(255, 255, 255, 0.3);
}

.btn-complete:hover:not(:disabled) {
  background: linear-gradient(135deg, #f87171, #ef4444);
  transform: translateY(-3px) scale(1.01);
  box-shadow: 
    0 9px 0 #7f1d1d,
    0 18px 35px rgba(0, 0, 0, 0.5),
    0 0 40px rgba(239, 68, 68, 0.4);
}

.btn-complete:active:not(:disabled) {
  transform: translateY(4px) scale(0.97);
  box-shadow: 
    0 3px 0 #7f1d1d,
    0 8px 15px rgba(0, 0, 0, 0.4);
}

.btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  filter: saturate(0.7);
}

.btn-complete:disabled {
  box-shadow: none;
}

.cta-btn {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: #ffffff;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 700;
  box-shadow: 0 12px 24px rgba(37, 99, 235, 0.35);
  transition: all 0.2s;
}

.cta-btn:hover:not(:disabled) {
  box-shadow: 0 14px 28px rgba(37, 99, 235, 0.45);
}

.cta-btn:disabled {
  opacity: 0.5;
  box-shadow: none;
  cursor: not-allowed;
}

.btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.45);
  border-top-color: #ffffff;
  border-radius: 50%;
  display: inline-block;
  margin-right: 8px;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.toast-stack {
  position: fixed;
  top: 16px;
  right: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 10050;
  width: min(360px, calc(100vw - 32px));
}

.toast {
  position: relative;
  padding: 12px 12px 10px;
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.22);
  background: rgba(2, 6, 23, 0.92);
  color: #e2e8f0;
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.35);
  overflow: hidden;
}

.toast-msg {
  font-size: 13px;
  line-height: 1.35;
  white-space: pre-wrap;
  padding-right: 22px;
  font-weight: 600;
}

.toast-close {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 22px;
  height: 22px;
  border-radius: 8px;
  border: 1px solid rgba(148, 163, 184, 0.22);
  background: rgba(15, 23, 42, 0.6);
  color: #e2e8f0;
  cursor: pointer;
}

.toast-bar {
  position: absolute;
  left: 0;
  bottom: 0;
  height: 3px;
  width: 100%;
  transform-origin: left;
  animation: toastShrink linear forwards;
  opacity: 0.9;
}

.t-success {
  border-color: rgba(34, 197, 94, 0.35);
}

.t-success .toast-bar {
  background: rgba(34, 197, 94, 0.85);
}

.t-error {
  border-color: rgba(239, 68, 68, 0.45);
}

.t-error .toast-bar {
  background: rgba(239, 68, 68, 0.9);
}

.t-warn {
  border-color: rgba(245, 158, 11, 0.45);
}

.t-warn .toast-bar {
  background: rgba(245, 158, 11, 0.9);
}

.t-info {
  border-color: rgba(59, 130, 246, 0.45);
}

.t-info .toast-bar {
  background: rgba(59, 130, 246, 0.9);
}

@keyframes toastShrink {
  from { transform: scaleX(1); }
  to { transform: scaleX(0); }
}

/* ============================================
   HÓA ĐƠN IN - THIẾT KẾ MỚI CHUYÊN NGHIỆP
   ============================================ */

.hoa-don-print {
  width: 800px;
  padding: 32px;
  background: #ffffff;
  color: #1a1a1a;
  font-family: 'Segoe UI', Arial, sans-serif;
  font-size: 13px;
  position: fixed;
  top: -9999px;
  left: -9999px;
  line-height: 1.6;
}

/* ===== HEADER - LAYOUT 2 CỘT ===== */
.hd-header {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 24px;
  align-items: center;
  padding-bottom: 18px;
  margin-bottom: 18px;
  border-bottom: 3px solid #1a1a1a;
}

/* LOGO + TÊN SHOP BÊN TRÁI */
.hd-left-group {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* LOGO TRÒN */
.hd-logo-circle {
  width: 90px;
  height: 90px;
  border: 2px solid #1a1a1a;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: #ffffff;
  flex-shrink: 0;
}

.hd-logo-circle img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* TÊN SHOP + THỜI GIAN */
.hd-shop-info-box {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.hd-shop-name {
  font-size: 24px;
  font-weight: 900;
  color: #1a1a1a;
  letter-spacing: 0.8px;
  line-height: 1.2;
  text-transform: uppercase;
}

.hd-shop-time {
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
  font-style: italic;
}

/* CONTACT GÓC PHẢI */
.hd-contact-right {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: flex-start;
}

.contact-row {
  display: grid;
  grid-template-columns: 18px 1fr;
  gap: 8px;
  align-items: center;
  font-size: 11px;
}

.contact-img {
  width: 18px;
  height: 18px;
  object-fit: contain;
  flex-shrink: 0;
  border-radius: 2px;
}

.contact-text {
  color: #374151;
  font-weight: 500;
  text-align: left;
  white-space: nowrap;
  display: flex;
  gap: 4px;
}

.platform-name {
  font-weight: 700;
  text-transform: uppercase;
  color: #1f2937;
}

.platform-info {
  font-weight: 500;
  color: #374151;
}

.contact-placeholder {
  width: 18px;
  height: 18px;
  background: #e5e7eb;
  border-radius: 3px;
  flex-shrink: 0;
}

/* ===== TITLE (CĂN GIỮA) ===== */
.hd-title-section {
  text-align: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #e5e7eb;
}

.hd-title {
  font-size: 28px;
  font-weight: 900;
  color: #1a1a1a;
  letter-spacing: 2px;
  margin: 0 0 8px 0;
  text-transform: uppercase;
}

.hd-meta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-size: 13px;
  color: #6b7280;
  font-weight: 600;
}

.hd-code {
  letter-spacing: 0.5px;
}

.hd-separator {
  color: #d1d5db;
  font-weight: 400;
}

.hd-date {
  color: #9ca3af;
}

/* ===== 2 CARD THÔNG TIN ===== */
.hd-info-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
}

.info-card {
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  padding: 16px;
}

.card-title {
  font-size: 12px;
  font-weight: 800;
  color: #1a1a1a;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  border-bottom: 2px solid #1a1a1a;
  padding-bottom: 6px;
}

.card-row {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.card-row:last-child {
  margin-bottom: 0;
}

.card-row .label {
  font-weight: 600;
  color: #6b7280;
  white-space: nowrap;
  font-size: 12px;
  flex-shrink: 0;
}

.card-row .value {
  color: #1f2937;
  font-weight: 500;
  flex: 1;
  word-wrap: break-word;
}

/* ===== BẢNG SẢN PHẨM ===== */
.hd-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  overflow: hidden;
}

.hd-table thead {
  background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
}

.hd-table th {
  padding: 12px 10px;
  font-size: 12px;
  font-weight: 700;
  color: #ffffff;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  text-align: center;
  border-right: 1px solid rgba(255,255,255,0.1);
}

.hd-table th:last-child {
  border-right: none;
}

.hd-table tbody tr {
  border-bottom: 1px solid #e5e7eb;
}

.hd-table tbody tr:last-child {
  border-bottom: none;
}

.hd-table tbody tr:nth-child(even) {
  background: #f9fafb;
}

.hd-table tbody tr:hover {
  background: #f3f4f6;
}

.hd-table td {
  padding: 10px;
  font-size: 12px;
  color: #374151;
  border-right: 1px solid #e5e7eb;
}

.hd-table td:last-child {
  border-right: none;
}

.text-center {
  text-align: center;
}

.text-left {
  text-align: left;
}

.text-right {
  text-align: right;
}

.product-name {
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 2px;
}

.product-note {
  font-size: 11px;
  color: #6b7280;
  font-style: italic;
  margin-top: 2px;
}

.price-highlight {
  font-weight: 700;
  color: #1a1a1a;
}

.col-stt {
  width: 50px;
}

.col-name {
  min-width: 180px;
}

.col-size {
  width: 70px;
}

.col-dvt {
  width: 60px;
}

.col-qty {
  width: 50px;
}

.col-price {
  width: 100px;
}

.col-total {
  width: 110px;
}

/* ===== TỔNG KẾT ===== */
.hd-summary {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-left: auto;
  max-width: 400px;
  padding: 16px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 20px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
}

.summary-label {
  font-size: 13px;
  color: #6b7280;
  font-weight: 600;
}

.summary-value {
  font-size: 14px;
  color: #1f2937;
  font-weight: 700;
}

.summary-row.discount .summary-label,
.summary-row.discount .summary-value {
  color: #dc2626;
}

.summary-row.total {
  border-top: 2px solid #1a1a1a;
  padding-top: 12px;
  margin-top: 8px;
}

.summary-row.total .summary-label {
  font-size: 15px;
  color: #1a1a1a;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.summary-row.total .summary-value {
  font-size: 18px;
  color: #1a1a1a;
  font-weight: 900;
}

.summary-row.subtotal .summary-label,
.summary-row.subtotal .summary-value,
.summary-row.payment .summary-label,
.summary-row.payment .summary-value {
  font-weight: 800; /* Bold as requested */
  color: #111827;
}

.summary-row.payment {
  border-top: 1px solid #d1d5db;
  padding-top: 8px;
  margin-top: 4px;
}

/* ===== FOOTER ===== */
.hd-footer-note {
  text-align: center;
  padding-top: 20px;
  border-top: 2px solid #e5e7eb;
}

.footer-line {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
  margin: 4px 0;
  font-style: italic;
}

/* ============================================
   HÓA ĐƠN NCC (GIỮ NGUYÊN)
   ============================================ */
.hoa-don-ncc {
  width: 720px;
  padding: 20px;
  background: #fff;
  color: #000;
  font-size: 14px;
  position: fixed;
  top: -9999px;
  left: -9999px;
}

.ncc-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

.ncc-table th,
.ncc-table td {
  border: 1px solid #000;
  padding: 6px;
  text-align: center;
}

/* ===== POPUP & MODAL ===== */
.text-invoice-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.text-invoice-box {
  width: 520px;
  background: rgba(2, 6, 23, 0.92);
  padding: 16px;
  border-radius: 8px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  color: #e2e8f0;
}

.text-invoice-box textarea {
  width: 100%;
  font-family: monospace;
  font-size: 13px;
  padding: 8px;
  margin-top: 8px;
}

.text-invoice-box .actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
}

.modal {
  position: fixed;
  inset: 0;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  z-index: 9999;
}

.modal-overlay-blur {
  background: rgba(2, 6, 23, 0.7) !important;
  backdrop-filter: blur(8px) saturate(180%);
}

.modal-box {
  background: rgba(2, 6, 23, 0.96) !important;
  padding: 24px !important;
  border-radius: 16px !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  color: #f1f5f9 !important;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6) !important;
  width: 480px;
  max-width: 95vw;
}

.premium-modal-compact {
  background: linear-gradient(165deg, rgba(15, 23, 42, 0.98), rgba(2, 6, 23, 1)) !important;
  border: 1px solid rgba(255, 255, 255, 0.12) !important;
  border-radius: 20px !important;
  width: 620px !important;
  padding: 0 !important;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7) !important;
}

/* ========== PREMIUM MODAL V2 ========== */
.premium-modal-v2 {
  background: linear-gradient(180deg, rgba(15, 23, 42, 1), rgba(2, 6, 23, 0.98)) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  border-radius: 24px !important;
  width: 580px !important;
  max-width: 95vw;
  padding: 0 !important;
  overflow: hidden;
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.03),
    0 30px 60px -20px rgba(0, 0, 0, 0.8),
    0 0 80px -30px rgba(34, 197, 94, 0.15) !important;
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.pm-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.03), transparent);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.pm-header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.pm-icon-circle {
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--accent-green), var(--accent-green-dark));
  border-radius: 16px;
  box-shadow: 0 8px 20px rgba(34, 197, 94, 0.3);
}

.pm-icon-circle i {
  font-size: 26px;
  color: #ffffff;
}

.pm-header-text h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 800;
  color: #f8fafc;
  letter-spacing: 0.3px;
}

.pm-product-name {
  margin: 4px 0 0;
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
  max-width: 320px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pm-close-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.pm-close-btn:hover {
  background: rgba(239, 68, 68, 0.12);
  border-color: rgba(239, 68, 68, 0.3);
  color: #ef4444;
}

.pm-body {
  padding: 24px;
}

/* Stock Banner */
.pm-stock-banner {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  border-radius: 14px;
  margin-bottom: 24px;
  border: 1px solid;
}

.pm-stock-banner.stock-ok {
  background: rgba(34, 197, 94, 0.08);
  border-color: rgba(34, 197, 94, 0.2);
}

.pm-stock-banner.stock-low {
  background: rgba(251, 191, 36, 0.08);
  border-color: rgba(251, 191, 36, 0.2);
}

.pm-stock-banner.stock-empty {
  background: rgba(239, 68, 68, 0.08);
  border-color: rgba(239, 68, 68, 0.2);
}

.stock-icon-wrap {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
}

.pm-stock-banner.stock-ok .stock-icon-wrap {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
}

.pm-stock-banner.stock-low .stock-icon-wrap {
  background: rgba(251, 191, 36, 0.15);
  color: #fbbf24;
}

.pm-stock-banner.stock-empty .stock-icon-wrap {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

.stock-icon-wrap i {
  font-size: 22px;
}

.stock-details {
  display: flex;
  align-items: center;
  gap: 24px;
  flex: 1;
}

.stock-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stock-label {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: rgba(255, 255, 255, 0.5);
}

.stock-value {
  font-size: 20px;
  font-weight: 900;
  font-family: 'JetBrains Mono', monospace;
  color: #f1f5f9;
}

.stock-divider {
  width: 1px;
  height: 36px;
  background: rgba(255, 255, 255, 0.1);
}

/* Form Sections */
.pm-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.pm-section {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 14px;
  padding: 16px 18px;
}

.pm-section-discount {
  background: rgba(239, 68, 68, 0.04);
  border-color: rgba(239, 68, 68, 0.1);
}

.pm-section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #94a3b8;
  margin-bottom: 14px;
}

.pm-section-discount .pm-section-title {
  color: #fb7185;
}

.pm-section-title i {
  font-size: 15px;
}

.pm-fields-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 14px;
}

.pm-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.pm-field-half {
  max-width: 200px;
}

.pm-field-full {
  margin-top: 14px;
}

.pm-field label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #64748b;
}

.pm-input-with-unit {
  position: relative;
  display: flex;
  align-items: center;
}

.pm-input {
  width: 100%;
  height: 44px;
  padding: 0 44px 0 14px;
  background: rgba(15, 23, 42, 0.6) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  border-radius: 10px !important;
  color: #f1f5f9 !important;
  font-size: 15px !important;
  font-weight: 600 !important;
  transition: all 0.2s !important;
}

.pm-input:focus {
  outline: none !important;
  border-color: var(--accent-green) !important;
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.15) !important;
  background: rgba(15, 23, 42, 0.8) !important;
}

.pm-input-highlight {
  color: #4ade80 !important;
  font-size: 17px !important;
  font-weight: 800 !important;
}

.pm-input-danger {
  color: #fb7185 !important;
}

.pm-unit {
  position: absolute;
  right: 14px;
  font-size: 11px;
  font-weight: 800;
  color: #475569;
  pointer-events: none;
}

.pm-select {
  width: 100%;
  height: 44px;
  padding: 0 36px 0 14px;
  background: rgba(15, 23, 42, 0.6) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  border-radius: 10px !important;
  color: #f1f5f9 !important;
  font-size: 14px !important;
  font-weight: 600 !important;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 14px;
  cursor: pointer;
}

.pm-textarea {
  width: 100%;
  padding: 12px 14px;
  background: rgba(15, 23, 42, 0.6) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  border-radius: 10px !important;
  color: #f1f5f9 !important;
  font-size: 14px !important;
  resize: none !important;
  transition: all 0.2s;
}

.pm-textarea:focus {
  outline: none;
  border-color: var(--accent-green) !important;
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.15) !important;
}

.pm-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 18px 24px;
  background: rgba(0, 0, 0, 0.2);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.pm-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 44px;
  padding: 0 24px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.25s;
}

.pm-btn-cancel {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #94a3b8;
}

.pm-btn-cancel:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.2);
  color: #e2e8f0;
}

.pm-btn-save {
  background: linear-gradient(135deg, var(--accent-green), var(--accent-green-dark));
  border: none;
  color: #ffffff;
  box-shadow: 0 8px 20px rgba(34, 197, 94, 0.3);
}

.pm-btn-save:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(34, 197, 94, 0.4);
  filter: brightness(1.08);
}

/* ========== PREMIUM MODAL V3 ========== */
.premium-modal-v3 {
  background: #0f172a !important;
  border: 1px solid rgba(255, 255, 255, 0.06) !important;
  border-radius: 20px !important;
  width: 520px !important;
  max-width: 95vw;
  padding: 0 !important;
  overflow: hidden;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.6) !important;
  animation: modalFadeIn 0.25s ease-out;
}

@keyframes modalFadeIn {
  from { opacity: 0; transform: scale(0.96); }
  to { opacity: 1; transform: scale(1); }
}


/* ========== PREMIUM MODAL V4 (CLEAN & MINIMAL) ========== */
.premium-modal-v4 {
  background: #0f172a !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  border-radius: 20px !important;
  width: 500px !important;
  max-width: 95vw;
  padding: 0 !important;
  overflow: hidden;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.7) !important;
  animation: modalFadeIn 0.25s ease-out;
}

@keyframes modalFadeIn {
  from { opacity: 0; transform: scale(0.96); }
  to { opacity: 1; transform: scale(1); }
}

/* Header */
.pmv4-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.pmv4-header-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pmv4-icon-box {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #10b981, #059669);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 20px;
}

.pmv4-title {
  margin: 0;
  font-size: 16px;
  font-weight: 800;
  color: #f1f5f9;
}

.pmv4-subtitle {
  margin: 1px 0 0;
  font-size: 12px;
  color: #94a3b8;
  font-weight: 500;
}

.pmv4-close {
  background: transparent;
  border: none;
  color: #64748b;
  cursor: pointer;
  font-size: 20px;
  transition: color 0.2s;
}

.pmv4-close:hover {
  color: #ef4444;
}

/* Body */
.pmv4-body {
  padding: 20px;
}

/* Stock Strip (Minimal) */
.pmv4-stock-strip {
  display: flex;
  justify-content: space-between;
  padding: 10px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 13px;
}

.pmv4-stock-strip.strip-success { background: rgba(16, 185, 129, 0.1); color: #34d399; }
.pmv4-stock-strip.strip-warning { background: rgba(251, 191, 36, 0.1); color: #fbbf24; }
.pmv4-stock-strip.strip-danger  { background: rgba(239, 68, 68, 0.1); color: #f87171; }

.strip-text b { font-weight: 800; margin-left: 4px; }
.strip-item { display: flex; align-items: center; gap: 6px; }

/* Grid */
.pmv4-form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.span-full { grid-column: span 2; }

.pmv4-field-group {
  display: flex;
  flex-direction: column;
}

.pmv4-label {
  display: block;
  font-size: 11px;
  font-weight: 700;
  color: #cbd5e1;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.text-subtle { color: #64748b; }

/* Stepper V5 (Circular Design) */
.pmv4-stepper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  height: 54px;
  width: 100%;
}

.pmv4-step-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  background: #22c55e;
  color: #fff;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.4);
  transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.pmv4-step-btn:hover:not(:disabled) {
  background: #16a34a;
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 8px 16px rgba(34, 197, 94, 0.5);
}

.pmv4-step-btn:active:not(:disabled) {
  transform: translateY(0) scale(0.95);
}

.pmv4-step-btn:disabled {
  background: rgba(255, 255, 255, 0.05);
  color: #64748b;
  box-shadow: none;
  cursor: not-allowed;
}

.pmv4-step-input-wrap {
  flex: 1;
  max-width: 160px;
  height: 48px;
  position: relative;
  display: flex;
  align-items: center;
}

.pmv4-step-input {
  width: 100%;
  height: 100%;
  border-radius: 14px;
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.2);
  color: #22c55e;
  font-size: 26px;
  font-weight: 800;
  text-align: center;
  padding: 0 35px; /* Space for unit */
  transition: all 0.2s;
}

.pmv4-step-input:focus {
  outline: none;
  background: rgba(34, 197, 94, 0.15);
  border-color: #22c55e;
  box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.1);
}

.pmv4-input-unit {
  position: absolute;
  right: 12px;
  font-size: 11px;
  color: #15803d; /* Dark green for contrast on light bg */
  font-weight: 800;
  text-transform: uppercase;
  pointer-events: none;
}

/* Inputs */
.pmv4-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.pmv4-input {
  width: 100%;
  height: 40px;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 0 12px;
  color: #e2e8f0;
  font-weight: 600;
}

.pmv4-input:focus, .pmv4-step-input:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.15);
}

.text-highlight { color: #4ade80; font-weight: 800; }
.text-danger-soft { color: #fb7185; }

.pmv4-static-field {
  width: 100%;
  height: 40px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px dashed rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  color: #94a3b8;
  font-weight: 600;
  font-family: 'JetBrains Mono', monospace;
  position: relative;
}

.pmv4-static-unit {
  position: absolute;
  right: 12px;
  font-size: 11px;
  color: #475569;
  font-weight: 700;
}

.pmv4-input-unit {
  position: absolute;
  right: 12px;
  font-size: 11px;
  color: #22c55e;
  font-weight: 800;
}

.pmv4-textarea {
  width: 100%;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 10px;
  color: #e2e8f0;
  resize: none;
}

.pmv4-textarea:focus {
    outline: none;
    border-color: #10b981;
    box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.15);
}

/* Footer */
.pmv4-footer {
  padding: 16px 20px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.pmv4-btn-ghost {
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  background: transparent;
  color: #94a3b8;
  border: none;
  cursor: pointer;
}

.pmv4-btn-ghost:hover { color: #e2e8f0; background: rgba(255,255,255,0.05); }

.pmv4-btn-primary {
  padding: 8px 24px;
  border-radius: 8px;
  font-weight: 700;
  background: #10b981;
  color: #fff;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.pmv4-btn-primary:hover {
  background: #059669;
}

/* Hide Spinners */
.pmv4-input::-webkit-outer-spin-button,
.pmv4-input::-webkit-inner-spin-button,
.pmv4-step-input::-webkit-outer-spin-button,
.pmv4-step-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.pmv4-input[type=number],
.pmv4-step-input[type=number] {
  -moz-appearance: textfield;
}


.pmv3-icon-box i {
  font-size: 22px;
  color: #fff;
}

.pmv3-title {
  margin: 0;
  font-size: 17px;
  font-weight: 800;
  color: #f8fafc;
}

.pmv3-subtitle {
  margin: 2px 0 0;
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
  max-width: 280px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pmv3-close {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.pmv3-close:hover {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

/* Body */
.pmv3-body {
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Stock Strip */
.pmv3-stock-strip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 14px 20px;
  border-radius: 12px;
  border: 1px solid;
}

.pmv3-stock-strip.strip-success {
  background: rgba(34, 197, 94, 0.06);
  border-color: rgba(34, 197, 94, 0.15);
}

.pmv3-stock-strip.strip-warning {
  background: rgba(251, 191, 36, 0.06);
  border-color: rgba(251, 191, 36, 0.15);
}

.pmv3-stock-strip.strip-danger {
  background: rgba(239, 68, 68, 0.06);
  border-color: rgba(239, 68, 68, 0.15);
}

.strip-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.strip-item i {
  font-size: 20px;
}

.strip-success .strip-item:first-child i { color: #22c55e; }
.strip-warning .strip-item:first-child i { color: #fbbf24; }
.strip-danger .strip-item:first-child i { color: #ef4444; }

.strip-item:last-child i {
  color: #64748b;
}

.strip-content {
  display: flex;
  flex-direction: column;
}

.strip-label {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: rgba(255, 255, 255, 0.5);
}

.strip-value {
  font-size: 18px;
  font-weight: 900;
  font-family: 'JetBrains Mono', monospace;
  color: #f1f5f9;
}

.strip-separator {
  width: 1px;
  height: 32px;
  background: rgba(255, 255, 255, 0.1);
}

/* Cards */
.pmv3-card {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 14px;
  overflow: hidden;
}

.pmv3-card-danger {
  background: rgba(239, 68, 68, 0.03);
  border-color: rgba(239, 68, 68, 0.08);
}

.pmv3-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #94a3b8;
}

.pmv3-card-danger .pmv3-card-header {
  color: #fb7185;
}

.pmv3-card-header i {
  font-size: 14px;
}

.pmv3-card-body {
  padding: 16px;
}

.pmv3-grid-2 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}

.pmv3-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.pmv3-field label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #64748b;
}

.pmv3-input-group {
  position: relative;
  display: flex;
  align-items: center;
}

.pmv3-input {
  width: 100%;
  height: 44px;
  padding: 0 50px 0 14px;
  background: rgba(15, 23, 42, 0.5) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  border-radius: 10px !important;
  color: #f1f5f9 !important;
  font-size: 15px !important;
  font-weight: 600 !important;
  transition: all 0.2s !important;
}

.pmv3-input:focus {
  outline: none !important;
  border-color: var(--accent-green) !important;
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.12) !important;
}

.pmv3-input-lg {
  height: 52px;
  font-size: 20px !important;
  font-weight: 800 !important;
  text-align: center;
  padding-right: 70px !important;
}

.pmv3-input-success {
  color: #4ade80 !important;
  font-weight: 800 !important;
}

.pmv3-input-danger {
  color: #fb7185 !important;
}

.pmv3-input-suffix {
  position: absolute;
  right: 14px;
  font-size: 12px;
  font-weight: 800;
  color: #475569;
  pointer-events: none;
}

.pmv3-textarea {
  width: 100%;
  padding: 12px 14px;
  background: rgba(15, 23, 42, 0.5) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  border-radius: 10px !important;
  color: #f1f5f9 !important;
  font-size: 14px !important;
  resize: none !important;
  transition: all 0.2s;
}

.pmv3-textarea:focus {
  outline: none;
  border-color: var(--accent-green) !important;
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.12) !important;
}


/* Stepper V3 */
.pmv3-stepper {
  display: flex;
  align-items: stretch;
  gap: 10px;
  height: 52px;
}

.pmv3-step-btn {
  width: 52px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.03);
  color: #e2e8f0;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.pmv3-step-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.25);
  color: #fff;
  transform: translateY(-1px);
}

.pmv3-step-btn:active:not(:disabled) {
  transform: translateY(0);
}

.pmv3-step-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  background: transparent;
  border-color: rgba(255, 255, 255, 0.05);
}

.pmv3-step-input-wrap {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}

.pmv3-step-input {
  width: 100%;
  height: 100%;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(15, 23, 42, 0.6);
  color: #4ade80; /* Highlight Green */
  font-size: 28px;
  font-weight: 800;
  text-align: center;
  padding: 0 50px;
  transition: all 0.2s;
}

.pmv3-step-input:focus {
  outline: none;
  border-color: var(--accent-green);
  box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.15);
  background: rgba(15, 23, 42, 0.8);
}

.pmv3-step-unit {
  position: absolute;
  right: 16px;
  color: #64748b;
  font-weight: 700;
  font-size: 13px;
  pointer-events: none;
  text-transform: uppercase;
}

/* Footer */
.pmv3-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 24px;
  background: rgba(0, 0, 0, 0.15);
  border-top: 1px solid rgba(255, 255, 255, 0.04);
}

.pmv3-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 42px;
  padding: 0 22px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.pmv3-btn-ghost {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #94a3b8;
}

.pmv3-btn-ghost:hover {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.15);
  color: #e2e8f0;
}

.pmv3-btn-primary {
  background: linear-gradient(135deg, var(--accent-green), var(--accent-green-dark));
  border: none;
  color: #fff;
  box-shadow: 0 6px 16px rgba(34, 197, 94, 0.25);
}

.pmv3-btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 24px rgba(34, 197, 94, 0.35);
  filter: brightness(1.05);
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  background: rgba(255, 255, 255, 0.02);
}

.modal-title-wrap {
  display: flex;
  gap: 16px;
  align-items: center;
}

.modal-title-wrap .header-icon {
  font-size: 28px;
  color: var(--accent-green);
  background: rgba(34, 197, 94, 0.1);
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.modal-title-wrap h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 800;
  letter-spacing: 0.5px;
  color: #f8fafc;
}

.modal-subtitle {
  margin: 2px 0 0;
  font-size: 13px;
  color: #94a3b8;
  font-weight: 500;
}

.modal-close-btn {
  background: rgba(255, 255, 255, 0.05);
  border: none;
  color: #64748b;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close-btn:hover {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

.modal-body {
  padding: 24px;
}

.stock-status-banner {
  display: flex;
  justify-content: space-between;
  padding: 14px 20px;
  border-radius: 12px;
  border: 1px solid;
  margin-bottom: 24px;
}

.stock-info-main, .stock-info-sub {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stock-info-main {
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  padding-right: 40px;
}

.stock-status-banner .label {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1px;
  color: rgba(255, 255, 255, 0.5);
}

.stock-status-banner .value {
  font-size: 18px;
  font-weight: 950;
  font-family: 'JetBrains Mono', monospace;
}

.modal-form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.span-full {
  grid-column: span 2;
}

.discounts-panel {
  background: rgba(239, 68, 68, 0.05);
  padding: 16px;
  border-radius: 12px;
  border: 1px solid rgba(239, 68, 68, 0.1);
}

.input-premium {
  background: rgba(15, 23, 42, 0.8) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 10px !important;
  height: 44px !important;
  padding: 0 14px !important;
  font-size: 15px !important;
  font-weight: 600 !important;
  color: #f1f5f9 !important;
  transition: all 0.2s !important;
}

.input-premium:focus {
  border-color: var(--accent-green) !important;
  box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.15) !important;
}

.highlight-input {
  color: #4ade80 !important;
  font-size: 18px !important;
  font-weight: 800 !important;
}

.input-readonly-dark {
  background: rgba(2, 6, 23, 0.5) !important;
  border-color: rgba(255, 255, 255, 0.05) !important;
  color: #94a3b8 !important;
  cursor: default;
}

.input-stepper-wrap, .input-currency-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.input-unit {
  position: absolute;
  right: 14px;
  font-size: 12px;
  font-weight: 800;
  color: #64748b;
  pointer-events: none;
}

.select-premium {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;
  background-size: 16px;
  background-color: rgba(15, 23, 42, 0.8) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 10px !important;
  height: 44px !important;
  padding: 0 40px 0 14px !important;
  font-weight: 600 !important;
  color: #f1f5f9 !important;
}

.textarea-premium {
  background: rgba(15, 23, 42, 0.8) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 12px !important;
  padding: 12px 14px !important;
  font-size: 14px !important;
  color: #f1f5f9 !important;
  resize: none !important;
}

.modal-footer {
  padding: 20px 24px;
  background: rgba(255, 255, 255, 0.02);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: flex-end;
  gap: 14px;
}

.btn-cancel-premium {
  padding: 0 24px;
  height: 44px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  color: #94a3b8;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel-premium:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #f1f5f9;
  border-color: rgba(255, 255, 255, 0.3);
}

.btn-save-premium {
  padding: 0 32px;
  height: 44px;
  background: linear-gradient(135deg, var(--accent-green), var(--accent-green-dark));
  border: none;
  border-radius: 12px;
  color: #ffffff;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 10px 20px rgba(34, 197, 94, 0.3);
}

.btn-save-premium:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 30px rgba(34, 197, 94, 0.45);
  filter: brightness(1.1);
}

.text-danger-val {
  color: #f87171 !important;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
}

.stock-warning {
  background: rgba(15, 23, 42, 0.8);
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 12px;
  border-left: 4px solid #3b82f6;
}

.stock-warning p {
  margin: 4px 0;
}

.stock-warning b {
  color: #e2e8f0;
}

.btn-delete {
  padding: 4px 8px;
  background: #ef4444;
  color: #0f172a;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: bold;
  transition: background 0.2s;
}

.btn-delete:hover {
  background: #f87171;
}

/* ===== MEDIA PRINT - ẨN CÁC NÚT VÀ PHẦN KHÔNG CẦN IN ===== */
@media print {
  .page,
  .box,
  .btn,
  .payment,
  .summary,
  button,
  .modal,
  .text-invoice-overlay {
    display: none !important;
  }
  
  .hoa-don-print {
    position: static !important;
    display: block !important;
  }
}

/* ============================================
   CATALOG SẢN PHẨM
   ============================================ */

.search-box {
  margin-bottom: 16px;
}

.search-input {
  width: 100%;
  padding: 12px 16px;
  font-size: 15px;
  border: 1px solid rgba(148, 163, 184, 0.3);
  border-radius: 8px;
  transition: border 0.3s;
  background: rgba(2, 6, 23, 0.7);
  color: #e2e8f0;
}

.search-input:focus {
  border-color: rgba(59, 130, 246, 0.9);
  outline: none;
}


  /* ===== PRODUCT GRID (VIP Refactor) ===== */

  /* ===== PRODUCT GRID (VIP Refactor) ===== */
.product-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  padding-bottom: 16px;
}

/* =========================================
   SCOPED CATALOG GRID STYLES (COMPACT FIX)
   ========================================= */


/* 1. Scoped Grid Container */
.catalog-grid-section .product-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr)); /* FORCE 3 COLUMNS */
  gap: 10px;
  padding: 10px 0;
  width: 100%;
}

/* 2. Scoped Card Container - High Specificity */
.catalog-grid-section .product-card-horizontal {
  display: flex !important;
  flex-direction: row !important;
  width: 100%;
  min-height: 135px; /* Use min-height to prevent cut-off */
  height: auto;
  background: #1e293b;
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
  padding: 0; 
  align-items: stretch;
  gap: 0;
}

.catalog-grid-section .product-card-horizontal:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  border-color: rgba(59, 130, 246, 0.4);
}

.catalog-grid-section .product-card-horizontal.is-out {
  opacity: 0.6;
  filter: grayscale(0.8);
}

/* 3. Image Section (Fixed Width) */
.catalog-grid-section .pc-media-horizontal {
  width: 110px;
  min-width: 110px;
  height: auto; /* Allow to stretch */
  min-height: 100%;
  position: relative;
  background: #fff;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.catalog-grid-section .pc-media-horizontal img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 4px;
  display: block;
  position: absolute; /* Lock inside container */
  top: 0;
  left: 0;
}

.catalog-grid-section .pc-media-horizontal .no-img-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1e293b;
  color: #475569;
  font-size: 24px;
}

/* Badges (Absolute to Image) */
.catalog-grid-section .badge-sale {
  position: absolute;
  top: 4px;
  left: 4px;
  background: #ef4444;
  color: white;
  font-size: 9px;
  font-weight: 700;
  padding: 2px 4px;
  border-radius: 4px;
  z-index: 2;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.catalog-grid-section .badge-out {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.85);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 9px;
  font-weight: 700;
  white-space: nowrap;
  border: 1px solid rgba(255,255,255,0.15);
  z-index: 2;
}

/* 4. Content Section */
.catalog-grid-section .pc-content-horizontal {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  padding: 8px 10px;
  justify-content: space-between;
  overflow: visible; /* Show dropdowns/popovers */
}

/* Name */
.catalog-grid-section .pc-name-horizontal {
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 13px;
  line-height: 1.3;
  color: #f8fafc;
  margin-bottom: 4px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 34px;
  flex-shrink: 0;
}

/* New Card Layout Styles */
.catalog-grid-section .pc-info-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: auto;
  min-width: 0;
}

.catalog-grid-section .pc-price-stock-row {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  flex-wrap: wrap; 
}

.catalog-grid-section .pc-price-box-horizontal {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 6px;
}

.catalog-grid-section .price-sale {
  color: #f87171;
  font-weight: 800;
  font-size: 14px;
}

.catalog-grid-section .price-old {
  color: #64748b;
  text-decoration: line-through;
  font-size: 11px;
}

.catalog-grid-section .price-normal {
  color: #e2e8f0;
  font-weight: 700;
  font-size: 14px;
}

.catalog-grid-section .pc-stock-pill-horizontal {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  font-weight: 600;
  color: #94a3b8;
  background: rgba(148, 163, 184, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  width: fit-content;
  margin-top: 0;
}
.catalog-grid-section .pc-stock-pill-horizontal.stock-out { color: #f87171; background: rgba(239, 68, 68, 0.12); }
.catalog-grid-section .pc-stock-pill-horizontal.stock-low { color: #fbbf24; background: rgba(245, 158, 11, 0.12); }
.catalog-grid-section .pc-stock-pill-horizontal.stock-ok { color: #4ade80; background: rgba(74, 222, 128, 0.12); }

/* Actions */
.catalog-grid-section .pc-actions-horizontal {
  display: flex;
  gap: 6px;
  margin-top: 6px; 
  padding-top: 0;
  border-top: none; 
}

/* Modern Stepper Layout */
.qty-note-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 2px;
}

.qty-stepper-modern {
  display: flex;
  align-items: center;
  gap: 4px;
}

.qty-btn-circle {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #10b981;
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 8px rgba(16, 185, 129, 0.3);
  flex-shrink: 0;
}

.qty-btn-circle:hover:not(:disabled) {
  background: #059669;
  transform: scale(1.1);
}

.qty-btn-circle:disabled {
  background: #334155;
  color: #94a3b8;
  cursor: not-allowed;
  box-shadow: none;
  opacity: 0.5;
}

.qty-input-box {
  width: 50px;
  padding: 0 4px;
  height: 24px;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.25);
  border-radius: 6px;
  color: #10b981;
  font-weight: 800;
  text-align: center;
  font-size: 12px;
  outline: none;
  -moz-appearance: textfield; 
}

/* Force hide spin buttons */
.qty-input-box::-webkit-outer-spin-button,
.qty-input-box::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
  display: none !important;
}

.btn-note-text-green {
  width: 24px;
  height: 24px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(16, 185, 129, 0.1); 
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 6px;
  color: #10b981;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px; /* Icon size */
}

.btn-note-text-green:hover {
  background: rgba(16, 185, 129, 0.2);
  border-color: rgba(16, 185, 129, 0.4);
}

.btn-note-text-green.has-note {
  background: #facc15;
  color: #000;
  border-color: #eab308;
}

/* Green Add Button */
.btn-add-green {
  flex: 1;
  height: 30px;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 700;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(16, 185, 129, 0.25);
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-add-green:hover:not(:disabled) {
  background: linear-gradient(135deg, #059669, #047857);
  transform: translateY(-1px);
  box-shadow: 0 6px 14px rgba(16, 185, 129, 0.35);
}

.btn-add-green:disabled {
  background: #334155;
  box-shadow: none;
  cursor: not-allowed;
  opacity: 0.6;
}

.catalog-grid-section .note-popover-horizontal {
  position: absolute;
  bottom: 34px;
  right: 0;
  width: 200px;
  background: #1e293b;
  border: 1px solid rgba(148, 163, 184, 0.3);
  box-shadow: 0 10px 25px rgba(0,0,0,0.5);
  padding: 8px;
  border-radius: 8px;
  z-index: 20;
}

.catalog-grid-section .note-save-horizontal {
  width: 100%;
  margin-top: 6px;
  height: 24px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  font-size: 11px;
}

/* Responsive */
@media (max-width: 900px) { /* Adjusted breakpoint down from 1024px */
  .catalog-grid-section .product-grid { grid-template-columns: repeat(2, 1fr); }
}


@media (max-width: 640px) {
  .catalog-grid-section .product-grid { grid-template-columns: 1fr; }
  .catalog-grid-section .product-card-horizontal { height: auto; } /* Allow expand on mobile */
  .catalog-grid-section .pc-media-horizontal { width: 100px; }
}

/* Header Language Select */
/* Header Language Select */
.header-lang-select {
  position: relative;
  width: auto;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(22, 163, 74, 0.2); /* Dark green bg */
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 6px;
  padding: 0 8px;
  gap: 8px;
}

.custom-select-transparent {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0; /* Fully hidden but clickable */
  cursor: pointer;
  z-index: 2;
}

.lang-label-text {
  font-size: 11px; /* Reduced from 13px */
  font-weight: 700;
  color: #4ade80; /* Green text */
  text-transform: uppercase;
  z-index: 1;
  pointer-events: none;
  white-space: nowrap;
}

.lang-flag-img {
  width: 20px; /* Reduced from 24px */
  height: auto;
  border-radius: 3px;
  pointer-events: none;
  z-index: 1;
  display: block;
}

/* Ensure options are visible when opened (browser dependent, mainly for non-native styling attempts) */
.custom-select-transparent option {
  color: #000; /* Fallback for some browsers */
}

.product-card {
  background: rgba(2, 6, 23, 0.68);
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 14px;
  padding: 12px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border 0.2s ease;
  display: grid;
  grid-template-columns: 84px 1fr;
  gap: 12px;
  align-items: center;
  position: relative;
  box-shadow: 0 10px 26px rgba(2, 6, 23, 0.35);
}

.product-card:hover {
  transform: translateY(-2px);
  border-color: rgba(59, 130, 246, 0.45);
  box-shadow: 0 16px 32px rgba(2, 6, 23, 0.45);
}

.product-card.is-out {
  opacity: 0.6;
}

.product-card.is-flash {
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.35), 0 18px 40px rgba(59, 130, 246, 0.2);
}

.pc-media {
  width: 84px;
  height: 84px;
  flex-shrink: 0;
  background: #0f172a;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.16);
}

.pc-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-img-placeholder i, .no-img {
  font-size: 26px;
}

.badge-sale {
  position: absolute;
  top: 6px;
  left: 6px;
  padding: 2px 8px;
  font-size: 9px;
  font-weight: 700;
  border-radius: 999px;
  background: rgba(239, 68, 68, 0.9);
  color: #fff;
}

.badge-out {
  position: absolute;
  bottom: 6px;
  left: 6px;
  padding: 2px 8px;
  font-size: 9px;
  font-weight: 700;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.75);
  color: #0f172a;
}

.pc-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
}

.pc-header {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.pc-name {
  font-size: 14px;
  font-weight: 700;
  color: #e2e8f0;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.pc-price-box {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.price-sale {
  font-size: 14px;
  font-weight: 700;
  color: #ef4444;
}

.price-old {
  font-size: 11px;
  color: #64748b;
  text-decoration: line-through;
}

.price-normal {
  font-size: 14px;
  font-weight: 700;
  color: #e2e8f0;
}

.pc-stock-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  border: 1px solid rgba(148, 163, 184, 0.16);
  width: fit-content;
}

.pc-stock-pill .stock-qty {
  background: rgba(148, 163, 184, 0.2);
  padding: 2px 6px;
  border-radius: 999px;
  font-size: 10px;
}

.pc-stock-pill.stock-ok {
  color: #22c55e;
  border-color: rgba(34, 197, 94, 0.35);
  background: rgba(34, 197, 94, 0.12);
}

.pc-stock-pill.stock-low {
  color: #fbbf24;
  border-color: rgba(251, 191, 36, 0.35);
  background: rgba(251, 191, 36, 0.12);
}

.pc-stock-pill.stock-out {
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.35);
  background: rgba(239, 68, 68, 0.12);
}

.pc-footer {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.qty-stepper {
  display: flex;
  align-items: center;
  background: rgba(15, 23, 42, 0.75);
  border: 1px solid rgba(148, 163, 184, 0.24);
  border-radius: 999px;
  padding: 2px;
}

.qty-btn-mini {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  color: #e2e8f0;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  border-radius: 999px;
}

.qty-btn-mini:hover:not(:disabled) {
  background: rgba(59, 130, 246, 0.18);
  color: #3b82f6;
}

.qty-btn-mini:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.qty-input-mini {
  width: 40px;
  height: 28px;
  background: transparent;
  border: none;
  color: #e2e8f0;
  text-align: center;
  font-size: 12px;
  font-weight: 700;
  appearance: textfield;
}

.qty-input-mini::-webkit-inner-spin-button, 
.qty-input-mini::-webkit-outer-spin-button { 
  -webkit-appearance: none; 
  margin: 0; 
}

.btn-add-mini {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.btn-add-mini i {
  font-size: 18px;
}

.btn-add-mini:hover:not(:disabled) {
  background: #2563eb;
  box-shadow: 0 8px 18px rgba(37, 99, 235, 0.35);
}

.btn-add-mini:disabled {
  background: #475569;
  cursor: not-allowed;
  opacity: 0.5;
}

.pc-note-wrap {
  position: relative;
}

.note-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: rgba(15, 23, 42, 0.65);
  color: #cbd5f5;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.note-btn:hover {
  border-color: rgba(59, 130, 246, 0.45);
  color: #e2e8f0;
}

.note-popover {
  position: absolute;
  right: 0;
  top: calc(100% + 6px);
  width: 220px;
  background: rgba(2, 6, 23, 0.95);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 12px;
  padding: 10px;
  z-index: 10;
  box-shadow: 0 18px 30px rgba(2, 6, 23, 0.6);
}

.note-popover textarea {
  width: 100%;
  min-height: 70px;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 8px;
  color: #e2e8f0;
  padding: 8px;
  font-size: 12px;
  resize: vertical;
}

.note-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}

.note-save {
  padding: 6px 10px;
  border-radius: 8px;
  border: none;
  background: #3b82f6;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
}



.pc-note textarea {
  width: 100%;
  padding: 4px 6px;
  border: 1px solid rgba(148, 163, 184, 0.28);
  border-radius: 6px;
  font-size: 11px;
  resize: none;
  transition: border 0.2s, height 0.2s;
  height: 28px;
  overflow: hidden;
  background: rgba(2, 6, 23, 0.7);
  color: #e2e8f0;
}

.pc-note textarea:focus {
  outline: none;
  border-color: rgba(59, 130, 246, 0.9);
  height: 72px;
}

.pc-note textarea::placeholder {
  color: #64748b;
  font-size: 11px;
}

.pc-qty-row {
  display: grid;
  grid-template-columns: 36px 1fr 36px;
  gap: 6px;
  align-items: center;
}

.qty-btn {
  width: 36px;
  height: 32px;
  border: 1px solid rgba(148, 163, 184, 0.35);
  background: rgba(15, 23, 42, 0.8);
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 700;
  transition: all 0.2s;
  color: #e2e8f0;
}

.qty-btn:hover:not(:disabled) {
  background: rgba(30, 41, 59, 0.9);
  border-color: rgba(59, 130, 246, 0.8);
}

.qty-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.qty-input {
  width: 100%;
  height: 32px;
  text-align: center;
  border: 1px solid rgba(148, 163, 184, 0.35);
  border-radius: 6px;
  font-weight: 600;
  background: rgba(2, 6, 23, 0.7);
  color: #e2e8f0;
}

.pc-add-row .btn-add-product {
  width: 100%;
  height: 36px;
  padding: 0 12px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: #e2e8f0;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  white-space: nowrap;
}

.btn-add-product:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
}

.btn-add-product:disabled {
  background: #475569;
  cursor: not-allowed;
}


.no-products {
  text-align: center;
  padding: 40px;
  color: #94a3b8;
  font-size: 15px;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(148, 163, 184, 0.2);
}

.page-btn {
  padding: 8px 12px;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.35);
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  color: #e2e8f0;
}

.page-btn:hover:not(:disabled) {
  background: rgba(30, 41, 59, 0.9);
  border-color: rgba(59, 130, 246, 0.8);
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-info {
  font-weight: 600;
  color: #e2e8f0;
  min-width: 120px;
  text-align: center;
}

/* ============================================
   MODAL CHI TIẾT SẢN PHẨM
   ============================================ */

/* ===== PREMIUM DARK PRODUCT MODAL - BALANCED ===== */
.product-detail-box {
  background: linear-gradient(135deg, #1e293b, #0f172a);
  border-radius: 16px;
  max-width: 1100px; /* Wider for balance */
  width: 95%;
  max-height: 95vh;
  min-height: 500px;
  height: auto;
  display: flex;
  flex-direction: column;
  position: relative;
  padding: 32px; /* Restored breathing room */
  border: 1px solid rgba(148, 163, 184, 0.1);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  color: #f8fafc;
  overflow: hidden;
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 36px;
  height: 36px;
  border: 1px solid rgba(148, 163, 184, 0.1);
  background: rgba(15, 23, 42, 0.6);
  color: #94a3b8;
  border-radius: 50%;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  z-index: 10;
}

.close-btn:hover {
  background: rgba(15, 23, 42, 0.9);
  color: #f8fafc;
  transform: rotate(90deg);
}

.detail-grid {
  display: grid;
  grid-template-columns: 45% 1fr; /* Balanced Image/Info split */
  gap: 36px; /* Wider gap */
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-right: 8px;
}

/* Custom scrollbar for grid */
.detail-grid::-webkit-scrollbar { width: 4px; }
.detail-grid::-webkit-scrollbar-track { background: rgba(15, 23, 42, 0.3); }
.detail-grid::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.3); border-radius: 10px; }
.detail-grid::-webkit-scrollbar-thumb:hover { background: rgba(148, 163, 184, 0.5); }

/* Images Left */
.detail-images {
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-self: center; /* Vertically center in grid */
}

.main-image {
  width: 100%;
  height: 380px; /* Increased for better visibility */
  background: #020617;
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-shadow: inset 0 0 20px rgba(0,0,0,0.2);
}

.main-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 8px;
}

.no-img-large {
  font-size: 80px;
  color: #334155;
}

.thumbnail-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
  gap: 12px;
}

.thumbnail {
  width: 70px;
  height: 70px;
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  background: #020617;
  transition: all 0.2s;
}

.thumbnail:hover {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.8;
  transition: opacity 0.2s;
}

.thumbnail:hover img {
  opacity: 1;
}

/* Info Right */
.detail-info {
  display: flex;
  flex-direction: column;
  gap: 16px; /* Comfortable gap */
}

.detail-title {
  font-size: 28px; /* Restored size */
  font-weight: 800;
  background: linear-gradient(135deg, #f8fafc, #94a3b8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
  line-height: 1.2;
}

.detail-row {
  display: flex;
  gap: 16px;
  padding: 8px 0; /* Comfortable padding */
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
  align-items: baseline;
}

.detail-label {
  font-weight: 600;
  color: #64748b;
  min-width: 100px;
  font-size: 14px;
}

.detail-value {
  color: #e2e8f0;
  font-weight: 500;
  font-size: 15px;
}

/* Price Section - Airy */
.detail-price-section {
  background: transparent;
  padding: 8px 0;
  margin: 8px 0;
  border-top: 1px dashed rgba(148, 163, 184, 0.2);
  border-bottom: 1px dashed rgba(148, 163, 184, 0.2);
}

.price-section-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 700;
  color: #94a3b8;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.price-section-header i { font-size: 14px; color: #10b981; }

/* Price Row Structure - Minimal */
.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  gap: 12px;
}

/* Price Row Label - Big & Clear */
.price-row-label {
  display: flex;
  align-items: center;
  gap: 8px; /* Increased gap */
  font-size: 18px; /* Greatly increased size */
  font-weight: 700; /* Bolder */
  color: #f8fafc; /* Even brighter */
  min-width: 100px;
}

.price-row-label i { font-size: 20px; opacity: 1; }

.price-row-value {
  flex: 1;
  text-align: right;
  font-size: 20px; /* Big value */
  font-weight: 700;
  color: #f8fafc;
  line-height: 1;
}

/* Cost & Selling - No Backgrounds */
.price-row-cost, .price-row-selling {
  background: transparent;
  padding: 4px 0;
  border-radius: 0;
  margin-bottom: 0;
}

.price-row-cost .price-row-label { color: #e2e8f0; }
.price-row-selling .price-row-label { color: #e2e8f0; }

/* Cost Price - Large & Equal */
.price-cost {
  color: #60a5fa !important;
  font-family: 'Roboto Mono', monospace;
  font-size: 24px; /* Increased to match selling price */
  font-weight: 700;
}

/* Price with Discount */
.price-with-discount {
  display: flex;
  flex-direction: column;
  gap: 0;
  align-items: flex-end;
}

.price-current {
  font-size: 24px; /* Same large size */
  font-weight: 900;
  color: #ef4444;
  text-shadow: 0 2px 10px rgba(239, 68, 68, 0.3);
}

.price-original-strike {
  font-size: 13px;
  color: #64748b;
  text-decoration: line-through;
  font-weight: 600;
}

.price-normal-large {
  font-size: 24px; /* Same large size */
  font-weight: 700;
  color: #4ade80;
  letter-spacing: -0.5px;
}

/* Profit Indicator - Smaller Hierarchy */
.profit-indicator {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  margin-top: 6px;
  border-top: 1px dotted rgba(148, 163, 184, 0.2);
  background: transparent;
  border-radius: 0;
  border-left: none;
  border-right: none;
  border-bottom: none;
}

.profit-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px; /* Slightly smaller label */
  font-weight: 600;
  color: #4ade80;
  text-transform: uppercase;
  min-width: 100px;
}

.profit-label i { font-size: 16px; color: #10b981; }

.profit-value {
  font-size: 18px; /* Smaller than prices (24px vs 18px) */
  font-weight: 700;
  color: #10b981;
}

.detail-stock {
  font-size: 15px;
  font-weight: 600;
}

.detail-desc {
  margin-top: 8px;
}

.detail-desc p {
  color: #94a3b8;
  line-height: 1.5;
  margin: 4px 0;
  font-size: 13px;
}

.detail-note-input {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed rgba(148, 163, 184, 0.2);
}

.detail-note-input label {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
  font-weight: 600;
  color: #cbd5e1;
  font-size: 14px;
}

.detail-note-input textarea {
  width: 100%;
  padding: 12px;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.15);
  color: #e2e8f0;
  border-radius: 12px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  transition: all 0.2s;
}

.detail-note-input textarea:focus {
  outline: none;
  background: rgba(15, 23, 42, 0.9);
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.detail-actions {
  display: flex;
  flex-direction: column; /* Vertical stacking */
  gap: 14px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(148, 163, 184, 0.1);
}

/* Quantity row - centered */
.detail-actions .qty-note-row {
  display: flex;
  justify-content: center;
  margin: 0;
}

/* Button full width */
.detail-actions .btn-add-large {
  width: 100%;
}


/* Meta Tags / Pills */
.detail-meta-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 16px 0;
}

.meta-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  color: #60a5fa;
  white-space: nowrap;
}

.meta-tag i {
  font-size: 14px;
}

.meta-category {
  background: rgba(139, 92, 246, 0.1);
  border-color: rgba(139, 92, 246, 0.2);
  color: #a78bfa;
}

.meta-size {
  background: rgba(236, 72, 153, 0.1);
  border-color: rgba(236, 72, 153, 0.2);
  color: #f472b6;
}

.meta-unit {
  background: rgba(34, 197, 94, 0.1);
  border-color: rgba(34, 197, 94, 0.2);
  color: #4ade80;
}

.meta-status-active,
.meta-status-hoạt_động {
  background: rgba(34, 197, 94, 0.1);
  border-color: rgba(34, 197, 94, 0.2);
  color: #4ade80;
}

/* Stock - Inline Meta */
.meta-stock {
  font-weight: 700;
  border-width: 1px;
}

.meta-stock.stock-ok {
  background: rgba(34, 197, 94, 0.1);
  border-color: rgba(34, 197, 94, 0.3);
  color: #4ade80;
}

.meta-stock.stock-low {
  background: rgba(251, 191, 36, 0.1);
  border-color: rgba(251, 191, 36, 0.3);
  color: #fbbf24;
}

.meta-stock.stock-out {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.3);
  color: #f87171;
}

/* Price Label */
.price-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.price-label i {
  font-size: 16px;
  color: #10b981;
}

/* Section Titles */
.detail-section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 700;
  color: #cbd5e1;
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-section-title i {
  font-size: 16px;
  color: #3b82f6;
}

.btn-add-large {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px 28px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  position: relative;
  overflow: hidden;
}

.btn-add-large::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.5s;
}

.btn-add-large:hover::before {
  left: 100%;
}

.btn-add-large:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
}

.btn-add-large:active:not(:disabled) {
  transform: translateY(0);
}

.btn-add-large:disabled {
  background: rgba(100, 116, 139, 0.3);
  cursor: not-allowed;
  box-shadow: none;
  opacity: 0.6;
}

@media (max-width: 768px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
  
  .main-image {
    height: 300px;
  }
}
</style>

<style scoped>
/* ===== CATALOG TOOLBAR ===== */
.catalog-toolbar {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  gap: 16px;
  align-items: flex-start;
  justify-content: space-between;
  padding: 12px;
  margin: -12px -12px 12px;
  background: rgba(2, 6, 23, 0.92);
  border-bottom: 1px solid rgba(148, 163, 184, 0.12);
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 20px rgba(2, 6, 23, 0.35);
}

.toolbar-left {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1 1 320px;
  min-width: 240px;
}

.toolbar-right {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: flex-end;
  align-items: flex-start;
  flex: 1 1 320px;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 15px;
  pointer-events: none;
}

.search-input {
  width: 100%;
  height: 42px;
  padding: 0 40px 0 38px;
  background: rgba(2, 6, 23, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 10px;
  color: #e2e8f0;
  outline: none;
  font-size: 14px;
  transition: border 0.2s, box-shadow 0.2s;
}

.search-input:focus {
  border-color: rgba(59, 130, 246, 0.6);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.35);
}

.search-clear {
  position: absolute;
  right: 8px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: 1px solid rgba(148, 163, 184, 0.16);
  background: rgba(15, 23, 42, 0.8);
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s;
}

.search-clear:hover {
  color: #e2e8f0;
  border-color: rgba(59, 130, 246, 0.45);
}

.catalog-meta {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.meta-count {
  font-size: 12px;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.btn-reset {
  height: 32px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  background: rgba(15, 23, 42, 0.6);
  color: #e2e8f0;
  font-weight: 600;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-reset:hover {
  border-color: rgba(59, 130, 246, 0.45);
  box-shadow: 0 6px 14px rgba(37, 99, 235, 0.25);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 140px;
}

.filter-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(148, 163, 184, 0.8);
}

.pill-group {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.pill {
  padding: 6px 12px;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  background: rgba(2, 6, 23, 0.6);
  color: #94a3b8;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.pill:hover {
  border-color: rgba(59, 130, 246, 0.4);
  color: #e2e8f0;
}

.pill.active {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.9), rgba(37, 99, 235, 0.9));
  border-color: rgba(59, 130, 246, 0.75);
  color: #ffffff;
  box-shadow: 0 6px 14px rgba(37, 99, 235, 0.35);
}

.pill-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.chk-hidden {
  display: none;
}

@media (max-width: 1024px) {
  .catalog-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .toolbar-right {
    justify-content: flex-start;
  }
}

/* ===== PRODUCT CARD REFINEMENTS ===== */
.no-img-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #1e293b, #0f172a);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #475569;
}

.no-img-placeholder i {
  font-size: 48px;
  opacity: 0.5;
}

/* ===== SUMMARY BOX REFINEMENTS ===== */
.sum-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sum-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.sum-label {
  color: #94a3b8;
}

.font-mono {
  font-family: 'Consolas', 'Monaco', monospace;
  letter-spacing: -0.5px;
}

.has-value .sum-value {
  font-weight: 700;
}

.sum-divider {
  height: 1px;
  background: rgba(148, 163, 184, 0.2);
  margin: 12px 0;
}

.highlight-row .sum-label {
  font-weight: 700;
  color: #e2e8f0;
  font-size: 16px;
}

/* =========================================
   UNIFIED CATALOG HEADER (Single Row)
   ========================================= */
.catalog-toolbar-unified {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  background: rgba(15, 23, 42, 0.95);
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
  backdrop-filter: blur(12px);
  border-radius: 12px 12px 0 0;
  flex-wrap: wrap; /* Allow wrapping to 2 rows */
  overflow-x: visible;
  row-gap: 12px;
}

/* 1. SECTION TITLE & MODE */
.toolbar-section-title {
  display: flex;
  align-items: center;
  justify-content: space-between; /* Title left, buttons right/fill */
  gap: 16px;
  flex-shrink: 0;
  width: 100%;
  padding-bottom: 8px;
  margin-bottom: 4px;
  border-bottom: 1px dashed rgba(148, 163, 184, 0.15);
}

.entry-mode-toggle {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1; /* Grow to fill remaining space */
  background: transparent;
  padding: 0;
  border-radius: 0;
  border: none;
}

.header-title-text {
  font-size: 13px;
  font-weight: 900;
  text-transform: uppercase;
  color: #e2e8f0;
  padding-left: 4px;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.mode-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  color: #94a3b8;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
}

.mode-btn i { font-size: 16px; }

.mode-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex: 1; /* Each button grows equally */
  padding: 10px 32px;
  min-width: 0; /* Remove min-width to allow full stretching */
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  color: #94a3b8;
  background: transparent;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
}

.mode-btn i { font-size: 18px; }

.mode-btn:hover { 
  color: #f1f5f9; 
  background: rgba(255,255,255,0.05); 
}

/* Green Button - Active State (Có sẵn) */
.mode-btn-green.active {
  background: #22c55e !important; /* Solid green */
  color: #ffffff !important; /* White text */
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.4);
  border-color: rgba(34, 197, 94, 0.5);
}

/* Green Button - Inactive State */
.mode-btn-green:not(.active) {
  color: #94a3b8; /* Gray text */
  background: rgba(148, 163, 184, 0.1);
  border-color: rgba(148, 163, 184, 0.2);
}

/* Blue Button - Active State (Thủ công) */
.mode-btn-blue.active {
  background: #3b82f6 !important; /* Solid blue */
  color: #ffffff !important; /* White text */
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  border-color: rgba(59, 130, 246, 0.5);
}

/* Blue Button - Inactive State */
.mode-btn-blue:not(.active) {
  color: #94a3b8; /* Gray text */
  background: rgba(148, 163, 184, 0.1);
  border-color: rgba(148, 163, 184, 0.2);
}

/* 2. SEARCH Box */
/* 2. SEARCH Box */
.toolbar-section-search {
  flex: 0 1 300px; /* Do not force full width, allow shrinking. Base 300px */
  min-width: 180px;
}

.search-box-unified {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.search-input-unified {
  width: 100%;
  height: 40px;
  padding: 0 36px 0 38px;
  background: #ffffff;
  border: 1px solid rgba(226, 232, 240, 0.8); /* Lighter, cleaner border */
  border-radius: 99px; /* Fully rounded pill shape */
  color: #0f172a;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05); /* Subtle depth */
}

.search-input-unified:hover {
  border-color: #cbd5e1;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}

.search-input-unified:focus {
  background: #ffffff;
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15); /* Soft, wide glow */
  transform: translateY(0);
}

.search-input-unified::placeholder { 
  color: #94a3b8; 
  font-weight: 400;
  letter-spacing: 0.3px;
}

.search-icon {
  position: absolute;
  left: 14px;
  color: #64748b; /* Slightly darker for better visibility on white */
  pointer-events: none;
  font-size: 16px;
}

.search-clear {
  position: absolute;
  right: 12px;
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  display: flex;
  padding: 4px;
  border-radius: 50%;
  transition: all 0.2s;
}
.search-clear:hover { color: #f87171; background: rgba(239, 68, 68, 0.1); }


/* 3. FILTERS SECTION */
.toolbar-section-filters {
  display: flex;
  align-items: center;
  gap: 8px; /* Reduced gap */
  flex-shrink: 1; /* Allow shrinking */
  min-width: 0;
}

/* Custom Dropdown Style */
.filter-item { position: relative; flex-shrink: 1; }

.custom-select-wrapper {
  position: relative;
  width: auto;
  min-width: 80px; /* Reduced from 100px */
  max-width: none;
}

.cat-filter-wrap {
  max-width: 115px; /* Reduced from 130px */
}

.custom-select {
  width: 100%;
  height: 38px; /* Slightly reduced height */
  appearance: none;
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 9px;
  padding: 0 16px 0 8px; /* Further reduced padding */
  color: #cbd5e1;
  font-size: 10.5px; /* Reduced font size from 12px */
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.custom-select:hover {
  background: rgba(30, 41, 59, 0.9);
  border-color: rgba(148, 163, 184, 0.4);
  color: #f8fafc;
}

.custom-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.arrow-icon {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
  font-size: 13px;
  pointer-events: none;
}

/* Promo Toggle Button Style */
.filter-checkbox-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  height: 38px; /* Consistent height */
  padding: 0 10px;
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 9px;
  cursor: pointer;
  transition: all 0.2s;
  color: #94a3b8;
  font-size: 10.5px; /* Reduced from 12px */
  font-weight: 700;
  user-select: none;
  white-space: nowrap;
}

.filter-checkbox-btn:hover {
  background: rgba(30, 41, 59, 0.9);
  color: #e2e8f0;
  border-color: rgba(148, 163, 184, 0.4);
}

.filter-checkbox-btn.active {
  background: rgba(239, 68, 68, 0.1);
  border-color: #ef4444;
  color: #ef4444;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.15);
}

/* Green Filter Style */
.custom-select-green {
  border-color: rgba(34, 197, 94, 0.3) !important;
  color: #4ade80 !important;
  background: rgba(34, 197, 94, 0.05) !important;
}
.custom-select-green:hover {
  background: rgba(34, 197, 94, 0.1) !important;
  border-color: rgba(34, 197, 94, 0.5) !important;
}

/* Category Filter Style (Dark Blue Bg, Green Text) */
.custom-select-cat {
  border-color: rgba(34, 197, 94, 0.3) !important;
  color: #4ade80 !important;
  background: rgba(15, 23, 42, 0.95) !important; /* Dark Blue */
}
.custom-select-cat:hover {
  background: #0f172a !important; /* 100% opacity */
  border-color: rgba(34, 197, 94, 0.6) !important;
}
.text-green-400 { color: #4ade80 !important; }

/* Yellow Filter Style */
.filter-checkbox-yellow {
  border-color: rgba(234, 179, 8, 0.3) !important;
  color: #facc15 !important;
  background: rgba(234, 179, 8, 0.05) !important;
}
.filter-checkbox-yellow:hover {
  background: rgba(234, 179, 8, 0.1) !important;
  border-color: rgba(234, 179, 8, 0.5) !important;
  color: #fde047 !important;
}
.filter-checkbox-yellow.active {
  background: rgba(234, 179, 8, 0.15) !important;
  border-color: #eab308 !important; /* Yellow-500 */
  color: #facc15 !important; /* Yellow-400 */
  box-shadow: 0 4px 12px rgba(234, 179, 8, 0.25) !important;
}

.chk-hidden { display: none; }

/* Reset Button */
.btn-reset-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 10px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-reset-icon:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.3);
  transform: rotate(180deg);
}

.highlight-row .sum-value.large {
  font-size: 24px;
  font-weight: 800;
}

.sub-info {
  margin-top: 4px;
  font-size: 13px;
  opacity: 0.9;
}

.payment-method-row {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px dashed rgba(148, 163, 184, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pm-label {
  font-size: 12px;
  text-transform: uppercase;
  color: #64748b;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.pm-badge {
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
}

.pm-cash {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.pm-transfer {
  background: rgba(59, 130, 246, 0.15);
  color: #3b82f6;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

/* ===== CUSTOMER INFO ENHANCEMENTS ===== */
.cust-summary-box {
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 8px;
  padding: 12px;
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 0; /* field-row handles margin */
}

/* ci-label and ci-value are now within field-row structure */
.ci-value {
  font-weight: 600;
}

.text-danger { color: #f87171 !important; }
.text-success { color: #10b981 !important; }
.text-primary { color: #3b82f6 !important; }

/* ===== HORIZONTAL FIELD LAYOUT ===== */
.info-row-2col {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  flex-shrink: 0;
}

.customer-scroll-container {
  display: contents;
}

.customer-next-wrap,
.order-next-wrap {
  display: flex;
  gap: 10px;
  width: 100%;
  max-width: 360px;
  margin: 0 auto;
  padding: 8px 0 0;
}

.customer-next-btn,
.order-next-btn,
.customer-back-btn,
.order-back-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex: 1;
  width: 100%;
  max-width: none;
  height: 46px;
  border-radius: 12px;
  border: none;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  cursor: pointer;
}

.customer-next-btn,
.order-next-btn {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: #ffffff;
  box-shadow: 0 8px 18px rgba(16, 185, 129, 0.3);
}

.customer-back-btn,
.order-back-btn {
  background: rgba(148, 163, 184, 0.12);
  border: 1px solid rgba(148, 163, 184, 0.3);
  color: #e2e8f0;
  box-shadow: none;
}

.customer-next-btn:hover,
.order-next-btn:hover {
  filter: brightness(1.05);
}

.customer-back-btn:hover,
.order-back-btn:hover {
  background: rgba(148, 163, 184, 0.2);
}

@media (max-width: 1024px) {
  .info-row-2col {
    grid-template-columns: 1fr;
  }

  .customer-scroll-container {
    display: grid;
    grid-template-columns: 1fr;
    gap: 12px;
    flex: 1;
    min-height: 0;
    max-height: calc(100dvh - 200px);
    overflow-y: auto;
    padding-bottom: calc(35px + env(safe-area-inset-bottom));
    -webkit-overflow-scrolling: touch;
  }
}

.field-row {
  display: grid;
  grid-template-columns: 130px 1fr; /* Reduced from 140px to give more room */
  gap: 10px;
  align-items: center;
  margin-bottom: 12px;
}


.field-row label {
  font-size: 11px; /* Slightly smaller */
  color: #94a3b8;
  font-weight: 700;
  text-transform: uppercase;
  white-space: nowrap;
  letter-spacing: 0.3px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.field-control {
  min-width: 0; /* Prevents overflow in grid */
}

.field-control input,
.field-control select {
  width: 100%;
  height: 36px;
  padding: 0 12px;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 6px;
  color: #e2e8f0;
  font-size: 14px;
}

.field-control textarea {
  width: 100%;
  padding: 8px 12px;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 6px;
  color: #e2e8f0;
  font-size: 14px;
  min-height: 60px;
  display: block;
}

.field-row:has(textarea) {
  align-items: start;
}

.field-row:has(textarea) label {
  margin-top: 8px;
}

.field-control .delivery-time-row {
  display: flex;
  gap: 4px; /* Reduced gap */
  align-items: center;
  flex-wrap: wrap; /* Allow wrapping if too narrow */
}

.field-control .time-select {
  width: 55px; /* More compact */
  flex-shrink: 0;
  padding: 0 4px !important;
}

.field-control .date-input {
  flex: 1;
  min-width: 120px;
}

.field-control .pay-toggle {
  display: flex;
  gap: 8px;
}

.pill-btn {
  padding: 6px 12px;
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid rgba(148, 163, 184, 0.25);
  border-radius: 20px;
  color: #94a3b8;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.pill-btn:hover {
  background: rgba(30, 41, 59, 0.9);
  border-color: rgba(59, 130, 246, 0.4);
}

.pill-btn.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

/* RESPONSIVE: VERTICAL ON MOBILE */
@media (max-width: 768px) {
  .field-row {
    grid-template-columns: 1fr;
    gap: 4px;
  }
  
  .field-row label {
    white-space: normal;
  }
  
  .field-row:has(textarea) {
    align-items: stretch;
  }
}

/* ===== INVOICE PRINT PROMO ===== */
.hd-promo { 
  margin-top: 5px; 
  padding: 4px 0; 
  text-align: right; /* Align right as requested */
}
.hd-promo-text { 
  font-size: 13px; 
  color: #dc2626; /* Red color */
  font-weight: 700; /* Slightly bolder */
  white-space: pre-line; 
}


/* ===== COMPACT MANUAL ENTRY MODE (PREMIUM) ===== */
.manual-content.compact-mode {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 6px 0;
}

.cp-row {
  display: flex;
  gap: 12px;
  align-items: flex-end;
}
.cp-row.name-row { align-items: flex-end; }
.cp-field.grow { flex: 1; }
.cp-field.w-auto { width: auto; }
.cp-field.w-sm { width: 90px; }

/* 5 COLS GRID for Prices */
.cp-grid-5 {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
}

.cp-field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.cp-field label {
  font-size: 10px;
  text-transform: uppercase;
  color: #94a3b8;
  font-weight: 700;
  white-space: nowrap;
  letter-spacing: 0.5px;
}

.cp-input {
  background: linear-gradient(145deg, rgba(15, 23, 42, 0.7), rgba(2, 6, 23, 0.6));
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 10px;
  height: 40px; 
  color: #e2e8f0;
  font-size: 13px;
  padding: 0 12px;
  width: 100%;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
}
.cp-input:focus {
  border-color: rgba(34, 197, 94, 0.6);
  background: rgba(15, 23, 42, 0.95);
  box-shadow: 
    0 0 0 3px var(--accent-green-glow),
    inset 0 1px 2px rgba(0, 0, 0, 0.1),
    0 4px 12px var(--accent-green-light);
  outline: none;
  transform: translateY(-1px);
}
.cp-input.main-input {
  height: 44px;
  font-size: 14px;
  font-weight: 600;
  border-width: 1.5px;
}

.clear-badge-icon {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #ef4444;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  transition: all 0.2s;
  opacity: 0.8;
}
.clear-badge-icon:hover { 
  transform: translateY(-50%) scale(1.15); 
  opacity: 1;
  filter: drop-shadow(0 0 8px rgba(239, 68, 68, 0.5));
}


.stock-badge-box {
  border: 1.5px solid;
  padding: 0 18px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  min-width: 100px;
  background: linear-gradient(145deg, rgba(15, 23, 42, 0.8), rgba(2, 6, 23, 0.7));
  box-shadow: 
    inset 0 1px 0 rgba(255, 255, 255, 0.05),
    0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s;
}
.stock-badge-box:hover {
  transform: translateY(-2px);
  box-shadow: 
    inset 0 1px 0 rgba(255, 255, 255, 0.05),
    0 6px 18px rgba(0, 0, 0, 0.2);
}


/* QUANTITY STEPPER (PREMIUM) */
.qty-stepper-manual {
  display: flex;
  align-items: center;
  background: linear-gradient(145deg, rgba(15, 23, 42, 0.9), rgba(2, 6, 23, 0.8));
  border: 1.5px solid rgba(148, 163, 184, 0.25);
  border-radius: 10px;
  overflow: hidden;
  height: 50px;
  box-shadow: 
    inset 0 1px 0 rgba(255, 255, 255, 0.05),
    0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s;
}
.qty-stepper-manual:hover {
  border-color: rgba(34, 197, 94, 0.4);
  box-shadow: 
    inset 0 1px 0 rgba(255, 255, 255, 0.05),
    0 6px 18px rgba(0, 0, 0, 0.2),
    0 0 20px var(--accent-green-light);
}
.q-btn {
  width: 44px;
  height: 100%;
  border: none;
  background: transparent;
  color: #94a3b8;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.q-btn:hover { 
  background: var(--accent-green-light); 
  color: var(--accent-green);
  transform: scale(1.1);
}
.q-btn:active {
  transform: scale(0.95);
}
.q-input {
  width: 70px;
  height: 100%;
  border: none;
  background: transparent;
  color: #e2e8f0;
  font-size: 18px;
  font-weight: 700;
  text-align: center;
  appearance: textfield; 
}
.q-input:focus { 
  outline: none;
  color: var(--accent-green);
}

/* ADD BUTTON (PREMIUM) */
.btn-add-full {
  height: 52px;
  border-radius: 12px;
  font-size: 15px;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  font-weight: 800;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%);
  box-shadow: 
    0 6px 16px rgba(59, 130, 246, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.btn-add-full::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.5s;
}

.btn-add-full:hover::before {
  left: 100%;
}

.btn-add-full:hover {
  transform: translateY(-3px);
  box-shadow: 
    0 10px 28px rgba(59, 130, 246, 0.5),
    0 0 40px rgba(59, 130, 246, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}
.btn-add-full:active {
  transform: translateY(-1px);
}
.btn-add-full.grow { flex: 1; }

.mini-old-price {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 11px;
    color: #f87171;
    text-decoration: line-through;
    pointer-events: none;
    font-weight: 600;
    opacity: 0.8;
}
.price-stack { position: relative; }




/* ===== BANK TRANSFER INFO IN INVOICE ===== */
.hd-summary-row {
  display: grid;
  grid-template-columns: 1fr 420px; /* Tăng cột phải chút cho thoáng */
  gap: 20px;
  align-items: stretch;
  margin-bottom: 16px;
}

.hd-bank-box {
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between; /* Cân đối chiều dọc */
}

.bank-title {
  font-size: 13px;
  font-weight: 900;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  border-bottom: 2px solid #334155; /* Đậm hơn */
  padding-bottom: 8px;
  margin-bottom: 14px;
  color: #0f172a;
}

.bank-body {
  display: flex;
  align-items: center;
  gap: 20px;
}

.bank-qr {
  width: 110px;
  height: 110px;
  flex-shrink: 0;
  border: 4px solid #fff;
  outline: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.bank-qr img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.bank-text {
  font-size: 13px; /* To hơn */
  color: #0f172a; /* Đen hơn */
  white-space: pre-line;
  line-height: 1.6;
  font-weight: 700; /* In đậm */
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  height: 4.8em; /* Cố định 3 dòng */
}

.bank-divider {
  height: 1px;
  background: #cbd5e1;
  margin: 14px 0;
  width: 100%;
  border-top: 1px dashed #94a3b8; /* Line nét đứt cho tinh tế */
  background: transparent;
}

.bank-amount {
  background: #fff;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.03);
}

.ba-label {
  font-size: 12px;
  font-weight: 800;
  color: #475569;
  text-transform: uppercase;
  margin-bottom: 6px;
  letter-spacing: 0.5px;
}

.ba-value {
  font-size: 22px; /* To hơn */
  font-weight: 900;
  color: #000000;
  letter-spacing: -0.5px;
}

.ba-sub {
  font-size: 12px;
  color: #64748b;
  font-weight: 600;
  margin-top: 4px;
}


.summary-title {
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: #111827;
  border-bottom: 1px dashed #94a3b8;
  padding-bottom: 8px;
  margin-bottom: 12px;
  text-align: center;
}
.bank-list-stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.bank-minicard {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px;
  background: #ffffff;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.bank-minicard .bank-body {
  margin-bottom: 0;
}
.btn-delete-cta {
  position: absolute;
  right: 5px;
  top: 50%;
  transform: translateY(-50%);
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 5px 10px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  z-index: 2;
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.btn-delete-cta:hover {
  background: #dc2626;
  box-shadow: 0 4px 8px rgba(239, 68, 68, 0.4);
  transform: translateY(-50%) translateY(-1px);
}
.btn-delete-cta:active {
  transform: translateY(-50%) translateY(0);
}

/* ===== SUMMARY CARDS REFACTOR ===== */
.summary-stack {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

@media (max-width: 1024px) {
  .summary-stack {
    grid-template-columns: 1fr;
  }
}

.summary-card .card-title {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.8px;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 12px;
}

/* Payment toggle section */
.payment-toggle-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 6px;
}

.payment-toggle-section .pm-label {
  font-size: 10px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.payment-toggle-section .pay-toggle {
  display: flex;
  gap: 6px;
}

.payment-toggle-section .pill-btn {
  flex: 1;
  padding: 6px 10px;
  font-size: 11px;
  font-weight: 600;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.payment-toggle-section .pill-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.15);
}

.payment-toggle-section .pill-btn.active {
  background: linear-gradient(135deg, var(--accent-green) 0%, var(--accent-green-dark) 100%);
  border-color: var(--accent-green);
  color: white;
  box-shadow: 0 0 12px rgba(34, 197, 94, 0.4);
}

/* Total row styling */
.sum-row.total-row {
  margin-top: 6px;
  padding: 8px 0;
}

.sum-row.total-row .total-label {
  font-size: 13px;
  font-weight: 900;
  letter-spacing: 1px;
}

.sum-row.total-row .total-value {
  font-size: 22px;
  font-weight: 900;
  letter-spacing: -0.5px;
}

/* Transfer row styling */
.sum-row.transfer-row {
  margin-top: 6px;
  padding: 8px 10px;
  background: rgba(34, 197, 94, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.sum-row.transfer-row .transfer-label {
  font-size: 10px;
  font-weight: 700;
  color: var(--accent-green);
  letter-spacing: 0.5px;
}

.sum-row.transfer-row .transfer-value {
  font-size: 14px;
  font-weight: 800;
  color: var(--accent-green);
}

/* Exchange rate section in payment card */
.exchange-rate-section {
  margin-top: 8px;
  padding: 8px 10px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.exchange-rate-section .er-label {
  display: block;
  font-size: 10px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
}

.exchange-rate-section .er-input-wrapper {
  display: flex;
  align-items: center;
  gap: 6px;
}

.exchange-rate-section .er-input {
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  font-family: 'Courier New', monospace;
  -moz-appearance: textfield;
  appearance: textfield;
}

.exchange-rate-section .er-input::-webkit-outer-spin-button,
.exchange-rate-section .er-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.exchange-rate-section .er-input:focus {
  outline: none;
  border-color: var(--accent-green);
  box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.2);
}

.exchange-rate-section .er-badge {
  padding: 4px 8px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  font-size: 10px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.8);
  white-space: nowrap;
}

.exchange-rate-section .er-hint {
  font-size: 9px;
  color: rgba(255, 255, 255, 0.5);
  font-style: italic;
  margin-top: 4px;
}
/* Delivery Date & Time Button */
.date-input-dark {
  width: 100%;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: white;
  color-scheme: dark; /* Icon lịch màu trắng */
}

.date-input-dark:focus {
  outline: none;
  border-color: var(--accent-green);
  box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.2);
}

.btn-now {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 16px;
  height: 38px;
  background: #ef4444;
  border: none;
  border-radius: 6px;
  color: white;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
}

.btn-now:hover {
  background: #dc2626;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(239, 68, 68, 0.4);
}

.btn-now:active {
  transform: translateY(0);
}

.btn-now i {
  font-size: 16px;
}
/* ===============================================================
   PREMIUM UI SKIN FOR INFO CARDS (FINAL RETRY)
   Scope: .customer-box, .delivery-box, .summary-card--order, .summary-card--payment
   =============================================================== */

/* === 1. UNIFIED CARD SKIN === */
.customer-box,
.delivery-box,
.summary-card {
  background: linear-gradient(145deg, rgba(15, 23, 42, 0.98), rgba(7, 10, 20, 0.99)) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  border-radius: 12px !important;
  padding: 12px 12px 8px 12px !important; /* Reduced bottom padding */
  box-shadow: 
    0 4px 15px rgba(0, 0, 0, 0.5),
    0 0 40px -5px rgba(34, 197, 94, 0.05) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  position: relative;
  overflow: hidden;
}

.summary-card .sum-grid .sum-row:last-child {
  padding-bottom: 0 !important;
}

.customer-box:hover,
.delivery-box:hover,
.summary-card:hover {
  transform: translateY(-3px);
  border-color: rgba(34, 197, 94, 0.3) !important;
  box-shadow: 
    0 12px 30px rgba(0, 0, 0, 0.6),
    0 0 50px -10px rgba(34, 197, 94, 0.18) !important;
}

/* === 2. CARD HEADERS === */
.customer-box > h3,
.delivery-box > h3,
.summary-card .card-title {
  display: flex !important;
  justify-content: space-between !important; /* Added */
  align-items: center !important;
  /* gap: 12px !important; */ /* Removed */
  font-size: 13px !important;
  font-weight: 850 !important;
  text-transform: uppercase !important;
  letter-spacing: 1.5px !important;
  color: #ffffff !important;
  padding-bottom: 10px !important;
  margin-bottom: 8px !important; /* Changed from 12px to 8px */
  border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
  opacity: 0.95;
}

.customer-box > h3 i,
.delivery-box > h3 i,
.summary-card .card-title i {
  color: var(--accent-green);
  font-size: 20px;
  filter: drop-shadow(0 0 8px rgba(34, 197, 94, 0.4));
}

/* === 3. LABELS & TYPOGRAPHY === */
.customer-box label,
.delivery-box label,
.summary-card .sum-label,
.summary-card .pm-label,
.summary-card .er-label {
  display: block;
  font-size: 10px !important;
  font-weight: 700 !important;
  text-transform: uppercase !important;
  letter-spacing: 1px !important;
  color: #ffffff !important; /* Changed from #94a3b8 to white */
  margin-bottom: 4px !important;
}

/* === 4. INPUTS, SELECTS, TEXTAREAS === */
.customer-box input,
.customer-box select,
.customer-box textarea,
.delivery-box input,
.delivery-box select,
.delivery-box textarea,
.summary-card input {
  width: 100%;
  height: 40px;
  padding: 0 14px !important;
  background: rgba(15, 23, 42, 0.85) !important;
  border: 1px solid rgba(255, 255, 255, 0.12) !important;
  border-radius: 8px !important;
  color: #f1f5f9 !important;
  font-size: 13.5px !important;
  font-weight: 500 !important;
  transition: all 0.2s ease !important;
}

.customer-box textarea,
.delivery-box textarea {
  height: auto !important;
  padding: 12px 14px !important;
  min-height: 80px;
}

/* Hover */
.customer-box input:hover,
.delivery-box input:hover,
.summary-card input:hover {
  border-color: rgba(255, 255, 255, 0.25) !important;
  background: #0f172a !important;
}

/* Focus */
.customer-box input:focus,
.customer-box select:focus,
.customer-box textarea:focus,
.delivery-box input:focus,
.delivery-box select:focus,
.delivery-box textarea:focus,
.summary-card input:focus {
  outline: none !important;
  border-color: var(--accent-green) !important;
  box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.18) !important;
  background: #020617 !important;
}

/* === 5. CUSTOMER MINI-DASHBOARD === */
.cust-summary-box {
  display: grid !important;
  grid-template-columns: repeat(3, 1fr) !important;
  gap: 12px !important;
  margin: 10px 0 !important;
  padding: 10px !important;
  background: rgba(0, 0, 0, 0.3) !important;
  border-radius: 10px !important;
  border: 1px solid rgba(255, 255, 255, 0.05) !important;
}

.cust-stat {
  display: flex !important;
  flex-direction: column !important;
  gap: 4px !important;
  text-align: center !important;
}

.cust-stat-label {
  font-size: 9px;
  font-weight: 800;
  text-transform: uppercase;
  color: #ffffff; /* Optimized for visibility */
  letter-spacing: 0.6px;
}

.cust-stat-value {
  font-family: 'JetBrains Mono', 'Courier New', monospace !important;
  font-size: 14px !important; /* Slightly larger */
  font-weight: 950 !important; /* Maximum weight */
  color: #f1f5f9;
}


.sum-right-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-limit-red {
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 700;
  padding: 4px 10px;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-limit-red:hover {
  background: #b91c1c;
}

.btn-edit-inline {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  margin-left: 6px;
  padding: 2px;
  border-radius: 4px;
  transition: all 0.2s;
  font-size: 14px;
}

.btn-edit-inline:hover {
  color: #fff;
  background: rgba(255,255,255,0.1);
}

/* === 6. SUMMARY ROWS === */
.summary-card .sum-row {
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  padding: 8px 0 !important;
}

.summary-card .sum-label {
  font-size: 11px !important;
  color: #ffffff !important; /* Force white for inner summary labels */
}

.summary-card .sum-value {
  font-size: 14px !important;
  font-weight: 900 !important; /* Consistent with template */
  color: #ffffff !important;
}

.summary-card .sum-divider {
  height: 1px !important;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent) !important;
  margin: 8px 0 !important;
  border: none !important;
}

/* === 7. HERO TOTAL ROW === */
.summary-card .total-row {
  margin-top: 4px !important;
  padding: 6px 8px !important;
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.18), rgba(2, 6, 23, 0.6)) !important;
  border: 1px solid rgba(34, 197, 94, 0.4) !important;
  border-radius: 6px !important;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2) !important;
}

.summary-card .total-label {
  font-size: 14px !important;
  font-weight: 900 !important;
  color: #ffffff !important;
  letter-spacing: 1.2px !important;
}

.summary-card .total-value {
  font-size: 24px !important;
  font-weight: 950 !important;
  color: #4ade80 !important;
  text-shadow: 0 0 20px rgba(34, 197, 94, 0.6) !important;
}

/* === 8. TRANSFER PILL ROW === */
.summary-card .transfer-row {
  margin-top: 4px !important;
  padding: 4px 8px !important;
  background: rgba(59, 130, 246, 0.18) !important;
  border: 1px solid rgba(59, 130, 246, 0.35) !important;
  border-radius: 99px !important;
}

.summary-card .transfer-label {
  color: #ffffff !important;
  font-weight: 800 !important;
  font-size: 10px !important;
}

.summary-card .transfer-value {
  color: #93c5fd !important;
  font-weight: 900 !important;
  font-size: 16px !important;
}

/* === 9. PAYMENT BUTTONS (Pills) === */
.summary-card .pill-btn {
  height: 44px !important;
  padding: 0 16px !important;
  background: rgba(30, 41, 59, 0.7) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 10px !important;
  font-size: 12px !important;
  font-weight: 750 !important;
  color: #94a3b8 !important;
  transition: all 0.25s !important;
}

.summary-card .pill-btn:hover {
  background: rgba(51, 65, 85, 0.9) !important;
  color: white !important;
}

.summary-card .pill-btn.active {
  background: linear-gradient(135deg, var(--accent-green), var(--accent-green-dark)) !important;
  color: white !important;
  border-color: var(--accent-green) !important;
  box-shadow: 0 0 20px rgba(34, 197, 94, 0.45) !important;
}

.summary-card .pill-btn--transfer.active {
  background: linear-gradient(135deg, #3b82f6, #2563eb) !important;
  border-color: #3b82f6 !important;
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.45) !important;
}

/* === COMPACT PAYMENT SECTIONS === */
.payment-toggle-section {
  margin-bottom: 8px;
}

.payment-toggle-section .pm-label {
  font-size: 10px;
  margin-bottom: 4px;
}

.exchange-rate-section {
  margin-bottom: 8px;
}

.exchange-rate-section .er-label {
  font-size: 10px;
  color: #94a3b8;
  margin-bottom: 4px;
  display: block;
}

.exchange-rate-section .er-input-wrapper {
  display: flex;
  gap: 6px;
  align-items: center;
}

.exchange-rate-section .er-input {
  flex: 1;
  height: 28px;
  padding: 0 8px;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 6px;
  color: #fff;
  font-size: 12px;
}

.exchange-rate-section .er-badge {
  padding: 4px 8px;
  background: rgba(59, 130, 246, 0.15);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 4px;
  font-size: 11px;
  color: #93c5fd;
}

.btn-discount-trigger {
  width: 100%;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px dashed rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: #94a3b8;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 8px;
}

.btn-discount-trigger:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.4);
  color: #fff;
}



/* ================= PREMIUM MANUAL MODE CSS ================= */
.premium-mode {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 8px 0;
}

.pm-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.pm-row-main {
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

.pm-input-lg {
  width: 100%;
  background: transparent;
  border: none;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
  font-size: 16px;
  color: #fff;
  padding: 8px 0;
  transition: all 0.2s;
}

.pm-input-lg:focus {
  border-bottom-color: var(--accent-blue);
  background: rgba(59, 130, 246, 0.05);
}

/* CHIPS */
.pm-chips-row {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.chip-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.chip-group label {
  font-size: 11px;
  text-transform: uppercase;
  color: #64748b;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.chip-scroll {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.chip-scroll::-webkit-scrollbar {
  height: 4px;
}

.chip-scroll::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.pm-chip {
  padding: 6px 12px;
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  font-size: 13px;
  color: #cbd5e1;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.pm-chip:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
}

.pm-chip.active {
  background: rgba(59, 130, 246, 0.2);
  border-color: var(--accent-blue);
  color: var(--accent-blue);
  box-shadow: 0 0 10px rgba(59, 130, 246, 0.2);
}

.pm-chip-input {
  background: transparent;
  border: 1px dashed rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 6px 12px;
  color: #fff;
  font-size: 13px;
  width: 80px;
}

.pm-chip-input:focus {
  border-color: var(--accent-blue);
  border-style: solid;
}

/* PRICING GRID */
.pm-pricing-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 12px;
  background: rgba(30, 41, 59, 0.3);
  padding: 12px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.pm-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.pm-field label {
  font-size: 11px;
  color: #94a3b8;
}

.pm-input {
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 8px;
  color: #fff;
  font-family: 'JetBrains Mono', monospace;
  width: 100%;
}

.pm-input.text-highlight {
  color: var(--accent-green);
  font-weight: 700;
  border-color: rgba(34, 197, 94, 0.3);
}

.input-symbol {
  position: relative;
}

.input-symbol .symbol {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 11px;
  color: #64748b;
}

/* ACCORDION */
.pm-accordion {
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  background: rgba(30, 41, 59, 0.2);
  overflow: hidden;
}

.pm-summary {
  padding: 10px 12px;
  cursor: pointer;
  font-size: 13px;
  color: #94a3b8;
  display: flex;
  align-items: center;
  gap: 8px;
  list-style: none;
}

.pm-summary:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
}

.pm-details-body {
  padding: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(15, 23, 42, 0.4);
}

.pm-row-details {
  display: flex;
  gap: 12px;
}

.pm-select {
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
  padding: 8px;
  border-radius: 6px;
  width: 100%;
}

/* HERO SECTION */
.pm-hero-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 8px;
}

.hero-stats {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 16px;
  align-items: center;
}

.hero-item {
  display: flex;
  flex-direction: column;
}

.hero-label {
  font-size: 11px;
  color: #94a3b8;
  text-transform: uppercase;
}

.hero-value {
  font-family: 'JetBrains Mono', monospace;
  font-size: 18px;
  font-weight: 800;
}

.hero-stock {
  text-align: right;
  font-size: 12px;
}

.btn-add-hero {
  padding: 12px;
  background: linear-gradient(135deg, var(--accent-blue), #1e40af);
  border: none;
  border-radius: 8px;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
  transition: all 0.2s;
}

.btn-add-hero:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.4);
}

.btn-content {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  font-size: 14px;
}

.btn-sub {
  background: rgba(0, 0, 0, 0.2);
  padding: 4px 8px;
  border-radius: 4px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
}

.summary-card .pill-btn--transfer.active {
  background: linear-gradient(135deg, #3b82f6, #2563eb) !important;
  border-color: #3b82f6 !important;
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.45) !important;
}

/* === 10. DELIVERY TIME GRID === */
.delivery-box .time-select {
  width: 70px !important;
  text-align: center !important;
  font-family: 'JetBrains Mono', monospace !important;
  font-weight: 800 !important;
  font-size: 15px !important;
}

/* === 11. BUTTON NOW REFINEMENT === */
.btn-now {
  background: linear-gradient(135deg, #ef4444, #991b1b) !important;
  border: none !important;
  font-size: 12px !important;
  font-weight: 800 !important;
  letter-spacing: 0.5px !important;
  box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4) !important;
}

.btn-now:hover {
  filter: brightness(1.1);
  transform: translateY(-2px) !important;
  box-shadow: 0 8px 20px rgba(239, 68, 68, 0.5) !important;
}

/* === 12. UTILS === */
.text-danger { color: #f87171 !important; }
.text-success { color: #4ade80 !important; }
.text-primary { color: #60a5fa !important; }
.font-mono { font-family: 'JetBrains Mono', monospace !important; }

/* Hide scrollbar for Chrome, Safari and Opera */
.scrollbar-hide::-webkit-scrollbar {
    display: none;
}

/* Hide scrollbar for IE, Edge and Firefox */
.scrollbar-hide {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
}

</style>

<!-- Non-scoped styles for scrollbar (scoped styles don't work with pseudo-elements) -->
<style>
/* ===== GLOBAL SCROLLBAR STYLING FOR NHAPHOADON ===== */
/* Apply to everything inside .page to ensure consistency */
.page ::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.page ::-webkit-scrollbar-track {
  background: rgba(15, 23, 42, 0.4);
  border-radius: 4px;
}

.page ::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.35);
  border-radius: 4px;
}

.page ::-webkit-scrollbar-thumb:hover {
  background: rgba(148, 163, 184, 0.5);
}

.page ::-webkit-scrollbar-corner {
  background: transparent;
}

/* Firefox standard */
.page * {
  scrollbar-width: thin;
  scrollbar-color: rgba(148, 163, 184, 0.35) rgba(15, 23, 42, 0.4);
}
.page .customer-box h3,
.page .delivery-box h3 {
  display: flex !important;
  align-items: center !important;
  justify-content: flex-start !important;
  color: #10b981 !important; /* Green */
  text-align: left !important;
}

.page .summary-card h3,
.page .summary-card--order h3,
.page .summary-card--payment h3,
.page .card-title {
  display: flex !important;
  align-items: center !important;
  justify-content: flex-start !important;
  color: #ffffff !important; /* Revert to White */
  text-align: left !important;
}

.page .customer-box h3 i,
.page .delivery-box h3 i,
.page .summary-card h3 i,
.page .card-title i {
  color: #10b981 !important; /* Force Green */
  margin-right: 10px !important;
  margin-left: 0 !important;
  flex: 0 0 auto !important;
}

/* Success Button State */
.btn-added-success {
  background: #10b981 !important; /* Green Success */
  border-color: #10b981 !important;
  color: white !important;
  pointer-events: none; /* Prevent double click */
}
.btn-copied {
  background: #10b981 !important; /* Green */
  color: white !important;
  pointer-events: none;
}
/* ===== MANUAL ENTRY V2 PRO STYLES ===== */
.manual-v2-container { display: flex; flex-direction: column; gap: 16px; padding: 4px; }
.mv2-card { background: rgba(30, 41, 59, 0.4); border: 1px solid rgba(148, 163, 184, 0.1); border-radius: 12px; padding: 16px; }
.mv2-header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.mv2-title { font-size: 14px; font-weight: 700; color: #94a3b8; text-transform: uppercase; display: flex; align-items: center; gap: 6px; }
.mv2-btn-clear-all { font-size: 12px; color: #fca5a5; background: transparent; border: none; cursor: pointer; }
.mv2-row-split { display: flex; gap: 12px; margin-bottom: 16px; }
.mv2-field { display: flex; flex-direction: column; gap: 6px; }
.mv2-field label { font-size: 12px; font-weight: 600; color: #64748b; }
.mv2-field label .req { color: #ef4444; }
.mv2-input-box { background: #0f172a; border: 1px solid #334155; border-radius: 8px; height: 40px; display: flex; align-items: center; padding: 0 12px; transition: all 0.2s; }
.mv2-input-box:focus-within { border-color: #10b981; box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.15); }
.mv2-input-box input { background: transparent; border: none; width: 100%; color: #e2e8f0; font-size: 14px; height: 100%; font-weight: 600; }
.mv2-input-box input:focus { outline: none; }
.mv2-input-box .icon-left { color: #64748b; margin-right: 8px; }
.mv2-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.mv2-row-pricing { display: grid; grid-template-columns: 160px 1fr; gap: 12px; }
.qty-card { display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; background: rgba(16, 185, 129, 0.05); border: 1px solid rgba(16, 185, 129, 0.2); }
.mv2-qty-control { display: flex; align-items: center; background: #0f172a; border-radius: 20px; padding: 4px; margin: 8px 0; border: 1px solid #334155; }
.mv2-qty-control button { width: 32px; height: 32px; border-radius: 50%; border: none; background: #1e293b; color: #e2e8f0; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.mv2-qty-control button:hover { background: #334155; }
.mv2-qty-control input { width: 50px; background: transparent; border: none; text-align: center; color: #fff; font-size: 16px; -moz-appearance: textfield; }
.mv2-stock-info { font-size: 12px; color: #64748b; }
.price-card { padding: 12px; }
.mv2-price-grid { display: grid; grid-template-columns: repeat(3, 1fr) 1.5fr; gap: 10px; align-items: start; }
.input-price { background: #0f172a; border: 1px solid #334155; border-radius: 8px; width: 100%; padding: 8px; color: #e2e8f0; font-family: 'JetBrains Mono', monospace; font-size: 13px; }
.input-price.text-highlight { color: #10b981; font-weight: 700; border-color: rgba(16, 185, 129, 0.3); }
.mv2-total-box { background: rgba(16, 185, 129, 0.1); border-radius: 8px; padding: 8px; text-align: right; border: 1px dashed rgba(16, 185, 129, 0.4); }
.mv2-total-box .label { font-size: 11px; color: #10b981; text-transform: uppercase; font-weight: 700; }
.mv2-total-box .value { font-size: 18px; font-weight: 900; color: #ffffff; }
.mv2-total-box .profit { font-size: 11px; color: #3b82f6; }
.mv2-btn-submit { width: 100%; height: 48px; background: linear-gradient(90deg, #10b981 0%, #059669 100%); border: none; border-radius: 12px; display: flex; align-items: center; justify-content: space-between; padding: 0 20px; cursor: pointer; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4); transition: transform 0.2s; }
.mv2-btn-submit:hover { transform: translateY(-2px); filter: brightness(1.1); }
.mv2-btn-submit .cont { display: flex; flex-direction: column; align-items: flex-start; }
.mv2-btn-submit .txt { font-weight: 900; font-size: 14px; color: white; letter-spacing: 1px; }
.mv2-btn-submit .sub { font-size: 12px; color: #d1fae5; }
.mv2-btn-submit i { font-size: 20px; color: white; }
.w-30 { width: 30%; }
.w-70 { width: 70%; }
.w-full { width: 100%; }

/* Hero Input Enhancements */
.mv2-input-box.hero-input {
  height: 50px;
  border-color: rgba(16, 185, 129, 0.4);
  background: linear-gradient(to right, rgba(16, 185, 129, 0.05), rgba(15, 23, 42, 0.6));
}

.mv2-input-box.hero-input i {
  color: #10b981;
  font-size: 18px;
}

.text-lg {
  font-size: 16px !important;
  font-weight: 700 !important;
  letter-spacing: 0.5px;
}

/* ================= MANUAL MODE V3 (UNIFIED CARD) ================= */
.premium-mode-v3 {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 8px 0;
}

/* Unified Card Container */
.mv3-unified-card {
  background: rgba(2, 6, 23, 0.75);
  border: 1px solid rgba(148, 163, 184, 0.15);
  border-radius: 14px;
  padding: 18px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(8px);
}

/* Header */
.mv3-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
}

.mv3-header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.mv3-header-left i {
  color: var(--accent-green);
  font-size: 18px;
}

.mv3-title {
  font-size: 14px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: #e2e8f0;
}

.mv3-btn-clear {
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  color: #ef4444;
}

.mv3-btn-clear:hover {
  color: #dc2626;
  background: rgba(239, 68, 68, 0.25);
}

/* Product Name Section */
.mv3-name-section {
  margin-bottom: 14px;
}

.mv3-name-section label {
  display: block;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: #94a3b8;
  margin-bottom: 6px;
  letter-spacing: 0.5px;
}

.mv3-input-hero {
  position: relative;
  display: flex;
  align-items: center;
}

.mv3-input-hero i {
  position: absolute;
  left: 14px;
  color: var(--accent-green);
  font-size: 18px;
  pointer-events: none;
}

.mv3-input-hero input {
  width: 100%;
  height: 50px;
  padding: 0 16px 0 46px;
  background: linear-gradient(to right, rgba(16, 185, 129, 0.08), rgba(15, 23, 42, 0.6));
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 10px;
  color: #e2e8f0;
  font-size: 15px;
  font-weight: 600;
  transition: all 0.2s;
}

.mv3-input-hero input:focus {
  outline: none;
  border-color: var(--accent-green);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
  background: rgba(15, 23, 42, 0.8);
}

/* Grid Layouts */
.mv3-grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 14px;
}

.mv3-grid-2 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.mv3-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.mv3-field label {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  color: #94a3b8;
  letter-spacing: 0.5px;
}

.mv3-field input,
.mv3-field select {
  width: 100%;
  height: 38px;
  padding: 0 12px;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 8px;
  color: #e2e8f0;
  font-size: 13px;
  transition: all 0.2s;
}

.mv3-field input:focus,
.mv3-field select:focus {
  outline: none;
  border-color: rgba(59, 130, 246, 0.5);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  background: rgba(15, 23, 42, 0.9);
}

/* Divider */
.mv3-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(148, 163, 184, 0.15), transparent);
  margin: 12px 0;
}

/* Quantity & Stock Row */
.mv3-qty-stock-row {
  display: flex;
  gap: 14px;
  align-items: flex-end;
  margin-bottom: 14px;
}

.mv3-qty-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.mv3-qty-section label {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  color: #94a3b8;
  letter-spacing: 0.5px;
}

.mv3-qty-stepper {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 10px;
  padding: 4px;
  height: 44px;
}

.mv3-qty-stepper button {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(59, 130, 246, 0.15);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 8px;
  color: #60a5fa;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 16px;
}

.mv3-qty-stepper button:hover:not(:disabled) {
  background: rgba(59, 130, 246, 0.25);
  border-color: rgba(59, 130, 246, 0.5);
}

.mv3-qty-stepper button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.mv3-qty-stepper input {
  flex: 1;
  background: transparent;
  border: none;
  text-align: center;
  color: #e2e8f0;
  font-size: 16px;
  font-weight: 700;
  min-width: 60px;
}

.mv3-qty-stepper input:focus {
  outline: none;
}

/* Stock Badge */
.mv3-stock-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 16px;
  height: 44px;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 10px;
  white-space: nowrap;
}

.mv3-stock-badge i {
  color: var(--accent-green);
  font-size: 18px;
}

.mv3-stock-badge span {
  font-size: 12px;
  color: #94a3b8;
}

.mv3-stock-badge strong {
  color: var(--accent-green);
  font-size: 16px;
  font-weight: 800;
}

/* Stock Badge Color Variants */
.mv3-stock-badge.text-danger {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.3);
}

.mv3-stock-badge.text-danger i,
.mv3-stock-badge.text-danger strong {
  color: #ef4444;
}

.mv3-stock-badge.text-warning {
  background: rgba(245, 158, 11, 0.1);
  border-color: rgba(245, 158, 11, 0.3);
}

.mv3-stock-badge.text-warning i,
.mv3-stock-badge.text-warning strong {
  color: #f59e0b;
}

/* Price Input Fields */
.mv3-input-price {
  position: relative;
  display: flex;
  align-items: center;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 8px;
  height: 38px;
  overflow: hidden;
  transition: all 0.2s;
}

.mv3-input-price input {
  flex: 1;
  background: transparent;
  border: none;
  padding: 0 12px;
  color: #e2e8f0;
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  font-weight: 600;
}

.mv3-input-price input:focus {
  outline: none;
}

.mv3-input-price .currency {
  padding: 0 12px;
  font-size: 10px;
  font-weight: 700;
  color: #64748b;
  background: rgba(0, 0, 0, 0.2);
  height: 100%;
  display: flex;
  align-items: center;
  border-left: 1px solid rgba(148, 163, 184, 0.15);
}

.mv3-input-price:focus-within {
  border-color: rgba(59, 130, 246, 0.5);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Highlight variant for selling price */
.mv3-field.highlight .mv3-input-price {
  border-color: rgba(16, 185, 129, 0.4);
  background: rgba(16, 185, 129, 0.05);
}

.mv3-field.highlight .mv3-input-price input {
  color: var(--accent-green);
  font-weight: 700;
}

.mv3-field.highlight .mv3-input-price:focus-within {
  border-color: var(--accent-green);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

/* Danger variant for discount */
.mv3-input-price.danger {
  border-color: rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.05);
}

.mv3-input-price.danger input {
  color: #f87171;
}

/* Note Section */
.mv3-note-section {
  margin-bottom: 14px;
}

.mv3-note-section label {
  display: block;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  color: #94a3b8;
  margin-bottom: 6px;
  letter-spacing: 0.5px;
}

.mv3-note-section input {
  width: 100%;
  height: 38px;
  padding: 0 12px;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 8px;
  color: #e2e8f0;
  font-size: 13px;
  transition: all 0.2s;
}

.mv3-note-section input:focus {
  outline: none;
  border-color: rgba(148, 163, 184, 0.4);
  background: rgba(15, 23, 42, 0.9);
}

/* Summary Box */
.mv3-summary {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(2, 6, 23, 0.4));
  border: 1px solid rgba(16, 185, 129, 0.25);
  border-radius: 10px;
  padding: 14px;
}

.mv3-summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
}

.mv3-summary-row + .mv3-summary-row {
  border-top: 1px dashed rgba(148, 163, 184, 0.15);
  margin-top: 6px;
  padding-top: 12px;
}

.mv3-summary-row .label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: #94a3b8;
  letter-spacing: 0.5px;
}

.mv3-summary-row .value {
  font-family: 'JetBrains Mono', monospace;
  font-size: 18px;
  font-weight: 900;
  color: #e2e8f0;
}

.mv3-summary-row .value.primary {
  color: var(--accent-green);
  text-shadow: 0 0 12px rgba(16, 185, 129, 0.4);
}

.mv3-summary-row .value.success {
  color: #4ade80;
  font-size: 14px;
}

/* Accordion */
.mv3-accordion {
  background: rgba(2, 6, 23, 0.4);
  border: 1px solid rgba(148, 163, 184, 0.15);
  border-radius: 10px;
  overflow: hidden;
}

.mv3-accordion-summary {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  cursor: pointer;
  list-style: none;
  user-select: none;
  transition: all 0.2s;
  color: #94a3b8;
  font-size: 12px;
  font-weight: 700;
}

.mv3-accordion-summary::-webkit-details-marker {
  display: none;
}

.mv3-accordion-summary:hover {
  background: rgba(148, 163, 184, 0.05);
  color: #e2e8f0;
}

.mv3-accordion-summary i {
  font-size: 16px;
}

.mv3-accordion-summary .chevron {
  margin-left: auto;
  transition: transform 0.2s;
}

.mv3-accordion[open] .mv3-accordion-summary .chevron {
  transform: rotate(180deg);
}

.mv3-accordion-body {
  padding: 16px;
  border-top: 1px solid rgba(148, 163, 184, 0.1);
  background: rgba(0, 0, 0, 0.2);
}

/* Action Button */
.mv3-btn-add {
  width: 100%;
  height: 62px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  background: linear-gradient(135deg, var(--accent-green) 0%, var(--accent-green-dark) 100%);
  border: none;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.35);
  position: relative;
  overflow: hidden;
}

.mv3-btn-add::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.5s;
}

.mv3-btn-add:hover::before {
  left: 100%;
}

.mv3-btn-add:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 32px rgba(16, 185, 129, 0.5);
  filter: brightness(1.1);
}

.mv3-btn-add:active {
  transform: translateY(-1px);
}

.mv3-btn-add .btn-content {
  display: flex;
  align-items: center;
  gap: 14px;
}

.mv3-btn-add .btn-content i {
  font-size: 24px;
  color: white;
}

.mv3-btn-add .btn-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
}

.mv3-btn-add .btn-text .main {
  font-size: 15px;
  font-weight: 900;
  color: white;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.mv3-btn-add .btn-text .sub {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 600;
  font-family: 'JetBrains Mono', monospace;
}

.mv3-btn-add .arrow {
  font-size: 24px;
  color: white;
}

/* Responsive */
@media (max-width: 768px) {
  .mv3-grid-3 {
    grid-template-columns: 1fr;
  }
  
  .mv3-qty-stock-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .mv3-stock-badge {
    justify-content: center;
  }
}

/* ================= MANUAL MODE V4 (CLEAN PROFESSIONAL) ================= */
.premium-mode-v4 {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 4px 0;
  height: 100%;
}

/* Card Container - Clean Glass */
.mv4-card {
  position: relative;
  background: rgba(15, 23, 42, 0.6); /* Subtle dark background */
  border-radius: 16px;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 0;
  flex: 1;
  overflow: visible;
  backdrop-filter: blur(20px);
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5); /* Deep shadow only */
  border: 1px solid rgba(255, 255, 255, 0.08);
}

/* Header - Clean */
.mv4-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  margin-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  position: relative;
  min-height: 32px;
}

.mv4-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.mv4-header-left i {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 8px;
  color: #10b981;
  font-size: 16px;
}

.mv4-header-left span {
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #e2e8f0;
}

.mv4-btn-clear {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  background: rgba(239, 68, 68, 0.1);
  color: #f87171;
  transition: 0.2s;
  border: 1px solid transparent;
}

.mv4-btn-clear:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.3);
}

/* Layouts */
.mv4-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; padding: 8px 0; }
.mv4-row-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; padding: 8px 0; }
.mv4-row-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; padding: 8px 0; }
.mv4-row-full { display: flex; width: 100%; padding: 8px 0; }
.mv4-row-qty { display: flex; justify-content: center; align-items: center; gap: 20px; padding-top: 12px; margin-bottom: auto; }

/* Fields - Clean Input */
.mv4-field {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
}

.mv4-field label {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  color: #ffffff; /* Use white color as requested */
  letter-spacing: 0.5px;
  width: 70px;
  flex-shrink: 0;
  text-align: right;
}

.mv4-field label .req { color: #f43f5e; margin-left: 2px; }

.mv4-field input,
.mv4-field select {
  flex: 1;
  width: 100%;
  height: 38px;
  padding: 0 12px;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.15);
  border-radius: 8px;
  color: #e2e8f0;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.mv4-field input:hover,
.mv4-field select:hover {
  border-color: rgba(148, 163, 184, 0.3);
  background: rgba(15, 23, 42, 0.8);
}

.mv4-field input:focus,
.mv4-field select:focus {
  outline: none;
  background: rgba(15, 23, 42, 0.9);
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2); /* Subtle focus ring */
}

/* Hero Input - Clean */
.mv4-input-hero {
  position: relative;
  display: flex;
  align-items: center;
}

.mv4-input-hero i {
  position: absolute;
  left: 12px;
  color: #10b981;
  font-size: 18px;
  z-index: 1;
}

.mv4-input-hero input {
  height: 48px;
  padding: 0 16px 0 40px;
  font-size: 15px;
  font-weight: 600;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.mv4-input-hero input:focus {
  border-color: #10b981;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.15);
  background: rgba(15, 23, 42, 0.8);
}

/* Price Input - Clean */
.mv4-input-price {
  display: flex;
  align-items: center;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.15);
  border-radius: 8px;
  height: 38px;
  overflow: hidden;
  transition: 0.2s;
}

.mv4-input-price:focus-within {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.15);
}

.mv4-input-price input {
  flex: 1;
  background: transparent;
  border: none;
  padding: 0 12px;
  color: #e2e8f0;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 500;
  height: 100%;
}
.mv4-input-price input:focus { outline: none; }

.mv4-input-price .currency {
  padding: 0 12px;
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  background: rgba(0, 0, 0, 0.1);
  height: 100%;
  display: flex;
  align-items: center;
  border-left: 1px solid rgba(148, 163, 184, 0.1);
}

/* Quantity Section Styles */
.mv4-qty-section { flex: 0 1 auto; display: flex; flex-direction: row; align-items: center; gap: 12px; }
.mv4-qty-section label { width: auto; color: #ffffff; margin-right: 4px; }

/* Quantity Stepper - Modern Split Style */
.mv4-qty-stepper {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 42px;
  background: transparent;
  padding: 0;
  border: none;
}

.mv4-qty-stepper button {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: 0.2s;
  font-size: 16px;
}

/* Minus Button */
.mv4-qty-stepper button:first-of-type {
  background: rgba(30, 41, 59, 0.8);
  color: #94a3b8;
  border: 1px solid rgba(148, 163, 184, 0.1);
}
.mv4-qty-stepper button:first-of-type:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
  color: #e2e8f0;
}
.mv4-qty-stepper button:disabled { opacity: 0.5; cursor: not-allowed; }

/* Plus Button */
.mv4-qty-stepper button:last-of-type {
  background: #10b981;
  color: white;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  border: none;
}
.mv4-qty-stepper button:last-of-type:hover {
  background: #059669;
  transform: translateY(-1px);
  box-shadow: 0 6px 15px rgba(16, 185, 129, 0.4);
}

/* Input Display */
.mv4-qty-stepper input {
  width: 50px;
  height: 36px;
  background: rgba(6, 78, 59, 0.3); /* Dark green tint */
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 8px;
  font-size: 16px;
  font-weight: 800;
  text-align: center;
  color: #34d399; /* Bright green text */
  padding: 0;
}
.mv4-qty-stepper input:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 1px rgba(16, 185, 129, 0.3);
}

/* Stock Badge - Clean */
.mv4-stock-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 16px;
  height: 42px;
  background: rgba(16, 185, 129, 0.05);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 10px;
}
.mv4-stock-badge i { font-size: 18px; color: #10b981; }
.mv4-stock-badge span {font-size: 12px; color: #64748b;}
.mv4-stock-badge strong { font-family: 'JetBrains Mono'; color: #10b981; font-size: 15px; }

/* Action Button - Clean Solid */
.mv4-btn-add-simple {
  width: 100%;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: #10b981;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  color: white;
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.mv4-btn-add-simple:hover {
  background: #059669;
  transform: translateY(-1px);
  box-shadow: 0 6px 8px -1px rgba(0, 0, 0, 0.15);
}

.mv4-btn-add-simple.is-disabled-stock {
  background: #334155 !important;
  color: #94a3b8 !important;
  cursor: not-allowed !important;
  box-shadow: none !important;
  opacity: 0.8;
}

.mv4-btn-add-simple:disabled {
  pointer-events: none;
}

.mv4-btn-add-simple .price {
  background: rgba(0, 0, 0, 0.2);
  padding: 4px 10px;
  border-radius: 6px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
}

/* Custom Header Toggle Active State */
.mode-btn.active-manual {
  background-color: #3b82f6 !important;
  border-color: #3b82f6 !important;
  color: #ffffff !important;
}

.mode-btn.active-manual i {
  color: #ffffff !important;
}

/* ================= VIP SUCCESS MODAL ================= */
.vip-modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: vipFadeIn 0.3s ease-out;
}

.vip-success-card {
  background: rgba(15, 23, 42, 0.95);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 20px;
  padding: 30px 40px;
  text-align: center;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5), 0 0 30px rgba(16, 185, 129, 0.15);
  max-width: 400px;
  width: 90%;
  animation: vipScaleUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  overflow: hidden;
}

.vip-success-card::before {
  content: '';
  position: absolute;
  top: -50%; left: -50%; width: 200%; height: 200%;
  background: radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 60%);
  pointer-events: none;
}

.vip-icon-box {
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.vip-success-ring {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  border-radius: 50%;
  border: 4px solid #10b981;
  opacity: 0.2;
  animation: vipRingPing 1.5s infinite;
}

.vip-check-icon {
  font-size: 40px;
  color: #10b981;
  background: rgba(16, 185, 129, 0.2);
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 15px rgba(16, 185, 129, 0.4);
}

.vip-title {
  margin: 0 0 10px;
  font-size: 20px;
  font-weight: 800;
  color: #ffffff;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.vip-message {
  margin: 0 0 25px;
  font-size: 14px;
  color: #cad5e1;
  line-height: 1.5;
}

.vip-btn-ok {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
  transition: all 0.2s;
  width: 100%;
  text-transform: uppercase;
}

.vip-btn-ok:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
}

@keyframes vipFadeIn { from { opacity: 0; } to { opacity: 1; }}
@keyframes vipScaleUp { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; }}
@keyframes vipRingPing { 
  0% { transform: scale(0.8); opacity: 0.5; border-width: 4px; }
  100% { transform: scale(1.5); opacity: 0; border-width: 0; }
}

/* Responsive */
@media (max-width: 768px) {
  .mv4-row-2, .mv4-row-3, .mv4-row-4 { grid-template-columns: 1fr; gap: 8px; }
  .mv4-row-qty { flex-direction: column; align-items: stretch; gap: 10px; padding-top: 8px; } 
  .mv4-qty-section { justify-content: space-between; }
  .mv4-stock-badge { justify-content: center; }
  .mv4-field label { text-align: left; width: 80px; }
}
/* ================= SKELETON LOADING ================= */
.skeleton-card {
  pointer-events: none;
  border-color: rgba(255, 255, 255, 0.05);
  background: rgba(15, 23, 42, 0.4);
}

.skeleton-shimmer {
  background: linear-gradient(90deg, rgba(255,255,255, 0.03) 25%, rgba(255,255,255, 0.08) 50%, rgba(255,255,255, 0.03) 75%);
  background-size: 200% 100%;
  animation: shimmer 2s infinite linear;
  border-radius: 6px;
}

.skeleton-line {
  height: 14px;
  border-radius: 4px;
}

.width-80 { width: 80%; height: 16px; margin-bottom: 4px; }
.width-60 { width: 60%; }
.width-40 { width: 40%; height: 36px; border-radius: 8px; }

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

</style>

<style scoped>
/* Custom Override for Table Rows - Even Rows Lighter */
.order-table-wrap table tbody tr:nth-child(even) {
  background-color: rgba(255, 255, 255, 0.04) !important;
}
</style>

<style scoped>
/* Custom Override for Table Rows - Even Rows Lighter */
.order-table-wrap table tbody tr:nth-child(even) {
  background-color: rgba(255, 255, 255, 0.04) !important;
}

/* Input Spinner */
.input-spinner {
  position: absolute;
  right: 48px; /* Adjusted position */
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-left-color: #3b82f6; 
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  pointer-events: none;
}

/* Success Check Icon */
.input-success-icon {
  position: absolute;
  right: 48px; /* Adjusted position */
  top: 50%;
  transform: translateY(-50%);
  color: #10b981; /* Green */
  font-size: 18px;
  pointer-events: none;
  animation: fadeIn 0.3s ease-out;
}

@keyframes spin { 100% { transform: translateY(-50%) rotate(360deg); } }
@keyframes fadeIn { from { opacity: 0; transform: translateY(-50%) scale(0.8); } to { opacity: 1; transform: translateY(-50%) scale(1); } }
</style>

<style scoped>
/* ================= MOBILE PILL TABS (REFACTORED) ================= */
.mobile-tabs-header {
  display: flex;
  background: rgba(15, 23, 42, 0.9);
  padding: 5px;
  position: sticky;
  top: 12px;
  left: 0;
  right: 0;
  z-index: 3000;
  margin: 0 16px 12px;
  border-radius: 100px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  gap: 4px;
}

.m-tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  background: transparent;
  border: none;
  color: #94a3b8;
  padding: 8px 2px;
  border-radius: 100px;
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
  position: relative;
}

.m-tab-item i {
  font-size: 16px;
  margin-bottom: 0px;
}

.m-tab-item.active {
  background: #ffffff !important; 
  color: green !important;   
  box-shadow: 0 4px 15px rgba(255, 255, 255, 0.2);
  transform: scale(1.02);
}

.m-tab-item.active i {
  color: green !important;
}

.m-badge {
  position: absolute;
  top: 4px;
  right: 20%;
  background: #ef4444;
  color: white;
  font-size: 9px;
  padding: 2px 5px;
  border-radius: 10px;
  line-height: 1;
  border: 1px solid #0f172a;
}

/* On Mobile, ensure grid collapses to single column and components take full width */
@media (max-width: 1024px) {
  .layout-grid {
    display: block !important; /* Force block so v-show works nicely */
  }
  
  .left-stack, .right-stack {
    width: 100% !important;
    display: block;
    max-width: none !important;
    padding: 0 !important;
    height: 100%;
    min-height: 0;
  }

  .page {
    padding: 0 0 80px 0 !important; /* Bottom padding for fixed buttons */
    overflow-x: hidden;
    --mobile-filter-gap: clamp(3px, 1.2vw, 6px);
    --mobile-filter-height: clamp(30px, 7.5vw, 36px);
    --mobile-filter-font: clamp(9px, 2.1vw, 11px);
    --mobile-filter-icon: clamp(10px, 2.8vw, 12px);
    --mobile-filter-stock-w: clamp(56px, 16vw, 72px);
    --mobile-filter-cat-w: clamp(70px, 22vw, 96px);
    --mobile-filter-size-w: clamp(46px, 14vw, 60px);
    --mobile-filter-btn: clamp(30px, 8vw, 34px);
    --mobile-content-offset: clamp(150px, 20vh, 200px);
    --mobile-catalog-pad: clamp(40px, 8vh, 80px);
    --mobile-order-pad: clamp(12px, 3vh, 28px);
    --mobile-manual-pad: clamp(40px, 8vh, 80px);
    --mobile-manual-gap: clamp(20px, 4vh, 40px);
    height: 100%;
    min-height: 100%;
  }

  .manual-entry-header {
    display: none;
    margin: 0;
    padding: 0;
    border: none;
  }

  .entry-body.entry-body-manual {
    background: transparent;
    border: none;
    box-shadow: none;
    padding: 0;
    overflow: visible;
  }

  .mobile-filters-row {
    gap: var(--mobile-filter-gap);
  }

  .mobile-filter-wrap {
    min-width: 0;
    overflow: hidden;
  }

  .mobile-filter-stock {
    width: var(--mobile-filter-stock-w);
    max-width: var(--mobile-filter-stock-w);
    flex: 0 0 var(--mobile-filter-stock-w);
  }

  .mobile-filter-cat {
    width: var(--mobile-filter-cat-w);
    max-width: var(--mobile-filter-cat-w);
    flex: 0 0 var(--mobile-filter-cat-w);
  }

  .mobile-filter-size {
    width: var(--mobile-filter-size-w);
    max-width: var(--mobile-filter-size-w);
    flex: 0 0 var(--mobile-filter-size-w);
  }

  .mobile-filter-select {
    width: 100%;
    min-width: 0;
    height: var(--mobile-filter-height);
    padding: 0 8px 0 6px;
    font-size: var(--mobile-filter-font);
  }

  .mobile-filter-icon {
    right: 6px;
    font-size: var(--mobile-filter-icon);
  }

  .mobile-filter-checkbox {
    height: var(--mobile-filter-height);
    padding: 0 6px;
    font-size: var(--mobile-filter-font);
    gap: 3px;
  }

  .mobile-filter-checkbox .app-ico {
    font-size: clamp(12px, 3.6vw, 14px);
  }

  .mobile-filter-reset {
    width: var(--mobile-filter-btn);
    height: var(--mobile-filter-btn);
  }

  /* Adjust Boxes for Tab View */
  .box {
    margin-bottom: 0 !important;
    border-radius: 0 !important;
    border: none !important;
    border-bottom: 1px dashed rgba(255,255,255,0.1) !important;
  }

  /* Customer/Delivery Box Tweaks */
  .info-row-2col {
    display: block !important;
  }

  /* Fixed Bottom Bar for Payment Actions */
  .mobile-fixed-bottom {
    position: fixed !important;
    bottom: 70px !important;
    left: 0 !important;
    width: 100% !important;
    background: #1e293b !important; /* Slightly lighter than bg */
    padding: 12px !important;
    z-index: 1000 !important;
    box-shadow: 0 -4px 20px rgba(0,0,0,0.5) !important;
    border-top: 1px solid rgba(255,255,255,0.1) !important;
    display: flex !important;
    flex-direction: row !important;
    flex-wrap: nowrap !important;
    align-items: stretch !important;
    gap: 8px !important;
    height: auto !important;
  }
  
  .mobile-fixed-bottom button {
    flex: 1 !important;
    margin: 0 !important;
    font-size: 13px !important;
  }
  
  /* Ensure content is not hidden behind fixed bottom */
  .bottom-row {
    padding-bottom: 0 !important;
  }

  .payment-scroll {
    flex: 1;
    min-height: 0;
    max-height: calc(100dvh - var(--mobile-content-offset));
    overflow-y: auto;
    padding-bottom: calc(90px + env(safe-area-inset-bottom));
    -webkit-overflow-scrolling: touch;
  }

  /* Catalog Scroll Fix */
  .catalog-grid-section {
    height: calc(100dvh - var(--mobile-content-offset)) !important; /* Switch to dvh for mobile browsers */
    overflow-y: auto !important;
    padding-bottom: calc(var(--mobile-catalog-pad) + env(safe-area-inset-bottom)) !important;
    -webkit-overflow-scrolling: touch;
  }

  .order-box {
    height: 100%;
    min-height: 0;
    overflow: hidden;
  }

  .order-card-container {
    flex: 1;
    min-height: 0;
  }

  .order-card-list {
    padding-bottom: calc(var(--mobile-order-pad) + env(safe-area-inset-bottom));
  }

  /* Manual Entry Scroll Parent */
  .manual-mobile-block-parent {
    max-height: calc(100dvh - var(--mobile-content-offset)) !important;
    height: auto !important;
    overflow-y: auto !important;
    padding: 10px 10px var(--mobile-manual-pad) !important;
    -webkit-overflow-scrolling: touch;
    display: block;
    background: rgba(15, 23, 42, 0.4); 
    border-radius: 16px;
    margin: 0 8px;
  }

  .manual-content {
    height: auto !important;
    overflow: visible !important;
  }

  .mv4-card {
    margin-bottom: calc(var(--mobile-manual-gap) + env(safe-area-inset-bottom));
  }
}
</style>

<style scoped>
/* ================= MOBILE ENTRY DROPDOWN (TAB HEADER) ================= */
.mobile-entry-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background: #1e293b; /* Matches dark background */
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
  z-index: 2000;
  margin-top: 4px;
  overflow: hidden;
  animation: slideDown 0.2s ease-out;
  display: flex;
  flex-direction: column;
}

.me-dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  color: #94a3b8;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  background: transparent;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  text-align: left;
}

.me-dropdown-item:last-child {
  border-bottom: none;
}

.me-dropdown-item i {
  font-size: 16px;
}

.me-dropdown-item.active {
  background: rgba(16, 185, 129, 0.15); /* Green tint */
  color: #34d399; /* Green text */
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>

<style scoped>
/* Update Text Invoice Modal Background */
.text-invoice-box {
  background: #1e293b !important; /* Matches product-card theme */
  border: 1px solid rgba(148, 163, 184, 0.1) !important;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5) !important;
  color: #fff !important;
}

.text-invoice-box textarea {
  background: rgba(15, 23, 42, 0.6) !important; /* Slightly darker input bg */
  border-color: rgba(148, 163, 184, 0.1) !important;
  color: #e2e8f0 !important;
}
</style>
