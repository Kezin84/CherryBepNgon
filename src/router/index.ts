import { createRouter, createWebHistory } from 'vue-router'

import MenuOnline from '@/views/MenuOnline.vue'

import QRBanking from '@/views/QRBanking.vue'

import NhapHang from '@/views/nhapHang.vue'
import KhoHang from '@/views/khoHang.vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import Banner from '@/views/Banner.vue'
import Thongbao from '@/views/Thongbao.vue'
import Logo from '@/views/Logo.vue'
import Khuyenmai from '@/views/Khuyenmai.vue'
import OpenTime from '@/views/OpenTime.vue'
import ContactShop from '@/views/ContactShop.vue'
import Login from '@/views/Login.vue'

const SUPPORTED_LANGS = ['vi', 'en', 'zh-CN', 'fil']

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/vi' },
    { path: '/login', name: 'login', component: Login },

    {
      path: '/:lang',
      name: 'menu-online',
      component: MenuOnline,
      beforeEnter: (to) => {
        if (!SUPPORTED_LANGS.includes(to.params.lang)) {
          return { name: 'menu-online', params: { lang: 'vi' } }
        }
      },
    },
   

    {
      path: '/crm',
      component: AdminLayout,
      meta: { requiresAuth: true },
      children: [
        { path: '', redirect: 'nhap-hang' },
        { path: 'nhap-hang', name: 'nhap-hang', component: NhapHang },
        { path: 'kho-hang', name: 'kho-hang', component: KhoHang },
        { path: 'banner', name: 'admin-banner', component: Banner },
        { path: 'thong-bao', name: 'admin-thong-bao', component: Thongbao },
        { path: 'logo', name: 'admin-logo', component: Logo },
        { path: 'khuyen-mai', name: 'admin-khuyen-mai', component: Khuyenmai },
        { path: 'open-time', name: 'admin-open-time', component: OpenTime },
        { path: 'contact-shop', name: 'admin-contact-shop', component: ContactShop },
        { path: 'qr-banking', name: 'admin-qr-banking', component: QRBanking },
      ],
    },

    { path: '/:pathMatch(.*)*', redirect: '/vi' },
  ],
})

router.beforeEach((to, from, next) => {
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  const isLoginPage = to.name === 'login'
  const isPublicMenu = to.name === 'menu-online' || to.name === 'menu-mobile'

  if (to.meta.requiresAuth && !user) {
    return next({ name: 'login' })
  }

  if (user && isLoginPage) {
    return next('/crm')
  }

  if (isPublicMenu || isLoginPage) {
    return next()
  }

  next()
})

export default router
