<template>
  <div class="flex h-screen bg-slate-50 font-sans">
    <!-- Sidebar -->
    <aside
      class="w-64 bg-slate-900 text-slate-200 flex flex-col justify-between"
    >
      <div>
        <div class="p-6 border-b border-slate-800">
          <h1 class="text-xl font-bold tracking-wide text-white">NGEPRINGAN</h1>
          <p class="text-xs text-slate-400 mt-1">
            Sistem Informasi Karang Taruna
          </p>
        </div>

        <nav class="p-4 space-y-1">
          <RouterLink
            to="/"
            class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition"
            :class="
              $route.name === 'dashboard'
                ? 'bg-emerald-600 text-white'
                : 'hover:bg-slate-800 text-slate-300'
            "
          >
            📊 Dashboard
          </RouterLink>
          <RouterLink
            to="/keuangan"
            class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition"
            :class="
              $route.name === 'keuangan'
                ? 'bg-emerald-600 text-white'
                : 'hover:bg-slate-800 text-slate-300'
            "
          >
            💰 Kas Keuangan
          </RouterLink>
          <RouterLink
            to="/jimpitan"
            class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition"
            :class="
              $route.name === 'jimpitan'
                ? 'bg-emerald-600 text-white'
                : 'hover:bg-slate-800 text-slate-300'
            "
          >
            🪙 Jimpitan RT
          </RouterLink>
          <RouterLink
            to="/warga"
            class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition"
            :class="
              $route.name === 'warga'
                ? 'bg-emerald-600 text-white'
                : 'hover:bg-slate-800 text-slate-300'
            "
          >
            👨‍👩‍👧 Data Warga
          </RouterLink>
          <RouterLink
            to="/rapat"
            class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition"
            :class="
              $route.name === 'rapat'
                ? 'bg-emerald-600 text-white'
                : 'hover:bg-slate-800 text-slate-300'
            "
          >
            📝 Rapat & Notulensi
          </RouterLink>
          <RouterLink
            to="/laporan"
            class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition"
            :class="$route.name === 'laporan' ? 'bg-emerald-600 text-white' : 'hover:bg-slate-800 text-slate-300'"
          >
            Laporan
          </RouterLink>
        </nav>
      </div>

      <!-- User Profile & Logout -->
      <div class="p-4 border-t border-slate-800">
        <div class="mb-3 px-2">
          <p class="text-sm font-semibold text-white">{{ auth.user?.nama }}</p>
          <p class="text-xs text-slate-400 capitalize">
            Role: {{ auth.user?.role }}
          </p>
        </div>
        <button
          @click="handleLogout"
          class="w-full text-left px-4 py-2 text-sm text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
        >
          🚪 Keluar
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-y-auto">
      <header
        class="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between"
      >
        <h2 class="text-lg font-semibold text-slate-800 capitalize">
          {{ $route.name }}
        </h2>
        <span
          class="text-xs px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-medium"
        >
          Dusun Ngepringan
        </span>
      </header>

      <main class="p-8">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

const auth = useAuthStore();
const router = useRouter();

const handleLogout = () => {
  auth.logout();
  router.push("/login");
};
</script>
