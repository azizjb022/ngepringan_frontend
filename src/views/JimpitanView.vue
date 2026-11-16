<template>
  <div :class="{ 'ronda-dark bg-slate-950 text-slate-100 p-4 -m-4 sm:-m-6 sm:p-6 rounded-2xl transition-colors duration-300': isRondaMode }" class="space-y-6">
    <!-- Header (Disembunyikan saat print lembar matriks) -->
    <div class="no-print flex flex-wrap items-start justify-between gap-3">
      <div>
        <div class="flex items-center gap-2">
          <h3 :class="isRondaMode ? 'text-white' : 'text-slate-800'" class="text-xl font-bold">
            Jimpitan per KK
          </h3>
          <span
            v-if="isRondaMode"
            class="px-2 py-0.5 text-xs font-bold bg-amber-400 text-slate-950 rounded-full animate-pulse flex items-center gap-1"
          >
            🌙 Mode Ronda Malam
          </span>
        </div>
        <p :class="isRondaMode ? 'text-slate-300' : 'text-slate-500'" class="text-sm mt-0.5">
          Rp {{ perHari.toLocaleString("id-ID") }} / KK / hari · Pencatatan ronda malam Karang Taruna per RT.
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-wrap items-center gap-2">
        <!-- Cetak Lembar Jimpitan Matriks (Sesuai Format Buku Warga) -->
        <button
          type="button"
          @click="openMatrixModal"
          class="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold border border-indigo-500 flex items-center gap-1.5 transition shadow-sm"
          title="Buka laporan tabel matriks harian tanggal 1-30/31 untuk dicetak"
        >
          📑 Cetak Lembar Matriks
        </button>

        <!-- Toggle Mode Ronda Malam (High Contrast) -->
        <button
          type="button"
          @click="isRondaMode = !isRondaMode"
          :class="isRondaMode ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold' : 'bg-slate-800 text-white hover:bg-slate-900 border-slate-700'"
          class="px-3 py-2 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition shadow-sm"
          title="Tampilan kontras tinggi untuk keliling malam hari"
        >
          <span>{{ isRondaMode ? '☀️ Mode Normal' : '🌙 Mode Ronda Malam' }}</span>
        </button>

        <!-- Kalkulator Hitung Koin -->
        <button
          type="button"
          @click="showCoinModal = true"
          :class="isRondaMode ? 'bg-slate-800 text-emerald-300 border-emerald-500/50' : 'bg-white text-emerald-700 border-emerald-300 hover:bg-emerald-50'"
          class="px-3 py-2 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition shadow-sm"
        >
          🪙 Hitung Koin Pos
        </button>

        <!-- Jadwal & Absensi Ronda -->
        <button
          type="button"
          @click="openJadwalModal"
          :class="isRondaMode ? 'bg-slate-800 text-blue-300 border-blue-500/50' : 'bg-white text-blue-700 border-blue-300 hover:bg-blue-50'"
          class="px-3 py-2 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition shadow-sm"
        >
          📅 Jadwal & Presensi
        </button>

        <!-- Topup Deposit -->
        <button
          type="button"
          @click="openDepositModal()"
          :class="isRondaMode ? 'bg-purple-950 text-purple-200 border-purple-600' : 'bg-purple-50 text-purple-700 border-purple-300 hover:bg-purple-100'"
          class="px-3 py-2 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition shadow-sm"
        >
          💳 + Deposit Warga
        </button>

        <!-- Form Manual Catat Jimpitan -->
        <button
          :disabled="!selectedRT"
          @click="openModal()"
          class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium text-xs transition disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
        >
          + Catat Khusus
        </button>
      </div>
    </div>

    <!-- Alert Notifikasi -->
    <div v-if="successMsg" class="no-print p-3 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-xl text-sm font-medium flex items-center justify-between">
      <span>{{ successMsg }}</span>
      <button @click="successMsg = ''" class="text-xs hover:opacity-75">✕</button>
    </div>
    <div v-if="errorMsg" class="no-print p-3 bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded-xl text-sm font-medium flex items-center justify-between">
      <span>{{ errorMsg }}</span>
      <button @click="errorMsg = ''" class="text-xs hover:opacity-75">✕</button>
    </div>

    <!-- Toolbar: RT, Tanggal, & Aksi Cepat -->
    <div
      :class="isRondaMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'"
      class="no-print p-4 rounded-xl border shadow-sm flex flex-wrap items-end gap-3"
    >
      <div>
        <label :class="isRondaMode ? 'text-slate-300' : 'text-slate-600'" class="block text-xs font-semibold mb-1">
          RT
        </label>
        <!-- Petugas RT: terkunci ke RT sendiri -->
        <div
          v-if="isPetugas"
          class="px-3 py-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-lg text-sm font-bold min-w-[120px]"
        >
          {{ lockedRT || "RT belum diatur" }}
        </div>
        <!-- Admin/pengurus: pilih RT -->
        <select
          v-else
          v-model="selectedRT"
          :class="isRondaMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-800'"
          class="p-2 border rounded-lg text-sm min-w-[150px] focus:ring-2 focus:ring-emerald-500 focus:outline-none"
        >
          <option value="">— Pilih RT —</option>
          <option v-for="r in daftarRT" :key="r" :value="r">{{ r }}</option>
        </select>
      </div>

      <div>
        <label :class="isRondaMode ? 'text-slate-300' : 'text-slate-600'" class="block text-xs font-semibold mb-1">
          Tanggal Ronda
        </label>
        <input
          v-model="selectedDate"
          type="date"
          :class="isRondaMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-800'"
          class="p-2 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
        />
      </div>

      <button
        @click="refreshAll"
        :class="isRondaMode ? 'border-slate-700 hover:bg-slate-800 text-slate-200' : 'border-slate-300 hover:bg-slate-50 text-slate-700'"
        class="px-3 py-2 border rounded-lg text-sm transition"
      >
        🔄 Muat Ulang
      </button>

      <!-- Auto Deduct Potong Deposit Massal -->
      <button
        v-if="selectedRT"
        @click="autoDeductAllDeposit"
        :disabled="deductingDeposit"
        :class="isRondaMode ? 'bg-purple-900 hover:bg-purple-800 text-purple-200 border-purple-700' : 'bg-purple-100 hover:bg-purple-200 text-purple-800 border-purple-300'"
        class="px-3 py-2 border rounded-lg text-xs font-bold flex items-center gap-1.5 transition ml-auto disabled:opacity-50"
        title="Otomatis potong jimpitan hari ini bagi semua warga yang memiliki saldo deposit"
      >
        <span>⚡ Potong Semua Deposit Warga</span>
      </button>
    </div>

    <!-- Belum pilih RT (admin) -->
    <div
      v-if="!selectedRT"
      :class="isRondaMode ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-300 text-slate-400'"
      class="no-print p-10 rounded-xl border border-dashed text-center"
    >
      Silakan pilih RT terlebih dahulu untuk menampilkan data warga dan jimpitan.
    </div>

    <template v-else>
      <!-- Stat Cards Ringkasan Pengambilan -->
      <div class="no-print space-y-3">
        <div class="flex items-center justify-between">
          <h4 :class="isRondaMode ? 'text-white' : 'text-slate-800'" class="font-bold text-base">
            Progres Ronda {{ selectedRT }} — {{ formatTanggal(selectedDate) }}
          </h4>
          <span class="text-xs text-slate-400">Sinkronisasi tiap 15 detik</span>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div :class="isRondaMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'" class="p-3.5 rounded-xl border shadow-sm">
            <p class="text-xs text-slate-400">Total KK Aktif</p>
            <p :class="isRondaMode ? 'text-white' : 'text-slate-800'" class="text-xl font-black mt-1">
              {{ progress?.total_kk ?? 0 }}
            </p>
          </div>

          <div :class="isRondaMode ? 'bg-slate-900 border-emerald-800/40' : 'bg-white border-emerald-200'" class="p-3.5 rounded-xl border shadow-sm">
            <p class="text-xs text-emerald-400">✓ Sudah Terbayar</p>
            <p class="text-xl font-black text-emerald-500 mt-1">
              {{ progress?.sudah ?? 0 }}
            </p>
          </div>

          <div :class="isRondaMode ? 'bg-slate-900 border-amber-800/40' : 'bg-white border-amber-200'" class="p-3.5 rounded-xl border shadow-sm">
            <p class="text-xs text-amber-400">⏳ Belum Lunas</p>
            <p class="text-xl font-black text-amber-500 mt-1">
              {{ progress?.belum ?? 0 }}
            </p>
          </div>

          <div :class="isRondaMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'" class="p-3.5 rounded-xl border shadow-sm">
            <p class="text-xs text-slate-400">Nihil / Tutup Mudik</p>
            <p :class="isRondaMode ? 'text-slate-300' : 'text-slate-600'" class="text-xl font-black mt-1">
              {{ (progress?.counts?.kosong_nihil || 0) + (progress?.counts?.rumah_tutup_mudik || 0) }}
            </p>
          </div>

          <div :class="isRondaMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'" class="p-3.5 rounded-xl border shadow-sm col-span-2 md:col-span-1">
            <p class="text-xs text-slate-400">Uang Terkumpul</p>
            <p :class="isRondaMode ? 'text-emerald-400' : 'text-emerald-700'" class="text-base font-bold mt-1">
              Rp {{ Number(progress?.total_terkumpul || 0).toLocaleString("id-ID") }}
            </p>
            <p class="text-[11px] text-slate-400">
              dari target Rp {{ Number(progress?.target || 0).toLocaleString("id-ID") }}
            </p>
          </div>
        </div>

        <!-- Progress bar -->
        <div :class="isRondaMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'" class="p-4 rounded-xl border shadow-sm">
          <div class="w-full h-3 bg-slate-800/20 rounded-full overflow-hidden">
            <div
              class="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
              :style="{ width: persenProgress + '%' }"
            ></div>
          </div>
          <div class="flex justify-between text-xs text-slate-400 mt-2 font-medium">
            <span>{{ persenProgress }}% selesai keliling</span>
            <span v-if="progress?.per_petugas?.length">
              <span v-for="(p, i) in progress.per_petugas" :key="p.petugas">
                <span v-if="i > 0"> · </span>
                {{ p.petugas }}: {{ p.jumlah }} KK (Rp {{ Number(p.nominal).toLocaleString('id-ID') }})
              </span>
            </span>
          </div>
        </div>

        <!-- TABEL WARGA & TOMBOL BAYAR DENGAN MODAL KEKURANGAN -->
        <div
          :class="isRondaMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'"
          class="rounded-xl border overflow-hidden shadow-sm"
        >
          <div class="p-3.5 border-b border-slate-200/50 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h5 :class="isRondaMode ? 'text-white' : 'text-slate-800'" class="font-bold text-sm">
                Daftar Rumah Ronda — {{ selectedRT }}
              </h5>
              <p class="text-xs text-slate-400">
                Klik tombol <b>Bayar</b> untuk menampilkan jumlah hari dan uang kekurangan yang bisa disesuaikan.
              </p>
            </div>

            <!-- Filter Status -->
            <div class="flex items-center gap-1.5 text-xs">
              <button
                @click="filterTabel = 'all'"
                :class="filterTabel === 'all' ? 'bg-emerald-600 text-white' : (isRondaMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600')"
                class="px-2.5 py-1 rounded-md font-semibold transition"
              >
                Semua ({{ progress?.warga?.length || 0 }})
              </button>
              <button
                @click="filterTabel = 'belum'"
                :class="filterTabel === 'belum' ? 'bg-amber-600 text-white' : (isRondaMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600')"
                class="px-2.5 py-1 rounded-md font-semibold transition"
              >
                Belum Lunas ({{ progress?.belum || 0 }})
              </button>
              <button
                @click="filterTabel = 'sudah'"
                :class="filterTabel === 'sudah' ? 'bg-emerald-700 text-white' : (isRondaMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600')"
                class="px-2.5 py-1 rounded-md font-semibold transition"
              >
                Lunas ({{ progress?.sudah || 0 }})
              </button>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead
                :class="isRondaMode ? 'bg-slate-950 text-slate-400 border-slate-800' : 'bg-slate-50 text-slate-600 border-slate-200'"
                class="text-xs uppercase font-semibold border-b"
              >
                <tr>
                  <th class="p-3">Nama KK</th>
                  <th class="p-3">Alamat / Saldo</th>
                  <th class="p-3">Status Lapangan</th>
                  <th class="p-3">Status Nominal</th>
                  <th class="p-3">Petugas</th>
                  <th class="p-3 text-center min-w-[220px]">Aksi Ronda</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100/10 text-sm">
                <tr
                  v-for="w in filteredWargaList"
                  :key="w.id"
                  :class="[
                    isRondaMode
                      ? (w.sudah_bayar ? 'hover:bg-slate-800/60' : 'bg-amber-950/20 hover:bg-amber-950/30')
                      : (w.sudah_bayar ? 'hover:bg-slate-50' : 'bg-amber-50/40 hover:bg-amber-50/70'),
                    quickLoadingId === w.id ? 'opacity-60 pointer-events-none' : ''
                  ]"
                  class="transition-colors"
                >
                  <!-- Nama KK -->
                  <td class="p-3">
                    <p :class="isRondaMode ? 'text-white' : 'text-slate-800'" class="font-bold">
                      {{ w.nama_kk }}
                    </p>
                    <p class="text-xs text-slate-400 font-mono">{{ w.no_kk || '-' }}</p>
                  </td>

                  <!-- Alamat & Saldo Deposit -->
                  <td class="p-3 text-xs">
                    <p :class="isRondaMode ? 'text-slate-300' : 'text-slate-600'">{{ w.alamat || '-' }}</p>
                    <div v-if="w.saldo_deposit > 0" class="mt-0.5 inline-flex items-center gap-1 font-bold text-purple-400">
                      <span>💳 Deposit: Rp {{ Number(w.saldo_deposit).toLocaleString('id-ID') }}</span>
                    </div>
                  </td>

                  <!-- Status Lapangan Badge -->
                  <td class="p-3">
                    <span
                      class="px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 shadow-xs"
                      :class="statusBadge(w)"
                    >
                      <span>{{ statusIcon(w) }}</span>
                      <span>{{ statusText(w) }}</span>
                    </span>
                    <p v-if="w.catatan_lapangan" class="text-[11px] text-slate-400 mt-0.5 italic">
                      "{{ w.catatan_lapangan }}"
                    </p>
                  </td>

                  <!-- Status Nominal (Jika kosong/nihil maka nominal_kurang TIDAK 0!) -->
                  <td class="p-3 font-semibold">
                    <template v-if="w.sudah_bayar">
                      <span class="text-emerald-500 font-bold">
                        Rp {{ Number(w.nominal).toLocaleString("id-ID") }}
                      </span>
                      <span v-if="w.metode_bayar === 'deposit'" class="block text-[10px] text-purple-400 font-normal">
                        (Deposit)
                      </span>
                    </template>
                    <template v-else>
                      <div class="text-rose-500 font-bold text-xs">
                        Kurang: Rp {{ Number(w.nominal_kurang || perHari).toLocaleString("id-ID") }}
                      </div>
                      <span class="text-[10px] text-slate-400">
                        ({{ w.hari_kurang || 1 }} hari)
                      </span>
                    </template>
                  </td>

                  <!-- Petugas Ronda -->
                  <td class="p-3 text-xs text-slate-400">
                    <p :class="isRondaMode ? 'text-slate-200' : 'text-slate-700'" class="font-medium">{{ w.petugas || '-' }}</p>
                    <p v-if="w.updated_by_nama && w.updated_by_nama !== w.petugas" class="text-[10px] text-amber-500 italic">
                      Ubah: {{ w.updated_by_nama }}
                    </p>
                  </td>

                  <!-- Aksi Ronda: Tombol Bayar & Status Lapangan -->
                  <td class="p-3 text-center">
                    <!-- Belum Lunas: Tombol Bayar & Opsi Lapangan -->
                    <div v-if="!w.sudah_bayar" class="flex flex-wrap items-center justify-center gap-1.5">
                      <!-- TOMBOL BAYAR UTAMA (Membuka modal uang kekurangan & jumlah hari) -->
                      <button
                        type="button"
                        @click="openBayarModal(w)"
                        class="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-sm flex items-center gap-1"
                      >
                        <span>💵 Bayar</span>
                      </button>

                      <!-- Quick Button Nihil (Kaleng Kosong) -->
                      <button
                        type="button"
                        @click="quickAction(w, 'kosong_nihil')"
                        class="px-2 py-1.5 bg-amber-600/80 hover:bg-amber-600 text-white rounded-lg text-xs font-medium transition"
                        title="Wadah ada tetapi tidak ada uang receh (nominal kurang tetap tercatat tidak 0)"
                      >
                        ○ Nihil
                      </button>

                      <!-- Quick Button Rumah Tutup / Mudik -->
                      <button
                        type="button"
                        @click="quickAction(w, 'rumah_tutup_mudik')"
                        class="px-2 py-1.5 bg-slate-600 hover:bg-slate-700 text-white rounded-lg text-xs font-medium transition"
                        title="Rumah gelap / tutup / warga bepergian"
                      >
                        🏠 Tutup
                      </button>

                      <!-- Tombol Potong Deposit langsung jika saldo mencukupi -->
                      <button
                        v-if="w.saldo_deposit >= perHari"
                        type="button"
                        @click="openBayarModal(w, true)"
                        class="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition shadow-sm flex items-center gap-1"
                        title="Bayar dengan saldo deposit warga"
                      >
                        ⚡ Depo
                      </button>
                    </div>

                    <!-- Sudah Lunas: Tombol Ubah / WhatsApp -->
                    <div v-else class="flex items-center justify-center gap-2">
                      <button
                        v-if="w.status_setor === 'pending'"
                        @click="openModal(w)"
                        class="px-2.5 py-1 border border-amber-400 text-amber-400 hover:bg-amber-400/10 text-xs font-medium rounded-md transition"
                      >
                        Ubah
                      </button>

                      <!-- Tombol WhatsApp Notifikasi Warga -->
                      <button
                        type="button"
                        @click="sendWhatsApp(w)"
                        class="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 text-xs font-semibold rounded-md transition flex items-center gap-1"
                        title="Kirim konfirmasi WhatsApp ke warga"
                      >
                        <span>💬 WA</span>
                      </button>
                    </div>
                  </td>
                </tr>

                <tr v-if="!filteredWargaList.length">
                  <td colspan="6" class="p-8 text-center text-slate-400 text-sm">
                    Tidak ada data warga dengan filter ini di {{ selectedRT }}.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Rekap bulan ini (RT terpilih) -->
      <div v-if="rekapSelected" class="no-print space-y-3">
        <h4 :class="isRondaMode ? 'text-white' : 'text-slate-800'" class="font-bold text-base">
          Rekap {{ selectedRT }} — {{ namaBulan }} {{ rekapPeriode.tahun }}
        </h4>
        <div :class="isRondaMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'" class="p-5 rounded-xl border shadow-sm">
          <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <p class="text-xs text-slate-400">KK Aktif</p>
              <p :class="isRondaMode ? 'text-white' : 'text-slate-800'" class="text-lg font-bold">
                {{ rekapSelected.kk_aktif }}
              </p>
            </div>
            <div>
              <p class="text-xs text-slate-400">Terkumpul</p>
              <p class="text-lg font-bold text-emerald-500">
                Rp {{ Number(rekapSelected.total_terkumpul).toLocaleString("id-ID") }}
              </p>
            </div>
            <div>
              <p class="text-xs text-slate-400">Belum Disetor (Kas Petugas)</p>
              <p class="text-lg font-bold text-amber-500">
                Rp {{ Number(rekapSelected.total_pending).toLocaleString("id-ID") }}
              </p>
              <div v-if="rekapSelected.pending_info?.total_hari > 0" class="mt-1">
                <p class="text-[11px] font-semibold text-amber-600 dark:text-amber-400 leading-tight">
                  📅 {{ rekapSelected.pending_info.total_hari }} Hari ({{ formatTanggal(rekapSelected.pending_info.dari_tanggal) }} s/d {{ formatTanggal(rekapSelected.pending_info.sampai_tanggal) }})
                </p>
                <button
                  type="button"
                  @click="openPendingDetailModal(rekapSelected.rt)"
                  class="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-bold mt-0.5 inline-block"
                >
                  Lihat Tanggal &rarr;
                </button>
              </div>
              <p v-else class="text-[11px] text-slate-400 mt-1">Nihil / Sudah disetor semua</p>
            </div>
            <div>
              <p class="text-xs text-slate-400">Menunggu Validasi</p>
              <p class="text-lg font-bold text-blue-400">
                Rp {{ Number(rekapSelected.total_diajukan || 0).toLocaleString("id-ID") }}
              </p>
            </div>
            <div>
              <p class="text-xs text-slate-400">Target Sebulan</p>
              <p class="text-lg font-bold text-slate-400">
                Rp {{ Number(rekapSelected.target_bulan_ini).toLocaleString("id-ID") }}
              </p>
            </div>
          </div>

          <div class="mt-4 pt-4 border-t border-slate-200/20 flex flex-wrap items-center justify-between gap-3">
            <button
              v-if="rekapSelected.total_pending > 0 && ['superadmin', 'bendahara', 'petugas_rt'].includes(auth.userRole)"
              @click="openSetorModal(rekapSelected.rt)"
              class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition shadow-sm"
            >
              Ajukan Setoran Rp {{ Number(rekapSelected.total_pending).toLocaleString("id-ID") }} ke Bendahara
            </button>
            <span v-else class="text-xs text-slate-400">
              Tidak ada setoran pending di RT ini.
            </span>
          </div>
        </div>
      </div>
    </template>

    <!-- MODAL BARU: PEMBAYARAN JIMPITAN (UANG KEKURANGAN & JUMLAH HARI DAPAT DIATUR) -->
    <div
      v-if="showBayarModal"
      class="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto"
    >
      <div :class="isRondaMode ? 'bg-slate-900 border border-slate-700 text-white' : 'bg-white text-slate-800'" class="max-w-md w-full rounded-2xl p-6 shadow-2xl space-y-4 my-8">
        <div class="flex items-center justify-between border-b pb-3 border-slate-200/20">
          <div>
            <h4 class="text-lg font-bold flex items-center gap-2">
              💵 Pembayaran Jimpitan
            </h4>
            <p class="text-xs text-slate-400">
              Sesuaikan jumlah hari yang ingin dilunasi warga saat pengambilan.
            </p>
          </div>
          <button @click="showBayarModal = false" class="text-slate-400 hover:text-white text-lg">✕</button>
        </div>

        <!-- Info KK & Tunggakan -->
        <div :class="isRondaMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'" class="p-3.5 rounded-xl border space-y-2">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-base font-bold text-slate-900 dark:text-white">{{ bayarTarget?.nama_kk }}</p>
              <p class="text-xs text-slate-400">{{ bayarTarget?.alamat || '-' }} · {{ selectedRT }}</p>
            </div>
            <span class="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-400">
              {{ bayarTarget?.status_lapangan === 'kosong_nihil' ? 'Nihil / Kosong' : 'Belum Lunas' }}
            </span>
          </div>

          <!-- Total Kekurangan Terhitung -->
          <div class="pt-2 border-t border-slate-200/20 flex justify-between items-center text-xs">
            <span class="text-slate-400 font-medium">Uang Kekurangan Terdata:</span>
            <span class="text-rose-500 font-black text-sm">
              Rp {{ Number(bayarTarget?.nominal_kurang || perHari).toLocaleString('id-ID') }}
              <span class="text-slate-400 font-normal">({{ bayarTarget?.hari_kurang || 1 }} hari)</span>
            </span>
          </div>

          <div v-if="Number(bayarTarget?.saldo_deposit || 0) > 0" class="flex justify-between items-center text-xs font-semibold text-purple-400">
            <span>Saldo Deposit Tersedia:</span>
            <span>Rp {{ Number(bayarTarget?.saldo_deposit || 0).toLocaleString('id-ID') }}</span>
          </div>
        </div>

        <!-- Info Alokasi FIFO -->
        <div class="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl text-xs text-blue-300 flex items-start gap-2">
          <span class="text-sm">ℹ️</span>
          <div>
            <p class="font-bold text-blue-400">Sistem FIFO (Pelunasan Utang Tertua):</p>
            <p class="text-[11px] text-slate-300 mt-0.5">
              Pembayaran {{ bayarForm.jumlah_hari }} hari ini akan melunasi tunggakan mulai dari tanggal paling awal yang belum lunas.
            </p>
          </div>
        </div>

        <form @submit.prevent="submitBayar" class="space-y-4">
          <!-- Input Jumlah Hari dengan Counter [-] [+] -->
          <div>
            <label class="block text-xs font-bold mb-1.5">Jumlah Hari yang Dibayarkan</label>
            <div class="flex items-center gap-2">
              <button
                type="button"
                @click="bayarForm.jumlah_hari = Math.max(1, bayarForm.jumlah_hari - 1)"
                class="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-black text-lg hover:bg-slate-300 dark:hover:bg-slate-700 flex items-center justify-center transition"
              >
                -
              </button>
              <input
                v-model.number="bayarForm.jumlah_hari"
                type="number"
                min="1"
                required
                :class="isRondaMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-800'"
                class="flex-1 p-2.5 border rounded-xl text-center text-lg font-black focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                @click="bayarForm.jumlah_hari = bayarForm.jumlah_hari + 1"
                class="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-black text-lg hover:bg-slate-300 dark:hover:bg-slate-700 flex items-center justify-center transition"
              >
                +
              </button>
            </div>

            <!-- Shortcut Penambahan Hari Cepat -->
            <div class="flex flex-wrap gap-1.5 mt-2">
              <button
                type="button"
                @click="bayarForm.jumlah_hari = 1"
                class="px-2.5 py-1 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg"
              >
                1 Hari (Rp {{ perHari.toLocaleString('id-ID') }})
              </button>
              <button
                type="button"
                @click="bayarForm.jumlah_hari = 7"
                class="px-2.5 py-1 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg"
              >
                1 Minggu (7 Hari)
              </button>
              <button
                type="button"
                @click="bayarForm.jumlah_hari = 30"
                class="px-2.5 py-1 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg"
              >
                1 Bulan (30 Hari)
              </button>
              <button
                v-if="bayarTarget?.hari_kurang && bayarTarget.hari_kurang > 1"
                type="button"
                @click="bayarForm.jumlah_hari = bayarTarget.hari_kurang"
                class="px-2.5 py-1 text-xs font-bold bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 rounded-lg"
              >
                Lunasi Semua ({{ bayarTarget.hari_kurang }} Hari)
              </button>
            </div>
          </div>

          <!-- Pilihan Metode Pembayaran -->
          <div>
            <label class="block text-xs font-bold mb-1.5">Metode Pembayaran</label>
            <div class="grid grid-cols-2 gap-2">
              <label
                :class="bayarForm.metode_bayar === 'tunai' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-slate-300 dark:border-slate-700 text-slate-400'"
                class="flex items-center gap-2 p-2.5 border rounded-xl cursor-pointer text-xs font-bold"
              >
                <input type="radio" value="tunai" v-model="bayarForm.metode_bayar" class="accent-emerald-600" />
                <span>💵 Uang Tunai</span>
              </label>

              <label
                :class="bayarForm.metode_bayar === 'deposit' ? 'border-purple-500 bg-purple-500/10 text-purple-400' : 'border-slate-300 dark:border-slate-700 text-slate-400'"
                class="flex items-center gap-2 p-2.5 border rounded-xl cursor-pointer text-xs font-bold"
              >
                <input
                  type="radio"
                  value="deposit"
                  v-model="bayarForm.metode_bayar"
                  :disabled="(bayarTarget?.saldo_deposit || 0) < (bayarForm.jumlah_hari * perHari)"
                  class="accent-purple-600"
                />
                <span>💳 Potong Saldo Depo</span>
              </label>
            </div>
          </div>

          <!-- Total Yang Harus Dibayar -->
          <div :class="isRondaMode ? 'bg-emerald-950/40 border-emerald-800' : 'bg-emerald-50 border-emerald-200'" class="p-3.5 rounded-xl border flex items-center justify-between">
            <div>
              <p class="text-xs text-slate-500 dark:text-emerald-300 font-medium">Total Diterima Petugas:</p>
              <p class="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                Rp {{ (bayarForm.jumlah_hari * perHari).toLocaleString('id-ID') }}
              </p>
            </div>
            <span class="text-xs text-slate-400">
              {{ bayarForm.jumlah_hari }} hari × Rp {{ perHari.toLocaleString('id-ID') }}
            </span>
          </div>

          <div class="flex justify-end gap-2 pt-2">
            <button
              type="button"
              @click="showBayarModal = false"
              class="px-4 py-2 border rounded-xl text-xs text-slate-400 hover:text-white"
            >
              Batal
            </button>
            <button
              type="submit"
              :disabled="bayarSubmitting"
              class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md transition disabled:opacity-50"
            >
              {{ bayarSubmitting ? 'Memproses...' : `Konfirmasi Bayar Rp ${(bayarForm.jumlah_hari * perHari).toLocaleString('id-ID')}` }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL 6: CETAK LEMBAR MATRIKS JIMPITAN WARGA (SESUAI GAMBAR DAFTAR JIMPITAN WARGA) -->
    <div
      v-if="showMatrixModal"
      class="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto"
    >
      <div class="bg-white text-slate-900 w-full max-w-6xl rounded-2xl shadow-2xl p-4 sm:p-6 space-y-4 my-4 max-h-[95vh] overflow-y-auto print:max-h-none print:shadow-none print:p-0 print:m-0 print:border-none print:rounded-none">
        <!-- Toolbar Atas Modal (Disembunyikan saat print) -->
        <div class="no-print flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div>
            <h4 class="text-lg font-bold text-slate-800 flex items-center gap-2">
              📑 Lembar Buku Jimpitan Warga (Format Matriks)
            </h4>
            <p class="text-xs text-slate-500">
              Format matriks harian per warga siap dicetak untuk arsip RT / musyawarah.
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <!-- Pilihan Mode: Bulanan vs Rentang Tanggal -->
            <div class="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-semibold">
              <button
                type="button"
                @click="matrixMode = 'bulanan'; fetchMatrixData()"
                :class="matrixMode === 'bulanan' ? 'bg-white shadow-xs text-indigo-700 font-bold' : 'text-slate-600'"
                class="px-2.5 py-1 rounded-md transition"
              >
                Bulanan
              </button>
              <button
                type="button"
                @click="matrixMode = 'rentang'; fetchMatrixData()"
                :class="matrixMode === 'rentang' ? 'bg-white shadow-xs text-indigo-700 font-bold' : 'text-slate-600'"
                class="px-2.5 py-1 rounded-md transition"
              >
                Rentang Tanggal
              </button>
            </div>

            <!-- Filter Bulan & Tahun (Jika Mode Bulanan) -->
            <template v-if="matrixMode === 'bulanan'">
              <select
                v-model.number="matrixPeriode.bulan"
                @change="fetchMatrixData"
                class="p-1.5 border rounded-lg text-xs bg-white font-medium"
              >
                <option v-for="(b, i) in daftarBulanList" :key="i + 1" :value="i + 1">{{ b }}</option>
              </select>
              <input
                v-model.number="matrixPeriode.tahun"
                @change="fetchMatrixData"
                type="number"
                class="w-16 p-1.5 border rounded-lg text-xs text-center font-medium"
              />
            </template>

            <!-- Filter Rentang Tanggal (Jika Mode Rentang) -->
            <template v-else>
              <input
                v-model="matrixRentang.dari"
                @change="fetchMatrixData"
                type="date"
                class="p-1 border rounded-lg text-xs bg-white font-medium"
              />
              <span class="text-xs text-slate-400">s/d</span>
              <input
                v-model="matrixRentang.sampai"
                @change="fetchMatrixData"
                type="date"
                class="p-1 border rounded-lg text-xs bg-white font-medium"
              />
            </template>

            <!-- Tombol Unduh CSV -->
            <button
              @click="exportMatrixCsv"
              class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-300"
            >
              Unduh CSV
            </button>

            <!-- Tombol Cetak Dokumen -->
            <button
              @click="printMatrix"
              class="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm flex items-center gap-1"
            >
              🖨️ Cetak
            </button>

            <button
              @click="showMatrixModal = false"
              class="p-1.5 text-slate-400 hover:text-slate-600 text-lg ml-1"
            >
              ✕
            </button>
          </div>
        </div>

        <div v-if="matrixLoading" class="py-12 text-center text-slate-400 text-sm">
          Memuat data lembar matriks jimpitan...
        </div>

        <!-- AREA CETAK LAPORAN MATRIKS (PERSIS SEPERTI GAMBAR) -->
        <div v-else-if="matrixData" class="print-area font-sans">
          <!-- Kop Judul Laporan Sesuai Gambar -->
          <div class="text-center space-y-1 mb-5">
            <h2 class="text-base sm:text-lg font-bold tracking-wide uppercase text-black">
              {{ matrixCustomJudul || `DAFTAR JIMPITAN WARGA ${matrixData.header.rt} ${matrixData.header.wilayah}` }}
            </h2>
            <p class="text-xs font-semibold text-black tracking-wider uppercase">
              PERIODE : {{ matrixData.header.periode }}
            </p>
          </div>

          <!-- Tabel Matriks Garis Tegas Sesuai Gambar -->
          <div class="overflow-x-auto">
            <table class="matrix-table w-full border-collapse border-2 border-black text-center text-[10px] sm:text-xs text-black">
              <thead>
                <tr>
                  <th rowspan="2" class="border border-black p-1 w-8 font-bold bg-slate-100 print:bg-transparent">No</th>
                  <th rowspan="2" class="border border-black p-1 text-left px-2 font-bold min-w-[130px] sm:min-w-[160px] bg-slate-100 print:bg-transparent">
                    NAMA
                  </th>
                  <th
                    v-if="matrixData.mode === 'bulanan'"
                    rowspan="2"
                    class="border border-black p-1 text-center font-bold px-1.5 bg-amber-50 print:bg-transparent text-[9px] sm:text-[10px]"
                    title="Tunggakan dari bulan-bulan sebelum bulan ini"
                  >
                    SISA LALU
                  </th>
                  <th :colspan="(matrixData.hari_list_detail || matrixData.hari_list).length" class="border border-black p-1 font-bold uppercase tracking-wider bg-slate-100 print:bg-transparent">
                    TANGGAL
                  </th>
                  <th rowspan="2" class="border border-black p-1 font-bold px-2 bg-slate-100 print:bg-transparent">TOTAL (Rp)</th>
                  <th rowspan="2" class="border border-black p-1 font-bold px-1 bg-slate-100 print:bg-transparent">HARI</th>
                </tr>
                <tr>
                  <th
                    v-for="d in (matrixData.hari_list_detail || [])"
                    :key="d.key"
                    class="border border-black p-0.5 w-6 sm:w-7 font-bold bg-slate-50 print:bg-transparent text-[9px]"
                  >
                    {{ d.label }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="row in matrixData.rows"
                  :key="row.id"
                  class="hover:bg-slate-50 print:hover:bg-transparent"
                >
                  <td class="border border-black p-1 font-medium">{{ row.no }}.</td>
                  <td class="border border-black p-1 text-left px-2 font-bold uppercase whitespace-nowrap">
                    {{ row.nama_kk }}
                  </td>
                  <td
                    v-if="matrixData.mode === 'bulanan'"
                    class="border border-black p-0.5 text-center font-medium text-[9px] whitespace-nowrap"
                    :class="row.tunggakan_lalu_hari ? 'text-rose-600 font-bold bg-rose-50/50 print:bg-transparent' : 'text-slate-400'"
                  >
                    {{ row.tunggakan_lalu_hari ? row.tunggakan_lalu_hari + ' hr' : '-' }}
                  </td>
                  <td
                    v-for="d in (matrixData.hari_list_detail || [])"
                    :key="d.key"
                    class="border border-black p-0.5 text-center font-bold"
                    :class="row.days[d.key]?.paid ? 'text-emerald-700 print:text-black font-black' : ''"
                  >
                    {{ row.days[d.key]?.symbol || '' }}
                  </td>
                  <td class="border border-black p-1 text-right px-1.5 font-bold whitespace-nowrap">
                    {{ row.total_nominal ? row.total_nominal.toLocaleString('id-ID') : '-' }}
                  </td>
                  <td class="border border-black p-1 font-medium">
                    {{ row.total_hari || 0 }}
                  </td>
                </tr>

                <!-- Baris Ringkasan Total Harian di Bawah -->
                <tr class="font-bold bg-slate-100 print:bg-transparent border-t-2 border-black">
                  <td :colspan="matrixData.mode === 'bulanan' ? 3 : 2" class="border border-black p-1 text-right pr-2">
                    JUMLAH (Rp)
                  </td>
                  <td
                    v-for="d in (matrixData.hari_list_detail || [])"
                    :key="d.key"
                    class="border border-black p-0.5 text-[8px] sm:text-[9px] font-semibold"
                  >
                    {{ matrixData.daily_totals[d.key] ? (matrixData.daily_totals[d.key] >= 1000 ? Math.round(matrixData.daily_totals[d.key] / 1000) + 'k' : matrixData.daily_totals[d.key]) : '' }}
                  </td>
                  <td class="border border-black p-1 text-right px-1.5 font-black">
                    Rp {{ Number(matrixData.grand_total).toLocaleString('id-ID') }}
                  </td>
                  <td class="border border-black p-1 font-black">
                    {{ matrixData.rows.reduce((s, r) => s + r.total_hari, 0) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Keterangan Simbol & Tanda Tangan Cetak -->
          <div class="mt-4 flex flex-wrap items-end justify-between text-xs text-black pt-3">
            <div class="text-[11px] space-y-0.5">
              <p><b>Keterangan Simbol & Kebijakan:</b></p>
              <p>• <b>✓</b> = Telah Diterima (Lunas)</p>
              <p>• <b>○</b> = Wadah Ada tapi Nihil / Kosong</p>
              <p>• <b>T</b> = Rumah Tutup / Warga Mudik</p>
              <p>• <b>Sistem FIFO</b> = Pembayaran melunasi tunggakan hari tertua terlebih dahulu.</p>
              <p>• Tarif: Rp {{ perHari.toLocaleString('id-ID') }} / KK / Hari</p>
            </div>

            <div class="text-center pr-6 print:pr-10 pt-4">
              <p class="text-xs">Dusun Ngepringan, .............................. 2026</p>
              <p class="text-xs font-semibold mt-1">Ketua Regu Ronda / Petugas RT</p>
              <div class="h-14"></div>
              <p class="text-xs font-bold border-b border-black inline-block px-8">( ............................................ )</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL 1: KALKULATOR HITUNG KOIN POS RONDA -->
    <div
      v-if="showCoinModal"
      class="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto"
    >
      <div :class="isRondaMode ? 'bg-slate-900 border border-slate-700 text-white' : 'bg-white text-slate-800'" class="max-w-lg w-full rounded-2xl p-6 shadow-2xl space-y-4 my-8">
        <div class="flex items-center justify-between border-b pb-3 border-slate-200/20">
          <div>
            <h4 class="text-lg font-black flex items-center gap-2">
              🪙 Kalkulator Koin & Pecahan Pos
            </h4>
            <p class="text-xs text-slate-400">
              Cocokkan uang fisik di kaleng ronda dengan total catatan sistem.
            </p>
          </div>
          <button @click="showCoinModal = false" class="text-slate-400 hover:text-white text-lg">✕</button>
        </div>

        <!-- Pecahan Koin -->
        <div>
          <p class="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">Uang Logam / Koin</p>
          <div class="grid grid-cols-2 gap-2.5">
            <div
              v-for="den in koinDenominations"
              :key="den.value"
              :class="isRondaMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'"
              class="p-2.5 rounded-xl border flex items-center justify-between gap-2"
            >
              <div>
                <p class="text-xs font-bold">Rp {{ den.value.toLocaleString('id-ID') }}</p>
                <p class="text-[11px] text-slate-400">= Rp {{ ((coinCounts[den.value] || 0) * den.value).toLocaleString('id-ID') }}</p>
              </div>
              <input
                v-model.number="coinCounts[den.value]"
                type="number"
                min="0"
                placeholder="0 keping"
                :class="isRondaMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-800'"
                class="w-20 p-1.5 border rounded-lg text-sm text-right font-bold focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        <!-- Pecahan Kertas -->
        <div>
          <p class="text-xs font-bold uppercase tracking-wider text-blue-400 mb-2">Uang Kertas</p>
          <div class="grid grid-cols-2 gap-2.5">
            <div
              v-for="den in kertasDenominations"
              :key="den.value"
              :class="isRondaMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'"
              class="p-2.5 rounded-xl border flex items-center justify-between gap-2"
            >
              <div>
                <p class="text-xs font-bold">Rp {{ den.value.toLocaleString('id-ID') }}</p>
                <p class="text-[11px] text-slate-400">= Rp {{ ((coinCounts[den.value] || 0) * den.value).toLocaleString('id-ID') }}</p>
              </div>
              <input
                v-model.number="coinCounts[den.value]"
                type="number"
                min="0"
                placeholder="0 lembar"
                :class="isRondaMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-800'"
                class="w-20 p-1.5 border rounded-lg text-sm text-right font-bold focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        <!-- Ringkasan Komparasi Fisik vs Sistem -->
        <div :class="isRondaMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-300'" class="p-4 rounded-xl border space-y-2">
          <div class="flex justify-between text-xs">
            <span class="text-slate-400">Total Uang Fisik Terhitung:</span>
            <span class="font-bold text-sm">Rp {{ totalFisikKoin.toLocaleString('id-ID') }}</span>
          </div>
          <div class="flex justify-between text-xs">
            <span class="text-slate-400">Total Jimpitan di Sistem (Hari Ini):</span>
            <span class="font-bold text-sm">Rp {{ Number(progress?.total_terkumpul || 0).toLocaleString('id-ID') }}</span>
          </div>

          <!-- Status Selisih -->
          <div
            class="pt-2 border-t border-slate-200/20 flex items-center justify-between text-sm font-bold"
            :class="selisihKoin === 0 ? 'text-emerald-400' : (selisihKoin < 0 ? 'text-rose-400' : 'text-blue-400')"
          >
            <span>Selisih (Fisik - Sistem):</span>
            <span>
              {{ selisihKoin === 0 ? '✓ Sesuai / Pas (Rp 0)' : (selisihKoin < 0 ? '- Kurang Rp ' + Math.abs(selisihKoin).toLocaleString('id-ID') : '+ Lebih Rp ' + selisihKoin.toLocaleString('id-ID')) }}
            </span>
          </div>
        </div>

        <div class="flex justify-end gap-2 pt-2">
          <button
            type="button"
            @click="resetCoinCounts"
            class="px-3 py-2 border rounded-lg text-xs font-semibold text-slate-400 hover:text-white"
          >
            Reset Nol
          </button>
          <button
            type="button"
            @click="showCoinModal = false"
            class="px-5 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL 2: JADWAL & PRESENSI RONDA PEMUDA -->
    <div
      v-if="showJadwalModal"
      class="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto"
    >
      <div :class="isRondaMode ? 'bg-slate-900 border border-slate-700 text-white' : 'bg-white text-slate-800'" class="max-w-2xl w-full rounded-2xl p-6 shadow-2xl space-y-4 my-8">
        <div class="flex items-center justify-between border-b pb-3 border-slate-200/20">
          <div>
            <h4 class="text-lg font-black flex items-center gap-2">
              📅 Jadwal & Presensi Regu Ronda Karang Taruna
            </h4>
            <p class="text-xs text-slate-400">
              Petugas otomatis hadir tercatat saat melakukan pencatatan jimpitan pertama pada tanggal tersebut.
            </p>
          </div>
          <button @click="showJadwalModal = false" class="text-slate-400 hover:text-white text-lg">✕</button>
        </div>

        <!-- Tab Selector: Jadwal Mingguan vs Presensi Otomatis -->
        <div class="flex border-b border-slate-200/20 text-xs font-bold gap-4">
          <button
            @click="activeJadwalTab = 'jadwal'"
            :class="activeJadwalTab === 'jadwal' ? 'border-b-2 border-emerald-500 text-emerald-400 pb-2' : 'text-slate-400 pb-2'"
          >
            📋 Jadwal Regu Mingguan (Senin - Minggu)
          </button>
          <button
            @click="activeJadwalTab = 'absensi'"
            :class="activeJadwalTab === 'absensi' ? 'border-b-2 border-emerald-500 text-emerald-400 pb-2' : 'text-slate-400 pb-2'"
          >
            ⏱️ Log Presensi Petugas Ronda ({{ formatTanggal(selectedDate) }})
          </button>
        </div>

        <!-- TAB A: Jadwal Mingguan -->
        <div v-if="activeJadwalTab === 'jadwal'" class="space-y-3 max-h-96 overflow-y-auto pr-1">
          <div
            v-for="j in jadwalList"
            :key="j.id"
            :class="isRondaMode ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-50 border-slate-200'"
            class="p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2"
          >
            <div>
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 rounded text-[11px] font-black bg-emerald-500/20 text-emerald-300">
                  {{ j.hari }}
                </span>
                <span class="font-bold text-sm">{{ j.nama_regu }}</span>
                <span v-if="j.rt" class="text-xs text-slate-400 font-semibold">({{ j.rt }})</span>
              </div>
              <p class="text-xs text-slate-300 mt-1">
                <span class="text-slate-400 font-medium">Anggota:</span> {{ j.anggota }}
              </p>
            </div>
            <p v-if="j.keterangan" class="text-[11px] text-slate-400 italic">
              {{ j.keterangan }}
            </p>
          </div>
          <p v-if="!jadwalList.length" class="text-xs text-slate-400 text-center py-4">
            Belum ada jadwal ronda terdaftar.
          </p>
        </div>

        <!-- TAB B: Presensi Otomatis Petugas -->
        <div v-else class="space-y-3 max-h-96 overflow-y-auto pr-1">
          <div
            v-for="a in absensiList"
            :key="a.id"
            :class="isRondaMode ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-50 border-slate-200'"
            class="p-3.5 rounded-xl border flex items-center justify-between gap-3"
          >
            <div>
              <div class="flex items-center gap-2">
                <span class="font-bold text-sm text-emerald-400">{{ a.nama_petugas }}</span>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 uppercase">
                  {{ a.status }}
                </span>
              </div>
              <p class="text-xs text-slate-400 mt-1">
                Mulai: <span class="text-slate-200 font-mono">{{ formatJam(a.waktu_pertama) }}</span> ·
                Terakhir: <span class="text-slate-200 font-mono">{{ formatJam(a.waktu_terakhir) }}</span>
              </p>
            </div>
            <div class="text-right">
              <span class="px-2.5 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs font-bold text-emerald-400">
                {{ a.total_catatan }} KK Dicatat
              </span>
            </div>
          </div>
          <p v-if="!absensiList.length" class="text-xs text-slate-400 text-center py-6">
            Belum ada petugas yang mencatat jimpitan pada tanggal ini.
          </p>
        </div>

        <div class="flex justify-end pt-2">
          <button
            type="button"
            @click="showJadwalModal = false"
            class="px-4 py-2 bg-slate-700 text-white rounded-lg text-xs font-semibold hover:bg-slate-600"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL 3: TOPUP SALDO DEPOSIT JIMPITAN WARGA -->
    <div
      v-if="showDepositModal"
      class="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50"
    >
      <div :class="isRondaMode ? 'bg-slate-900 border border-slate-700 text-white' : 'bg-white text-slate-800'" class="max-w-md w-full rounded-2xl p-6 shadow-2xl space-y-4">
        <h4 class="text-lg font-bold flex items-center gap-2">
          💳 Topup Deposit Jimpitan Warga
        </h4>
        <p class="text-xs text-slate-400">
          Warga dapat membayar di muka (misal Rp 15.000 untuk 30 hari). Sistem akan memotong saldo harian otomatis saat ronda keliling.
        </p>

        <form @submit.prevent="submitDeposit" class="space-y-3">
          <div>
            <label class="block text-xs font-semibold mb-1">Pilih Kepala Keluarga</label>
            <select
              v-model="depositForm.warga_id"
              required
              :class="isRondaMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-800'"
              class="w-full p-2 border rounded-lg text-sm"
            >
              <option value="" disabled>Pilih KK</option>
              <option v-for="w in wargaList" :key="w.id" :value="w.id">
                {{ w.nama_kk }} (Saldo saat ini: Rp {{ Number(w.saldo_deposit || 0).toLocaleString('id-ID') }})
              </option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold mb-1">Nominal Deposit (Rp)</label>
            <input
              v-model.number="depositForm.nominal"
              type="number"
              min="500"
              step="500"
              required
              placeholder="Contoh: 15000"
              :class="isRondaMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-800'"
              class="w-full p-2 border rounded-lg text-sm"
            />
            <p class="text-[11px] text-emerald-400 mt-1">
              Setara dengan ±{{ Math.floor((depositForm.nominal || 0) / perHari) }} hari iuran jimpitan.
            </p>
          </div>

          <div class="flex justify-end gap-2 pt-2">
            <button
              type="button"
              @click="showDepositModal = false"
              class="px-4 py-2 border rounded-lg text-xs text-slate-400 hover:text-white"
            >
              Batal
            </button>
            <button
              type="submit"
              :disabled="submittingDeposit"
              class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold disabled:opacity-50"
            >
              {{ submittingDeposit ? "Menyimpan..." : "Simpan Saldo Deposit" }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL 4: FORM MANUAL CATAT JIMPITAN KHUSUS / UBAH -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto"
    >
      <div :class="isRondaMode ? 'bg-slate-900 border border-slate-700 text-white' : 'bg-white text-slate-800'" class="max-w-md w-full rounded-2xl p-6 space-y-4 my-8">
        <h4 class="text-lg font-bold">
          {{ editingId ? "Ubah Catatan Jimpitan" : "Catat Jimpitan Khusus" }}
        </h4>

        <div v-if="formError" class="p-3 bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded-lg text-xs">
          {{ formError }}
        </div>

        <form @submit.prevent="submitJimpitan" class="space-y-3">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold mb-1">RT</label>
              <input :value="selectedRT" type="text" disabled class="w-full p-2 border rounded-lg text-sm bg-slate-800/40 text-slate-400" />
            </div>
            <div>
              <label class="block text-xs font-semibold mb-1">Tanggal</label>
              <input v-model="form.tanggal" type="date" required :class="isRondaMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-800'" class="w-full p-2 border rounded-lg text-sm" />
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold mb-1">Kepala Keluarga</label>
            <select
              v-model="form.warga_id"
              required
              :class="isRondaMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-800'"
              class="w-full p-2 border rounded-lg text-sm"
            >
              <option value="" disabled>Pilih KK</option>
              <option v-for="w in wargaList" :key="w.id" :value="w.id">
                {{ w.nama_kk }}
              </option>
            </select>
          </div>

          <!-- Status Khusus Lapangan -->
          <div>
            <label class="block text-xs font-semibold mb-1">Status Kunjungan Lapangan</label>
            <select
              v-model="form.status_lapangan"
              :class="isRondaMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-800'"
              class="w-full p-2 border rounded-lg text-sm"
            >
              <option value="lunas">✓ Lunas (Bayar Normal)</option>
              <option value="titip_tetangga">🤝 Titip Tetangga</option>
              <option value="kosong_nihil">○ Nihil / Kosong (Wadah ada, uang tidak ada)</option>
              <option value="rumah_tutup_mudik">🏠 Rumah Tutup / Mudik (Sedang bepergian)</option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-3" v-if="form.status_lapangan === 'lunas' || form.status_lapangan === 'titip_tetangga'">
            <div>
              <label class="block text-xs font-semibold mb-1">Jumlah Hari</label>
              <input
                v-model.number="form.jumlah_hari"
                type="number"
                min="1"
                required
                :class="isRondaMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-800'"
                class="w-full p-2 border rounded-lg text-sm"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold mb-1">Total Nominal</label>
              <div :class="isRondaMode ? 'bg-slate-800 border-slate-700 text-emerald-400' : 'bg-slate-50 border-slate-300 text-slate-800'" class="w-full p-2 border rounded-lg text-sm font-bold">
                Rp {{ nominalHitung.toLocaleString("id-ID") }}
              </div>
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold mb-1">Catatan Lapangan (Opsional)</label>
            <input
              v-model="form.catatan_lapangan"
              type="text"
              placeholder="Contoh: Titip di Bu RT sebelah"
              :class="isRondaMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-800'"
              class="w-full p-2 border rounded-lg text-sm"
            />
          </div>

          <div v-if="!editingId">
            <label class="block text-xs font-semibold mb-1">Foto Bukti (Opsional)</label>
            <input ref="fileInput" type="file" accept="image/*" class="w-full text-xs text-slate-400 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:bg-emerald-600 file:text-white" />
          </div>

          <div class="flex justify-end gap-2 pt-2">
            <button type="button" @click="showModal = false" class="px-4 py-2 border rounded-lg text-xs text-slate-400 hover:text-white">
              Batal
            </button>
            <button type="submit" :disabled="submitting" class="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 disabled:opacity-50">
              {{ submitting ? "Menyimpan..." : "Simpan Catatan" }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL 5: PENGAJUAN SETORAN KE BENDAHARA -->
    <div
      v-if="showSetorModal"
      class="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto"
    >
      <div :class="isRondaMode ? 'bg-slate-900 border border-slate-700 text-white' : 'bg-white text-slate-800'" class="max-w-md w-full rounded-2xl p-6 space-y-4 my-8">
        <div class="flex items-center justify-between border-b pb-3 border-slate-200/20">
          <div>
            <h4 class="text-lg font-bold">Ajukan Setoran Jimpitan</h4>
            <p class="text-xs text-slate-400">
              Uang fisik jimpitan RT akan diserahkan dan divalidasi masuk ke kas dusun oleh Bendahara.
            </p>
          </div>
          <button @click="showSetorModal = false" class="text-slate-400 hover:text-white text-lg">✕</button>
        </div>

        <div v-if="setorError" class="p-3 bg-rose-500/20 text-rose-300 rounded-lg text-xs">
          {{ setorError }}
        </div>

        <form @submit.prevent="submitSetoran" class="space-y-3">
          <div>
            <label class="block text-xs font-semibold mb-1">RT</label>
            <input :value="setorForm.rt" disabled class="w-full p-2 border rounded-lg text-sm bg-slate-800/40 text-slate-400" />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold mb-1">Dari Tanggal *</label>
              <input v-model="setorForm.dari" type="date" required :class="isRondaMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-800'" class="w-full p-2 border rounded-lg text-sm font-semibold" />
            </div>
            <div>
              <label class="block text-xs font-semibold mb-1">Sampai Tanggal *</label>
              <input v-model="setorForm.sampai" type="date" required :class="isRondaMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-800'" class="w-full p-2 border rounded-lg text-sm font-semibold" />
            </div>
          </div>

          <!-- Rincian Tanggal-Tanggal Belum Disetor -->
          <div v-if="pendingData?.rincian_tanggal?.length" class="space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 max-h-48 overflow-y-auto">
            <p class="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>📅 Tanggal yang Belum Disetor:</span>
              <span class="text-emerald-600 dark:text-emerald-400 font-black">
                Rp {{ Number(pendingData.total_nominal).toLocaleString('id-ID') }}
              </span>
            </p>
            <div
              v-for="item in pendingData.rincian_tanggal"
              :key="item.tanggal"
              class="flex justify-between items-center text-xs py-1.5 border-b last:border-0 border-slate-200/50"
            >
              <div>
                <span class="font-bold text-slate-800 dark:text-slate-100">{{ formatTanggal(item.tanggal) }}</span>
                <span class="text-slate-400 text-[11px] ml-1.5">({{ item.transaksi }} KK · Petugas: {{ item.petugas }})</span>
              </div>
              <span class="font-bold text-emerald-600 dark:text-emerald-400">Rp {{ item.nominal.toLocaleString('id-ID') }}</span>
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-2">
            <button type="button" @click="showSetorModal = false" class="px-4 py-2 border rounded-lg text-xs text-slate-400 hover:text-white">Batal</button>
            <button type="submit" :disabled="submittingSetor" class="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 disabled:opacity-50">
              {{ submittingSetor ? "Mengajukan..." : "Ajukan ke Bendahara" }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL 7: RINCIAN TANGGAL JIMPITAN BELUM DISETOR KE BENDAHARA -->
    <div
      v-if="showPendingModal"
      class="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto"
    >
      <div :class="isRondaMode ? 'bg-slate-900 border border-slate-700 text-white' : 'bg-white text-slate-800'" class="max-w-xl w-full rounded-2xl p-6 space-y-4 my-8">
        <div class="flex items-center justify-between border-b pb-3 border-slate-200/20">
          <div>
            <h4 class="text-lg font-bold flex items-center gap-2">
              📅 Rincian Jimpitan Belum Disetor ({{ pendingData?.rt || selectedRT }})
            </h4>
            <p class="text-xs text-slate-400">
              Uang fisik hasil keliling ronda yang masih dipegang petugas dan belum diajukan ke bendahara.
            </p>
          </div>
          <button @click="showPendingModal = false" class="text-slate-400 hover:text-white text-lg">✕</button>
        </div>

        <div v-if="pendingLoading" class="py-10 text-center text-slate-400 text-sm">
          Memuat rincian tanggal pending...
        </div>

        <div v-else-if="pendingData" class="space-y-4">
          <!-- Summary Header -->
          <div :class="isRondaMode ? 'bg-slate-950 border-slate-800' : 'bg-amber-50 border-amber-200'" class="p-3.5 rounded-xl border flex flex-wrap items-center justify-between gap-3">
            <div>
              <p class="text-xs text-slate-500">Rentang Tanggal Belum Disetor:</p>
              <p class="text-sm font-black text-slate-800 dark:text-white mt-0.5">
                {{ formatTanggal(pendingData.dari_tanggal) }} s/d {{ formatTanggal(pendingData.sampai_tanggal) }}
                <span class="text-xs font-normal text-slate-400">({{ pendingData.total_hari }} hari)</span>
              </p>
            </div>
            <div class="text-right">
              <p class="text-xs text-slate-500">Total Uang Pending:</p>
              <p class="text-lg font-black text-amber-600 dark:text-amber-400">
                Rp {{ Number(pendingData.total_nominal).toLocaleString('id-ID') }}
              </p>
            </div>
          </div>

          <!-- Rincian Tanggal -->
          <div>
            <p class="text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">Daftar Tanggal Pengambilan:</p>
            <div class="space-y-2 max-h-56 overflow-y-auto pr-1">
              <div
                v-for="r in pendingData.rincian_tanggal"
                :key="r.tanggal"
                :class="isRondaMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'"
                class="p-2.5 rounded-xl border flex items-center justify-between text-xs"
              >
                <div>
                  <p class="font-bold text-sm">{{ formatTanggal(r.tanggal) }}</p>
                  <p class="text-[11px] text-slate-400">{{ r.transaksi }} transaksi KK · Petugas: {{ r.petugas }}</p>
                </div>
                <div class="text-right">
                  <p class="font-bold text-sm text-emerald-500">Rp {{ r.nominal.toLocaleString('id-ID') }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-2 border-t border-slate-200/20">
            <button
              type="button"
              @click="showPendingModal = false"
              class="px-4 py-2 border rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Tutup
            </button>
            <button
              v-if="pendingData.total_nominal > 0 && ['superadmin', 'bendahara', 'petugas_rt'].includes(auth.userRole)"
              type="button"
              @click="showPendingModal = false; openSetorModal(pendingData.rt)"
              class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm"
            >
              Ajukan Tanggal Ini ke Bendahara &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount, watch } from "vue";
import api from "../api/axios";
import { useAuthStore } from "../stores/auth";

const auth = useAuthStore();
const isPetugas = computed(() => auth.userRole === "petugas_rt");
const lockedRT = computed(() => auth.user?.rt || "");

// State Mode Ronda Malam
const isRondaMode = ref(false);

const perHari = ref(500);
const rekap = ref([]);
const rekapPeriode = ref({
  bulan: new Date().getMonth() + 1,
  tahun: new Date().getFullYear(),
});
const progress = ref(null);
const jimpitan = ref([]);
const wargaList = ref([]);
const filterTabel = ref("all");
const quickLoadingId = ref(null);

const selectedRT = ref(isPetugas.value ? lockedRT.value : "");
const selectedDate = ref(new Date().toISOString().split("T")[0]);

// Modals State
const showModal = ref(false);
const showSetorModal = ref(false);
const showCoinModal = ref(false);
const showJadwalModal = ref(false);
const showDepositModal = ref(false);
const showBayarModal = ref(false);
const showMatrixModal = ref(false);
const showPendingModal = ref(false);

const submitting = ref(false);
const submittingSetor = ref(false);
const submittingDeposit = ref(false);
const deductingDeposit = ref(false);
const bayarSubmitting = ref(false);
const matrixLoading = ref(false);
const pendingLoading = ref(false);
const pendingData = ref(null);

const errorMsg = ref("");
const successMsg = ref("");
const formError = ref("");
const setorError = ref("");
const fileInput = ref(null);
const editingId = ref(null);

// Forms
const form = reactive({
  warga_id: "",
  tanggal: selectedDate.value,
  jumlah_hari: 1,
  status_lapangan: "lunas",
  catatan_lapangan: "",
});

const bayarTarget = ref(null);
const bayarForm = reactive({
  warga_id: null,
  tanggal: selectedDate.value,
  jumlah_hari: 1,
  metode_bayar: "tunai",
  catatan_lapangan: "",
});

const setorForm = reactive({
  rt: "",
  dari: selectedDate.value,
  sampai: selectedDate.value,
});

const depositForm = reactive({
  warga_id: "",
  nominal: 15000,
});

// Jadwal & Absensi
const activeJadwalTab = ref("jadwal");
const jadwalList = ref([]);
const absensiList = ref([]);

// Lembar Jimpitan Matriks
const matrixData = ref(null);
const matrixCustomJudul = ref("");
const matrixMode = ref("bulanan"); // 'bulanan' | 'rentang'
const matrixRentang = reactive({
  dari: new Date().toISOString().slice(0, 7) + "-01",
  sampai: new Date().toISOString().slice(0, 10),
});
const matrixPeriode = reactive({
  bulan: new Date().getMonth() + 1,
  tahun: new Date().getFullYear(),
});

const daftarBulanList = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

// Kalkulator Koin State
const koinDenominations = [
  { value: 100 },
  { value: 200 },
  { value: 500 },
  { value: 1000 },
];
const kertasDenominations = [
  { value: 2000 },
  { value: 5000 },
  { value: 10000 },
  { value: 20000 },
  { value: 50000 },
  { value: 100000 },
];
const coinCounts = reactive({
  100: 0,
  200: 0,
  500: 0,
  1000: 0,
  2000: 0,
  5000: 0,
  10000: 0,
  20000: 0,
  50000: 0,
  100000: 0,
});

const resetCoinCounts = () => {
  Object.keys(coinCounts).forEach((k) => (coinCounts[k] = 0));
};

const totalFisikKoin = computed(() => {
  let sum = 0;
  Object.keys(coinCounts).forEach((val) => {
    sum += Number(val) * (Number(coinCounts[val]) || 0);
  });
  return sum;
});

const selisihKoin = computed(() => {
  const sistemTotal = Number(progress.value?.total_terkumpul || 0);
  return totalFisikKoin.value - sistemTotal;
});

const daftarRT = computed(() =>
  [...new Set(rekap.value.map((r) => r.rt))].sort()
);

const rekapSelected = computed(
  () => rekap.value.find((r) => r.rt === selectedRT.value) || null
);

const nominalHitung = computed(() => {
  if (form.status_lapangan === 'kosong_nihil' || form.status_lapangan === 'rumah_tutup_mudik') {
    return 0;
  }
  return perHari.value * (Number(form.jumlah_hari) || 1);
});

const persenProgress = computed(() => {
  if (!progress.value || !progress.value.total_kk) return 0;
  return Math.round((progress.value.sudah / progress.value.total_kk) * 100);
});

const namaBulan = computed(() => {
  return daftarBulanList[rekapPeriode.value.bulan - 1] || "";
});

const filteredWargaList = computed(() => {
  const list = progress.value?.warga || [];
  if (filterTabel.value === "sudah") return list.filter((w) => w.sudah_bayar);
  if (filterTabel.value === "belum") return list.filter((w) => !w.sudah_bayar);
  return list;
});

const formatTanggal = (val) => (val ? String(val).split("T")[0] : "-");
const formatJam = (val) => {
  if (!val) return "-";
  const d = new Date(val);
  return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
};

const statusBadge = (w) => {
  if (!w.sudah_bayar) {
    if (w.status_lapangan === 'kosong_nihil') {
      return "bg-amber-600/20 text-amber-300 border border-amber-600/40";
    }
    if (w.status_lapangan === 'rumah_tutup_mudik') {
      return "bg-slate-700 text-slate-300 border border-slate-600";
    }
    return "bg-amber-500/20 text-amber-300 border border-amber-500/30";
  }
  if (w.status_lapangan === 'titip_tetangga') {
    return "bg-blue-500/20 text-blue-300 border border-blue-500/40";
  }
  return "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40";
};

const statusIcon = (w) => {
  if (!w.sudah_bayar) {
    if (w.status_lapangan === 'kosong_nihil') return "○";
    if (w.status_lapangan === 'rumah_tutup_mudik') return "🏠";
    return "⏳";
  }
  if (w.status_lapangan === 'titip_tetangga') return "🤝";
  return "✓";
};

const statusText = (w) => {
  if (!w.sudah_bayar) {
    if (w.status_lapangan === 'kosong_nihil') return "Nihil / Kosong";
    if (w.status_lapangan === 'rumah_tutup_mudik') return "Rumah Tutup";
    return "Belum Lunas";
  }
  if (w.status_lapangan === 'titip_tetangga') return "Titip Tetangga";
  return "Lunas";
};

// API Calls
const fetchKonstanta = async () => {
  const res = await api.get("/jimpitan/konstanta");
  perHari.value = Number(res.data.data.nominal_per_hari) || 500;
};

const fetchRekap = async () => {
  const res = await api.get("/jimpitan/rekap");
  rekap.value = res.data.data.data;
  rekapPeriode.value = res.data.data.periode;
};

const fetchProgress = async () => {
  if (!selectedRT.value || !selectedDate.value) {
    progress.value = null;
    return;
  }
  const res = await api.get("/jimpitan/progress", {
    params: {
      rt: selectedRT.value,
      tanggal: selectedDate.value,
    },
  });
  progress.value = res.data.data;
};

const fetchJimpitan = async () => {
  if (!selectedRT.value) {
    jimpitan.value = [];
    return;
  }
  const res = await api.get("/jimpitan", {
    params: { rt: selectedRT.value },
  });
  jimpitan.value = res.data.data;
};

const fetchWarga = async () => {
  if (!selectedRT.value) {
    wargaList.value = [];
    return;
  }
  const res = await api.get("/warga", {
    params: { rt: selectedRT.value, status: "aktif" },
  });
  wargaList.value = res.data.data;
};

const refreshAll = async () => {
  try {
    await Promise.all([
      fetchRekap(),
      fetchProgress(),
      fetchJimpitan(),
      fetchWarga(),
    ]);
  } catch (err) {
    console.error(err);
  }
};

// Modal Pembayaran Jimpitan (Dengan input kekurangan & jumlah hari yang bisa disesuaikan)
const openBayarModal = (warga, forceDeposit = false) => {
  bayarTarget.value = warga;
  bayarForm.warga_id = warga.id;
  bayarForm.tanggal = selectedDate.value;
  bayarForm.jumlah_hari = Math.max(1, warga.hari_kurang || 1);
  bayarForm.metode_bayar = (forceDeposit || (warga.saldo_deposit >= perHari.value * bayarForm.jumlah_hari)) ? "deposit" : "tunai";
  bayarForm.catatan_lapangan = "";
  showBayarModal.value = true;
};

const submitBayar = async () => {
  if (!bayarTarget.value) return;
  bayarSubmitting.value = true;
  try {
    const res = await api.post("/jimpitan", {
      warga_id: bayarForm.warga_id,
      tanggal: bayarForm.tanggal,
      jumlah_hari: bayarForm.jumlah_hari,
      status_lapangan: "lunas",
      metode_bayar: bayarForm.metode_bayar,
      catatan_lapangan: bayarForm.catatan_lapangan || "Pembayaran jimpitan",
    });
    showBayarModal.value = false;
    await refreshAll();
    successMsg.value = `✓ Pembayaran untuk ${bayarTarget.value.nama_kk} berhasil (${bayarForm.jumlah_hari} hari, Rp ${(bayarForm.jumlah_hari * perHari.value).toLocaleString('id-ID')})!`;
    setTimeout(() => (successMsg.value = ""), 4000);
  } catch (err) {
    alert(err.response?.data?.message || "Gagal menyimpan pembayaran.");
  } finally {
    bayarSubmitting.value = false;
  }
};

// Quick action untuk status khusus (Nihil atau Tutup)
const quickAction = async (warga, statusLapangan = 'kosong_nihil') => {
  quickLoadingId.value = warga.id;
  try {
    const payload = {
      warga_id: warga.id,
      tanggal: selectedDate.value,
      jumlah_hari: 1,
      status_lapangan: statusLapangan,
      metode_bayar: 'tunai',
    };
    await api.post("/jimpitan", payload);
    await refreshAll();
    successMsg.value = `Pencatatan ${warga.nama_kk} diperbarui (${statusLapangan})!`;
    setTimeout(() => (successMsg.value = ""), 3000);
  } catch (err) {
    errorMsg.value = err.response?.data?.message || "Gagal memperbarui catatan.";
    setTimeout(() => (errorMsg.value = ""), 4000);
  } finally {
    quickLoadingId.value = null;
  }
};

// Potong Semua Deposit Warga Sekaligus
const autoDeductAllDeposit = async () => {
  if (!confirm(`Potong otomatis iuran jimpitan hari ini (${selectedDate.value}) untuk semua warga di ${selectedRT.value} yang memiliki saldo deposit?`)) {
    return;
  }
  deductingDeposit.value = true;
  try {
    const res = await api.post("/jimpitan/auto-deduct-deposit", {
      rt: selectedRT.value,
      tanggal: selectedDate.value,
    });
    await refreshAll();
    successMsg.value = res.data.message || "Deposit otomatis berhasil diproses!";
    setTimeout(() => (successMsg.value = ""), 4000);
  } catch (err) {
    errorMsg.value = err.response?.data?.message || "Gagal memproses deposit otomatis.";
  } finally {
    deductingDeposit.value = false;
  }
};

// WhatsApp Integration
const sendWhatsApp = async (warga) => {
  try {
    const res = await api.get("/jimpitan/notif-wa", {
      params: {
        warga_id: warga.id,
        tanggal: selectedDate.value,
        type: "konfirmasi",
      },
    });
    if (res.data.data?.wa_url) {
      window.open(res.data.data.wa_url, "_blank");
    } else {
      alert(`Nomor WhatsApp warga ${warga.nama_kk} belum terdaftar.`);
    }
  } catch (err) {
    alert("Gagal membuat tautan WhatsApp: " + (err.response?.data?.message || err.message));
  }
};

// Modal Lembar Matriks Jimpitan Warga (Format Gambar)
const openMatrixModal = async () => {
  showMatrixModal.value = true;
  matrixCustomJudul.value = `DAFTAR JIMPITAN WARGA ${selectedRT.value || 'RT 1 RW 4'} DUSUN NGEPRINGAN`;
  await fetchMatrixData();
};

const fetchMatrixData = async () => {
  matrixLoading.value = true;
  try {
    const params = {
      rt: selectedRT.value,
    };
    if (matrixMode.value === "rentang") {
      params.dari_tanggal = matrixRentang.dari;
      params.sampai_tanggal = matrixRentang.sampai;
    } else {
      params.bulan = matrixPeriode.bulan;
      params.tahun = matrixPeriode.tahun;
    }

    const res = await api.get("/jimpitan/matrix-rekap", { params });
    if (res.data.success) {
      matrixData.value = res.data.data;
    }
  } catch (e) {
    console.error(e);
  } finally {
    matrixLoading.value = false;
  }
};

const printMatrix = () => {
  window.print();
};

const exportMatrixCsv = () => {
  if (!matrixData.value) return;
  const md = matrixData.value;
  const daysHeader = (md.hari_list_detail || []).map((d) => d.label);
  const isBulanan = md.mode === "bulanan";
  const headerRow = ["No", "NAMA", ...(isBulanan ? ["SISA LALU"] : []), ...daysHeader, "TOTAL (Rp)", "HARI"];
  const dataRows = md.rows.map((r) => {
    const dayVals = (md.hari_list_detail || []).map((d) => r.days[d.key]?.symbol || (r.days[d.key]?.paid ? "500" : ""));
    const priorCol = isBulanan ? [r.tunggakan_lalu_hari ? `${r.tunggakan_lalu_hari} hr (${r.tunggakan_lalu_nominal})` : "-"] : [];
    return [r.no, r.nama_kk, ...priorCol, ...dayVals, r.total_nominal, r.total_hari];
  });
  const footVals = (md.hari_list_detail || []).map((d) => md.daily_totals[d.key] || 0);
  const footRow = ["", "JUMLAH (Rp)", ...(isBulanan ? [""] : []), ...footVals, md.grand_total, md.rows.reduce((s, r) => s + r.total_hari, 0)];

  const csvContent = [headerRow, ...dataRows, footRow]
    .map((row) => row.map((v) => `"${String(v ?? "").replaceAll('"', '""')}"`).join(","))
    .join("\n");

  const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `daftar-jimpitan-${selectedRT.value || "all"}-${md.header.periode}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
};

// Modal Jadwal & Absensi
const openJadwalModal = async () => {
  showJadwalModal.value = true;
  try {
    const [jRes, aRes] = await Promise.all([
      api.get("/jimpitan/jadwal-ronda", { params: { rt: selectedRT.value } }),
      api.get("/jimpitan/absensi-ronda", {
        params: { rt: selectedRT.value, tanggal: selectedDate.value },
      }),
    ]);
    jadwalList.value = jRes.data.data || [];
    absensiList.value = aRes.data.data || [];
  } catch (e) {
    console.error(e);
  }
};

// Modal Deposit
const openDepositModal = (w = null) => {
  depositForm.warga_id = w?.id || "";
  depositForm.nominal = 15000;
  showDepositModal.value = true;
};

const submitDeposit = async () => {
  submittingDeposit.value = true;
  try {
    const res = await api.post("/jimpitan/deposit", depositForm);
    showDepositModal.value = false;
    await refreshAll();
    successMsg.value = res.data.message || "Deposit berhasil ditambahkan!";
    setTimeout(() => (successMsg.value = ""), 4000);
  } catch (err) {
    alert(err.response?.data?.message || "Gagal menambah deposit.");
  } finally {
    submittingDeposit.value = false;
  }
};

// Form Manual Catat Modal
const openModal = (w = null) => {
  formError.value = "";
  form.warga_id = w?.id || "";
  editingId.value = w?.jimpitan_id || null;
  form.tanggal = w?.tanggal ? formatTanggal(w.tanggal) : selectedDate.value;
  form.jumlah_hari = w?.jumlah_hari || 1;
  form.status_lapangan = w?.status_lapangan || "lunas";
  form.catatan_lapangan = w?.catatan_lapangan || "";
  if (fileInput.value) fileInput.value.value = "";
  showModal.value = true;
};

const submitJimpitan = async () => {
  submitting.value = true;
  formError.value = "";
  try {
    const fd = new FormData();
    fd.append("warga_id", form.warga_id);
    fd.append("tanggal", form.tanggal);
    fd.append("jumlah_hari", form.jumlah_hari);
    fd.append("status_lapangan", form.status_lapangan);
    if (form.catatan_lapangan) fd.append("catatan_lapangan", form.catatan_lapangan);
    if (fileInput.value?.files[0]) {
      fd.append("bukti_foto", fileInput.value.files[0]);
    }

    const res = editingId.value
      ? await api.put(`/jimpitan/${editingId.value}`, fd)
      : await api.post("/jimpitan", fd);
    showModal.value = false;
    editingId.value = null;
    await refreshAll();
    successMsg.value = res.data.message || "Jimpitan berhasil disimpan!";
    setTimeout(() => (successMsg.value = ""), 4000);
  } catch (err) {
    formError.value = err.response?.data?.message || "Gagal menyimpan jimpitan.";
  } finally {
    submitting.value = false;
  }
};

const fetchPendingData = async (rt) => {
  pendingLoading.value = true;
  try {
    const res = await api.get("/jimpitan/pending-setor", { params: { rt } });
    if (res.data.success) {
      pendingData.value = res.data.data;
      return res.data.data;
    }
  } catch (e) {
    console.error(e);
  } finally {
    pendingLoading.value = false;
  }
  return null;
};

const openPendingDetailModal = async (rt) => {
  showPendingModal.value = true;
  await fetchPendingData(rt);
};

const openSetorModal = async (rt) => {
  setorError.value = "";
  setorForm.rt = rt;
  const pData = await fetchPendingData(rt);
  if (pData?.dari_tanggal && pData?.sampai_tanggal) {
    setorForm.dari = pData.dari_tanggal;
    setorForm.sampai = pData.sampai_tanggal;
  } else if (rekapSelected.value?.pending_info?.dari_tanggal) {
    setorForm.dari = rekapSelected.value.pending_info.dari_tanggal;
    setorForm.sampai = rekapSelected.value.pending_info.sampai_tanggal;
  } else {
    setorForm.dari = selectedDate.value;
    setorForm.sampai = selectedDate.value;
  }
  showSetorModal.value = true;
};

const submitSetoran = async () => {
  submittingSetor.value = true;
  setorError.value = "";
  try {
    const res = await api.post("/jimpitan/setor", setorForm);
    showSetorModal.value = false;
    await refreshAll();
    successMsg.value = res.data.message || "Setoran berhasil!";
    setTimeout(() => (successMsg.value = ""), 4000);
  } catch (err) {
    setorError.value = err.response?.data?.message || "Gagal mengajukan setoran.";
  } finally {
    submittingSetor.value = false;
  }
};

watch([selectedRT, selectedDate], () => {
  if (!selectedRT.value) {
    progress.value = null;
    jimpitan.value = [];
    wargaList.value = [];
    return;
  }
  refreshAll();
});

let pollTimer = null;

onMounted(async () => {
  try {
    await fetchKonstanta();
    await fetchRekap();
    if (isPetugas.value && !lockedRT.value) {
      errorMsg.value = "Akun petugas ini belum memiliki RT. Hubungi admin untuk mengaturnya.";
      return;
    }
    await refreshAll();
    pollTimer = setInterval(() => {
      if (selectedRT.value) refreshAll();
    }, 15000);
  } catch (err) {
    console.error(err);
  }
});

onBeforeUnmount(() => {
  if (pollTimer) clearInterval(pollTimer);
});
</script>

<style scoped>
/* Transisi halus saat beralih ke Mode Ronda Malam */
.ronda-dark {
  background-color: #030712 !important;
  color: #f3f4f6 !important;
}

/* Print CSS khusus lembar matriks sesuai Gambar */
@media print {
  @page {
    size: landscape;
    margin: 1cm;
  }

  body * {
    visibility: hidden;
  }

  .print-area,
  .print-area * {
    visibility: visible;
  }

  .print-area {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    color: black !important;
    background: white !important;
  }

  .no-print {
    display: none !important;
  }

  .matrix-table {
    border: 2px solid black !important;
  }

  .matrix-table th,
  .matrix-table td {
    border: 1px solid black !important;
    color: black !important;
  }
}
</style>
