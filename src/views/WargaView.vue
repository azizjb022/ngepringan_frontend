<template>
  <div class="space-y-4 sm:space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h3 class="text-lg sm:text-xl font-bold text-slate-800">Data Warga (per KK)</h3>
        <p class="text-xs sm:text-sm text-slate-500 mt-0.5">
          Data kepala keluarga untuk perhitungan jimpitan per RT.
        </p>
      </div>
      <!-- Tombol Tambah Warga: Terbuka untuk superadmin, pengurus, bendahara, dan petugas RT -->
      <button
        v-if="canManage"
        @click="openModal()"
        class="self-start sm:self-auto px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-semibold text-xs sm:text-sm transition shadow-sm flex items-center gap-1.5"
      >
        <span>+ Tambah Warga</span>
      </button>
    </div>

    <div
      v-if="successMsg"
      class="p-3 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium"
    >
      {{ successMsg }}
    </div>
    <div v-if="errorMsg" class="p-3 bg-rose-50 text-rose-600 rounded-lg text-sm font-medium">
      {{ errorMsg }}
    </div>

    <!-- Filter Toolbar -->
    <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-end gap-3">
      <div>
        <label class="block text-xs font-semibold text-slate-600 mb-1">RT</label>
        <div
          v-if="isPetugas"
          class="px-3 py-2 bg-emerald-50 text-emerald-800 rounded-lg text-sm font-bold min-w-[120px]"
        >
          {{ auth.user?.rt || "RT belum diatur" }}
        </div>
        <select
          v-else
          v-model="filter.rt"
          class="p-2 border rounded-lg text-sm bg-white min-w-[120px]"
        >
          <option value="">Semua RT</option>
          <option v-for="r in daftarRT" :key="r" :value="r">{{ r }}</option>
        </select>
      </div>

      <div>
        <label class="block text-xs font-semibold text-slate-600 mb-1">Status</label>
        <select
          v-model="filter.status"
          class="p-2 border rounded-lg text-sm bg-white min-w-[130px]"
        >
          <option value="">Semua Status</option>
          <option value="aktif">Aktif</option>
          <option value="tidak_aktif">Tidak Aktif</option>
        </select>
      </div>

      <div class="flex-1 min-w-[200px]">
        <label class="block text-xs font-semibold text-slate-600 mb-1">Pencarian</label>
        <input
          v-model="filter.q"
          type="text"
          placeholder="Nama KK, No. KK, atau Alamat..."
          class="w-full p-2 border rounded-lg text-sm"
        />
      </div>

      <button
        @click="fetchWarga"
        class="px-3 py-2 border border-slate-300 hover:bg-slate-50 rounded-lg text-sm text-slate-700"
      >
        Muat Ulang
      </button>
    </div>

    <!-- Tabel Data Warga -->
    <div
      class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm"
    >
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead
            class="bg-slate-50 text-slate-600 text-xs uppercase font-semibold border-b border-slate-200"
          >
            <tr>
              <th class="p-4">No. KK</th>
              <th class="p-4">Nama Kepala Keluarga</th>
              <th class="p-4">RT</th>
              <th class="p-4">Alamat</th>
              <th class="p-4">No. HP</th>
              <th class="p-4">Status</th>
              <th v-if="canManage" class="p-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-sm">
            <tr v-for="w in wargaList" :key="w.id" class="hover:bg-slate-50 transition">
              <td class="p-4 text-slate-600 font-mono text-xs">{{ w.no_kk || "-" }}</td>
              <td class="p-4">
                <p class="font-bold text-slate-800">{{ w.nama_kk }}</p>
                <p v-if="w.created_by_nama || w.updated_by_nama" class="text-[10px] text-slate-400 mt-0.5">
                  <span v-if="w.created_by_nama">Oleh: {{ w.created_by_nama }}</span>
                  <span v-if="w.updated_by_nama && w.updated_by_nama !== w.created_by_nama"> · Diubah: {{ w.updated_by_nama }}</span>
                </p>
              </td>
              <td class="p-4 text-slate-600">{{ w.rt }}</td>
              <td class="p-4 text-slate-600 max-w-xs">{{ w.alamat || "-" }}</td>
              <td class="p-4 text-slate-600 text-xs">{{ w.no_hp || "-" }}</td>
              <td class="p-4">
                <span
                  class="px-2.5 py-1 rounded-full text-xs font-semibold"
                  :class="
                    w.status === 'aktif'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-600'
                  "
                >
                  {{ w.status === "aktif" ? "Aktif" : "Tidak Aktif" }}
                </span>
              </td>
              <td v-if="canManage" class="p-4 text-center whitespace-nowrap">
                <button
                  @click="openModal(w)"
                  class="px-3 py-1.5 text-xs font-medium border border-slate-300 hover:bg-slate-50 rounded-md text-slate-700 mr-1.5"
                >
                  Edit
                </button>
                <button
                  @click="hapusWarga(w)"
                  class="px-3 py-1.5 text-xs font-medium bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-md"
                >
                  Hapus
                </button>
              </td>
            </tr>
            <tr v-if="!wargaList.length">
              <td :colspan="canManage ? 7 : 6" class="p-8 text-center text-slate-400 text-sm">
                Belum ada data warga terdaftar.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Form Tambah / Edit Warga -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto"
    >
      <div class="bg-white max-w-md w-full rounded-2xl p-6 space-y-4 my-8 shadow-2xl">
        <div class="flex items-center justify-between border-b pb-3 border-slate-100">
          <h4 class="text-lg font-bold text-slate-800">
            {{ editingId ? "Ubah Data Warga" : "Tambah Data Warga Baru" }}
          </h4>
          <button @click="showModal = false" class="text-slate-400 hover:text-slate-600">✕</button>
        </div>

        <div
          v-if="formError"
          class="p-3 bg-rose-50 text-rose-600 rounded-lg text-xs font-medium"
        >
          {{ formError }}
        </div>

        <form @submit.prevent="submitWarga" class="space-y-3">
          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">
              Nama Kepala Keluarga (KK) *
            </label>
            <input
              v-model="form.nama_kk"
              type="text"
              required
              class="w-full p-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
              placeholder="Contoh: Budi Santoso"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1">No. KK (Opsional)</label>
              <input
                v-model="form.no_kk"
                type="text"
                class="w-full p-2.5 border rounded-lg text-sm"
                placeholder="3304..."
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1">RT *</label>
              <input
                v-if="isPetugas"
                :value="auth.user?.rt"
                disabled
                class="w-full p-2.5 border rounded-lg text-sm bg-slate-100 text-slate-600 font-bold"
              />
              <input
                v-else
                v-model="form.rt"
                type="text"
                required
                list="daftar-rt"
                class="w-full p-2.5 border rounded-lg text-sm"
                placeholder="RT 01"
              />
              <datalist id="daftar-rt">
                <option v-for="r in daftarRT" :key="r" :value="r" />
              </datalist>
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">Alamat Rumah</label>
            <input
              v-model="form.alamat"
              type="text"
              class="w-full p-2.5 border rounded-lg text-sm"
              placeholder="Contoh: Jl. Mawar No. 12"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1">No. WhatsApp / HP</label>
              <input
                v-model="form.no_hp"
                type="text"
                class="w-full p-2.5 border rounded-lg text-sm"
                placeholder="08123456789"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1">Status Keaktifan</label>
              <select
                v-model="form.status"
                class="w-full p-2.5 border rounded-lg text-sm bg-white"
              >
                <option value="aktif">Aktif</option>
                <option value="tidak_aktif">Tidak Aktif</option>
              </select>
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-3">
            <button
              type="button"
              @click="showModal = false"
              class="px-4 py-2 border rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              :disabled="submitting"
              class="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition disabled:opacity-50"
            >
              {{ submitting ? "Menyimpan..." : "Simpan Warga" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from "vue";
import api from "../api/axios";
import { useAuthStore } from "../stores/auth";

const auth = useAuthStore();
// Hak kelola warga mencakup superadmin, ketua, sekretaris, bendahara, dan petugas RT
const canManage = computed(() =>
  ["superadmin", "ketua", "sekretaris", "bendahara", "petugas_rt"].includes(auth.userRole)
);
const isPetugas = computed(() => auth.userRole === "petugas_rt");

const wargaList = ref([]);
const daftarRT = ref([]);
const showModal = ref(false);
const editingId = ref(null);
const submitting = ref(false);
const errorMsg = ref("");
const successMsg = ref("");
const formError = ref("");

const filter = reactive({
  rt: isPetugas.value ? auth.user?.rt || "" : "",
  status: "",
  q: "",
});

const form = reactive({
  nama_kk: "",
  no_kk: "",
  rt: "",
  alamat: "",
  no_hp: "",
  status: "aktif",
});

const fetchWarga = async () => {
  try {
    const res = await api.get("/warga", { params: filter });
    wargaList.value = res.data.data;
  } catch (err) {
    console.error(err);
  }
};

const fetchRT = async () => {
  try {
    const res = await api.get("/warga/rekap");
    daftarRT.value = res.data.data.map((r) => r.rt);
  } catch (err) {
    console.error(err);
  }
};

const openModal = (w = null) => {
  formError.value = "";
  editingId.value = w?.id || null;
  form.nama_kk = w?.nama_kk || "";
  form.no_kk = w?.no_kk || "";
  form.rt = w?.rt || (isPetugas.value ? auth.user?.rt || "" : "");
  form.alamat = w?.alamat || "";
  form.no_hp = w?.no_hp || "";
  form.status = w?.status || "aktif";
  showModal.value = true;
};

const submitWarga = async () => {
  submitting.value = true;
  formError.value = "";
  try {
    if (editingId.value) {
      await api.put(`/warga/${editingId.value}`, form);
      successMsg.value = "Data warga berhasil diperbarui!";
    } else {
      await api.post("/warga", form);
      successMsg.value = "Data warga baru berhasil ditambahkan!";
    }
    showModal.value = false;
    await fetchWarga();
    await fetchRT();
    setTimeout(() => (successMsg.value = ""), 4000);
  } catch (err) {
    formError.value =
      err.response?.data?.message || "Gagal menyimpan data warga.";
  } finally {
    submitting.value = false;
  }
};

const hapusWarga = async (w) => {
  if (!confirm(`Hapus data warga ${w.nama_kk}?`)) return;
  try {
    await api.delete(`/warga/${w.id}`);
    successMsg.value = `Warga ${w.nama_kk} berhasil dihapus.`;
    await fetchWarga();
    await fetchRT();
    setTimeout(() => (successMsg.value = ""), 4000);
  } catch (err) {
    errorMsg.value = err.response?.data?.message || "Gagal menghapus warga.";
    setTimeout(() => (errorMsg.value = ""), 4000);
  }
};

watch(filter, () => {
  fetchWarga();
});

onMounted(async () => {
  await fetchRT();
  await fetchWarga();
});
</script>
