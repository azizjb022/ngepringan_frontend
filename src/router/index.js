import { createRouter, createWebHistory } from 'vue-router';
import DashboardLayout from '../layouts/DashboardLayout.vue';
import LoginView from '../views/LoginView.vue';
import DashboardView from '../views/DashboardView.vue';
import KeuanganView from '../views/KeuanganView.vue';
import JimpitanView from '../views/JimpitanView.vue';
import RapatView from '../views/RapatView.vue';
import WargaView from '../views/WargaView.vue';
import LaporanView from '../views/LaporanView.vue';
import PublicJimpitanView from '../views/PublicJimpitanView.vue';

const routes = [
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { guestOnly: true },
  },
  {
    path: '/cek-jimpitan',
    name: 'public-jimpitan',
    component: PublicJimpitanView,
    meta: { requiresAuth: false },
  },
  {
    path: '/transparansi',
    redirect: '/cek-jimpitan',
  },
  {
    path: '/',
    component: DashboardLayout,
    meta: { requiresAuth: true },
    children: [
      { path: '', name: 'dashboard', component: DashboardView },
      { path: 'keuangan', name: 'keuangan', component: KeuanganView },
      { path: 'jimpitan', name: 'jimpitan', component: JimpitanView },
      { path: 'warga', name: 'warga', component: WargaView },
      { path: 'rapat', name: 'rapat', component: RapatView },
      { path: 'laporan', name: 'laporan', component: LaporanView },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  // Cek langsung token dari localStorage agar tidak bergantung pada lifecycle Pinia
  const token = localStorage.getItem('token');
  const isAuthenticated = !!token;

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'login' });
  } else if (to.meta.guestOnly && isAuthenticated) {
    next({ name: 'dashboard' });
  } else {
    next();
  }
});

export default router;
