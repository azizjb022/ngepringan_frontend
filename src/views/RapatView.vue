<template>
  <div class="space-y-4 sm:space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
      <h3 class="text-lg sm:text-xl font-bold text-slate-800">Jadwal Rapat & Notulensi</h3>
      <button
        v-if="['superadmin', 'sekretaris', 'ketua'].includes(auth.userRole)"
        @click="showModalRapat = true"
        class="self-start sm:self-auto px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium text-xs sm:text-sm transition"
      >
        + Agenda Rapat Baru
      </button>
    </div>

    <!-- List Rapat -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        v-for="r in rapatList"
        :key="r.id"
        class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between"
      >
        <div>
          <div class="flex items-center justify-between">
            <span
              class="px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize"
              :class="
                r.status === 'selesai'
                  ? 'bg-slate-100 text-slate-700'
                  : 'bg-emerald-100 text-emerald-800'
              "
            >
              {{ r.status.replace("_", " ") }}
            </span>
            <span class="text-xs text-slate-400"
              >{{ r.total_hadir || 0 }} Kehadiran</span
            >
          </div>
          <h4 class="font-bold text-slate-800 mt-2 text-base">
            {{ r.judul_rapat }}
          </h4>
          <p class="text-xs text-slate-500 mt-1">📍 {{ r.lokasi }}</p>
          <p class="text-xs text-slate-500">
            ⏰ {{ new Date(r.tanggal_waktu).toLocaleString("id-ID") }}
          </p>
          <p class="text-xs text-slate-600 mt-2 line-clamp-2">
            {{ r.deskripsi }}
          </p>
        </div>

        <div
          class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2"
        >
          <button
            @click="openDetail(r.id)"
            class="px-3 py-1.5 text-xs font-medium border border-slate-300 hover:bg-slate-50 rounded-lg text-slate-700"
          >
            Notulensi & Presensi
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Form Buat Rapat -->
    <div
      v-if="showModalRapat"
      class="fixed inset-0 bg-slate-900/40 flex items-center justify-center p-4 z-50"
    >
      <div class="bg-white max-w-md w-full rounded-xl p-6 space-y-4">
        <h4 class="text-lg font-bold text-slate-800">Buat Agenda Rapat Baru</h4>
        <form @submit.prevent="submitRapat" class="space-y-3">
          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1"
              >Judul Rapat</label
            >
            <input
              v-model="formRapat.judul_rapat"
              type="text"
              required
              class="w-full p-2 border rounded-lg text-sm"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1"
              >Tanggal & Waktu</label
            >
            <input
              v-model="formRapat.tanggal_waktu"
              type="datetime-local"
              required
              class="w-full p-2 border rounded-lg text-sm"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1"
              >Lokasi</label
            >
            <input
              v-model="formRapat.lokasi"
              type="text"
              required
              class="w-full p-2 border rounded-lg text-sm"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1"
              >Deskripsi</label
            >
            <textarea
              v-model="formRapat.deskripsi"
              rows="2"
              class="w-full p-2 border rounded-lg text-sm"
            ></textarea>
          </div>
          <div class="flex justify-end gap-2 pt-2">
            <button
              type="button"
              @click="showModalRapat = false"
              class="px-4 py-2 border rounded-lg text-sm text-slate-600"
            >
              Batal
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium"
            >
              Simpan Agenda
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Detail Notulensi & Presensi -->
    <div
      v-if="selectedRapat"
      class="fixed inset-0 bg-slate-900/40 flex items-center justify-center p-4 z-50"
    >
      <div
        class="bg-white max-w-2xl w-full rounded-xl p-6 space-y-4 max-h-[90vh] overflow-y-auto"
      >
        <div class="flex justify-between items-start border-b pb-3">
          <div>
            <h4 class="text-lg font-bold text-slate-800">
              {{ selectedRapat.rapat.judul_rapat }}
            </h4>
            <p class="text-xs text-slate-500">
              📍 {{ selectedRapat.rapat.lokasi }}
            </p>
          </div>
          <button
            @click="selectedRapat = null"
            class="text-slate-400 hover:text-slate-600 text-lg"
          >
            ✕
          </button>
        </div>

        <!-- Form Simpan Notulensi (Sekretaris) -->
        <div
          v-if="['superadmin', 'sekretaris'].includes(auth.userRole)"
          class="space-y-3"
        >
          <h5 class="text-sm font-bold text-slate-700">Form Notulensi</h5>
          <textarea
            v-model="formNotulensi.isi_notulensi"
            rows="3"
            placeholder="Catatan pembahasan rapat..."
            class="w-full p-2 border rounded-lg text-sm"
          ></textarea>
          <textarea
            v-model="formNotulensi.keputusan"
            rows="2"
            placeholder="Poin-poin keputusan akhir..."
            class="w-full p-2 border rounded-lg text-sm"
          ></textarea>
          <button
            @click="saveNotulensi(selectedRapat.rapat.id)"
            class="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold"
          >
            Simpan Notulensi
          </button>
        </div>

        <!-- Catatan Notulensi Jika Sudah Ada -->
        <div
          v-else-if="selectedRapat.notulensi"
          class="p-4 bg-slate-50 rounded-lg text-sm space-y-2"
        >
          <p class="font-semibold text-slate-800">Isi Notulensi:</p>
          <p class="text-slate-600 whitespace-pre-line">
            {{ selectedRapat.notulensi.isi_notulensi }}
          </p>
          <p class="font-semibold text-slate-800 mt-2">Keputusan:</p>
          <p class="text-slate-600 whitespace-pre-line">
            {{ selectedRapat.notulensi.keputusan }}
          </p>
        </div>

        <!-- Daftar Kehadiran -->
        <div class="pt-2 border-t">
          <h5 class="text-sm font-bold text-slate-700 mb-2">
            Presensi Peserta
          </h5>
          <div class="space-y-1">
            <div
              v-for="p in selectedRapat.presensi"
              :key="p.id"
              class="flex justify-between items-center text-xs py-1.5 px-2 bg-slate-50 rounded"
            >
              <span class="font-medium text-slate-800"
                >{{ p.nama }} ({{ p.rt || "Pengurus" }})</span
              >
              <span class="text-emerald-600 font-semibold uppercase">{{
                p.keterangan
              }}</span>
            </div>
            <p
              v-if="!selectedRapat.presensi.length"
              class="text-xs text-slate-400"
            >
              Belum ada absensi.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import api from "../api/axios";
import { useAuthStore } from "../stores/auth";

const auth = useAuthStore();
const rapatList = ref([]);
const showModalRapat = ref(false);
const selectedRapat = ref(null);

const formRapat = reactive({
  judul_rapat: "",
  tanggal_waktu: "",
  lokasi: "",
  deskripsi: "",
});

const formNotulensi = reactive({
  isi_notulensi: "",
  keputusan: "",
});

const fetchRapat = async () => {
  const res = await api.get("/rapat");
  rapatList.value = res.data.data;
};

const submitRapat = async () => {
  await api.post("/rapat", formRapat);
  showModalRapat.value = false;
  formRapat.judul_rapat = "";
  formRapat.lokasi = "";
  formRapat.deskripsi = "";
  await fetchRapat();
};

const openDetail = async (id) => {
  const res = await api.get(`/rapat/${id}`);
  selectedRapat.value = res.data.data;
  formNotulensi.isi_notulensi =
    selectedRapat.value.notulensi?.isi_notulensi || "";
  formNotulensi.keputusan = selectedRapat.value.notulensi?.keputusan || "";
};

const saveNotulensi = async (rapatId) => {
  await api.post(`/rapat/${rapatId}/notulensi`, formNotulensi);
  await openDetail(rapatId);
  await fetchRapat();
};

onMounted(fetchRapat);
</script>
