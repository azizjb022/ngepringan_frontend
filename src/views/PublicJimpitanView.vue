<template>
  <div class="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased pb-16">
    <!-- Navbar Sederhana Warga -->
    <header class="bg-emerald-700 text-white shadow-md sticky top-0 z-30">
      <div class="max-w-4xl mx-auto px-4 py-3.5 flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center font-black text-white text-lg shadow-inner">
            🪙
          </div>
          <div>
            <h1 class="text-base font-bold leading-tight tracking-tight">Portal Jimpitan Warga</h1>
            <p class="text-xs text-emerald-100 font-medium">Dusun Ngepringan · Karang Taruna</p>
          </div>
        </div>
        <router-link
          to="/login"
          class="text-xs bg-emerald-800 hover:bg-emerald-900 px-3 py-1.5 rounded-lg border border-emerald-600 transition font-medium"
        >
          Masuk Petugas &rarr;
        </router-link>
      </div>
    </header>

    <main class="max-w-4xl mx-auto px-4 pt-6 space-y-6">
      <!-- Hero Banner Transparansi Kas -->
      <div class="bg-gradient-to-br from-emerald-600 to-teal-800 text-white rounded-2xl p-6 shadow-lg shadow-emerald-900/10 relative overflow-hidden">
        <div class="relative z-10 space-y-2">
          <span class="inline-block px-2.5 py-0.5 bg-emerald-500/40 border border-emerald-400/30 rounded-full text-[11px] font-semibold uppercase tracking-wider">
            Transparansi Kas Jimpitan
          </span>
          <h2 class="text-xl md:text-2xl font-black">Cek Iuran & Transparansi Lingkungan</h2>
          <p class="text-xs md:text-sm text-emerald-100 max-w-xl leading-relaxed">
            Iuran jimpitan Rp 500/hari dikelola pemuda Karang Taruna untuk kas sosial, keamanan lingkungan, dan kesejahteraan bersama warga Dusun Ngepringan.
          </p>

          <div class="grid grid-cols-2 gap-3 pt-3">
            <div class="bg-white/10 backdrop-blur rounded-xl p-3 border border-white/10">
              <p class="text-[11px] text-emerald-100 font-medium">Terkumpul Dusun Bulan Ini</p>
              <p class="text-lg md:text-xl font-bold mt-0.5">
                Rp {{ (dusunSummary.total_jimpitan_bulan_ini || 0).toLocaleString('id-ID') }}
              </p>
            </div>
            <div class="bg-white/10 backdrop-blur rounded-xl p-3 border border-white/10">
              <p class="text-[11px] text-emerald-100 font-medium">Total Catatan Ronda</p>
              <p class="text-lg md:text-xl font-bold mt-0.5">
                {{ (dusunSummary.total_transaksi_bulan_ini || 0).toLocaleString('id-ID') }} kali
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Form Pencarian Mandiri Warga -->
      <div class="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-slate-200 space-y-4">
        <div>
          <h3 class="text-base font-bold text-slate-800">🔍 Cek Riwayat Jimpitan Mandiri</h3>
          <p class="text-xs text-slate-500 mt-0.5">
            Ketik Nama Kepala Keluarga atau No. Kartu Keluarga (KK) rumah Anda.
          </p>
        </div>

        <form @submit.prevent="cariData" class="flex flex-col sm:flex-row gap-2.5">
          <div class="relative flex-1">
            <input
              v-model="keyword"
              type="text"
              placeholder="Contoh: Sutrisno atau 3304..."
              required
              class="w-full pl-4 pr-10 py-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
            />
            <button
              v-if="keyword"
              type="button"
              @click="keyword = ''; searchResult = null"
              class="absolute right-3 top-3 text-slate-400 hover:text-slate-600 text-sm"
            >
              ✕
            </button>
          </div>
          <button
            type="submit"
            :disabled="loading"
            class="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <span v-if="loading" class="animate-spin text-sm">⏳</span>
            <span>{{ loading ? 'Mencari...' : 'Cari Data' }}</span>
          </button>
        </form>

        <p v-if="errorMessage" class="text-xs text-rose-600 bg-rose-50 p-3 rounded-lg border border-rose-100">
          {{ errorMessage }}
        </p>
      </div>

      <!-- Hasil Pencarian: Kartu Jimpitan Digital Warga -->
      <div v-if="searchResult && searchResult.found" class="space-y-6">
        <!-- Kartu Identitas & Saldo Deposit -->
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-5">
          <div class="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-xl font-black text-slate-900">{{ searchResult.warga.nama_kk }}</h3>
                <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                  {{ searchResult.warga.rt }}
                </span>
              </div>
              <p class="text-xs text-slate-500 mt-1">
                No. KK: <span class="font-mono text-slate-700">{{ searchResult.warga.no_kk_masked }}</span> ·
                Alamat: {{ searchResult.warga.alamat || '-' }}
              </p>
            </div>

            <!-- Kartu Saldo Deposit Warga -->
            <div class="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-right min-w-[180px]">
              <p class="text-xs text-emerald-800 font-medium">Saldo Deposit (Bayar di Muka)</p>
              <p class="text-xl font-black text-emerald-700 mt-0.5">
                Rp {{ Number(searchResult.warga.saldo_deposit || 0).toLocaleString('id-ID') }}
              </p>
              <p class="text-[11px] text-emerald-600 mt-0.5">
                Cukup untuk ±{{ Math.floor((searchResult.warga.saldo_deposit || 0) / 500) }} hari ke depan
              </p>
            </div>
          </div>

          <!-- Ringkasan Statistik Bulan Ini -->
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
              <p class="text-xs text-slate-500">Iuran Bulan Ini</p>
              <p class="text-base font-bold text-slate-800 mt-1">
                Rp {{ Number(searchResult.statistik.bulan_ini_nominal || 0).toLocaleString('id-ID') }}
              </p>
            </div>
            <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
              <p class="text-xs text-slate-500">Hari Terbayar</p>
              <p class="text-base font-bold text-emerald-700 mt-1">
                {{ searchResult.statistik.bulan_ini_hari || 0 }} malam
              </p>
            </div>
            <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 col-span-2 sm:col-span-1">
              <p class="text-xs text-slate-500">Tarif Jimpitan</p>
              <p class="text-base font-bold text-slate-800 mt-1">
                Rp {{ Number(searchResult.statistik.tarif_per_hari || 500).toLocaleString('id-ID') }} / hari
              </p>
            </div>
          </div>
        </div>

        <!-- Riwayat Pencatatan Ronda (30 Hari Terakhir) -->
        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div class="p-4 md:p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h4 class="font-bold text-slate-800 text-sm">Riwayat Pengambilan Ronda Terakhir</h4>
              <p class="text-xs text-slate-400">Catatan petugas pemuda saat keliling malam</p>
            </div>
            <span class="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
              30 Catatan Terakhir
            </span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-xs md:text-sm">
              <thead class="bg-slate-50 text-slate-600 uppercase text-[11px] font-semibold border-b border-slate-200">
                <tr>
                  <th class="p-3.5">Tanggal</th>
                  <th class="p-3.5">Status Kunjungan</th>
                  <th class="p-3.5">Nominal</th>
                  <th class="p-3.5">Metode</th>
                  <th class="p-3.5">Petugas Ronda</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr
                  v-for="item in searchResult.riwayat_terakhir"
                  :key="item.id"
                  class="hover:bg-slate-50/80 transition"
                >
                  <td class="p-3.5 font-medium text-slate-700">
                    {{ formatTanggal(item.tanggal) }}
                  </td>
                  <td class="p-3.5">
                    <span
                      class="px-2.5 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1"
                      :class="statusBadgeClass(item.status_lapangan)"
                    >
                      <span>{{ statusIcon(item.status_lapangan) }}</span>
                      <span>{{ formatStatusLapangan(item.status_lapangan) }}</span>
                    </span>
                  </td>
                  <td class="p-3.5 font-bold" :class="item.nominal > 0 ? 'text-emerald-700' : 'text-slate-400'">
                    Rp {{ Number(item.nominal).toLocaleString('id-ID') }}
                  </td>
                  <td class="p-3.5 text-slate-600">
                    <span
                      class="px-2 py-0.5 rounded text-[11px] font-semibold"
                      :class="item.metode_bayar === 'deposit' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'"
                    >
                      {{ item.metode_bayar === 'deposit' ? '💳 Potong Deposit' : '💵 Tunai Koin' }}
                    </span>
                  </td>
                  <td class="p-3.5 text-slate-500 text-xs">
                    {{ item.petugas || 'Petugas Ronda' }}
                  </td>
                </tr>

                <tr v-if="!searchResult.riwayat_terakhir.length">
                  <td colspan="5" class="p-8 text-center text-slate-400">
                    Belum ada riwayat pengambilan tercatat untuk KK ini.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div
        v-else-if="searched && (!searchResult || !searchResult.found)"
        class="bg-white rounded-2xl p-10 text-center border border-dashed border-slate-300 space-y-2"
      >
        <span class="text-3xl">🔎</span>
        <h4 class="font-bold text-slate-700">Data Tidak Ditemukan</h4>
        <p class="text-xs text-slate-500 max-w-sm mx-auto">
          Pastikan ejaan nama kepala keluarga atau nomor KK sudah sesuai data RT aktif di Dusun Ngepringan.
        </p>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../api/axios';

const keyword = ref('');
const loading = ref(false);
const searched = ref(false);
const searchResult = ref(null);
const errorMessage = ref('');
const dusunSummary = ref({
  total_jimpitan_bulan_ini: 0,
  total_transaksi_bulan_ini: 0
});

const formatTanggal = (val) => {
  if (!val) return '-';
  const d = new Date(val);
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

const formatStatusLapangan = (status) => {
  switch (status) {
    case 'lunas':
      return 'Lunas';
    case 'kosong_nihil':
      return 'Nihil / Kosong';
    case 'titip_tetangga':
      return 'Titip Tetangga';
    case 'rumah_tutup_mudik':
      return 'Rumah Tutup / Mudik';
    default:
      return status || 'Lunas';
  }
};

const statusBadgeClass = (status) => {
  switch (status) {
    case 'lunas':
      return 'bg-emerald-100 text-emerald-800';
    case 'kosong_nihil':
      return 'bg-amber-100 text-amber-800';
    case 'titip_tetangga':
      return 'bg-blue-100 text-blue-800';
    case 'rumah_tutup_mudik':
      return 'bg-slate-200 text-slate-700';
    default:
      return 'bg-emerald-100 text-emerald-800';
  }
};

const statusIcon = (status) => {
  switch (status) {
    case 'lunas':
      return '✓';
    case 'kosong_nihil':
      return '○';
    case 'titip_tetangga':
      return '🤝';
    case 'rumah_tutup_mudik':
      return '🏠';
    default:
      return '✓';
  }
};

const cariData = async () => {
  if (!keyword.value.trim()) return;
  loading.value = true;
  errorMessage.value = '';
  searched.value = true;

  try {
    const res = await api.get('/jimpitan/public/cek-warga', {
      params: { keyword: keyword.value.trim() }
    });

    if (res.data.data?.found) {
      searchResult.value = res.data.data;
      if (res.data.data.transparansi_dusun) {
        dusunSummary.value = res.data.data.transparansi_dusun;
      }
    } else {
      searchResult.value = null;
    }
  } catch (err) {
    errorMessage.value = err.response?.data?.message || 'Gagal mencari data warga.';
    searchResult.value = null;
  } finally {
    loading.value = false;
  }
};

// Muat ringkasan awal jika ada keyword query atau muat default
onMounted(async () => {
  try {
    // Coba cari keyword dari query param url
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q') || params.get('no_kk') || params.get('nama');
    if (q) {
      keyword.value = q;
      await cariData();
    }
  } catch (e) {
    console.error(e);
  }
});
</script>
