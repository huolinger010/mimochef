// ============================================================
// MimoChef — Indonesian Recipe AI Assistant
// 6-agent pipeline: Pantry · Curator · Chef · Coach · Translator · Narrator
// Powered by Xiaomi MiMo V2.5 via Pollinations.ai gateway
// ============================================================

const CONFIG = {
  appName: 'mimochef',
  pollinations: 'https://text.pollinations.ai/openai',
  model: 'openai-fast',  // routes to MiMo via Pollinations
  maxResults: 12,
  chatHistoryLimit: 8,
};

const STATE = {
  lang: localStorage.getItem('mimochef-lang') || 'en',
  theme: localStorage.getItem('mimochef-theme') || 'dark',
  recipes: [],
  filtered: [],
  filters: { spice: 'any', time: 'any', diet: 'any' },
  lastQuery: '',
  lastNarrative: '',
  selectedRecipe: null,
  chatHistory: [],
  chatOpen: false,
};

// ============================================================
// I18N — Translator Agent
// ============================================================
const I18N = {
  en: {
    eyebrow: 'INDONESIAN RECIPE AI · 6 AGENTS',
    heroTitle: "Tell me what's in your <em>pantry</em>",
    heroSubtitle: 'Six AI agents — Pantry, Curator, Chef, Coach, Translator, Narrator — turn whatever you have into authentic Indonesian recipes. Real-time chat with Chef MiMo. Zero API key. Free.',
    pill1: '52 Nusantara Recipes',
    pill2: 'Real-time MiMo Chat',
    pill3: 'Bilingual EN / ID',
    pill4: 'No API Key',
    searchLabel: "WHAT'S IN YOUR KITCHEN?",
    placeholder: 'e.g. tempeh, chili, shallot, lime...',
    findText: 'Find Recipes',
    filtersText: 'Filters',
    tryLabel: 'TRY:',
    spiceLabel: 'SPICE',
    timeLabel: 'TIME',
    dietLabel: 'DIET',
    spiceAny: 'ANY', spiceMild: 'MILD', spiceMedium: 'MEDIUM', spiceHot: 'HOT',
    timeAny: 'ANY', timeQuick: '≤30M', timeMedium: '≤90M', timeSlow: 'SLOW',
    dietAny: 'ANY', dietVeg: 'VEGETARIAN',
    resultsTitle: "Curator's Pick",
    resultsMeta: (n, total) => `${n} OF ${total} RECIPES MATCHED`,
    noMatches: 'No exact matches. Try fewer or different ingredients.',
    spiceMeta: (n) => `SPICE ${'•'.repeat(n) || '0'}`,
    timeMeta: (n) => n < 30 ? `${n} MIN` : n < 90 ? `${n} MIN` : `${Math.round(n/60)} HR`,
    vegTag: 'VEGETARIAN',
    matchPercent: (n) => `${n}%`,
    narratorMeta: (time) => `${time} · JAKARTA`,
    agentsEyebrow: 'UNDER THE HOOD',
    agentsTitle: 'Six agents, one kitchen',
    agent1Name: 'Pantry', agent1Role: 'PARSER',
    agent1Desc: 'Reads your ingredient list, normalizes and translates Indonesian/English variants, builds the search vector.',
    agent2Name: 'Curator', agent2Role: 'MATCHER',
    agent2Desc: 'Searches 52 curated nusantara recipes by ingredient overlap, region, spice level, time, and diet preference.',
    agent3Name: 'Chef MiMo', agent3Role: 'LIVE CHAT',
    agent3Desc: 'Real-time chat via Pollinations gateway → Xiaomi MiMo V2.5. Ask anything: techniques, substitutions, why dishes work.',
    agent4Name: 'Coach', agent4Role: 'GUIDE',
    agent4Desc: 'Breaks selected recipe into time-aware difficulty signals, surfaces region history and ingredient context.',
    agent5Name: 'Translator', agent5Role: 'BILINGUAL',
    agent5Desc: 'Every string flips between English and Bahasa Indonesia mid-flow without losing context or rendering state.',
    agent6Name: 'Narrator', agent6Role: 'COMPOSER',
    agent6Desc: 'Weaves your pantry, the matched recipes, and the cultural region into one paragraph of evocative prose.',
    footerTagline: 'Your pantry, narrated by AI.',
    footerCredit: 'BUILT WITH ❤ ON MIMO V2.5 · OPEN SOURCE · MIT',
    chatPlaceholder: 'Ask Chef MiMo...',
    chatStatus: 'ONLINE · MIMO V2.5',
    chatThinking: 'CHEF IS THINKING...',
    chatGreet: 'Hi! 👨‍🍳 I\'m Chef MiMo, your Indonesian cuisine guide. Ask me anything — techniques, substitutions, recipe variations, or just chat about food.',
    chatErr: 'Connection hiccup. Try again in a moment, or rephrase your question.',
    chatSuggest1: 'How to make rendang tender?',
    chatSuggest2: 'Vegetarian rendang substitute?',
    chatSuggest3: 'What is base genep?',
    chatSuggest4: 'Easy 15-min Indonesian dish?',
    askInChat: 'Ask in Chat',
    ingredients: 'INGREDIENTS',
    cookingTime: 'TIME',
    spiceLvl: 'SPICE',
    difficulty: 'DIFFICULTY',
    region: 'REGION',
    minutes: (n) => n < 60 ? `${n} min` : n % 60 === 0 ? `${n/60}h` : `${Math.floor(n/60)}h ${n%60}m`,
    diffEasy: 'Easy', diffMedium: 'Medium', diffHard: 'Hard', diffExpert: 'Expert',
    aboutDish: 'ABOUT THIS DISH',
    closeBtn: 'Close',
  },
  id: {
    eyebrow: 'AI RESEP INDONESIA · 6 AGEN',
    heroTitle: 'Apa yang ada di <em>dapurmu</em>?',
    heroSubtitle: 'Enam agen AI — Pantry, Curator, Chef, Coach, Translator, Narrator — mengubah apa pun yang kamu punya jadi resep otentik Nusantara. Chat real-time dengan Chef MiMo. Tanpa API key. Gratis.',
    pill1: '52 Resep Nusantara',
    pill2: 'Chat MiMo Real-time',
    pill3: 'Dwi-bahasa EN / ID',
    pill4: 'Tanpa API Key',
    searchLabel: 'APA YANG ADA DI DAPURMU?',
    placeholder: 'contoh: tempe, cabe, bawang merah, jeruk nipis...',
    findText: 'Cari Resep',
    filtersText: 'Filter',
    tryLabel: 'COBA:',
    spiceLabel: 'PEDAS',
    timeLabel: 'WAKTU',
    dietLabel: 'DIET',
    spiceAny: 'SEMUA', spiceMild: 'RINGAN', spiceMedium: 'SEDANG', spiceHot: 'PEDAS',
    timeAny: 'SEMUA', timeQuick: '≤30M', timeMedium: '≤90M', timeSlow: 'LAMA',
    dietAny: 'SEMUA', dietVeg: 'VEGETARIAN',
    resultsTitle: 'Pilihan Curator',
    resultsMeta: (n, total) => `${n} DARI ${total} RESEP COCOK`,
    noMatches: 'Tidak ada yang persis cocok. Coba bahan yang lebih sedikit atau berbeda.',
    spiceMeta: (n) => `PEDAS ${'•'.repeat(n) || '0'}`,
    timeMeta: (n) => n < 60 ? `${n} MENIT` : n < 90 ? `${n} MENIT` : `${Math.round(n/60)} JAM`,
    vegTag: 'VEGETARIAN',
    matchPercent: (n) => `${n}%`,
    narratorMeta: (time) => `${time} · JAKARTA`,
    agentsEyebrow: 'DI BALIK LAYAR',
    agentsTitle: 'Enam agen, satu dapur',
    agent1Name: 'Pantry', agent1Role: 'PARSER',
    agent1Desc: 'Membaca daftar bahanmu, menormalisasi dan menerjemahkan varian Indonesia/Inggris, membangun vektor pencarian.',
    agent2Name: 'Curator', agent2Role: 'PEMILIH',
    agent2Desc: 'Menelusuri 52 resep nusantara terkurasi berdasarkan kecocokan bahan, daerah, tingkat pedas, waktu, dan preferensi diet.',
    agent3Name: 'Chef MiMo', agent3Role: 'CHAT LIVE',
    agent3Desc: 'Chat real-time via gateway Pollinations → Xiaomi MiMo V2.5. Tanya apa saja: teknik, substitusi, kenapa hidangan berhasil.',
    agent4Name: 'Coach', agent4Role: 'PEMANDU',
    agent4Desc: 'Memecah resep terpilih menjadi sinyal kesulitan sadar-waktu, mengangkat sejarah daerah dan konteks bahan.',
    agent5Name: 'Translator', agent5Role: 'DWI-BAHASA',
    agent5Desc: 'Setiap kata berpindah antara Inggris dan Bahasa Indonesia di tengah alur tanpa kehilangan konteks atau status render.',
    agent6Name: 'Narrator', agent6Role: 'PENULIS',
    agent6Desc: 'Merajut dapurmu, resep yang cocok, dan daerah budayanya menjadi satu paragraf prosa yang evokatif.',
    footerTagline: 'Dapurmu, dinarasikan AI.',
    footerCredit: 'DIBANGUN DENGAN ❤ DI MIMO V2.5 · OPEN SOURCE · MIT',
    chatPlaceholder: 'Tanya Chef MiMo...',
    chatStatus: 'ONLINE · MIMO V2.5',
    chatThinking: 'CHEF SEDANG BERPIKIR...',
    chatGreet: 'Halo! 👨‍🍳 Aku Chef MiMo, pemandu masakan Indonesiamu. Tanya apa saja — teknik, substitusi, variasi resep, atau ngobrol soal makanan.',
    chatErr: 'Koneksi sedikit terganggu. Coba lagi sebentar, atau tulis ulang pertanyaanmu.',
    chatSuggest1: 'Gimana bikin rendang empuk?',
    chatSuggest2: 'Substitusi rendang vegetarian?',
    chatSuggest3: 'Apa itu base genep?',
    chatSuggest4: 'Resep Indonesia 15 menit?',
    askInChat: 'Tanya di Chat',
    ingredients: 'BAHAN',
    cookingTime: 'WAKTU',
    spiceLvl: 'PEDAS',
    difficulty: 'KESULITAN',
    region: 'DAERAH',
    minutes: (n) => n < 60 ? `${n} menit` : n % 60 === 0 ? `${n/60} jam` : `${Math.floor(n/60)} jam ${n%60} menit`,
    diffEasy: 'Mudah', diffMedium: 'Sedang', diffHard: 'Sulit', diffExpert: 'Ahli',
    aboutDish: 'TENTANG HIDANGAN INI',
    closeBtn: 'Tutup',
  }
};

const t = (key, ...args) => {
  const val = I18N[STATE.lang][key] ?? I18N.en[key] ?? key;
  return typeof val === 'function' ? val(...args) : val;
};

// ============================================================
// Pantry Agent — ingredient parser & normalizer
// ============================================================
const INGREDIENT_ALIASES = {
  // Indonesian → English canonical
  'tempe': 'tempeh', 'tempeh': 'tempeh',
  'tahu': 'tofu', 'tofu': 'tofu',
  'cabe': 'chili', 'cabai': 'chili', 'chili': 'chili', 'chilli': 'chili',
  'bawang merah': 'shallot', 'shallot': 'shallot',
  'bawang putih': 'garlic', 'garlic': 'garlic',
  'bawang': 'shallot',
  'jahe': 'ginger', 'ginger': 'ginger',
  'kunyit': 'turmeric', 'turmeric': 'turmeric',
  'lengkuas': 'galangal', 'galangal': 'galangal',
  'serai': 'lemongrass', 'sereh': 'lemongrass', 'lemongrass': 'lemongrass',
  'daun jeruk': 'kaffir lime', 'kaffir lime': 'kaffir lime',
  'jeruk nipis': 'lime', 'lime': 'lime',
  'jeruk': 'lime',
  'asam jawa': 'tamarind', 'tamarind': 'tamarind',
  'gula merah': 'palm sugar', 'gula aren': 'palm sugar', 'palm sugar': 'palm sugar',
  'kecap manis': 'kecap manis', 'sweet soy': 'kecap manis', 'sweet soy sauce': 'kecap manis',
  'santan': 'coconut milk', 'coconut milk': 'coconut milk',
  'kelapa': 'coconut', 'coconut': 'coconut',
  'kemiri': 'candlenut', 'candlenut': 'candlenut',
  'terasi': 'shrimp paste', 'shrimp paste': 'shrimp paste',
  'kencur': 'kencur',
  'ayam': 'chicken', 'chicken': 'chicken',
  'sapi': 'beef', 'daging sapi': 'beef', 'beef': 'beef',
  'kambing': 'goat', 'goat': 'goat',
  'ikan': 'fish', 'fish': 'fish',
  'udang': 'prawn', 'shrimp': 'prawn', 'prawn': 'prawn',
  'cumi': 'squid', 'squid': 'squid',
  'telur': 'egg', 'egg': 'egg',
  'beras': 'rice', 'nasi': 'rice', 'rice': 'rice',
  'mie': 'noodle', 'mi': 'noodle', 'noodle': 'noodle', 'noodles': 'noodle',
  'kentang': 'potato', 'potato': 'potato',
  'tomat': 'tomato', 'tomato': 'tomato',
  'wortel': 'carrot', 'carrot': 'carrot',
  'kubis': 'cabbage', 'kol': 'cabbage', 'cabbage': 'cabbage',
  'tauge': 'beansprout', 'kecambah': 'beansprout', 'beansprout': 'beansprout', 'bean sprout': 'beansprout',
  'kacang': 'peanut', 'kacang tanah': 'peanut', 'peanut': 'peanut',
  'mentimun': 'cucumber', 'timun': 'cucumber', 'cucumber': 'cucumber',
  'pisang': 'banana', 'banana': 'banana',
  'mangga': 'mango', 'mango': 'mango',
  'nanas': 'pineapple', 'pineapple': 'pineapple',
  'kacang panjang': 'long bean', 'long bean': 'long bean',
  'terong': 'eggplant', 'eggplant': 'eggplant',
  'jagung': 'corn', 'corn': 'corn',
  'pandan': 'pandan',
  'jeroan': 'beef offal', 'offal': 'beef offal',
  'ketumbar': 'coriander', 'coriander': 'coriander',
  'merica': 'white pepper', 'lada': 'white pepper', 'white pepper': 'white pepper',
  'cengkeh': 'clove', 'clove': 'clove',
  'kayu manis': 'cinnamon', 'cinnamon': 'cinnamon',
  'pala': 'nutmeg', 'nutmeg': 'nutmeg',
  'keluak': 'keluak',
  'tepung': 'flour', 'flour': 'flour',
  'tepung beras': 'rice flour', 'rice flour': 'rice flour',
  'tepung tapioka': 'tapioca', 'tapioca': 'tapioca',
  'krupuk': 'krupuk', 'kerupuk': 'krupuk',
  'kemangi': 'lemon basil', 'lemon basil': 'lemon basil',
  'daun salam': 'salam leaf', 'salam leaf': 'salam leaf',
  'oyster sauce': 'oyster sauce',
  'minyak wijen': 'sesame oil', 'sesame oil': 'sesame oil',
};

function pantryParse(input) {
  if (!input) return [];
  const tokens = input.toLowerCase()
    .split(/[,;\n]+/)
    .map(t => t.trim())
    .filter(t => t.length > 0);

  const normalized = new Set();
  for (const tok of tokens) {
    // Try exact match first
    if (INGREDIENT_ALIASES[tok]) {
      normalized.add(INGREDIENT_ALIASES[tok]);
      continue;
    }
    // Try multi-word match
    const cleaned = tok.replace(/[^a-z\s]/g, '').trim();
    if (INGREDIENT_ALIASES[cleaned]) {
      normalized.add(INGREDIENT_ALIASES[cleaned]);
      continue;
    }
    // Try partial match
    let matched = false;
    for (const [alias, canonical] of Object.entries(INGREDIENT_ALIASES)) {
      if (cleaned.includes(alias) || alias.includes(cleaned)) {
        normalized.add(canonical);
        matched = true;
        break;
      }
    }
    if (!matched && cleaned.length > 2) {
      normalized.add(cleaned);  // unknown, keep raw
    }
  }
  return Array.from(normalized);
}

// ============================================================
// Curator Agent — recipe matcher with overlap scoring
// ============================================================
function curatorMatch(parsedIngredients, recipes, filters) {
  const userSet = new Set(parsedIngredients);
  const scored = recipes.map(r => {
    const recipeSet = new Set(r.main_ingredients);
    let overlap = 0;
    for (const ing of userSet) {
      if (recipeSet.has(ing)) overlap++;
    }
    // Match score: % of user ingredients found + % of recipe ingredients covered
    const userCoverage = userSet.size > 0 ? overlap / userSet.size : 0;
    const recipeCoverage = recipeSet.size > 0 ? overlap / recipeSet.size : 0;
    const matchScore = Math.round((userCoverage * 0.6 + recipeCoverage * 0.4) * 100);
    return { ...r, _overlap: overlap, _matchScore: matchScore };
  });

  // Apply filters
  let filtered = scored;
  if (filters.spice !== 'any') {
    const ranges = { mild: [0, 1], medium: [2, 3], hot: [4, 5] };
    const [lo, hi] = ranges[filters.spice];
    filtered = filtered.filter(r => r.spice >= lo && r.spice <= hi);
  }
  if (filters.time !== 'any') {
    const limits = { quick: 30, medium: 90, slow: 9999 };
    const lim = limits[filters.time];
    if (filters.time === 'slow') {
      filtered = filtered.filter(r => r.time > 90);
    } else {
      filtered = filtered.filter(r => r.time <= lim);
    }
  }
  if (filters.diet === 'veg') {
    filtered = filtered.filter(r => r.vegetarian);
  }

  // Sort by overlap desc, then matchScore desc, then time asc
  filtered.sort((a, b) => {
    if (b._overlap !== a._overlap) return b._overlap - a._overlap;
    if (b._matchScore !== a._matchScore) return b._matchScore - a._matchScore;
    return a.time - b.time;
  });

  // If user provided ingredients, only show overlap > 0 (unless none have overlap)
  if (parsedIngredients.length > 0) {
    const withOverlap = filtered.filter(r => r._overlap > 0);
    if (withOverlap.length > 0) return withOverlap.slice(0, CONFIG.maxResults);
  }
  return filtered.slice(0, CONFIG.maxResults);
}

// ============================================================
// Narrator Agent — composes evocative prose
// ============================================================
function narratorCompose(parsedIngredients, matchedRecipes) {
  if (matchedRecipes.length === 0) {
    return STATE.lang === 'id'
      ? 'Dapurmu unik. Tidak ada resep yang persis cocok kali ini, tapi setiap bahan punya cerita di nusantara — coba kurangi atau ganti satu bahan.'
      : "Your pantry is unique. No recipe matches exactly this time, but every ingredient has a story in the archipelago — try fewer or different ingredients.";
  }

  const top = matchedRecipes[0];
  const regionWords = matchedRecipes.slice(0, 3).map(r => r.region);
  const uniqueRegions = [...new Set(regionWords)];
  const regionStr = uniqueRegions.slice(0, 2).join(STATE.lang === 'id' ? ' dan ' : ' and ');
  const ingrStr = parsedIngredients.slice(0, 3).join(STATE.lang === 'id' ? ', ' : ', ');
  const topName = STATE.lang === 'id' ? top.name_id : top.name_en;

  const templates = {
    en: [
      `With ${ingrStr}, your pantry leans ${regionStr}. The Curator surfaces ${matchedRecipes.length} dishes; ${topName} is the closest fit — built for exactly this kind of evening.`,
      `${ingrStr} — these are the bones of ${regionStr} cooking. Of ${matchedRecipes.length} matches, ${topName} reads as the natural opening: ${top.spice >= 3 ? 'bold heat' : 'gentle warmth'}, ${top.time <= 30 ? 'quick to the table' : 'rewarding the patient'}.`,
      `Your kitchen holds ${ingrStr}. The Coach suggests ${topName} from ${top.region} — ${top.vegetarian ? 'plant-forward' : 'protein-driven'}, ${top.difficulty <= 2 ? 'beginner-friendly' : 'an opportunity to learn technique'}, ready in ${top.time <= 60 ? 'under an hour' : 'time enough to read between checks'}.`,
      `From ${ingrStr}, ${matchedRecipes.length} paths open. ${topName} leads — a ${regionStr} dish where ${top.spice >= 3 ? 'chili commands' : 'aromatics carry'} the conversation. The other ${matchedRecipes.length - 1} are written below.`,
    ],
    id: [
      `Dengan ${ingrStr}, dapurmu condong ke ${regionStr}. Curator menemukan ${matchedRecipes.length} hidangan; ${topName} paling cocok — dibuat untuk malam seperti ini.`,
      `${ingrStr} — ini tulang punggung masakan ${regionStr}. Dari ${matchedRecipes.length} kecocokan, ${topName} jadi pembuka alami: ${top.spice >= 3 ? 'pedas tegas' : 'kehangatan lembut'}, ${top.time <= 30 ? 'cepat ke meja' : 'menghargai kesabaran'}.`,
      `Dapurmu memegang ${ingrStr}. Coach merekomendasikan ${topName} dari ${top.region} — ${top.vegetarian ? 'berbasis nabati' : 'fokus protein'}, ${top.difficulty <= 2 ? 'ramah pemula' : 'kesempatan belajar teknik'}, siap dalam ${top.time <= 60 ? 'kurang dari satu jam' : 'waktu cukup untuk membaca di antara cek panci'}.`,
      `Dari ${ingrStr}, ${matchedRecipes.length} jalan terbuka. ${topName} memimpin — hidangan ${regionStr} di mana ${top.spice >= 3 ? 'cabe memimpin' : 'aroma membawa'} percakapan. ${matchedRecipes.length - 1} lainnya tertulis di bawah.`,
    ]
  };

  const pool = templates[STATE.lang];
  return pool[Math.floor(Math.random() * pool.length)];
}

// ============================================================
// Chef Agent — Real-time chat via Pollinations → MiMo V2.5
// ============================================================
async function chefChat(userMessage) {
  const systemPrompt = STATE.lang === 'id'
    ? 'Kamu adalah Chef MiMo, ahli masakan Indonesia yang ramah dan berpengetahuan. Jawab dalam Bahasa Indonesia. Bantu pengguna dengan resep nusantara, teknik memasak, substitusi bahan, dan tips dapur. Jaga jawaban tetap praktis dan ringkas (maksimal 4 paragraf pendek). Gunakan markdown ringan (**bold**, daftar) bila membantu.'
    : 'You are Chef MiMo, a friendly and knowledgeable Indonesian cuisine expert. Respond in English. Help users with nusantara recipes, cooking techniques, ingredient substitutions, and kitchen tips. Keep answers practical and concise (max 4 short paragraphs). Use light markdown (**bold**, lists) where helpful.';

  const messages = [
    { role: 'system', content: systemPrompt },
    ...STATE.chatHistory.slice(-CONFIG.chatHistoryLimit).map(m => ({
      role: m.role,
      content: m.content
    })),
    { role: 'user', content: userMessage }
  ];

  try {
    const res = await fetch(`${CONFIG.pollinations}?referrer=${CONFIG.appName}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: CONFIG.model,
        messages,
        referrer: CONFIG.appName,
        max_tokens: 600
      })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content?.trim();
    if (!reply) throw new Error('Empty reply');
    return reply;
  } catch (err) {
    console.error('Chef chat error:', err);
    return null;
  }
}

// ============================================================
// Coach Agent — recipe detail formatter
// ============================================================
function coachFormat(recipe) {
  const lang = STATE.lang;
  const name = lang === 'id' ? recipe.name_id : recipe.name_en;
  const desc = lang === 'id' ? recipe.description_id : recipe.description_en;

  const diffLabels = [t('diffEasy'), t('diffEasy'), t('diffMedium'), t('diffHard'), t('diffExpert')];
  const diff = diffLabels[recipe.difficulty] || t('diffMedium');

  return `
    <button class="modal-close" id="modal-close-btn">✕</button>
    <div class="modal-region">${recipe.region.toUpperCase()}</div>
    <h2 class="modal-title">${name}</h2>
    <p class="modal-desc">${desc}</p>

    <div class="modal-stats">
      <div class="stat-item">
        <div class="stat-label">${t('cookingTime')}</div>
        <div class="stat-value">${t('minutes', recipe.time)}</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">${t('spiceLvl')}</div>
        <div class="stat-value" style="font-size:18px;">
          <span class="spice-dots">
            ${[1,2,3,4,5].map(i => `<span class="spice-dot ${i <= recipe.spice ? 'on' : ''}"></span>`).join('')}
          </span>
        </div>
      </div>
      <div class="stat-item">
        <div class="stat-label">${t('difficulty')}</div>
        <div class="stat-value" style="font-size:18px;">${diff}</div>
      </div>
    </div>

    <div class="modal-section">
      <h3>${t('ingredients')}</h3>
      <div class="ingredient-list">
        ${recipe.main_ingredients.map(ing => `<span class="ingredient-tag">${ing}</span>`).join('')}
      </div>
    </div>

    <button class="btn-primary modal-action" id="ask-chef-btn">💬 ${t('askInChat')}</button>
  `;
}

// ============================================================
// RENDER
// ============================================================
function $(id) { return document.getElementById(id); }

function applyLang() {
  document.documentElement.setAttribute('lang', STATE.lang);
  $('lang-btn').textContent = STATE.lang.toUpperCase();
  $('hero-eyebrow').textContent = t('eyebrow');
  $('hero-title').innerHTML = t('heroTitle');
  $('hero-subtitle').textContent = t('heroSubtitle');
  $('pill-1').textContent = t('pill1');
  $('pill-2').textContent = t('pill2');
  $('pill-3').textContent = t('pill3');
  $('pill-4').textContent = t('pill4');
  $('search-label').textContent = t('searchLabel');
  $('ingredients-input').placeholder = t('placeholder');
  $('find-text').textContent = t('findText');
  $('filters-text').textContent = t('filtersText');
  $('try-label').textContent = t('tryLabel');
  $('filter-spice-label').textContent = t('spiceLabel');
  $('filter-time-label').textContent = t('timeLabel');
  $('filter-diet-label').textContent = t('dietLabel');

  // Filter chips text
  document.querySelectorAll('[data-filter="spice"]').forEach(b => {
    const v = b.dataset.value;
    b.textContent = t({ any: 'spiceAny', mild: 'spiceMild', medium: 'spiceMedium', hot: 'spiceHot' }[v]);
  });
  document.querySelectorAll('[data-filter="time"]').forEach(b => {
    const v = b.dataset.value;
    b.textContent = t({ any: 'timeAny', quick: 'timeQuick', medium: 'timeMedium', slow: 'timeSlow' }[v]);
  });
  document.querySelectorAll('[data-filter="diet"]').forEach(b => {
    const v = b.dataset.value;
    b.textContent = t({ any: 'dietAny', veg: 'dietVeg' }[v]);
  });

  $('agents-eyebrow').textContent = t('agentsEyebrow');
  $('agents-title').textContent = t('agentsTitle');
  for (let i = 1; i <= 6; i++) {
    $(`agent-${i}-name`).textContent = t(`agent${i}Name`);
    $(`agent-${i}-role`).textContent = t(`agent${i}Role`);
    $(`agent-${i}-desc`).textContent = t(`agent${i}Desc`);
  }

  $('footer-tagline').textContent = t('footerTagline');
  $('footer-credit').textContent = t('footerCredit');
  $('chat-input').placeholder = t('chatPlaceholder');
  $('chat-status').textContent = t('chatStatus');

  // Re-render results if showing — re-compose narrative in new language
  if ($('results').classList.contains('on')) {
    const parsed = pantryParse(STATE.lastQuery);
    STATE.lastNarrative = narratorCompose(parsed, STATE.filtered);
    renderResults();
  }

  // Re-render chat suggestions
  renderChatSuggestions();

  // If chat empty, show greeting
  if (STATE.chatHistory.length === 0) {
    renderChatGreeting();
  }
}

function applyTheme() {
  document.documentElement.setAttribute('data-theme', STATE.theme);
  $('theme-btn').textContent = STATE.theme === 'dark' ? '🌙' : '☀️';
}

function renderResults() {
  const grid = $('recipe-grid');
  const recipes = STATE.filtered;

  $('results').classList.add('on');
  $('results-title').textContent = t('resultsTitle');
  $('results-meta').textContent = t('resultsMeta', recipes.length, STATE.recipes.length);

  if (STATE.lastNarrative) {
    $('narrator-text').textContent = STATE.lastNarrative;
    const time = new Date().toLocaleTimeString(STATE.lang === 'id' ? 'id-ID' : 'en-US', {
      hour: '2-digit', minute: '2-digit', hour12: true
    });
    $('narrator-meta').textContent = t('narratorMeta', time);
  }

  if (recipes.length === 0) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;">
      <div class="empty-icon">🍽️</div>
      <div class="empty-text">${t('noMatches')}</div>
    </div>`;
    return;
  }

  grid.innerHTML = recipes.map(r => {
    const name = STATE.lang === 'id' ? r.name_id : r.name_en;
    const desc = STATE.lang === 'id' ? r.description_id : r.description_en;
    const spiceClass = r.spice >= 3 ? `spice-${r.spice}` : '';
    return `
      <div class="recipe-card" data-id="${r.id}">
        <div class="match-score">${r._matchScore || 0}%</div>
        <div class="recipe-region">${r.region.toUpperCase()}</div>
        <div class="recipe-title">${name}</div>
        <div class="recipe-desc">${desc}</div>
        <div class="recipe-meta">
          <span class="meta-tag">${t('timeMeta', r.time)}</span>
          <span class="meta-tag ${spiceClass}">${t('spiceMeta', r.spice)}</span>
          ${r.vegetarian ? `<span class="meta-tag veg">${t('vegTag')}</span>` : ''}
        </div>
      </div>
    `;
  }).join('');

  // Bind card clicks
  grid.querySelectorAll('.recipe-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.dataset.id;
      const recipe = STATE.recipes.find(r => r.id === id);
      if (recipe) showRecipeDetail(recipe);
    });
  });
}

function showRecipeDetail(recipe) {
  STATE.selectedRecipe = recipe;
  $('modal-body').innerHTML = coachFormat(recipe);
  $('modal').classList.add('on');
  document.body.style.overflow = 'hidden';

  $('modal-close-btn').addEventListener('click', closeModal);
  $('ask-chef-btn').addEventListener('click', () => {
    closeModal();
    openChat();
    const name = STATE.lang === 'id' ? recipe.name_id : recipe.name_en;
    const seedQ = STATE.lang === 'id'
      ? `Ceritakan tentang ${name} — tips memasaknya?`
      : `Tell me about ${name} — what are the cooking tips?`;
    $('chat-input').value = seedQ;
    $('chat-input').focus();
  });
}

function closeModal() {
  $('modal').classList.remove('on');
  document.body.style.overflow = '';
}

// ============================================================
// CHAT
// ============================================================
function openChat() {
  STATE.chatOpen = true;
  $('chat-panel').classList.add('on');
  $('chat-fab').classList.add('hidden');
  if (STATE.chatHistory.length === 0) renderChatGreeting();
  setTimeout(() => $('chat-input').focus(), 100);
}

function closeChat() {
  STATE.chatOpen = false;
  $('chat-panel').classList.remove('on');
  $('chat-fab').classList.remove('hidden');
}

function renderChatGreeting() {
  $('chat-messages').innerHTML = `<div class="msg bot">${t('chatGreet')}</div>`;
}

function renderChatSuggestions() {
  $('chat-suggestions').innerHTML = `
    <button class="chat-suggest" data-q="${t('chatSuggest1')}">${t('chatSuggest1')}</button>
    <button class="chat-suggest" data-q="${t('chatSuggest2')}">${t('chatSuggest2')}</button>
    <button class="chat-suggest" data-q="${t('chatSuggest3')}">${t('chatSuggest3')}</button>
    <button class="chat-suggest" data-q="${t('chatSuggest4')}">${t('chatSuggest4')}</button>
  `;
  $('chat-suggestions').querySelectorAll('.chat-suggest').forEach(b => {
    b.addEventListener('click', () => {
      $('chat-input').value = b.dataset.q;
      sendChat();
    });
  });
}

function appendMsg(role, content) {
  const div = document.createElement('div');
  div.className = `msg ${role}`;
  if (role === 'bot') {
    // Light markdown: **bold**, `code`, line breaks
    div.innerHTML = content
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>');
  } else {
    div.textContent = content;
  }
  $('chat-messages').appendChild(div);
  $('chat-messages').scrollTop = $('chat-messages').scrollHeight;
}

function appendTyping() {
  const div = document.createElement('div');
  div.className = 'msg-typing';
  div.id = 'typing-indicator';
  div.innerHTML = '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';
  $('chat-messages').appendChild(div);
  $('chat-messages').scrollTop = $('chat-messages').scrollHeight;
}

function removeTyping() {
  const el = $('typing-indicator');
  if (el) el.remove();
}

async function sendChat() {
  const input = $('chat-input');
  const message = input.value.trim();
  if (!message) return;

  input.value = '';
  $('chat-send').disabled = true;
  appendMsg('user', message);
  STATE.chatHistory.push({ role: 'user', content: message });

  appendTyping();
  const reply = await chefChat(message);
  removeTyping();

  if (reply) {
    appendMsg('bot', reply);
    STATE.chatHistory.push({ role: 'assistant', content: reply });
  } else {
    appendMsg('bot', t('chatErr'));
  }
  $('chat-send').disabled = false;
}

// ============================================================
// HANDLERS
// ============================================================
function findRecipes() {
  const input = $('ingredients-input').value.trim();
  STATE.lastQuery = input;

  const parsed = pantryParse(input);
  STATE.filtered = curatorMatch(parsed, STATE.recipes, STATE.filters);
  STATE.lastNarrative = narratorCompose(parsed, STATE.filtered);

  renderResults();
  $('results').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function toggleFilters() {
  $('filters').classList.toggle('on');
}

function setFilter(filter, value) {
  STATE.filters[filter] = value;
  document.querySelectorAll(`[data-filter="${filter}"]`).forEach(b => {
    b.classList.toggle('active', b.dataset.value === value);
  });
  if (STATE.lastQuery !== '' || $('results').classList.contains('on')) {
    findRecipes();
  }
}

function toggleLang() {
  STATE.lang = STATE.lang === 'en' ? 'id' : 'en';
  localStorage.setItem('mimochef-lang', STATE.lang);
  applyLang();
}

function toggleTheme() {
  STATE.theme = STATE.theme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('mimochef-theme', STATE.theme);
  applyTheme();
}

// ============================================================
// INIT
// ============================================================
async function init() {
  applyTheme();

  // Load recipes
  try {
    const res = await fetch('recipes.json');
    STATE.recipes = await res.json();
  } catch (err) {
    console.error('Failed to load recipes:', err);
    STATE.recipes = [];
  }

  applyLang();

  // Default filter "any" active
  document.querySelectorAll('.filter-chip[data-value="any"]').forEach(b => b.classList.add('active'));

  // Bind events
  $('lang-btn').addEventListener('click', toggleLang);
  $('theme-btn').addEventListener('click', toggleTheme);
  $('find-btn').addEventListener('click', findRecipes);
  $('filters-btn').addEventListener('click', toggleFilters);
  $('ingredients-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') findRecipes();
  });

  // Examples
  document.querySelectorAll('.example-chip').forEach(b => {
    b.addEventListener('click', () => {
      $('ingredients-input').value = b.dataset.ex;
      findRecipes();
    });
  });

  // Filters
  document.querySelectorAll('.filter-chip').forEach(b => {
    b.addEventListener('click', () => {
      setFilter(b.dataset.filter, b.dataset.value);
    });
  });

  // Modal close on backdrop click
  $('modal').addEventListener('click', (e) => {
    if (e.target.id === 'modal') closeModal();
  });

  // Chat
  $('chat-fab').addEventListener('click', openChat);
  $('chat-close').addEventListener('click', closeChat);
  $('chat-send').addEventListener('click', sendChat);
  $('chat-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') sendChat();
  });

  // Esc to close modal/chat
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if ($('modal').classList.contains('on')) closeModal();
      else if (STATE.chatOpen) closeChat();
    }
  });
}

init();
