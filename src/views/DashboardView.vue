<template>
  <div>
    <div v-if="loading" class="text-center py-10 text-slate-500">
      Memuat data dashboard...
    </div>

    <div v-else class="space-y-4 sm:space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-6">
        <div class="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm">
          <p class="text-xs sm:text-sm font-medium text-slate-500">Saldo Kas Bersih</p>
          <p class="text-xl sm:text-2xl font-bold text-slate-900 mt-1 sm:mt-2">
            Rp
            {{ Number(summary?.keuangan?.saldo || 0).toLocaleString("id-ID") }}
          </p>
        </div>

        <div class="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm">
          <p class="text-xs sm:text-sm font-medium text-slate-500">Total Kas Masuk</p>
          <p class="text-xl sm:text-2xl font-bold text-emerald-600 mt-1 sm:mt-2">
            Rp
            {{
              Number(summary?.keuangan?.total_masuk || 0).toLocaleString(
                "id-ID",
              )
            }}
          </p>
        </div>

        <div class="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm">
          <p class="text-xs sm:text-sm font-medium text-slate-500">Total Kas Keluar</p>
          <p class="text-xl sm:text-2xl font-bold text-rose-600 mt-1 sm:mt-2">
            Rp
            {{
              Number(summary?.keuangan?.total_keluar || 0).toLocaleString(
                "id-ID",
              )
            }}
          </p>
        </div>
      </div>

      <div class="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <div class="bg-white p-3.5 sm:p-5 rounded-xl border border-slate-200 shadow-sm">
          <p class="text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-slate-500">KK Aktif</p>
          <p class="text-xl sm:text-2xl font-bold text-slate-900 mt-1 sm:mt-2">{{ analytics?.warga?.aktif || 0 }}</p>
          <p class="text-[11px] sm:text-xs text-slate-400 mt-0.5 sm:mt-1">dari {{ analytics?.warga?.total || 0 }} KK</p>
        </div>
        <div class="bg-white p-3.5 sm:p-5 rounded-xl border border-slate-200 shadow-sm">
          <p class="text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-slate-500">Jumlah RT</p>
          <p class="text-xl sm:text-2xl font-bold text-slate-900 mt-1 sm:mt-2">{{ analytics?.warga?.jumlah_rt || 0 }}</p>
          <p class="text-[11px] sm:text-xs text-slate-400 mt-0.5 sm:mt-1">wilayah terdata</p>
        </div>
        <div class="bg-white p-3.5 sm:p-5 rounded-xl border border-amber-200 shadow-sm">
          <p class="text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-amber-700">Validasi Tertunda</p>
          <p class="text-xl sm:text-2xl font-bold text-amber-700 mt-1 sm:mt-2">{{ analytics?.setoran_menunggu?.jumlah || 0 }}</p>
          <p class="text-[11px] sm:text-xs text-slate-400 mt-0.5 sm:mt-1">Rp {{ formatMoney(analytics?.setoran_menunggu?.nominal) }}</p>
        </div>
        <div class="bg-white p-3.5 sm:p-5 rounded-xl border border-emerald-200 shadow-sm">
          <p class="text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-emerald-700">Jimpitan Bulan Ini</p>
          <p class="text-xl sm:text-2xl font-bold text-emerald-700 mt-1 sm:mt-2">Rp {{ formatMoney(currentJimpitan) }}</p>
          <p class="text-[11px] sm:text-xs text-slate-400 mt-0.5 sm:mt-1">{{ currentJimpitanTransactions }} transaksi</p>
        </div>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        <div class="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="font-bold text-slate-800 text-sm sm:text-base">Arus Kas 6 Bulan Terakhir</h3>
              <p class="text-xs text-slate-500 mt-0.5">Perbandingan pemasukan dan pengeluaran</p>
            </div>
            <div class="flex gap-2 sm:gap-3 text-xs text-slate-500">
              <span class="flex items-center"><i class="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-1"></i>Masuk</span>
              <span class="flex items-center"><i class="inline-block w-2 h-2 rounded-full bg-rose-500 mr-1"></i>Keluar</span>
            </div>
          </div>
          <div class="overflow-x-auto pb-1">
            <div class="min-w-[280px]">
              <div class="h-44 sm:h-52 flex items-end gap-2 sm:gap-3 border-b border-slate-200 px-2">
                <div v-for="item in analytics?.keuangan_bulanan || []" :key="item.periode" class="flex-1 h-full flex items-end justify-center gap-1 group">
                  <div class="w-2.5 sm:w-3 bg-emerald-500 rounded-t transition-all" :style="{ height: chartHeight(item.masuk) + '%' }" :title="`Masuk Rp ${formatMoney(item.masuk)}`"></div>
                  <div class="w-2.5 sm:w-3 bg-rose-500 rounded-t transition-all" :style="{ height: chartHeight(item.keluar) + '%' }" :title="`Keluar Rp ${formatMoney(item.keluar)}`"></div>
                </div>
              </div>
              <div class="flex gap-2 sm:gap-3 px-2 mt-2 text-[9px] sm:text-[10px] text-slate-500">
                <span v-for="item in analytics?.keuangan_bulanan || []" :key="item.periode" class="flex-1 text-center">{{ item.periode.slice(5) }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 class="font-bold text-slate-800 text-sm sm:text-base">Jimpitan per RT Bulan Ini</h3>
          <p class="text-xs text-slate-500 mt-0.5 mb-4">RT dengan kontribusi terbesar berada di atas</p>
          <div class="space-y-3 sm:space-y-4">
            <div v-for="item in analytics?.jimpitan_rt_bulan_ini || []" :key="item.rt">
              <div class="flex justify-between text-xs mb-1"><span class="font-semibold text-slate-700">{{ item.rt }}</span><span class="text-emerald-700 font-semibold">Rp {{ formatMoney(item.total) }}</span></div>
              <div class="h-2 bg-slate-100 rounded-full overflow-hidden"><div class="h-full bg-emerald-500 rounded-full" :style="{ width: rtWidth(item.total) + '%' }"></div></div>
            </div>
            <p v-if="!analytics?.jimpitan_rt_bulan_ini?.length" class="text-sm text-slate-400">Belum ada data jimpitan bulan ini.</p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div class="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 class="font-bold text-slate-800 text-sm sm:text-base mb-3 sm:mb-4">
            🪙 Jimpitan Bulan Ini per RT
          </h3>
          <div class="space-y-2.5 sm:space-y-3">
            <div
              v-for="rt in summary?.jimpitan_bulan_ini"
              :key="rt.rt"
              class="flex items-center justify-between p-3 bg-slate-50 rounded-lg text-xs sm:text-sm"
            >
              <div>
                <p class="font-semibold text-slate-800">{{ rt.rt }}</p>
                <p class="text-[11px] text-slate-500">
                  {{ rt.jumlah_penarikan }} transaksi KK
                </p>
              </div>
              <p class="font-bold text-slate-800">
                Rp {{ Number(rt.total_jimpitan).toLocaleString("id-ID") }}
              </p>
            </div>
            <div
              v-if="!summary?.jimpitan_bulan_ini?.length"
              class="text-sm text-slate-400 py-2"
            >
              Belum ada data jimpitan bulan ini.
            </div>
          </div>
        </div>

        <div class="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 class="font-bold text-slate-800 text-sm sm:text-base mb-3 sm:mb-4">📅 Rapat Terdekat</h3>
          <div
            v-if="summary?.rapat_berikutnya"
            class="p-4 bg-emerald-50 border border-emerald-200 rounded-lg"
          >
            <h4 class="font-bold text-emerald-900 text-sm sm:text-base">
              {{ summary.rapat_berikutnya.judul_rapat }}
            </h4>
            <p class="text-xs sm:text-sm text-emerald-700 mt-1">
              📍 {{ summary.rapat_berikutnya.lokasi }}
            </p>
            <p class="text-[11px] sm:text-xs text-emerald-600 mt-2">
              ⏰
              {{
                new Date(summary.rapat_berikutnya.tanggal_waktu).toLocaleString(
                  "id-ID",
                )
              }}
            </p>
          </div>
          <div v-else class="text-sm text-slate-400 py-4">
            Belum ada agenda rapat terdekat.
          </div>
        </div>
      </div>

      <!-- ANALITIK & TREN PARTISIPASI RT (KEPATUHAN & TUNGGAKAN) -->
      <div class="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 class="font-bold text-slate-800 text-sm sm:text-base">📊 Analitik & Tren Partisipasi RT</h3>
            <p class="text-[11px] sm:text-xs text-slate-500 mt-0.5">
              Tingkat ketertiban jimpitan dan rasio tunggakan berjalan bulan ini
            </p>
          </div>
          <div class="flex items-center gap-3 text-[11px] sm:text-xs">
            <span class="flex items-center gap-1.5"><i class="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></i> Tertib</span>
            <span class="flex items-center gap-1.5"><i class="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block"></i> Tunggakan</span>
          </div>
        </div>

        <div class="space-y-3 sm:space-y-4 pt-1">
          <div
            v-for="rt in analitikPartisipasi?.rt_list || []"
            :key="rt.rt"
            class="p-3 sm:p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 transition space-y-2"
          >
            <div class="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1.5">
              <div class="flex items-center gap-2">
                <span
                  class="w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px]"
                  :class="rt.ranking === 1 ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-slate-200 text-slate-700'"
                >
                  {{ rt.ranking }}
                </span>
                <span class="font-bold text-slate-800 text-sm">{{ rt.rt }}</span>
                <span class="text-slate-400">({{ rt.kk_aktif }} KK Aktif)</span>
              </div>
              <div class="flex flex-wrap items-center gap-2 sm:gap-3 font-semibold text-[11px] sm:text-xs">
                <span class="text-emerald-700">Terkumpul Rp {{ formatMoney(rt.total_terkumpul) }}</span>
                <span class="text-slate-300 hidden sm:inline">|</span>
                <span class="text-rose-600">Tunggakan Rp {{ formatMoney(rt.tunggakan) }}</span>
                <span
                  class="px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold"
                  :class="rt.kepatuhan_persen >= 75 ? 'bg-emerald-100 text-emerald-800' : (rt.kepatuhan_persen >= 40 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800')"
                >
                  {{ rt.kepatuhan_persen }}%
                </span>
              </div>
            </div>

            <!-- Double Bar: Hijau (Kepatuhan) vs Merah (Tunggakan) -->
            <div class="w-full h-2.5 sm:h-3 bg-slate-200 rounded-full overflow-hidden flex">
              <div
                class="h-full bg-emerald-500 transition-all duration-500"
                :style="{ width: rt.kepatuhan_persen + '%' }"
                :title="`Kepatuhan ${rt.kepatuhan_persen}%`"
              ></div>
              <div
                class="h-full bg-rose-400 transition-all duration-500"
                :style="{ width: rt.tunggakan_persen + '%' }"
                :title="`Tunggakan ${rt.tunggakan_persen}%`"
              ></div>
            </div>

            <div class="flex flex-wrap justify-between text-[10px] sm:text-[11px] text-slate-400 gap-1">
              <span>Target Berjalan: Rp {{ formatMoney(rt.target_berjalan) }}</span>
              <span>Lunas: {{ rt.count_lunas }} KK · Nihil: {{ rt.count_kosong + rt.count_tutup }} KK</span>
            </div>
          </div>

          <p v-if="!analitikPartisipasi?.rt_list?.length" class="text-xs text-slate-400 py-3 text-center">
            Belum ada data partisipasi RT yang cukup.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import api from "../api/axios";

const summary = ref(null);
const loading = ref(true);
const analytics = ref(null);
const analitikPartisipasi = ref(null);
const formatMoney = (value) => Number(value || 0).toLocaleString("id-ID");
const currentPeriod = new Date().toISOString().slice(0, 7);
const currentJimpitan = computed(() => analytics.value?.jimpitan_bulanan?.find((item) => item.periode === currentPeriod)?.total || 0);
const currentJimpitanTransactions = computed(() => analytics.value?.jimpitan_bulanan?.find((item) => item.periode === currentPeriod)?.transaksi || 0);
const chartMax = computed(() => Math.max(1, ...(analytics.value?.keuangan_bulanan || []).flatMap((item) => [Number(item.masuk), Number(item.keluar)])));
const chartHeight = (value) => Math.max(3, (Number(value || 0) / chartMax.value) * 100);
const rtMax = computed(() => Math.max(1, ...(analytics.value?.jimpitan_rt_bulan_ini || []).map((item) => Number(item.total))));
const rtWidth = (value) => (Number(value || 0) / rtMax.value) * 100;

onMounted(async () => {
  try {
    const [summaryRes, analyticsRes, partisipasiRes] = await Promise.all([
      api.get("/dashboard/summary"),
      api.get("/dashboard/analytics"),
      api.get("/jimpitan/analitik-partisipasi").catch(() => ({ data: { success: false } }))
    ]);
    if (summaryRes.data.success) {
      summary.value = summaryRes.data.data;
    }
    if (analyticsRes.data.success) analytics.value = analyticsRes.data.data;
    if (partisipasiRes.data?.success) analitikPartisipasi.value = partisipasiRes.data.data;
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
});
</script>
