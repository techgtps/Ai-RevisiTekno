# REVISITEKNO AI V1.2
> Asisten Kreatif AI Personal untuk Kreator Konten YouTube Teknologi (Revisitekno)

Aplikasi web modern, responsif, dan mobile-first yang dirancang untuk membantu kreator konten YouTube merencanakan, mengorganisir, dan menyiapkan produksi video mulai dari ide awal hingga naskah dan suara narasi.

---

## 💡 Filosofi Produk
**AI membantu kreator, AI tidak menggantikan kreator.**
- Kreator tetap memegang kendali penuh atas riset fakta, pengujian mandiri, opini editorial, pengambilan keputusan kreatif, perekaman video, editing, dan publikasi.
- Revisitekno AI **tidak** memalsukan angka analitik YouTube (view, subscriber, search volume fiktif) dan tidak berpura-pura melakukan otomatisasi penuh yang tidak realistis.

---

## 🚀 Fitur Utama & Navigasi (10 Halaman)

1. **Dashboard**: Ringkasan metrik proyek nyata, pelacak status produksi (Kanban summary), aksi cepat, dan log aktivitas terkini.
2. **AI Assistant**: Konsultasi strategi konten, pembuat hook 10 detik pertama, penelaah naskah, dan pengubah saran AI menjadi ide atau rencana kerja hanya dalam 1 klik.
3. **Idea Generator**: Eksplorasi konsep video terstruktur (Judul CTR tinggi, hook, poin bahasan, kesulitan produksi, dan riset wajib).
4. **Video Planner**: Papan manajemen alur kerja (Kanban & List view) dengan status: *Idea, Planning, In Production, Editing, Ready to Publish, Published*, lengkap dengan checklist produksi terpadu.
5. **Script Studio**: Studio penulisan draf naskah dengan AI Section Refiner (pertajam hook, sederhanakan penjelasan, ubah tone, deteksi klaim fakta). Dilengkapi perbandingan berdampingan sebelum menerapkan perubahan agar naskah asli kreator terlindungi.
6. **Voice Studio (TTS)**:
   - **Mode Standar**: Sintesis suara teks ke audio narasi Bahasa Indonesia berkualitas tinggi menggunakan `gemini-3.8-flash-lite-tts` (Pilihan karakter: Kore, Puck, Fenrir, Zephyr, Charon). Unduh langsung dalam format WAV master.
   - **Pro Mode**: Segmentasi otomatis untuk naskah panjang, preview per segmen, sintesis ulang segmen gagal, dan penggabungan seluruh segmen menjadi 1 berkas WAV utuh via server RIFF header merger.
   - **Browser Speech Fallback**: Pratinjau instan via Web Speech API lokal browser.
7. **Thumbnail Lab**: Rancang konsep visual 16:9, panduan kontras layar smartphone, analisis safe zone (menghindari timestamp durasi YouTube), dan generator visual preview AI (`gemini-3.1-flash-lite-image`).
8. **YouTube SEO & Scheduler**: Penunjang distribusi video lengkap (rekomendasi 5 judul CTR tinggi, deskripsi video ramah algoritma tanpa link fiktif, generator hashtag, tag YouTube Studio dengan pembatas ketat <500 karakter, rekomendasi hari & jam tayang berbasis audiens Indonesia, serta 6 poin checklist pra-upload).
9. **Content Library**: Pusat arsip seluruh ide, rencana video, naskah, thumbnail, dan paket SEO dengan pencarian, filter, dan fitur Ekspor/Impor file JSON.
10. **Settings**: Konfigurasi profil channel Revisitekno, persona penulisan kreator, preferensi studio, verifikasi koneksi API, dan pemulihan data.

---

## 🛠️ Arsitektur Teknologi

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons
- **Backend**: Node.js & Express (`server.ts`) dengan integrasi Vite middleware dev & static production
- **AI Models (@google/genai)**:
  - Teks & Penalaran: `gemini-3.8-flash`
  - Sintesis Suara (TTS): `gemini-3.8-flash-lite-tts` (Unary WAV audio & server-side WAV header concatenator)
  - Pratinjau Visual Thumbnail: `gemini-3.1-flash-lite-image` (16:9 aspect ratio)
- **Persistensi Data**: Browser LocalStorage dengan skema terstruktur, fallback aman, dan pencadangan JSON.

---

## 🔑 Konfigurasi Environment & AI Provider

Aplikasi menggunakan integrasi server-side yang aman. Kunci API tidak pernah diekspos ke browser bundle.

### Variabel Environment (`.env`)
```bash
# GEMINI_API_KEY: Kunci API Google Gemini (dikelola melalui panel Secrets di AI Studio)
GEMINI_API_KEY="AIzaSy..."

# APP_URL: URL host aplikasi Cloud Run
APP_URL="https://your-app-url.run.app"
```

### Panduan Konfigurasi di Google AI Studio:
1. Buka antarmuka Google AI Studio.
2. Masuk ke menu **Settings > Secrets**.
3. Tambahkan secret bernama `GEMINI_API_KEY` dengan kunci API Gemini Anda.
4. Server aplikasi secara otomatis membaca environment variable ini tanpa perlu mengubah kode sumber.
5. Jika kunci belum diisi, seluruh fungsi organisasi, checklist, penulisan manual, dan browser TTS tetap dapat digunakan secara normal.

---

## 🏃 Panduan Menjalankan Aplikasi

### Mode Pengembangan (Development)
```bash
npm run dev
```
Server Express akan berjalan pada `http://localhost:3000` dengan Vite middleware aktif.

### Membangun untuk Produksi (Production Build)
```bash
npm run build
npm start
```

---

## ✅ Checklist Pengujian Praktis (Testing Checklist)

- [x] **Koneksi Status**: Halaman Settings dan Navbar mendeteksi ketersediaan API key server secara akurat.
- [x] **Dashboard**: Menghitung jumlah riil dari ide, rencana, naskah, dan thumbnail yang tersimpan.
- [x] **AI Assistant**: Mengirim riwayat percakapan ke endpoint `/api/chat` dan menyediakan tombol aksi "Jadikan Ide", "Buat Rencana", serta "Kirim ke Script".
- [x] **Idea Generator**: Menghasilkan 4 konsep ide berstruktur JSON dan tombol transfer ke Video Planner/Script Studio berfungsi.
- [x] **Video Planner**: Perpindahan status Kanban (Idea ➔ Planning ➔ In Production ➔ Editing ➔ Ready to Publish ➔ Published) dan centang checklist berfungsi secara reaktif.
- [x] **Script Studio**: Penghitungan kata, estimasi durasi membaca (~130 kata/menit), pengunduhan file `.txt`, serta pemoles AI dengan dialog tinjau sebelum menerapkan perubahan.
- [x] **Voice Studio**: Sintesis suara menggunakan `gemini-3.8-flash-lite-tts`, pemutaran audio, pengunduhan WAV, serta penggabungan segmen pada Pro Mode.
- [x] **Thumbnail Lab**: Visualisasi frame 16:9 dengan simulasi safe-zone timestamp YouTube dan prompt AI.
- [x] **Penyimpanan & Pencadangan**: Tombol "Cadangkan JSON" mengunduh file `.json` dan "Impor JSON" berhasil memulihkan data tanpa kehilangan relasi item.
- [x] **Responsivitas Mobile**: Sidebar dapat dilipat menjadi drawer pada layar ponsel/tablet dan tombol nyaman ditekan (touch-friendly).
