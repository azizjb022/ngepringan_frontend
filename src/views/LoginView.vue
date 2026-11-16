<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-100 px-4">
    <div
      class="max-w-md w-full bg-white p-8 rounded-xl shadow-sm border border-slate-200"
    >
      <div class="text-center mb-6">
        <h2 class="text-2xl font-bold text-slate-800">Masuk Akun</h2>
        <p class="text-sm text-slate-500 mt-1">
          Karang Taruna Dusun Ngepringan
        </p>
      </div>

      <div
        v-if="error"
        class="mb-4 p-3 bg-rose-50 text-rose-600 rounded-lg text-sm"
      >
        {{ error }}
      </div>

      <form @submit.prevent="submitLogin" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1"
            >Username / Email</label
          >
          <input
            v-model="form.username"
            type="text"
            required
            class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            placeholder="admin / bendahara"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1"
            >Kata Sandi</label
          >
          <input
            v-model="form.password"
            type="password"
            required
            class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition text-sm disabled:opacity-50"
        >
          {{ loading ? "Memproses..." : "Masuk" }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

const form = reactive({ username: "", password: "" });
const loading = ref(false);
const error = ref("");
const auth = useAuthStore();
const router = useRouter();

const submitLogin = async () => {
  loading.value = true;
  error.value = "";
  try {
    await auth.login(form.username, form.password);
    router.push("/");
  } catch (err) {
    error.value =
      err.response?.data?.message ||
      "Login gagal, periksa koneksi atau kredensial.";
  } finally {
    loading.value = false;
  }
};
</script>
