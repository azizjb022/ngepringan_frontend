<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h3 class="text-xl font-bold text-slate-800">Laporan Keuangan</h3>
        <p class="text-sm text-slate-500 mt-1">Pantau arus kas dan unduh laporan kegiatan Karang Taruna.</p>
      </div>
      <div class="flex items-center gap-2">
        <router-link
          to="/jimpitan"
          class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold flex items-center gap-1.5 transition"
        >
          📑 Lembar Jimpitan Matriks Warga
        </router-link>
        <button @click="exportCsv" :disabled="!laporan.transaksi.length" class="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-semibold disabled:opacity-40">Unduh CSV</button>
      </div>
    </div>

    <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-end gap-3">
      <div><label class="block text-xs font-semibold text-slate-600 mb-1">Dari</label><input v-model="filter.dari" type="date" class="p-2 border rounded-lg text-sm" /></div>
      <div><label class="block text-xs font-semibold text-slate-600 mb-1">Sampai</label><input v-model="filter.sampai" type="date" class="p-2 border rounded-lg text-sm" /></div>
      <select v-model="filter.jenis" class="p-2 border rounded-lg text-sm bg-white"><option value="">Semua jenis</option><option value="masuk">Kas masuk</option><option value="keluar">Kas keluar</option></select>
      <button @click="fetchLaporan" class="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold">Terapkan</button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-white p-5 rounded-xl border border-emerald-200 shadow-sm"><p class="text-xs text-slate-500">Total Masuk</p><p class="text-2xl font-bold text-emerald-700 mt-2">Rp {{ money(laporan.ringkasan.total_masuk) }}</p></div>
      <div class="bg-white p-5 rounded-xl border border-rose-200 shadow-sm"><p class="text-xs text-slate-500">Total Keluar</p><p class="text-2xl font-bold text-rose-700 mt-2">Rp {{ money(laporan.ringkasan.total_keluar) }}</p></div>
      <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm"><p class="text-xs text-slate-500">Saldo Periode</p><p class="text-2xl font-bold text-slate-800 mt-2">Rp {{ money(laporan.ringkasan.saldo) }}</p></div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <h4 class="font-semibold text-slate-800 mb-4">Per Kategori</h4>
        <div v-for="(item, nama) in laporan.ringkasan.per_kategori" :key="nama" class="py-2 border-b border-slate-100 last:border-0">
          <div class="flex justify-between text-sm"><span class="text-slate-700">{{ nama }}</span><span class="font-semibold text-slate-800">Rp {{ money(item.masuk - item.keluar) }}</span></div>
          <p class="text-xs text-slate-400 mt-1">Masuk Rp {{ money(item.masuk) }} | Keluar Rp {{ money(item.keluar) }}</p>
        </div>
        <p v-if="!Object.keys(laporan.ringkasan.per_kategori).length" class="text-sm text-slate-400">Tidak ada data.</p>
      </div>
      <div class="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="p-5 border-b border-slate-100"><h4 class="font-semibold text-slate-800">Detail Transaksi</h4><p class="text-xs text-slate-500 mt-1">{{ laporan.transaksi.length }} transaksi ditemukan</p></div>
        <div class="overflow-x-auto"><table class="w-full text-left text-sm"><thead class="bg-slate-50 text-xs uppercase text-slate-500"><tr><th class="p-3">Tanggal</th><th class="p-3">Keterangan</th><th class="p-3">Kategori</th><th class="p-3">Jenis</th><th class="p-3 text-right">Nominal</th></tr></thead><tbody class="divide-y divide-slate-100"><tr v-for="item in laporan.transaksi" :key="item.id"><td class="p-3 text-slate-600 whitespace-nowrap">{{ date(item.tanggal) }}</td><td class="p-3 text-slate-700">{{ item.keterangan }}</td><td class="p-3 text-slate-600">{{ item.nama_kategori }}</td><td class="p-3"><span :class="item.jenis === 'masuk' ? 'text-emerald-700' : 'text-rose-700'" class="font-semibold">{{ item.jenis === 'masuk' ? 'Masuk' : 'Keluar' }}</span></td><td class="p-3 text-right font-semibold">Rp {{ money(item.nominal) }}</td></tr><tr v-if="!laporan.transaksi.length"><td colspan="5" class="p-8 text-center text-slate-400">Tidak ada transaksi pada periode ini.</td></tr></tbody></table></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from "vue";
import api from "../api/axios";

const monthStart = () => {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().slice(0, 10);
};
const today = () => new Date().toISOString().slice(0, 10);
const filter = reactive({ dari: monthStart(), sampai: today(), jenis: "" });
const laporan = ref({ transaksi: [], ringkasan: { total_masuk: 0, total_keluar: 0, saldo: 0, per_kategori: {} } });
const money = (value) => Number(value || 0).toLocaleString("id-ID");
const date = (value) => String(value || "-").split("T")[0];

const fetchLaporan = async () => {
  const res = await api.get("/keuangan/laporan", { params: filter });
  if (res.data.success) laporan.value = res.data.data;
};

const exportCsv = () => {
  const header = ["Tanggal", "Keterangan", "Kategori", "Jenis", "Nominal"];
  const rows = laporan.value.transaksi.map((item) => [date(item.tanggal), item.keterangan, item.nama_kategori, item.jenis, item.nominal]);
  const csv = [header, ...rows].map((row) => row.map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`).join(",")).join("\n");
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" }));
  link.download = `laporan-keuangan-${filter.dari}-${filter.sampai}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
};

onMounted(fetchLaporan);
</script>
