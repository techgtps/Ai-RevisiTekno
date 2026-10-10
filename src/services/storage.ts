import {
  ChannelProfile,
  VideoIdea,
  VideoPlan,
  ScriptItem,
  ThumbnailConcept,
  SeoPackage,
  ChatMessage,
  AppSettings,
  AppActivity,
} from '../types';

const STORAGE_KEYS = {
  PROFILE: 'revisitekno_profile_v1.2',
  IDEAS: 'revisitekno_ideas_v1.2',
  PLANS: 'revisitekno_plans_v1.2',
  SCRIPTS: 'revisitekno_scripts_v1.2',
  THUMBNAILS: 'revisitekno_thumbnails_v1.2',
  SEO: 'revisitekno_seo_v1.2',
  CHATS: 'revisitekno_chats_v1.2',
  SETTINGS: 'revisitekno_settings_v1.2',
  ACTIVITIES: 'revisitekno_activities_v1.2',
};

const DEFAULT_PROFILE: ChannelProfile = {
  channelName: 'Revisitekno',
  niche: 'Review Gadget, Setup Meja Kerja, Perbandingan HP/Laptop, dan AI Productivity',
  targetAudience: 'Penonton Indonesia antusias teknologi, profesional muda, dan smart buyer gadget',
  preferredFormats: [
    'Long-form YouTube',
    'Review & Hands-on',
    'Perbandingan (VS)',
    'Tutorial & How-to',
  ],
  preferredLanguage: 'Bahasa Indonesia (Natural, Santai, Lugas)',
  preferredTone: 'Santai tapi berbobot, jujur, berbasis pengujian nyata',
  creatorGuidelines:
    'Fokus pada pengalaman pakai harian (daily use), bukan sekadar baca brosur spek. Tekankan kelebihan dan kekurangan secara objektif.',
  contentObjective: 'Membantu penonton membuat keputusan pembelian gadget dengan bijak.',
};

const DEFAULT_SETTINGS: AppSettings = {
  defaultFormat: 'Long-form YouTube',
  defaultTone: 'Santai & Analitis',
  defaultVoiceMode: 'simple',
  defaultVoice: 'Kore',
  speechRate: 1.0,
  autoSaveLocal: true,
};

const INITIAL_IDEAS: VideoIdea[] = [
  {
    id: 'idea-1',
    title: 'Flagship Killer 2026: Benarkah Masih Ada yang Layak Beli?',
    coreConcept:
      'Membongkar fenomena harga HP kelas menengah yang naik dan mencari apakah konsep "Flagship Killer" murni masih eksis di 2026.',
    hook: 'Dulu 4 juta dapat spek dewa, sekarang 8 juta dibilang murah. Kemana hilangnya julukan Flagship Killer?',
    viewerProblem: 'Penonton bingung memilih HP 5-7 jutaan yang performanya mendekati flagship tanpa gimmick.',
    talkingPoints: [
      'Sejarah pergeseran harga chipset dan sensor kamera flagship',
      'Kompromi tersembunyi: build quality, software update, dan sertifikasi IP',
      '3 Pilihan HP terbaik di harga 6 jutaan tahun 2026',
      'Kesimpulan: beli flagship second atau mid-range baru?',
    ],
    structure: 'Intro (0:00) -> Kilas Balik Harga (1:30) -> 3 Opsi Terbaik (4:00) -> Uji Kompromi (7:30) -> Rekomendasi Akhir (10:00)',
    thumbnailDirection: 'Kiri: HP retak bertuliskan 4 JUTA, Kanan: HP mewah bersinar bertuliskan 9 JUTA. Teks: "FLAGSHIP KILLER MATI?"',
    difficulty: 'Sedang',
    researchNeeded: 'Perbandingan riil harga rilis vs kurs rupiah, uji suhu throttling gaming 30 menit.',
    createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
  },
  {
    id: 'idea-2',
    title: 'Setup Meja Kerja Minimalis untuk Video Editor & Programmer',
    coreConcept: 'Tour setup meja produktivitas dengan manajemen kabel bersih, pencahayaan bias, dan single-cable USB-C dock.',
    hook: 'Bukan soal barang mahal, tapi soal gimana meja kerja ini bikin gue fokus 8 jam tanpa sakit leher.',
    viewerProblem: 'Meja kerja berantakan dan setup monitor ergonomis yang bikin cepat lelah.',
    talkingPoints: [
      'Pondasi meja: pemilihan standing desk dan penataan kabel di bawah meja',
      'Layar monitor ultrawide vs dual-monitor untuk multitasking',
      'Pencahayaan: lightbar monitor untuk mencegah ketegangan mata',
      'Budget breakdown: alternatif murah untuk setiap komponen',
    ],
    structure: 'Hook visual B-roll meja (0:00) -> Cable Management breakdown (2:00) -> Gear Review (5:00) -> Total Biaya & Tips Hemat (8:00)',
    thumbnailDirection: 'Sudut pandang sinematik meja menyala di kegelapan dengan lampu hangat. Teks: "SETUP IMPIAN 2026"',
    difficulty: 'Rendah',
    researchNeeded: 'Daftar link pembelian produk dan alternatif murah di marketplace lokal.',
    createdAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
  },
];

const INITIAL_PLANS: VideoPlan[] = [
  {
    id: 'plan-1',
    title: 'Review Jujur: 30 Hari Pakai Laptop AI Windows on ARM',
    topic: 'Review Laptop Snapdragon X Elite & Windows on ARM',
    contentObjective: 'Menguji kompatibilitas aplikasi di Indonesia dan daya tahan baterai riil untuk kerja.',
    targetAudience: 'Pekerja remote, programmer, mahasiswa, dan kreator konten',
    videoFormat: 'Review & Hands-on',
    summary:
      'Pengalaman riil memakai laptop ARM untuk editing video 4K dan browsing 50 tab. Apakah emulasi x86 masih ngelag?',
    hook: 'Baterainya tahan 16 jam, tapi apakah Photoshop dan game favorit kalian bisa jalan tanpa crash?',
    talkingPoints: [
      'Real-world battery life: uji kerja offline dan online seharian',
      'Kompatibilitas software lokal: e-faktur, banking token, dan driver printer',
      'Performa rendering video di Premiere Pro & DaVinci Resolve ARM native',
      'Suhu dan kipas: apakah benar-benar hening?',
      'Siapa yang boleh beli dan siapa yang wajib tunggu?',
    ],
    researchNotes:
      'Catat persentase baterai setiap 2 jam. Bandingkan waktu render video test benchmark 4K ProRes dengan MacBook Air M3.',
    checklist: [
      { id: 'c1', text: 'Rekam B-roll unboxing & detail bodi tipis', done: true },
      { id: 'c2', text: 'Uji kompatibilitas software non-native (x86)', done: true },
      { id: 'c3', text: 'Uji daya baterai perjalanan luar kota', done: true },
      { id: 'c4', text: 'Finalisasi naskah bagian kesimpulan', done: false },
      { id: 'c5', text: 'Rekam A-roll kamera depan studio', done: false },
    ],
    linkedScriptId: 'script-1',
    linkedThumbnailId: 'thumb-1',
    targetDate: new Date(Date.now() + 3600000 * 24 * 4).toISOString().split('T')[0],
    personalNotes: 'Jangan lupa sebutkan garansi resmi dan ketersediaan service center di Indonesia.',
    status: 'In Production',
    createdAt: new Date(Date.now() - 3600000 * 24 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
  },
  {
    id: 'plan-2',
    title: 'Top 5 AI Tools Gratis yang Membantu Pekerjaan Harian di 2026',
    topic: 'Alat Kecerdasan Buatan untuk Produktivitas',
    contentObjective: 'Edukasi tools gratis non-gimmick yang benar-benar memangkas waktu kerja.',
    targetAudience: 'Mahasiswa, pekerja kantoran, freelancer desain dan penulisan',
    videoFormat: 'Tutorial & How-to',
    summary: 'Rekomendasi 5 tools AI gratis dengan demonstrasi langsung studi kasus nyata.',
    hook: '90 persen orang masih pakai AI cuma buat nanya resep. Padahal 5 tools ini bisa beresin kerjaan seminggu jadi 2 jam.',
    talkingPoints: [
      'Tool 1: Riset dokumen dan sintesis jurnal ilmiah',
      'Tool 2: Pembuat presentasi otomatis dan visualisasi data',
      'Tool 3: Otomasi pembersihan audio rekaman HP jadi kualitas studio',
      'Tool 4: Transkripsi meeting lokal Bahasa Indonesia',
      'Tool 5: AI asisten coding dan formula spreadsheet',
    ],
    researchNotes: 'Pastikan semua tier gratis yang didemokan masih valid dan tidak memerlukan kartu kredit saat pendaftaran.',
    checklist: [
      { id: 'c21', text: 'Screen record demo 5 tools', done: false },
      { id: 'c22', text: 'Buat rangkuman prompt template di deskripsi', done: false },
      { id: 'c23', text: 'Desain thumbnail konsep 16:9', done: false },
    ],
    targetDate: new Date(Date.now() + 3600000 * 24 * 7).toISOString().split('T')[0],
    status: 'Planning',
    createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
  },
];

const INITIAL_SCRIPTS: ScriptItem[] = [
  {
    id: 'script-1',
    title: 'Review Laptop ARM: Baterai 16 Jam, Tapi Apakah Aman?',
    topic: 'Laptop Windows on ARM Review 30 Hari',
    targetAudience: 'Pekerja remote & Kreator',
    videoFormat: 'Review & Hands-on',
    targetDuration: '9 menit',
    tone: 'Santai, lugas, berbasis bukti',
    objective: 'Memberi panduan objektif apakah ekosistem ARM Windows sudah matang di 2026.',
    content: `[00:00 - HOOK]
Halo semuanya, balik lagi di Revisitekno.
Bayangin kalian bawa laptop keluar rumah dari jam 8 pagi, kerja di coffee shop, edit beberapa potongan video, dan pas pulang jam 8 malam... baterainya masih 40 persen tanpa sekalipun nyolok charger.
Terdengar kayak mimpi pengguna laptop Windows kan?
Tapi di balik daya tahan baterai gilanya ini, ada satu pertanyaan besar yang jarang dibahas jujur: gimana dengan software-software lama yang biasa kita pakai sehari-hari di Indonesia?

[01:15 - INTRO & LATAR BELAKANG]
Selama 30 hari terakhir, laptop ini jadi daily driver utama gue buat ngerjain script, komunikasi, sampai rendering footage YouTube.
Gue beli versi ritel resmi, bukan unit pinjaman brand, jadi semua yang gue omongin di video ini murni pengalaman pakai pribadi.

[02:45 - PENGUJIAN SOFTWARE & EMULASI]
Kita langsung ke poin paling krusial: kompatibilitas.
Aplikasi populer kayak Chrome, Spotify, dan VS Code udah native ARM. Rasanya enteng banget, buka tab 40 biji pun gak ada stutter.
Tapi gimana pas gue tes aplikasi perpajakan DJP dan driver printer jadul? Nah di sinilah kalian harus tahu batasannya...

[05:30 - EDITING VIDEO & PERFORMA GRAFIS]
Di DaVinci Resolve yang udah optimized buat ARM, playback timeline 4K lancar jaya. Tapi kalau kalian berencana main game AAA berat, tahan dulu. Laptop ini dirancang buat maraton produktivitas, bukan gaming rig.

[07:45 - KESIMPULAN REVISITEKNO]
Kalau pekerjaan kalian 80% berbasis browser, dokumen, dan coding ringan, ini adalah laptop Windows terbaik yang pernah gue pakai. Tapi kalau kalian butuh software khusus dengan driver kernel lawas, opsi x86 Intel/AMD masih jadi pilihan paling aman saat ini.

[08:45 - CTA]
Gimana menurut kalian? Apakah tahun ini saatnya kalian migrasi ke laptop ARM? Tulis pendapat kalian di kolom komentar di bawah. Jangan lupa like dan subscribe Revisitekno buat review teknologi tanpa basa-basi. Sampai jumpa di video berikutnya!`,
    wordCount: 295,
    estimatedDurationMinutes: 2.3,
    status: 'In Revision',
    linkedPlanId: 'plan-1',
    createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
  },
];

const INITIAL_THUMBNAILS: ThumbnailConcept[] = [
  {
    id: 'thumb-1',
    title: 'Thumbnail Review Laptop ARM 2026',
    topic: 'Laptop Windows on ARM',
    conceptName: 'Baterai Hijau vs Tanda Bahaya Software',
    mainSubject: 'Host memegang laptop tipis terbuka dengan ekspresi heran/penasaran.',
    composition: 'Rule of thirds: Host di sepertiga kanan, laptop dan teks grafis besar di sepertiga kiri.',
    focalPoint: 'Indikator baterai 100% raksasa berwarna hijau neon dengan tanda tanya merah kontras.',
    background: 'Studio gelap dengan aksen rim-light biru cyan khas Revisitekno, latar bokeh lembut.',
    colors: ['#0B0F17 (Hitam Obsidian)', '#00F0FF (Cyan Neon)', '#22C55E (Hijau Baterai)', '#EF4444 (Merah Peringatan)'],
    textOverlay: 'BATERAI 16 JAM?! (Tapi Jangan Beli Dulu)',
    textPlacement: 'Kiri atas dan tengah kiri (Aman dari timestamp YouTube di kanan bawah).',
    contrastAndReadability: 'Font sans-serif tebal warna putih dengan stroke hitam tegas, terbaca jelas di layar HP 5 inci.',
    imagePrompt:
      'A professional tech YouTube video thumbnail, dark studio background with cyan and deep navy lighting. A male tech creator in his late 20s holding a sleek ultra-thin laptop open, looking curious. High contrast, sharp focus, cinematic lighting, 16:9 ratio.',
    linkedPlanId: 'plan-1',
    linkedScriptId: 'script-1',
    createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
  },
];

const INITIAL_SEO: SeoPackage[] = [
  {
    id: 'seo-1',
    videoTitle: 'Review 30 Hari Laptop AI Windows on ARM: Jangan Beli Dulu Sebelum Tahu Ini!',
    videoTopic: 'Review Laptop Snapdragon X Elite & Windows on ARM',
    mainKeyword: 'review laptop windows on arm',
    videoFormat: 'Long-form',
    targetAudience: 'Pekerja remote, programmer, mahasiswa, dan kreator konten Indonesia',
    scriptSummary: 'Pengujian riil 30 hari daya tahan baterai 16 jam, kompatibilitas aplikasi perbankan & editing video.',
    alternativeTitles: [
      '30 Hari Pakai Laptop Snapdragon X Elite: Uji Realita Tanpa Gimmick',
      'Review Jujur Laptop Windows on ARM 2026: Apakah Emulasi Masih Lambat?',
      'Jangan Beli Laptop AI Sebelum Tonton Ini! (Uji Kompatibilitas Software)',
      'Laptop Windows Rasa MacBook? Pengalaman 1 Bulan Pakai Snapdragon X Elite',
      'Baterai Tahan 16 Jam Nyata? Kupas Tuntas Laptop Windows on ARM',
    ],
    selectedTitle: 'Review 30 Hari Laptop AI Windows on ARM: Jangan Beli Dulu Sebelum Tahu Ini!',
    description: `Review lengkap 30 hari penggunaan laptop Windows on ARM berbasis Snapdragon X Elite untuk kebutuhan kerja harian di Indonesia. Di video ini kita uji ketahanan baterai riil, kompatibilitas aplikasi kerja, video editing, hingga kemampuan emulasi software lawas.\n\n📌 Poin Pembahasan Utama:\n- Performa multitasking & editing video 4K\n- Uji baterai riil browsing vs streaming\n- Kompatibilitas software perbankan, printer & aplikasi x86\n- Kelebihan & kekurangan objektif\n\nBagikan pendapat atau pertanyaan kalian di kolom komentar ya! Jangan lupa like dan subscribe Revisitekno untuk review gadget tanpa basa-basi.\n\n#Revisitekno #ReviewLaptop #WindowsOnARM #SnapdragonXElite #LaptopAI`,
    hashtags: ['#Revisitekno', '#ReviewLaptop', '#WindowsOnARM', '#SnapdragonXElite', '#LaptopAI', '#Gadget2026'],
    tags: [
      'review laptop windows on arm',
      'snapdragon x elite review indonesia',
      'laptop ai 2026',
      'daya tahan baterai laptop arm',
      'kompatibilitas software arm windows',
      'revisitekno',
      'rekomendasi laptop kerja',
      'laptop tahan lama',
    ],
    tagCharactersCount: 228,
    recommendedSchedule: {
      dayOfWeek: 'Jumat & Sabtu',
      timeWindow: '19:00 - 21:00 WIB',
      timezone: 'WIB',
      reasoning: 'Waktu santai malam penonton pekerja/mahasiswa Indonesia untuk menonton ulasan teknologi mendalam.',
      isEstimate: true,
    },
    checklist: {
      titleReviewed: true,
      descriptionReviewed: true,
      tagsReviewed: true,
      thumbnailReady: true,
      videoChecked: false,
      scheduleSelected: true,
    },
    linkedPlanId: 'plan-1',
    createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
  },
];

const INITIAL_ACTIVITIES: AppActivity[] = [
  {
    id: 'act-1',
    action: 'Dibuat',
    itemType: 'plan',
    title: 'Review Jujur: 30 Hari Pakai Laptop AI Windows on ARM',
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'act-2',
    action: 'Diedit',
    itemType: 'script',
    title: 'Review Laptop ARM: Baterai 16 Jam, Tapi Apakah Aman?',
    timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: 'act-3',
    action: 'Disimpan',
    itemType: 'idea',
    title: 'Flagship Killer 2026: Benarkah Masih Ada yang Layak Beli?',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
];

// Helper safe JSON parse
function safeParse<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (e) {
    console.error(`Storage read error on ${key}:`, e);
    return fallback;
  }
}

function safeSave<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Storage write error on ${key}:`, e);
  }
}

export const StorageService = {
  // Profile
  getProfile(): ChannelProfile {
    return safeParse<ChannelProfile>(STORAGE_KEYS.PROFILE, DEFAULT_PROFILE);
  },
  saveProfile(profile: ChannelProfile): void {
    safeSave(STORAGE_KEYS.PROFILE, profile);
    this.logActivity('Diperbarui', 'settings', 'Profil Channel ' + profile.channelName);
  },

  // Settings
  getSettings(): AppSettings {
    return safeParse<AppSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  },
  saveSettings(settings: AppSettings): void {
    safeSave(STORAGE_KEYS.SETTINGS, settings);
  },

  // Ideas
  getIdeas(): VideoIdea[] {
    return safeParse<VideoIdea[]>(STORAGE_KEYS.IDEAS, INITIAL_IDEAS);
  },
  saveIdea(idea: VideoIdea): VideoIdea[] {
    const ideas = this.getIdeas();
    const idx = ideas.findIndex((i) => i.id === idea.id);
    let updated: VideoIdea[];
    if (idx >= 0) {
      updated = [...ideas];
      updated[idx] = { ...idea, updatedAt: new Date().toISOString() };
      this.logActivity('Diedit', 'idea', idea.title);
    } else {
      updated = [idea, ...ideas];
      this.logActivity('Dibuat', 'idea', idea.title);
    }
    safeSave(STORAGE_KEYS.IDEAS, updated);
    return updated;
  },
  deleteIdea(id: string): VideoIdea[] {
    const ideas = this.getIdeas();
    const target = ideas.find((i) => i.id === id);
    const updated = ideas.filter((i) => i.id !== id);
    safeSave(STORAGE_KEYS.IDEAS, updated);
    if (target) this.logActivity('Dihapus', 'idea', target.title);
    return updated;
  },

  // Plans
  getPlans(): VideoPlan[] {
    return safeParse<VideoPlan[]>(STORAGE_KEYS.PLANS, INITIAL_PLANS);
  },
  savePlan(plan: VideoPlan): VideoPlan[] {
    const plans = this.getPlans();
    const idx = plans.findIndex((p) => p.id === plan.id);
    let updated: VideoPlan[];
    if (idx >= 0) {
      updated = [...plans];
      updated[idx] = { ...plan, updatedAt: new Date().toISOString() };
      this.logActivity('Diedit', 'plan', plan.title);
    } else {
      updated = [plan, ...plans];
      this.logActivity('Dibuat', 'plan', plan.title);
    }
    safeSave(STORAGE_KEYS.PLANS, updated);
    return updated;
  },
  deletePlan(id: string): VideoPlan[] {
    const plans = this.getPlans();
    const target = plans.find((p) => p.id === id);
    const updated = plans.filter((p) => p.id !== id);
    safeSave(STORAGE_KEYS.PLANS, updated);
    if (target) this.logActivity('Dihapus', 'plan', target.title);
    return updated;
  },

  // Scripts
  getScripts(): ScriptItem[] {
    return safeParse<ScriptItem[]>(STORAGE_KEYS.SCRIPTS, INITIAL_SCRIPTS);
  },
  saveScript(script: ScriptItem): ScriptItem[] {
    const scripts = this.getScripts();
    const idx = scripts.findIndex((s) => s.id === script.id);
    let updated: ScriptItem[];
    if (idx >= 0) {
      updated = [...scripts];
      updated[idx] = { ...script, updatedAt: new Date().toISOString() };
      this.logActivity('Diedit', 'script', script.title);
    } else {
      updated = [script, ...scripts];
      this.logActivity('Dibuat', 'script', script.title);
    }
    safeSave(STORAGE_KEYS.SCRIPTS, updated);
    return updated;
  },
  deleteScript(id: string): ScriptItem[] {
    const scripts = this.getScripts();
    const target = scripts.find((s) => s.id === id);
    const updated = scripts.filter((s) => s.id !== id);
    safeSave(STORAGE_KEYS.SCRIPTS, updated);
    if (target) this.logActivity('Dihapus', 'script', target.title);
    return updated;
  },

  // Thumbnails
  getThumbnails(): ThumbnailConcept[] {
    return safeParse<ThumbnailConcept[]>(STORAGE_KEYS.THUMBNAILS, INITIAL_THUMBNAILS);
  },
  saveThumbnail(thumbnail: ThumbnailConcept): ThumbnailConcept[] {
    const thumbs = this.getThumbnails();
    const idx = thumbs.findIndex((t) => t.id === thumbnail.id);
    let updated: ThumbnailConcept[];
    if (idx >= 0) {
      updated = [...thumbs];
      updated[idx] = { ...thumbnail, updatedAt: new Date().toISOString() };
      this.logActivity('Diedit', 'thumbnail', thumbnail.title || thumbnail.conceptName);
    } else {
      updated = [thumbnail, ...thumbs];
      this.logActivity('Dibuat', 'thumbnail', thumbnail.title || thumbnail.conceptName);
    }
    safeSave(STORAGE_KEYS.THUMBNAILS, updated);
    return updated;
  },
  deleteThumbnail(id: string): ThumbnailConcept[] {
    const thumbs = this.getThumbnails();
    const target = thumbs.find((t) => t.id === id);
    const updated = thumbs.filter((t) => t.id !== id);
    safeSave(STORAGE_KEYS.THUMBNAILS, updated);
    if (target) this.logActivity('Dihapus', 'thumbnail', target.title || target.conceptName);
    return updated;
  },

  // YouTube SEO & Scheduler
  getSeoPackages(): SeoPackage[] {
    return safeParse<SeoPackage[]>(STORAGE_KEYS.SEO, INITIAL_SEO);
  },
  saveSeoPackage(pkg: SeoPackage): SeoPackage[] {
    const list = this.getSeoPackages();
    const idx = list.findIndex((s) => s.id === pkg.id);
    let updated: SeoPackage[];
    if (idx >= 0) {
      updated = [...list];
      updated[idx] = { ...pkg, updatedAt: new Date().toISOString() };
      this.logActivity('Diedit', 'seo', pkg.selectedTitle || pkg.videoTitle);
    } else {
      updated = [pkg, ...list];
      this.logActivity('Dibuat', 'seo', pkg.selectedTitle || pkg.videoTitle);
    }
    safeSave(STORAGE_KEYS.SEO, updated);
    return updated;
  },
  deleteSeoPackage(id: string): SeoPackage[] {
    const list = this.getSeoPackages();
    const target = list.find((s) => s.id === id);
    const updated = list.filter((s) => s.id !== id);
    safeSave(STORAGE_KEYS.SEO, updated);
    if (target) this.logActivity('Dihapus', 'seo', target.selectedTitle || target.videoTitle);
    return updated;
  },

  // Chats
  getChats(): ChatMessage[] {
    return safeParse<ChatMessage[]>(STORAGE_KEYS.CHATS, [
      {
        id: 'welcome-chat',
        role: 'assistant',
        content:
          'Halo kreator Revisitekno! Saya asisten konten YouTube Anda. Ada rencana video apa yang ingin kita diskusikan hari ini? Saya bisa bantu brainstorming judul CTR tinggi, hook 10 detik pertama, uji logika naskah, atau menyusun poin bahasan review.',
        timestamp: new Date().toISOString(),
      },
    ]);
  },
  saveChats(chats: ChatMessage[]): void {
    safeSave(STORAGE_KEYS.CHATS, chats);
  },
  clearChats(): void {
    const welcome: ChatMessage = {
      id: 'welcome-chat-' + Date.now(),
      role: 'assistant',
      content:
        'Riwayat obrolan telah dibersihkan. Silakan mulai topik baru untuk perencanaan konten YouTube Anda!',
      timestamp: new Date().toISOString(),
    };
    safeSave(STORAGE_KEYS.CHATS, [welcome]);
  },

  // Activities
  getActivities(): AppActivity[] {
    return safeParse<AppActivity[]>(STORAGE_KEYS.ACTIVITIES, INITIAL_ACTIVITIES);
  },
  logActivity(action: string, itemType: AppActivity['itemType'], title: string): void {
    const activities = this.getActivities();
    const newAct: AppActivity = {
      id: 'act-' + Date.now(),
      action,
      itemType,
      title,
      timestamp: new Date().toISOString(),
    };
    const updated = [newAct, ...activities].slice(0, 30);
    safeSave(STORAGE_KEYS.ACTIVITIES, updated);
  },

  // Export & Import
  exportAllData() {
    return {
      version: '1.2',
      exportedAt: new Date().toISOString(),
      profile: this.getProfile(),
      settings: this.getSettings(),
      ideas: this.getIdeas(),
      plans: this.getPlans(),
      scripts: this.getScripts(),
      thumbnails: this.getThumbnails(),
      seoPackages: this.getSeoPackages(),
      activities: this.getActivities(),
    };
  },
  importData(jsonData: any): boolean {
    try {
      if (!jsonData || typeof jsonData !== 'object') return false;
      if (jsonData.profile) safeSave(STORAGE_KEYS.PROFILE, jsonData.profile);
      if (jsonData.settings) safeSave(STORAGE_KEYS.SETTINGS, jsonData.settings);
      if (Array.isArray(jsonData.ideas)) safeSave(STORAGE_KEYS.IDEAS, jsonData.ideas);
      if (Array.isArray(jsonData.plans)) safeSave(STORAGE_KEYS.PLANS, jsonData.plans);
      if (Array.isArray(jsonData.scripts)) safeSave(STORAGE_KEYS.SCRIPTS, jsonData.scripts);
      if (Array.isArray(jsonData.thumbnails)) safeSave(STORAGE_KEYS.THUMBNAILS, jsonData.thumbnails);
      if (Array.isArray(jsonData.seoPackages)) safeSave(STORAGE_KEYS.SEO, jsonData.seoPackages);
      this.logActivity('Diimpor', 'settings', 'Pencadangan Data Workspace');
      return true;
    } catch (e) {
      console.error('Import error:', e);
      return false;
    }
  },
  resetToDefault(): void {
    safeSave(STORAGE_KEYS.PROFILE, DEFAULT_PROFILE);
    safeSave(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    safeSave(STORAGE_KEYS.IDEAS, INITIAL_IDEAS);
    safeSave(STORAGE_KEYS.PLANS, INITIAL_PLANS);
    safeSave(STORAGE_KEYS.SCRIPTS, INITIAL_SCRIPTS);
    safeSave(STORAGE_KEYS.THUMBNAILS, INITIAL_THUMBNAILS);
    safeSave(STORAGE_KEYS.SEO, INITIAL_SEO);
    safeSave(STORAGE_KEYS.ACTIVITIES, INITIAL_ACTIVITIES);
    this.clearChats();
  },
};
