<template>
  <div class="space-y-6">
    <div v-if="loading" class="text-center py-10 text-slate-500">
      Memuat data keuangan...
    </div>

    <template v-else>
      <!-- Ringkasan Kas -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p class="text-sm font-medium text-slate-500">Saldo Kas Bersih</p>
          <p class="text-2xl font-bold text-slate-900 mt-2">
            Rp
            {{ Number(summary?.keuangan?.saldo || 0).toLocaleString("id-ID") }}
          </p>
        </div>

        <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p class="text-sm font-medium text-slate-500">Total Kas Masuk</p>
          <p class="text-2xl font-bold text-emerald-600 mt-2">
            Rp
            {{
              Number(summary?.keuangan?.total_masuk || 0).toLocaleString("id-ID")
            }}
          </p>
        </div>

        <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p class="text-sm font-medium text-slate-500">Total Kas Keluar</p>
          <p class="text-2xl font-bold text-rose-600 mt-2">
            Rp
            {{
              Number(summary?.keuangan?.total_keluar || 0).toLocaleString(
                "id-ID",
              )
            }}
          </p>
        </div>
      </div>

      <!-- Validasi setoran jimpitan oleh bendahara -->
      <div v-if="canManage" class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-xl font-bold text-slate-800">Setoran Jimpitan Menunggu Validasi</h3>
            <p class="text-sm text-slate-500 mt-0.5">Periksa RT dan rentang tanggal sebelum diterima ke kas.</p>
          </div>
          <button @click="fetchSetoranJimpitan" class="px-3 py-2 border border-slate-300 hover:bg-slate-50 rounded-lg text-sm text-slate-700">
            Muat Ulang
          </button>
        </div>
        <div v-if="!setoranJimpitan.length" class="bg-white p-5 rounded-xl border border-slate-200 text-sm text-slate-400">
          Tidak ada setoran jimpitan yang menunggu validasi.
        </div>
        <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div v-for="s in setoranJimpitan" :key="s.rt" class="bg-white p-5 rounded-xl border border-amber-200 shadow-sm">
            <div class="flex items-start justify-between gap-3">
              <div>
                <h4 class="font-bold text-slate-800">{{ s.rt }}</h4>
                <p class="text-xs text-slate-500 mt-1">{{ formatTanggal(s.dari_tanggal) }} s/d {{ formatTanggal(s.sampai_tanggal) }}</p>
              </div>
              <span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">Menunggu</span>
            </div>
            <div class="flex items-end justify-between mt-4">
              <div>
                <p class="text-xs text-slate-500">{{ s.jumlah_transaksi }} transaksi KK</p>
                <p class="text-lg font-bold text-emerald-700">Rp {{ Number(s.total_nominal).toLocaleString("id-ID") }}</p>
              </div>
              <button @click="terimaSetoran(s)" :disabled="processingSetoran === s.rt" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold disabled:opacity-50">
                {{ processingSetoran === s.rt ? "Memproses..." : "Terima dari Jimpitan" }}
              </button>
            </div>
            <div class="mt-3 space-y-3">
              <button
                type="button"
                @click="toggleDetailSetoran(s.rt)"
                class="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
              >
                {{ expandedSetoranRt === s.rt ? "Sembunyikan detail" : "Lihat detail per tanggal" }}
              </button>
              <div v-if="expandedSetoranRt === s.rt" class="rounded-lg bg-slate-50 divide-y divide-slate-200">
                <div v-for="detail in s.detail_per_tanggal" :key="detail.id" class="flex items-center justify-between gap-3 px-3 py-2 text-xs">
                  <div>
                    <p class="font-semibold text-slate-700">{{ formatTanggal(detail.dari_tanggal) }}</p>
                    <p class="text-slate-500">{{ detail.jumlah_transaksi }} transaksi KK, diajukan oleh {{ detail.nama_pengaju }}</p>
                  </div>
                  <span class="font-semibold text-emerald-700 whitespace-nowrap">Rp {{ Number(detail.total_nominal).toLocaleString("id-ID") }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Daftar Transaksi -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-xl font-bold text-slate-800">Riwayat Transaksi Kas</h3>
          <button
            v-if="canManage"
            @click="openModal"
            class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium text-sm transition"
          >
            + Catat Transaksi
          </button>
        </div>

        <div
          class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm"
        >
          <table class="w-full text-left border-collapse">
            <thead
              class="bg-slate-50 text-slate-600 text-xs uppercase font-semibold border-b border-slate-200"
            >
              <tr>
                <th class="p-4">Tanggal</th>
                <th class="p-4">Kategori</th>
                <th class="p-4">Jenis</th>
                <th class="p-4">Nominal</th>
                <th class="p-4">Keterangan</th>
                <th class="p-4">Bukti</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-sm">
              <tr v-for="t in transaksi" :key="t.id" class="hover:bg-slate-50">
                <td class="p-4 text-slate-600">
                  {{ formatTanggal(t.tanggal) }}
                </td>
                <td class="p-4 font-medium text-slate-800">
                  {{ t.nama_kategori }}
                </td>
                <td class="p-4">
                  <span
                    class="px-2.5 py-1 rounded-full text-xs font-semibold"
                    :class="
                      t.jenis === 'masuk'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    "
                  >
                    {{ t.jenis === "masuk" ? "Masuk" : "Keluar" }}
                  </span>
                </td>
                <td
                  class="p-4 font-semibold"
                  :class="
                    t.jenis === 'masuk' ? 'text-emerald-700' : 'text-rose-700'
                  "
                >
                  {{ t.jenis === "masuk" ? "+" : "-" }} Rp
                  {{ Number(t.nominal).toLocaleString("id-ID") }}
                </td>
                <td class="p-4 text-slate-600 max-w-xs">
                  {{ t.keterangan }}
                </td>
                <td class="p-4">
                  <a
                    v-if="t.bukti_nota"
                    :href="`${apiBase}/${t.bukti_nota}`"
                    target="_blank"
                    class="text-emerald-600 hover:underline text-xs font-medium"
                  >
                    Lihat
                  </a>
                  <span v-else class="text-xs text-slate-400">-</span>
                </td>
              </tr>
              <tr v-if="!transaksi.length">
                <td colspan="6" class="p-6 text-center text-slate-400 text-sm">
                  Belum ada transaksi kas.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <!-- Modal Form Catat Transaksi -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-slate-900/40 flex items-center justify-center p-4 z-50"
    >
      <div class="bg-white max-w-md w-full rounded-xl p-6 space-y-4">
        <h4 class="text-lg font-bold text-slate-800">Catat Transaksi Kas</h4>

        <div
          v-if="errorMsg"
          class="p-3 bg-rose-50 text-rose-600 rounded-lg text-sm"
        >
          {{ errorMsg }}
        </div>

        <form @submit.prevent="submitTransaksi" class="space-y-3">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1"
                >Tanggal</label
              >
              <input
                v-model="form.tanggal"
                type="date"
                required
                class="w-full p-2 border rounded-lg text-sm"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1"
                >Jenis</label
              >
              <select
                v-model="form.jenis"
                required
                class="w-full p-2 border rounded-lg text-sm bg-white"
              >
                <option value="masuk">Kas Masuk</option>
                <option value="keluar">Kas Keluar</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1"
              >Kategori</label
            >
            <select
              v-model="form.kategori_id"
              required
              class="w-full p-2 border rounded-lg text-sm bg-white"
            >
              <option value="" disabled>Pilih kategori</option>
              <option v-for="k in kategori" :key="k.id" :value="k.id">
                {{ k.nama_kategori }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1"
              >Nominal (Rp)</label
            >
            <input
              v-model.number="form.nominal"
              type="number"
              min="0"
              required
              class="w-full p-2 border rounded-lg text-sm"
              placeholder="0"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1"
              >Keterangan</label
            >
            <textarea
              v-model="form.keterangan"
              rows="2"
              required
              class="w-full p-2 border rounded-lg text-sm"
              placeholder="Uraian transaksi..."
            ></textarea>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1"
              >Bukti Nota (opsional)</label
            >
            <input
              ref="fileInput"
              type="file"
              accept="image/*,application/pdf"
              class="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-emerald-50 file:text-emerald-700"
            />
          </div>

          <div class="flex justify-end gap-2 pt-2">
            <button
              type="button"
              @click="showModal = false"
              class="px-4 py-2 border rounded-lg text-sm text-slate-600"
            >
              Batal
            </button>
            <button
              type="submit"
              :disabled="submitting"
              class="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"
            >
              {{ submitting ? "Menyimpan..." : "Simpan" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import api from "../api/axios";
import { useAuthStore } from "../stores/auth";

const auth = useAuthStore();
let envApi = import.meta.env.VITE_API_URL || "https://ngepringan-backend.vercel.app/api";
if (typeof window !== "undefined") {
  const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  if (!isLocalhost && (!envApi || envApi.includes("localhost") || envApi.includes("127.0.0.1"))) {
    envApi = "https://ngepringan-backend.vercel.app/api";
  }
}
const apiBase = envApi.replace(/\/api\/?$/, "");

const loading = ref(true);
const submitting = ref(false);
const summary = ref(null);
const transaksi = ref([]);
const kategori = ref([]);
const setoranJimpitan = ref([]);
const showModal = ref(false);
const errorMsg = ref("");
const processingSetoran = ref(null);
const expandedSetoranRt = ref(null);
const fileInput = ref(null);

const canManage = computed(() =>
  ["superadmin", "bendahara"].includes(auth.userRole),
);

const form = reactive({
  tanggal: new Date().toISOString().split("T")[0],
  jenis: "masuk",
  kategori_id: "",
  nominal: null,
  keterangan: "",
});

const formatTanggal = (val) => (val ? String(val).split("T")[0] : "-");

const toggleDetailSetoran = (rt) => {
  expandedSetoranRt.value = expandedSetoranRt.value === rt ? null : rt;
};

const fetchSummary = async () => {
  const res = await api.get("/dashboard/summary");
  if (res.data.success) summary.value = res.data.data;
};

const fetchTransaksi = async () => {
  const res = await api.get("/keuangan/transaksi");
  transaksi.value = res.data.data;
};

const fetchKategori = async () => {
  const res = await api.get("/keuangan/kategori");
  kategori.value = res.data.data;
};

const fetchSetoranJimpitan = async () => {
  if (!canManage.value) return;
  const res = await api.get("/keuangan/setoran-jimpitan");
  setoranJimpitan.value = res.data.data;
};

const terimaSetoran = async (setoran) => {
  if (!confirm(`Terima setoran jimpitan ${setoran.rt} sebesar Rp ${Number(setoran.total_nominal).toLocaleString("id-ID")}?`)) return;
  processingSetoran.value = setoran.rt;
  errorMsg.value = "";
  try {
    await api.post("/keuangan/setoran-jimpitan/terima", { setoran_ids: setoran.setoran_ids });
    await Promise.all([fetchSetoranJimpitan(), fetchTransaksi(), fetchSummary()]);
  } catch (err) {
    errorMsg.value = err.response?.data?.message || "Gagal menerima setoran jimpitan.";
  } finally {
    processingSetoran.value = null;
  }
};

const openModal = () => {
  errorMsg.value = "";
  showModal.value = true;
};

const resetForm = () => {
  form.tanggal = new Date().toISOString().split("T")[0];
  form.jenis = "masuk";
  form.kategori_id = "";
  form.nominal = null;
  form.keterangan = "";
  if (fileInput.value) fileInput.value.value = "";
};

const submitTransaksi = async () => {
  submitting.value = true;
  errorMsg.value = "";
  try {
    const fd = new FormData();
    fd.append("tanggal", form.tanggal);
    fd.append("jenis", form.jenis);
    fd.append("kategori_id", form.kategori_id);
    fd.append("nominal", form.nominal);
    fd.append("keterangan", form.keterangan);
    if (fileInput.value?.files[0]) {
      fd.append("bukti_nota", fileInput.value.files[0]);
    }

    await api.post("/keuangan/transaksi", fd);
    showModal.value = false;
    resetForm();
    await Promise.all([fetchTransaksi(), fetchSummary()]);
  } catch (err) {
    errorMsg.value =
      err.response?.data?.message || "Gagal menyimpan transaksi.";
  } finally {
    submitting.value = false;
  }
};

onMounted(async () => {
  try {
    await Promise.all([fetchSummary(), fetchTransaksi(), fetchKategori(), fetchSetoranJimpitan()]);
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
});
</script>
