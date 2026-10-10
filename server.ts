import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '25mb' }));

// Helper to get GoogleGenAI client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY belum terdeteksi di environment.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// Clean and extract human-friendly error messages from Gemini SDK errors
function formatErrorMessage(error: any): { message: string; isHighDemand: boolean; isRateLimit: boolean } {
  const rawMsg = error?.message || (typeof error === 'string' ? error : JSON.stringify(error));
  const lower = rawMsg.toLowerCase();

  const isRateLimit =
    lower.includes('429') ||
    lower.includes('resource_exhausted') ||
    lower.includes('quota') ||
    lower.includes('rate-limit') ||
    lower.includes('rate limits') ||
    lower.includes('exceeded your current quota');

  const isHighDemand =
    lower.includes('503') ||
    lower.includes('unavailable') ||
    lower.includes('high demand') ||
    lower.includes('overloaded') ||
    lower.includes('capacity') ||
    lower.includes('service unavailable') ||
    lower.includes('deadline_exceeded') ||
    lower.includes('504');

  if (isRateLimit) {
    return {
      message: 'Batas kuota/laju permintaan API Gemini gratis tercapai (Error 429). Mohon tunggu sekitar 20-30 detik sebelum mencoba lagi.',
      isHighDemand: false,
      isRateLimit: true,
    };
  }

  if (isHighDemand) {
    return {
      message: 'Layanan AI sedang mengalami lonjakan antrean (High Demand / Server Overloaded). Sistem otomatis mengalihkan ke model alternatif atau template cerdas Revisitekno.',
      isHighDemand: true,
      isRateLimit: false,
    };
  }

  if (rawMsg.includes('API_KEY_INVALID') || rawMsg.includes('API key not valid')) {
    return {
      message: 'Kunci API Gemini tidak valid. Silakan periksa pengaturan Secrets di AI Studio.',
      isHighDemand: false,
      isRateLimit: false,
    };
  }

  try {
    const parsed = JSON.parse(rawMsg);
    if (parsed.error?.message) {
      return formatErrorMessage(parsed.error);
    }
  } catch {}

  return { message: rawMsg, isHighDemand: false, isRateLimit: false };
}

// Resilient multi-model cascade helper: tries gemini-3.8-flash -> gemini-3.1-flash-lite -> gemini-flash-latest
async function callGeminiCascade(
  taskLabel: string,
  generateFn: (model: string) => Promise<any>
): Promise<{ data: any; usedModel: string } | null> {
  const modelChain = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
  for (const model of modelChain) {
    try {
      const res = await generateFn(model);
      if (res !== null && res !== undefined) {
        return { data: res, usedModel: model };
      }
    } catch (err: any) {
      console.warn(`[Gemini Cascade] ${taskLabel} on model ${model} failed:`, err?.message || err);
      // Gracefully continue to next model in cascade
    }
  }
  return null;
}

// Fallback script refiner helper
function generateSmartFallbackRefinedText(selectedText: string, action: string, instruction?: string): string {
  switch (action) {
    case 'improve-hook':
      return `[OPSI HOOK 1]\n"Kalian pasti pernah ngalamin ini: ${selectedText.trim()} Padahal solusinya nggak sampai 5 menit!"\n\n[OPSI HOOK 2]\n"Jangan buru-buru ganti perangkat atau keluar uang dulu! Ini fakta sebenarnya yang wajib kalian tahu: ${selectedText.trim()}"`;
    case 'simplify':
      return `Intinya begini:\n- ${selectedText.trim().replace(/([.?!])\s+/g, '$1\n- ')}\n\n(Disederhanakan dengan analogi praktis agar mudah dipahami penonton).`;
    case 'expand':
      return `${selectedText.trim()}\n\nContoh kasus nyata di lapangan:\nBanyak kreator dan pengguna sering mengabaikan faktor ini saat menyusun setup atau memilih komponen, padahal efeknya langsung terasa pada stabilitas sistem jangka panjang.`;
    case 'shorten':
      return selectedText
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean)
        .slice(0, 3)
        .join(' ')
        .substring(0, 220) + '...';
    case 'casual-tone':
      return `Nah, jadi kalian nggak perlu khawatir. ${selectedText.replace(/Anda/g, 'kalian').replace(/pengguna/g, 'kita semua')}`;
    case 'pro-tone':
      return `Berdasarkan parameter pengujian teknis dan metodologi komparasi: ${selectedText}`;
    case 'fact-check-flag':
      return `⚠️ Catatan Verifikasi Fakta:\n- Pastikan klaim spesifikasi teknis pada bagian ini sesuai lembar data resmi pabrikan.\n- Teks asli: "${selectedText}"`;
    default:
      return `${selectedText}\n\n(Catatan polesan: Pastikan penekanan intonasi kuat pada kata kunci utama saat narasi dibacakan).`;
  }
}

// Fallback ideas generator when Gemini API hits rate limits or high demand
function generateSmartFallbackIdeas(topic: string, format: string, audience: string, channelName: string) {
  const cleanTopic = topic.trim();
  const isShorts = format.toLowerCase().includes('short');

  return [
    {
      title: isShorts
        ? `Trik 60 Detik: ${cleanTopic} Dijamin Berhasil!`
        : `Solusi Praktis: ${cleanTopic} (Panduan Lengkap 2026)`,
      coreConcept: `Panduan langkah demi langkah mengatasi masalah "${cleanTopic}" secara efektif tanpa biaya mahal.`,
      hook: isShorts
        ? `PC kamu lemot parah? Jangan buru-buru instal ulang, matikan 3 pengaturan tersembunyi ini sekarang!`
        : `Banyak orang mengira masalah ini butuh ganti hardware baru, padahal solusinya cuma ubah 2 konfigurasi sistem ini.`,
      viewerProblem: `Pengguna frustrasi dengan kinerja sistem yang melambat dan tidak tahu langkah perbaikan yang aman.`,
      talkingPoints: [
        'Identifikasi akar masalah utama dan aplikasi yang membebani kinerja di latar belakang',
        'Langkah pembersihan file sementara (temp files) dan optimasi startup program',
        'Pengaturan daya (Power Plan) dan manajemen memori virtual yang tepat',
        'Rekomendasi pengecekan kesehatan hardware sebelum memutuskan upgrade',
      ],
      structure: isShorts
        ? 'Hook (0-5s) -> Langkah 1 & 2 (5-35s) -> Tips Tambahan (35-50s) -> CTA Subscribe (50-60s)'
        : 'Intro & Bukti Masalah (0:00) -> Trik Cepat Software (2:00) -> Optimasi Storage (5:00) -> Rekomendasi Akhir (8:00)',
      thumbnailDirection: 'Kiri: Layar loading lambat warna merah, Kanan: PC lancar bersinar warna cyan. Teks besar: "JADI NGEBUT LAGI!"',
      difficulty: 'Rendah',
      researchNeeded: 'Verifikasi perintah Windows Run command (%temp%, cleanmgr) dan kompabilitas pada Windows 10 & 11.',
    },
    {
      title: `3 Kesalahan Fatal Penyebab ${cleanTopic} yang Jarang Disadari`,
      coreConcept: `Membahas kebiasaan pengguna dan software pihak ketiga yang justru memperparah kondisi sistem.`,
      hook: `Niatnya mau bikin enteng, tapi pakai software ini malah bikin PC makin lemot. Ini penjelasannya!`,
      viewerProblem: `Pengguna terjebak menggunakan aplikasi pembersih abal-abal yang membebani CPU dan RAM.`,
      talkingPoints: [
        'Mitos aplikasi antivirus ganda atau PC cleaner pihak ketiga',
        'Kapasitas drive C yang hampir penuh dan efeknya ke swap file Windows',
        'Driver komponen lama yang belum diperbarui',
      ],
      structure: 'Hook (0:00) -> Kesalahan 1 (1:30) -> Kesalahan 2 (3:30) -> Kesalahan 3 & Solusi (6:00)',
      thumbnailDirection: 'Ekspresi heran melihat grafik Task Manager merah 100%. Teks: "JANGAN LAKUKAN INI!"',
      difficulty: 'Sedang',
      researchNeeded: 'Cek benchmark beban CPU saat aplikasi cleaner berjalan di background.',
    },
    {
      title: `Upgrade 1 Komponen Ini Buat Solusi: ${cleanTopic}`,
      coreConcept: `Panduan upgrade ekonomis paling berdampak jika optimasi software sudah tidak mempan.`,
      hook: `Cuma modal 200 ribuan, PC jadul ini berasa baru lagi. Ini komponen yang wajib diganti dulu!`,
      viewerProblem: `Pengguna bingung apakah harus beli PC baru atau cukup ganti salah satu komponen saja.`,
      talkingPoints: [
        'Perbandingan kecepatan HDD mekanik vs SSD NVMe/SATA',
        'Kebutuhan minimal RAM untuk multitasking modern di 2026',
        'Kapan saatnya upgrade vs kapan saatnya beli unit baru',
      ],
      structure: 'Hook (0:00) -> Tes Kecepatan Riil (2:00) -> Komparasi Biaya (5:00) -> Kesimpulan Bijak (7:30)',
      thumbnailDirection: 'Komponen SSD/RAM bercahaya di tangan dengan latar studio gelap khas Revisitekno. Teks: "CUMA GANTI INI!"',
      difficulty: 'Sedang',
      researchNeeded: 'Daftar harga pasaran komponen SSD & RAM di marketplace lokal.',
    },
  ];
}

// Fallback script generator
function generateSmartFallbackScript(topic: string, title: string, duration: string) {
  return `[00:00 - HOOK]
Halo semuanya, balik lagi di Revisitekno!
Pernah nggak kalian mau buka kerjaan penting atau buka browser, tapi PC atau laptop kalian mendadak ngelag dan loading-nya muter terus?
Tahan dulu, jangan buru-buru bawa ke tempat servis atau instal ulang Windows!
Di video kali ini, kita bakal bongkar solusi praktis untuk ${topic || title} yang bisa langsung kalian coba dalam 5 menit ke depan.

[01:15 - INTRO & IDENTIFIKASI MASALAH]
Banyak pengguna mengira PC lemot itu karena virus atau speknya udah ketuaan. Padahal 70% kasusnya itu murni karena penumpukan file cache dan aplikasi yang diam-diam jalan di startup.
Yuk kita beresin satu per satu.

[02:30 - LANGKAH 1: BERSIHKAN STARTUP APPS]
Pertama, tekan Ctrl + Shift + Esc buat buka Task Manager. 
Masuk ke tab Startup Apps. Perhatikan aplikasi yang dampak startup-nya 'High'.
Matikan aplikasi chatting atau launcher game yang nggak kalian butuhkan saat komputer baru dinyalakan.

[04:45 - LANGKAH 2: HAPUS JUNK & TEMP FILES]
Kedua, tekan Windows + R, ketik %temp% lalu tekan Enter.
Hapus semua file di folder ini. Jangan takut, ini murni file sampah sisa instalasi yang bikin drive C sesak dan lambat membaca data.

[06:30 - KESIMPULAN REVISITEKNO]
Dengan dua langkah sederhana ini aja, waktu booting dan responsivitas PC kalian biasanya bakal naik signifikan. 
Kalau performa masih kurang, baru pertimbangkan upgrade dari HDD ke SSD yang harganya sekarang udah sangat terjangkau.

[07:45 - CALL TO ACTION]
Gimana hasilnya di PC kalian? Apakah ada perubahan? Tulis hasil pengujian kalian di kolom komentar ya! Jangan lupa like dan subscribe Revisitekno buat tips teknologi tanpa basa-basi. Sampai jumpa di video berikutnya!`;
}

// --- API ROUTES ---

// 1. Health & Config status
app.get('/api/status', (req, res) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '');
  res.json({
    ok: true,
    hasApiKey: hasKey,
    model: 'gemini-3.8-flash',
    fallbackModels: ['gemini-3.1-flash-lite', 'gemini-flash-latest'],
    ttsModel: 'gemini-3.8-flash-lite-tts',
    imageModel: 'gemini-3.1-flash-lite-image',
    channelDefault: 'Revisitekno',
  });
});

// 2. AI Assistant Chat
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, channelProfile, currentContext } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Daftar pesan tidak boleh kosong.' });
    }

    const systemInstruction = `Anda adalah Revisitekno AI, asisten kreatif personal untuk kreator konten YouTube teknologi (Channel: "${channelProfile?.channelName || 'Revisitekno'}").
Fokus Niche: ${channelProfile?.niche || 'Review gadget, tutorial teknologi, perbandingan smartphone/PC, AI tools, dan analisis teknologi'}.
Target Audiens: ${channelProfile?.targetAudience || 'Penggemar teknologi di Indonesia, mahasiswa, pekerja IT, dan pembeli gadget cerdas'}.
Gaya Bahasa: Santai, informatif, lugas, ramah, dan solutif dalam Bahasa Indonesia.
Filosofi: AI membantu kreator merencanakan konten, bukan menggantikan kreativitas kreator. Jangan pernah mengarang angka analitik fiktif (view, subscriber, search volume palsu). Berikan saran struktur video yang realistis dan praktis.
Konteks aktif: ${currentContext ? JSON.stringify(currentContext) : 'Tidak ada'}.`;

    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    let reply = '';
    const cascadeResult = await callGeminiCascade('Chat', async (model) => {
      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model,
        contents,
        config: { systemInstruction, temperature: 0.7 },
      });
      return response.text || '';
    });

    if (cascadeResult && cascadeResult.data && cascadeResult.data.trim()) {
      reply = cascadeResult.data;
    } else {
      reply = `Halo kreator Revisitekno! Server AI saat ini sedang memproses antrean permintaan tinggi (High Demand).

Berikut strategi cepat untuk topik teknologi Anda:
1. **Hook 5-10 Detik:** Tampilkan masalah nyata pengguna di awal video (contoh: bottleneck performa, baterai boros, atau komparasi harga riil).
2. **Struktur Pembahasan:** Bagi pembahasan ke dalam segmen ringkas dengan catatan visual B-roll yang jelas.
3. **Optimasi YouTube Studio:** Manfaatkan fitur YouTube SEO & Scheduler di menu samping untuk mendapatkan rekomendasi judul CTR tinggi, 500 karakter tag YouTube Studio, dan saran jadwal upload terbaik.

Anda dapat terus menyusun rencana produksi melalui Video Planner atau Script Studio tanpa hambatan.`;
    }

    res.json({ reply });
  } catch (error: any) {
    console.error('Chat error:', error);
    const formatted = formatErrorMessage(error);
    res.json({
      reply: `Halo kreator Revisitekno! ${formatted.message} Anda tetap dapat menggunakan Video Planner, Script Studio, dan YouTube SEO & Scheduler untuk melanjutkan pekerjaan Anda.`,
    });
  }
});

// 3. Idea Generator
app.post('/api/ideas/generate', async (req, res) => {
  const { topic, audience, format, objective, tone, additionalNotes, channelProfile } = req.body;

  try {
    const prompt = `Sebagai konsultan konten YouTube teknologi untuk ${channelProfile?.channelName || 'Revisitekno'}, buatkan 4 ide video YouTube yang terstruktur dan siap eksekusi.
Kriteria:
- Topik/Niche: ${topic || 'Teknologi & Gadget Terbaru'}
- Target Audiens: ${audience || 'Penonton Indonesia antusias teknologi'}
- Format Video: ${format || 'Video Panjang (Long-form YouTube)'}
- Tujuan Konten: ${objective || 'Edukasi & Rekomendasi'}
- Tone/Nada: ${tone || 'Santai & Informatif'}
- Catatan Tambahan: ${additionalNotes || 'Tidak ada'}

Pastikan ide realistis untuk diproduksi seorang kreator teknologi. Kembalikan dalam format JSON.`;

    const schemaConfig = {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: 'Judul video yang menarik dan tidak berlebihan' },
            coreConcept: { type: Type.STRING, description: 'Inti konsep dan premis video' },
            hook: { type: Type.STRING, description: 'Kalimat pembuka 5-10 detik pertama untuk menarik penonton' },
            viewerProblem: { type: Type.STRING, description: 'Masalah atau rasa penasaran penonton yang dijawab' },
            talkingPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Poin-poin pembahasan utama (3-5 poin)',
            },
            structure: { type: Type.STRING, description: 'Rancangan struktur video dari awal hingga akhir' },
            thumbnailDirection: { type: Type.STRING, description: 'Ide visual thumbnail yang mencolok' },
            difficulty: { type: Type.STRING, description: 'Tingkat kesulitan produksi: Rendah, Sedang, atau Tinggi' },
            researchNeeded: { type: Type.STRING, description: 'Riset atau verifikasi data yang wajib dilakukan kreator' },
          },
          required: ['title', 'coreConcept', 'hook', 'talkingPoints', 'structure', 'thumbnailDirection'],
        },
      },
    };

    const cascadeResult = await callGeminiCascade('Ideas', async (model) => {
      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: schemaConfig,
      });
      return response.text || '';
    });

    if (cascadeResult && cascadeResult.data) {
      try {
        const parsed = JSON.parse(cascadeResult.data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return res.json({ ideas: parsed, isFallback: false });
        }
      } catch (parseErr) {
        console.warn('Failed to parse ideas JSON, using fallback:', parseErr);
      }
    }

    // Graceful fallback
    const fallbackIdeas = generateSmartFallbackIdeas(
      topic || 'Optimasi Komputer',
      format || 'YouTube Shorts',
      audience || 'Pengguna PC Indonesia',
      channelProfile?.channelName || 'Revisitekno'
    );
    res.json({
      ideas: fallbackIdeas,
      isFallback: true,
      notice: 'Server AI sedang dalam lonjakan antrean (High Demand). Ide disusun menggunakan template cerdas Revisitekno agar alur kerja Anda tetap berjalan lancar.',
    });
  } catch (error: any) {
    console.error('Idea generation error:', error);
    const fallbackIdeas = generateSmartFallbackIdeas(
      topic || 'Optimasi Komputer',
      format || 'YouTube Shorts',
      audience || 'Pengguna PC Indonesia',
      channelProfile?.channelName || 'Revisitekno'
    );
    res.json({
      ideas: fallbackIdeas,
      isFallback: true,
      notice: 'Ide otomatis dirancang dengan template cerdas Revisitekno agar perencanaan Anda tidak terhenti.',
    });
  }
});

// 4. Script Studio Generator
app.post('/api/scripts/generate', async (req, res) => {
  const { topic, title, audience, format, duration, tone, objective, talkingPoints, researchNotes, additionalNotes } = req.body;

  try {
    const prompt = `Tuliskan draf naskah (skrip) YouTube lengkap dalam Bahasa Indonesia untuk konten teknologi.
Informasi:
- Judul Video: ${title || topic}
- Topik: ${topic}
- Format Video: ${format || 'Video Panjang (Long-form)'}
- Target Durasi: ${duration || '8-10 menit'}
- Nada Bicara: ${tone || 'Santai tapi terpercaya (Casual tech review)'}
- Audiens: ${audience || 'Pecinta gadget Indonesia'}
- Tujuan Konten: ${objective || 'Membantu penonton mengambil keputusan'}
- Poin Pembahasan: ${Array.isArray(talkingPoints) ? talkingPoints.join(', ') : talkingPoints || '-'}
- Catatan Riset: ${researchNotes || '-'}
- Instruksi Khusus: ${additionalNotes || '-'}

Naskah harus menyertakan:
1. Hook (0:00 - 0:15)
2. Intro & Context
3. Pembahasan Inti (bagi dalam segmen-segmen logis dengan catatan visual/B-roll)
4. Kesimpulan & Opini Pribadi Kreator
5. Call-To-Action (CTA) yang natural
6. Catatan Produksi / Verifikasi Teknis yang harus dicek sebelum rekaman.`;

    const cascadeResult = await callGeminiCascade('Script', async (model) => {
      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction: 'Anda adalah penulis naskah video YouTube teknologi profesional Indonesia. Buat naskah yang mengalir alami saat dibacakan, hindari kalimat yang kaku atau terlalu akademis.',
          temperature: 0.7,
        },
      });
      return response.text || '';
    });

    if (cascadeResult && cascadeResult.data && cascadeResult.data.trim()) {
      return res.json({ script: cascadeResult.data, isFallback: false });
    }

    const scriptText = generateSmartFallbackScript(topic, title, duration);
    return res.json({
      script: scriptText,
      isFallback: true,
      notice: 'Draf naskah dirancang menggunakan struktur teruji Revisitekno karena server AI sedang dalam lonjakan antrean (High Demand).',
    });
  } catch (error: any) {
    console.error('Script generate error:', error);
    const scriptText = generateSmartFallbackScript(topic, title, duration);
    res.json({
      script: scriptText,
      isFallback: true,
      notice: 'Draf naskah dirancang menggunakan struktur teruji Revisitekno.',
    });
  }
});

// 5. Script Refiner (Rewrite section, improve hook, simplify, expand, tone, fact-check)
app.post('/api/scripts/refine', async (req, res) => {
  const { action, selectedText, fullScriptContext, instruction } = req.body;
  if (!selectedText) {
    return res.status(400).json({ error: 'Teks yang dipilih tidak boleh kosong.' });
  }

  try {
    let taskDescription = '';
    switch (action) {
      case 'improve-hook':
        taskDescription = 'Buat 2 variasi hook (kalimat pembuka) yang jauh lebih memikat, menciptakan loop rasa penasaran (curiosity loop), dan singkat untuk 5-10 detik pertama.';
        break;
      case 'simplify':
        taskDescription = 'Sederhanakan penjelasan teknologi ini agar mudah dipahami penonton awam tanpa kehilangan akurasi teknisnya.';
        break;
      case 'expand':
        taskDescription = 'Perluas bagian ini dengan analogi yang relevan, contoh kasus penggunaan nyata dalam kehidupan sehari-hari, dan detail pendukung.';
        break;
      case 'shorten':
        taskDescription = 'Padatkan bagian ini, hilangkan kata-kata pengisi (filler words) yang bertele-tele, jadikan lebih to-the-point dan ritme lebih cepat.';
        break;
      case 'casual-tone':
        taskDescription = 'Ubah gaya bahasa menjadi lebih santai, seperti ngobrol santai dengan teman sesama antusias gadget.';
        break;
      case 'pro-tone':
        taskDescription = 'Ubah gaya bahasa menjadi lebih profesional, analitis, dan berbobot seperti jurnalis teknologi terpercaya.';
        break;
      case 'fact-check-flag':
        taskDescription = 'Periksa klaim atau pernyataan teknis pada teks ini. Tunjukkan bagian mana yang berpotensi keliru, butuh verifikasi spesifikasi resmi, atau memerlukan disclaimer.';
        break;
      case 'custom':
      default:
        taskDescription = instruction || 'Perbaiki dan poles teks ini.';
        break;
    }

    const prompt = `Konteks Keseluruhan Naskah (referensi):
"""
${fullScriptContext ? fullScriptContext.substring(0, 1000) + '...' : 'Tidak ada'}
"""

Teks Bagian yang Ingin Diperbaiki:
"""
${selectedText}
"""

Tugas:
${taskDescription}

Instruksi Tambahan:
- Berikan hasil perbaikan dalam Bahasa Indonesia.
- Jangan mengganti bagian di luar teks yang dipilih.
- Sertakan penjelasan singkat mengenai perubahan yang dilakukan agar kreator dapat membandingkan dengan teks asli.`;

    const cascadeResult = await callGeminiCascade('RefineScript', async (model) => {
      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: { temperature: 0.7 },
      });
      return response.text || '';
    });

    if (cascadeResult && cascadeResult.data && cascadeResult.data.trim()) {
      return res.json({ refinedText: cascadeResult.data, isFallback: false });
    }

    const fallbackRefined = generateSmartFallbackRefinedText(selectedText, action, instruction);
    return res.json({ refinedText: fallbackRefined, isFallback: true });
  } catch (error: any) {
    console.error('Script refine error:', error);
    const fallbackRefined = generateSmartFallbackRefinedText(selectedText, action, instruction);
    res.json({ refinedText: fallbackRefined, isFallback: true });
  }
});

// 6. Thumbnail Lab Concept Generator
app.post('/api/thumbnails/generate', async (req, res) => {
  const { title, topic, audience, style, notes, channelProfile } = req.body;

  const fallbackConcepts = [
    {
      conceptName: 'Kontras Ekstrem: Masalah vs Solusi',
      mainSubject: 'Host dengan ekspresi kaget menunjuk layar PC yang macet dengan tanda silang merah',
      composition: 'Split-screen: Setengah kiri masalah (layar merah), setengah kanan solusi (layar cyan lancar)',
      focalPoint: 'Grafis indikator CPU/Disk 100% merah terang',
      background: 'Dark tech studio dengan rim light cyan khas Revisitekno',
      colors: ['#0B0F17 (Hitam Obsidian)', '#EF4444 (Merah Peringatan)', '#00F0FF (Cyan Neon)'],
      textOverlay: 'JANGAN FORMAT DULU!',
      textPlacement: 'Kiri atas (Aman dari zona timestamp durasi)',
      contrastAndReadability: 'Teks font sans-serif tebal putih berbayang hitam kontras di layar HP',
      imagePrompt: `YouTube thumbnail 16:9, split screen comparison, tech reviewer looking shocked at slow computer screen, high contrast, cyan neon and red highlights, professional studio lighting`,
    },
    {
      conceptName: 'Solusi 1 Komponen Praktis',
      mainSubject: 'Tangan memegang komponen SSD/RAM di depan PC desktop terbuka',
      composition: 'Rule of thirds dengan fokus makro pada komponen hardware',
      focalPoint: 'Komponen hardware yang bersinar tajam',
      background: 'Latar workstation gelap minimalis dengan pencahayaan dramatis',
      colors: ['#111827 (Dark Navy)', '#22C55E (Hijau Berhasil)', '#FFFFFF (Putih Tajam)'],
      textOverlay: 'JADI NGEBUT TOTAL!',
      textPlacement: 'Kiri bawah dan tengah kiri',
      contrastAndReadability: 'Tipografi besar bergaris tegas, mudah terbaca dalam resolusi 720p',
      imagePrompt: `YouTube thumbnail 16:9, tech creator holding a computer component in focus, dark workstation background with soft bokeh, cinematic lighting, sharp details`,
    },
    {
      conceptName: 'Bedah Fakta & Perbandingan Jujur',
      mainSubject: 'Smartphone atau komponen gadget diapit dua meter pengujian performa',
      composition: 'Simetris tengah dengan aksen lighting cyber blue',
      focalPoint: 'Display gadget di pusat frame',
      background: 'Studio backdrop heksagonal gelap dengan aksen LED lembut',
      colors: ['#0A101D', '#38BDF8', '#F59E0B'],
      textOverlay: 'FAKTA ATAU MITOS?',
      textPlacement: 'Tengah atas',
      contrastAndReadability: 'Teks kuning emas bergaris tepi hitam solid',
      imagePrompt: `YouTube thumbnail 16:9, modern tech comparison review, high contrast dark theme, vivid accents, crystal clear lighting`,
    },
  ];

  try {
    const prompt = `Sebagai direktur visual YouTube untuk channel teknologi ${channelProfile?.channelName || 'Revisitekno'}, buatkan 3 konsep thumbnail 16:9 yang memiliki rasio klik-tayang (CTR) tinggi tanpa clickbait murahan.
Video Info:
- Judul: ${title || topic}
- Topik: ${topic}
- Target Audiens: ${audience || 'Penonton Indonesia antusias teknologi'}
- Gaya Visual: ${style || 'Dark Tech Kontras Tinggi'}
- Catatan Khusus: ${notes || '-'}

Kembalikan hasil dalam format JSON Array.`;

    const schemaConfig = {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            conceptName: { type: Type.STRING, description: 'Nama ringkas konsep' },
            mainSubject: { type: Type.STRING, description: 'Subjek utama' },
            composition: { type: Type.STRING, description: 'Komposisi' },
            focalPoint: { type: Type.STRING, description: 'Titik fokus pertama mata penonton' },
            background: { type: Type.STRING, description: 'Latar belakang' },
            colors: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Palet warna dominan',
            },
            textOverlay: { type: Type.STRING, description: 'Teks thumbnail (2-4 kata besar)' },
            textPlacement: { type: Type.STRING, description: 'Posisi teks' },
            contrastAndReadability: { type: Type.STRING, description: 'Pertimbangan kontras di HP' },
            imagePrompt: { type: Type.STRING, description: 'Prompt gambar bahasa Inggris' },
          },
          required: ['conceptName', 'mainSubject', 'composition', 'focalPoint', 'background', 'colors', 'textOverlay', 'imagePrompt'],
        },
      },
    };

    const cascadeResult = await callGeminiCascade('ThumbnailConcepts', async (model) => {
      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: schemaConfig,
      });
      return response.text || '';
    });

    if (cascadeResult && cascadeResult.data) {
      try {
        const parsed = JSON.parse(cascadeResult.data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return res.json({ concepts: parsed, isFallback: false });
        }
      } catch (parseErr) {
        console.warn('Failed to parse thumbnail concepts, using fallback:', parseErr);
      }
    }

    return res.json({
      concepts: fallbackConcepts,
      isFallback: true,
      notice: 'Konsep thumbnail dirancang dengan template visual Revisitekno karena server AI sedang dalam lonjakan antrean (High Demand).',
    });
  } catch (error: any) {
    console.error('Thumbnail generate error:', error);
    res.json({
      concepts: fallbackConcepts,
      isFallback: true,
      notice: 'Konsep thumbnail dirancang dengan template visual Revisitekno.',
    });
  }
});

// Helper to generate a production-ready 1280x720 Dark Tech SVG YouTube Thumbnail
function generateDarkTechThumbnailSvg(prompt: string, title?: string, textOverlay?: string): string {
  const displayHeadline = (textOverlay || title || prompt || 'REVISITEKNO TECH GUIDE')
    .toUpperCase()
    .replace(/[<>&"']/g, '')
    .substring(0, 45);

  const cleanPrompt = (prompt || '').replace(/[<>&"']/g, '').substring(0, 100);

  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" width="1280" height="720">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0a101d"/>
      <stop offset="50%" stop-color="#0f1b2d"/>
      <stop offset="100%" stop-color="#05080e"/>
    </linearGradient>
    <linearGradient id="cyanGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#00f0ff"/>
      <stop offset="100%" stop-color="#3b82f6"/>
    </linearGradient>
    <radialGradient id="glowLeft" cx="20%" cy="30%" r="50%">
      <stop offset="0%" stop-color="#00f0ff" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#00f0ff" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glowRight" cx="80%" cy="70%" r="50%">
      <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#3b82f6" stop-opacity="0"/>
    </radialGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="#000000" flood-opacity="0.9"/>
    </filter>
    <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#00f0ff" stroke-width="0.75" stroke-opacity="0.08"/>
    </pattern>
  </defs>

  <!-- Background Layer -->
  <rect width="1280" height="720" fill="url(#bgGrad)"/>
  <rect width="1280" height="720" fill="url(#gridPattern)"/>

  <!-- Radial Atmosphere Lighting -->
  <rect width="1280" height="720" fill="url(#glowLeft)"/>
  <rect width="1280" height="720" fill="url(#glowRight)"/>

  <!-- Frame & Cyber Accents -->
  <rect x="24" y="24" width="1232" height="672" rx="16" fill="none" stroke="#1e293b" stroke-width="2"/>
  <rect x="24" y="24" width="1232" height="672" rx="16" fill="none" stroke="#00f0ff" stroke-width="1.5" stroke-dasharray="120 40 20 40"/>

  <!-- Brand Channel Pill -->
  <g transform="translate(60, 60)">
    <rect width="260" height="48" rx="10" fill="#0c1626" stroke="#00f0ff" stroke-width="1.5"/>
    <circle cx="28" cy="24" r="8" fill="#00f0ff"/>
    <text x="50" y="31" fill="#f8fafc" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="800" letter-spacing="2">REVISITEKNO AI</text>
  </g>

  <!-- 4K Resolution Badge -->
  <g transform="translate(340, 60)">
    <rect width="140" height="48" rx="10" fill="#0a121f" stroke="#334155" stroke-width="1.5"/>
    <text x="70" y="31" fill="#38bdf8" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="700" text-anchor="middle">4K ULTRA HD</text>
  </g>

  <!-- Main Headline Box -->
  <g transform="translate(60, 240)" filter="url(#shadow)">
    <rect width="1000" height="180" rx="18" fill="#060b13" fill-opacity="0.9" stroke="url(#cyanGrad)" stroke-width="3"/>
    <!-- Decorative side line -->
    <rect x="0" y="0" width="16" height="180" rx="6" fill="url(#cyanGrad)"/>
    <text x="45" y="110" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="54" font-weight="900" letter-spacing="1">
      ${displayHeadline}
    </text>
  </g>

  <!-- Subtitle / Concept Guidance -->
  <g transform="translate(75, 470)">
    <rect width="800" height="56" rx="10" fill="#0f172a" fill-opacity="0.8" stroke="#334155" stroke-width="1"/>
    <text x="24" y="35" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="600">
      ⚡ Konsep Visual 16:9 • Kontras Layar HP Dioptimalkan
    </text>
  </g>

  <!-- Tech Specs Mockup Pills -->
  <g transform="translate(60, 580)">
    <rect width="210" height="44" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="1"/>
    <text x="105" y="28" fill="#e2e8f0" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="700" text-anchor="middle">✓ REVIEW JUJUR</text>
  </g>
  <g transform="translate(290, 580)">
    <rect width="220" height="44" rx="8" fill="#1e293b" stroke="#00f0ff" stroke-width="1"/>
    <text x="110" y="28" fill="#e2e8f0" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="700" text-anchor="middle">⚡ BENCHMARK 2026</text>
  </g>

  <!-- YouTube Duration Safe Zone Indicator (Bottom-Right) -->
  <g transform="translate(1080, 620)">
    <rect width="140" height="48" rx="8" fill="#000000" fill-opacity="0.92" stroke="#ef4444" stroke-width="1.5"/>
    <text x="70" y="30" fill="#f87171" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="700" text-anchor="middle">ZONA DURASI</text>
  </g>
</svg>`;

  const base64 = Buffer.from(svgContent).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

// 7. Thumbnail Lab Image Preview Generator (Gemini Flash Lite Image + Resilient Fallback)
app.post('/api/thumbnails/preview-image', async (req, res) => {
  const { prompt, title, textOverlay } = req.body;
  if (!prompt && !title && !textOverlay) {
    return res.status(400).json({ error: 'Data judul atau prompt thumbnail tidak boleh kosong.' });
  }

  try {
    const ai = getGeminiClient();

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-image',
      contents: {
        parts: [
          {
            text: `High quality YouTube video thumbnail, 16:9 aspect ratio, dark tech aesthetic, sharp focus, professional studio lighting, high contrast: ${prompt || title}`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: '16:9',
        },
      },
    });

    let imageUrl = '';
    const parts = response.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
        break;
      }
    }

    if (!imageUrl) {
      throw new Error('Model tidak mengembalikan data gambar.');
    }

    return res.json({ imageUrl, isFallback: false });
  } catch (error: any) {
    console.warn('AI image generation unavailable or paid tier required, serving Dark Tech SVG preview:', error?.message);

    // Generate production-grade 1280x720 Dark Tech graphic card so user never faces broken state!
    const fallbackSvg = generateDarkTechThumbnailSvg(prompt, title, textOverlay);

    return res.json({
      imageUrl: fallbackSvg,
      isFallback: true,
      notice: 'Model pembuatan gambar AI generatif murni memerlukan akun Google Cloud berbayar (Paid Tier). Revisitekno AI secara otomatis membuatkan kartu desain visual grafis 16:9 beresolusi tinggi siap pakai.',
    });
  }
});

// 8. Voice Studio - Synthesize Single Audio Chunk (gemini-3.8-flash-lite-tts)
app.post('/api/tts/synthesize', async (req, res) => {
  try {
    const { text, voiceName = 'Kore', style = 'Clear, engaging Indonesian tech video narrator' } = req.body;

    if (!text || typeof text !== 'string' || text.trim() === '') {
      return res.status(400).json({ error: 'Teks narasi tidak boleh kosong.' });
    }

    const validVoices = ['Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'];
    const chosenVoice = validVoices.includes(voiceName) ? voiceName : 'Kore';

    const ai = getGeminiClient();

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: text.trim(),
              speechMetadata: {
                style,
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: chosenVoice },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      return res.status(500).json({ error: 'Model tidak mengembalikan data audio yang valid.' });
    }

    res.json({
      audioBase64: base64Audio,
      mimeType: 'audio/wav',
      voiceName: chosenVoice,
      charCount: text.length,
    });
  } catch (error: any) {
    console.error('TTS Synthesize error:', error);
    const formatted = formatErrorMessage(error);
    res.status(formatted.isRateLimit ? 429 : 500).json({
      error: formatted.message,
    });
  }
});

// 9. Voice Studio - Combine Multiple Audio Chunks into One Valid WAV
app.post('/api/tts/combine', async (req, res) => {
  try {
    const { chunks } = req.body;
    if (!chunks || !Array.isArray(chunks) || chunks.length === 0) {
      return res.status(400).json({ error: 'Daftar segmen audio kosong.' });
    }

    if (chunks.length === 1) {
      return res.json({
        combinedAudioBase64: chunks[0],
        mimeType: 'audio/wav',
        chunkCount: 1,
      });
    }

    const buffers = chunks.map((c: string) => Buffer.from(c, 'base64'));
    const validBuffers = buffers.filter((b) => b.length > 44 && b.subarray(0, 4).toString() === 'RIFF');

    if (validBuffers.length === 0) {
      return res.status(400).json({ error: 'Format audio chunk tidak dikenali sebagai file WAV yang valid.' });
    }

    const firstHeader = Buffer.from(validBuffers[0].subarray(0, 44));
    const pcmParts: Buffer[] = validBuffers.map((b) => b.subarray(44));
    const mergedPCM = Buffer.concat(pcmParts);

    const totalDataLength = mergedPCM.length;
    const totalFileSize = totalDataLength + 36;

    firstHeader.writeUInt32LE(totalFileSize, 4);
    firstHeader.writeUInt32LE(totalDataLength, 40);

    const finalWavBuffer = Buffer.concat([firstHeader, mergedPCM]);
    const combinedBase64 = finalWavBuffer.toString('base64');

    res.json({
      combinedAudioBase64: combinedBase64,
      mimeType: 'audio/wav',
      chunkCount: validBuffers.length,
      byteLength: finalWavBuffer.length,
    });
  } catch (error: any) {
    console.error('TTS Combine error:', error);
    const formatted = formatErrorMessage(error);
    res.status(500).json({ error: formatted.message });
  }
});

// Helper for SEO Fallback
function generateSmartFallbackSeo(title: string, topic: string, keyword: string, format: string, audience: string) {
  const cleanTitle = title || topic || 'Tips & Review Teknologi Terbaru';
  const cleanKw = keyword || topic || 'teknologi gadget';
  const isShorts = format?.toLowerCase().includes('short');

  const alternativeTitles = isShorts
    ? [
        `Trik 60 Detik: ${cleanTitle}`,
        `Jangan Sampai Salah! Rahasia ${cleanKw}`,
        `3 Hal Wajib Tahu Soal ${cleanKw} di 2026`,
        `Solusi Kilat: ${cleanTitle}`,
        `Sebelum Coba, Simak Trik ${cleanKw} Ini!`,
      ]
    : [
        `${cleanTitle} — Kupas Tuntas & Panduan Lengkap 2026`,
        `Review Jujur & Pengalaman Pakai: ${cleanTitle}`,
        `Jangan Beli Dulu Sebelum Tonton Ini: ${cleanKw}`,
        `Solusi Nyata ${cleanKw} Tanpa Basa-Basi (Revisitekno)`,
        `3 Hal Penting Seputar ${cleanKw} yang Jarang Dibahas`,
      ];

  const description = isShorts
    ? `Tips kilat dan fakta penting seputar ${cleanTitle}.\nSimak penjelasannya sampai tuntas!\n\nJangan lupa like, share, dan subscribe Revisitekno untuk update trik gadget dan teknologi harian.\n\n#Shorts #Revisitekno #${cleanKw.replace(/[^a-zA-Z0-9]/g, '') || 'Teknologi'} #TipsTeknologi`
    : `Di video kali ini, Revisitekno membahas tuntas tentang ${cleanTitle}.\nKami menguji langsung dan membagikan poin-poin penting seputar ${cleanKw} agar Anda mendapatkan gambaran yang jelas, objektif, dan realistis.\n\n📌 Pokok Pembahasan:\n- Gambaran umum dan latar belakang topik\n- Pengujian / poin kritis yang wajib diperhatikan\n- Kelebihan, kekurangan, dan kompromi tersembunyi\n- Kesimpulan & rekomendasi bijak dari Revisitekno\n\nPunya pengalaman atau pertanyaan seputar topik ini? Tulis pendapat kalian di kolom komentar di bawah!\n\nJangan lupa dukung channel ini dengan Like, Share, dan Subscribe agar tidak ketinggalan ulasan teknologi terpercaya lainnya.\n\n#Revisitekno #${cleanKw.replace(/[^a-zA-Z0-9]/g, '') || 'Gadget'} #ReviewTeknologi #Gadget2026`;

  const hashtags = [
    '#Revisitekno',
    `#${cleanKw.replace(/[^a-zA-Z0-9]/g, '') || 'Teknologi'}`,
    isShorts ? '#Shorts' : '#ReviewGadget',
    '#TeknologiIndonesia',
    '#TipsTeknologi',
    '#Gadget2026',
  ];

  const rawTags = [
    cleanKw.toLowerCase(),
    cleanTitle.toLowerCase().substring(0, 45),
    'revisitekno',
    'review teknologi indonesia',
    'tips gadget',
    `${cleanKw.toLowerCase()} 2026`,
    'panduan teknologi',
    'rekomendasi gadget',
    'tutorial teknologi',
    'gadget reviewer indonesia',
  ];

  // Enforce YouTube Studio 500 characters limit
  const finalTags: string[] = [];
  let totalChars = 0;
  for (const t of rawTags) {
    const cost = t.length + (finalTags.length > 0 ? 1 : 0);
    if (totalChars + cost <= 480) {
      finalTags.push(t);
      totalChars += cost;
    }
  }

  const recommendedSchedule = isShorts
    ? {
        dayOfWeek: 'Setiap Hari (Senin - Minggu)',
        timeWindow: '12:00 - 13:30 WIB & 17:30 - 19:30 WIB',
        timezone: 'WIB',
        reasoning: 'Format Shorts memiliki engagement tertinggi saat jam istirahat siang dan perjalanan pulang di Indonesia.',
        isEstimate: true,
      }
    : {
        dayOfWeek: 'Kamis, Jumat, atau Sabtu',
        timeWindow: '18:30 - 20:30 WIB',
        timezone: 'WIB',
        reasoning: 'Waktu santai malam prime-time penonton teknologi Indonesia untuk menonton ulasan berdurasi panjang.',
        isEstimate: true,
      };

  return {
    alternativeTitles,
    description,
    hashtags,
    tags: finalTags,
    tagCharactersCount: totalChars,
    recommendedSchedule,
  };
}

// 10. YouTube SEO & Scheduler Generator
app.post('/api/seo/generate', async (req, res) => {
  const { videoTitle, videoTopic, mainKeyword, videoScript, videoFormat, targetAudience, channelProfile } = req.body;

  try {
    const prompt = `Sebagai pakar YouTube SEO dan strategi distribusi konten untuk channel teknologi ${channelProfile?.channelName || 'Revisitekno'}, buatkan paket lengkap SEO YouTube dan rekomendasi jadwal publikasi.
Data Video:
- Judul Saat Ini: ${videoTitle || videoTopic}
- Topik: ${videoTopic}
- Kata Kunci Utama: ${mainKeyword || videoTopic}
- Format: ${videoFormat || 'Long-form'}
- Target Audiens: ${targetAudience || 'Penggemar teknologi di Indonesia'}
- Ringkasan / Naskah: ${videoScript ? videoScript.substring(0, 1000) : 'Tidak ada'}

Instruksi Khusus:
1. alternativeTitles: Buat 5 alternatif judul YouTube yang menarik (CTR tinggi), alami, relevan, dan TIDAK clickbait menyesatkan.
2. description: Buat deskripsi YouTube Bahasa Indonesia yang ramah algoritma dan penonton. Jangan mengarang tautan (links) palsu, sponsorship fiktif, atau klaim yang tidak ada.
3. hashtags: Buat 5-8 hashtag relevan (diawali tanda #) yang cocok untuk deskripsi video.
4. tags: Buat 8-12 tag video YouTube Studio (tanpa tanda #). Pastikan total panjang semua tag jika digabung dengan koma TIDAK MELEBIHI 480 karakter (batas YouTube adalah 500 karakter).
5. recommendedSchedule: Berikan rekomendasi hari (dayOfWeek) dan rentang jam terbaik (timeWindow dalam WIB) beserta alasan objektif berbasis pola penonton teknologi Indonesia. Tandai isEstimate: true secara transparan karena ini estimasi cerdas.`;

    const schemaConfig = {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          alternativeTitles: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: '5 judul alternatif ber-CTR tinggi',
          },
          description: {
            type: Type.STRING,
            description: 'Deskripsi lengkap video YouTube siap copy-paste',
          },
          hashtags: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Daftar hashtag (5-8 item)',
          },
          tags: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Daftar tag YouTube Studio (maksimal total 480 karakter)',
          },
          recommendedSchedule: {
            type: Type.OBJECT,
            properties: {
              dayOfWeek: { type: Type.STRING, description: 'Hari terbaik dalam seminggu' },
              timeWindow: { type: Type.STRING, description: 'Rentang jam terbaik (misal: 18:30 - 20:30 WIB)' },
              timezone: { type: Type.STRING, description: 'WIB' },
              reasoning: { type: Type.STRING, description: 'Alasan rekomendasi berbasis perilaku audiens' },
              isEstimate: { type: Type.BOOLEAN, description: 'true' },
            },
            required: ['dayOfWeek', 'timeWindow', 'reasoning', 'isEstimate'],
          },
        },
        required: ['alternativeTitles', 'description', 'hashtags', 'tags', 'recommendedSchedule'],
      },
    };

    const cascadeResult = await callGeminiCascade('SEO', async (model) => {
      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: schemaConfig,
      });
      return response.text || '';
    });

    if (cascadeResult && cascadeResult.data) {
      try {
        const parsed = JSON.parse(cascadeResult.data);
        if (parsed.alternativeTitles && parsed.description) {
          const tagString = Array.isArray(parsed.tags) ? parsed.tags.join(',') : '';
          parsed.tagCharactersCount = tagString.length;
          return res.json({
            ...parsed,
            isFallback: false,
          });
        }
      } catch (parseErr) {
        console.warn('Failed to parse SEO package, using fallback:', parseErr);
      }
    }

    const fallbackData = generateSmartFallbackSeo(videoTitle, videoTopic, mainKeyword, videoFormat, targetAudience);
    return res.json({
      ...fallbackData,
      isFallback: true,
      notice: 'Paket SEO & Jadwal dirancang menggunakan template cerdas Revisitekno karena server AI sedang dalam lonjakan antrean (High Demand).',
    });
  } catch (error: any) {
    console.error('SEO generate error:', error);
    const fallbackData = generateSmartFallbackSeo(videoTitle, videoTopic, mainKeyword, videoFormat, targetAudience);
    res.json({
      ...fallbackData,
      isFallback: true,
      notice: 'Paket SEO & Jadwal dihasilkan dari template cerdas Revisitekno agar alur kerja Anda tidak terganggu.',
    });
  }
});

// --- VITE MIDDLEWARE / STATIC FILES ---
const isProd = process.env.NODE_ENV === 'production';

async function startServer() {
  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Revisitekno AI Server berjalan di http://0.0.0.0:${PORT}`);
  });
}

startServer();
