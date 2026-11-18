<template>
  <div class="flex h-screen bg-slate-50 font-sans overflow-hidden">
    <!-- Backdrop Overlay untuk Mobile Sidebar -->
    <div
      v-if="isSidebarOpen"
      @click="isSidebarOpen = false"
      class="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden transition-opacity"
    ></div>

    <!-- Sidebar: Drawer di Mobile, Kolom Tetap di Desktop -->
    <aside
      :class="[
        'fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-200 flex flex-col justify-between transition-transform duration-300 ease-in-out shrink-0',
        isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
      ]"
    >
      <div>
        <div class="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h1 class="text-xl font-black tracking-wide text-white">NGEPRINGAN</h1>
            <p class="text-xs text-slate-400 mt-0.5">Sistem Informasi Karang Taruna</p>
          </div>
          <button
            @click="isSidebarOpen = false"
            class="p-1.5 text-slate-400 hover:text-white rounded-lg lg:hidden"
            aria-label="Tutup menu"
          >
            ✕
          </button>
        </div>

        <nav class="p-3 space-y-1">
          <RouterLink
            to="/"
            @click="isSidebarOpen = false"
            class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition"
            :class="$route.name === 'dashboard' ? 'bg-emerald-600 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'"
          >
            📊 Dashboard
          </RouterLink>
          <RouterLink
            to="/keuangan"
            @click="isSidebarOpen = false"
            class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition"
            :class="$route.name === 'keuangan' ? 'bg-emerald-600 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'"
          >
            💰 Kas Keuangan
          </RouterLink>
          <RouterLink
            to="/jimpitan"
            @click="isSidebarOpen = false"
            class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition"
            :class="$route.name === 'jimpitan' ? 'bg-emerald-600 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'"
          >
            🪙 Jimpitan RT
          </RouterLink>
          <RouterLink
            to="/warga"
            @click="isSidebarOpen = false"
            class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition"
            :class="$route.name === 'warga' ? 'bg-emerald-600 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'"
          >
            👨‍👩‍👧 Data Warga
          </RouterLink>
          <RouterLink
            to="/rapat"
            @click="isSidebarOpen = false"
            class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition"
            :class="$route.name === 'rapat' ? 'bg-emerald-600 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'"
          >
            📝 Rapat & Notulensi
          </RouterLink>
          <RouterLink
            to="/laporan"
            @click="isSidebarOpen = false"
            class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition"
            :class="$route.name === 'laporan' ? 'bg-emerald-600 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'"
          >
            📑 Laporan
          </RouterLink>
          <RouterLink
            to="/cek-jimpitan"
            @click="isSidebarOpen = false"
            class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition text-emerald-400 hover:bg-slate-800"
          >
            🔍 Portal Cek Warga
          </RouterLink>
        </nav>
      </div>

      <!-- User Profile & Logout -->
      <div class="p-4 border-t border-slate-800">
        <div class="mb-3 px-2">
          <p class="text-sm font-bold text-white truncate">{{ auth.user?.nama || 'Pengguna' }}</p>
          <p class="text-xs text-slate-400 capitalize truncate">
            Role: {{ auth.user?.role || 'Warga' }} {{ auth.user?.rt ? `(${auth.user.rt})` : '' }}
          </p>
        </div>
        <button
          @click="handleLogout"
          class="w-full text-left px-3 py-2 text-xs font-bold text-rose-400 hover:bg-rose-500/10 rounded-lg transition flex items-center gap-2"
        >
          <span>🚪</span>
          <span>Keluar Akun</span>
        </button>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col h-screen overflow-y-auto pb-16 lg:pb-0">
      <!-- Header Mobile & Desktop -->
      <header
        class="bg-white border-b border-slate-200 px-4 py-3 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs"
      >
        <div class="flex items-center gap-2.5">
          <!-- Tombol Hamburger Menu (Hanya Tampil di Layar HP) -->
          <button
            type="button"
            @click="isSidebarOpen = !isSidebarOpen"
            class="p-2 -ml-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg lg:hidden transition"
            aria-label="Buka menu navigasi"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>

          <h2 class="text-base sm:text-lg font-bold text-slate-800 capitalize tracking-tight">
            {{ formatRouteName($route.name) }}
          </h2>
        </div>

        <div class="flex items-center gap-2">
          <span
            class="text-[11px] sm:text-xs px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-semibold"
          >
            Dusun Ngepringan
          </span>
        </div>
      </header>

      <main class="p-3.5 sm:p-6 lg:p-8 flex-1">
        <RouterView />
      </main>
    </div>

    <!-- Bottom Navigation Bar Khusus Layar Handphone (Mobile Friendly) -->
    <nav class="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-200 flex items-center justify-around py-1.5 shadow-lg">
      <RouterLink
        to="/"
        class="flex flex-col items-center py-1 px-2 text-[10px] transition"
        :class="$route.name === 'dashboard' ? 'text-emerald-600 font-bold' : 'text-slate-500'"
      >
        <span class="text-base leading-none mb-1">📊</span>
        <span>Beranda</span>
      </RouterLink>

      <RouterLink
        to="/keuangan"
        class="flex flex-col items-center py-1 px-2 text-[10px] transition"
        :class="$route.name === 'keuangan' ? 'text-emerald-600 font-bold' : 'text-slate-500'"
      >
        <span class="text-base leading-none mb-1">💰</span>
        <span>Kas</span>
      </RouterLink>

      <RouterLink
        to="/jimpitan"
        class="flex flex-col items-center py-1 px-2 text-[10px] transition"
        :class="$route.name === 'jimpitan' ? 'text-emerald-600 font-bold' : 'text-slate-500'"
      >
        <span class="text-base leading-none mb-1">🪙</span>
        <span>Jimpitan</span>
      </RouterLink>

      <RouterLink
        to="/warga"
        class="flex flex-col items-center py-1 px-2 text-[10px] transition"
        :class="$route.name === 'warga' ? 'text-emerald-600 font-bold' : 'text-slate-500'"
      >
        <span class="text-base leading-none mb-1">👨‍👩‍👧</span>
        <span>Warga</span>
      </RouterLink>

      <button
        type="button"
        @click="isSidebarOpen = true"
        class="flex flex-col items-center py-1 px-2 text-[10px] text-slate-500 hover:text-slate-800 transition"
      >
        <span class="text-base leading-none mb-1">☰</span>
        <span>Menu</span>
      </button>
    </nav>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

const auth = useAuthStore();
const router = useRouter();
const isSidebarOpen = ref(false);

const formatRouteName = (name) => {
  if (!name) return "Dashboard";
  const map = {
    dashboard: "Dashboard",
    keuangan: "Kas Keuangan",
    jimpitan: "Jimpitan RT",
    warga: "Data Warga",
    rapat: "Rapat & Notulensi",
    laporan: "Laporan",
  };
  return map[name] || String(name);
};

const handleLogout = () => {
  isSidebarOpen.value = false;
  auth.logout();
  router.push("/login");
};
</script>
