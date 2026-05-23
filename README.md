# 🍳 MimoChef

> Indonesian recipe AI assistant powered by Xiaomi MiMo V2.5 — tell Chef MiMo what's in your pantry, get authentic nusantara recipes with real-time chat. Six AI agents work in parallel.

[![Live Demo](https://img.shields.io/badge/Live-Demo-e85d3a?style=for-the-badge)](https://huolinger010.github.io/mimochef/)
[![Powered by MiMo](https://img.shields.io/badge/Powered_by-MiMo_V2.5-f4b942?style=for-the-badge)](https://mimo.xiaomi.com)
[![License](https://img.shields.io/badge/License-MIT-c4471f?style=for-the-badge)](LICENSE)
[![Single File](https://img.shields.io/badge/Architecture-Single_HTML-1a0f08?style=for-the-badge)](.)
[![No API Key](https://img.shields.io/badge/API_Key-None-6db86f?style=for-the-badge)](.)

🔗 **Live**: https://huolinger010.github.io/mimochef/
📂 **Source**: https://github.com/huolinger010/mimochef

---

## 📖 The Idea

The pantry says everything about what's possible for dinner. Most people stand at the kitchen with three or four ingredients and run out of ideas — defaulting to the same 5 dishes on repeat. Indonesia has 17,000 islands and hundreds of regional dishes adapted to whatever's local and in season. The right recipe almost certainly already exists for whatever you have. The bottleneck is access.

**MimoChef** runs a 6-agent pipeline that turns a free-form ingredient list into curated nusantara recipes plus an open conversation with Chef MiMo, so you can ask follow-ups: techniques, substitutions, why a dish works, vegan adaptations, all in real time.

---

## 🎯 What it does

```
You type:    tempeh, chili, shallot, garlic
MimoChef:    1. Pantry parses → ['tempeh', 'chili', 'shallot', 'garlic']
             2. Curator scores 51 recipes by ingredient overlap + filters
             3. Narrator: "tempeh, chili, shallot — these are the bones of
                          Java cooking. Of 12 matches, Oseng Tempe Pedas
                          is the closest fit."
             4. Top match: Oseng Tempe Pedas (Java, 20 min, spice 3, 77% match)
             5. Click any card → full recipe detail
             6. Open chat → ask Chef MiMo anything
```

Every match is sorted by ingredient overlap × recipe coverage. Filter by spice, time, vegetarian. Bilingual EN/ID toggle re-renders everything mid-flow including narrator text. Dark/light WCAG-AA. Mobile responsive.

---

## ✨ Six agents, one kitchen

| # | Agent | Role | What it does |
|---|---|---|---|
| 01 | **Pantry** | Parser | Reads "tempe + cabe + bawang merah" or "tempeh, chili, shallot", normalizes 80+ aliases EN↔ID, builds search vector |
| 02 | **Curator** | Matcher | Searches 51 nusantara recipes by ingredient overlap, region, spice level, time, diet. Returns ranked top 12 |
| 03 | **Chef MiMo** | Live Chat | Real-time chat via Pollinations gateway → MiMo V2.5. Ask anything: technique, substitution, history |
| 04 | **Coach** | Guide | Breaks selected recipe into time/spice/difficulty signals, surfaces region history |
| 05 | **Translator** | Bilingual | Every string flips between English and Bahasa Indonesia mid-flow without losing context |
| 06 | **Narrator** | Composer | Weaves pantry + matches + region into one paragraph of evocative prose, recomposes on lang toggle |

---

## 🛠️ Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | Vanilla HTML/CSS/JS | Zero build, opens directly in browser, bulletproof deploys |
| Recipes | Curated JSON, 51 dishes | Hand-picked nusantara classics, ~27KB, fully bilingual |
| Chat | Pollinations.ai → MiMo V2.5 | Free LLM gateway, no API key, with `?referrer=mimochef` |
| Hosting | GitHub Pages | Free, CDN-backed, instant rollback via git |
| Fonts | Playfair Display + Inter + JetBrains Mono | Editorial/cookbook register without losing technical clarity |
| State | localStorage | Theme + language persist |
| Bilingual | Full EN/ID toggle | Every string through `t()`, narrator recomposes on toggle |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     User pantry input                        │
│              "tempeh, chili, shallot, lime"                  │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │  01. Pantry Agent  (parser)          │
        │   80+ alias map (cabe→chili, etc)    │
        │   ['tempeh', 'chili', 'shallot',     │
        │    'lime']                           │
        └──────────┬───────────────────────────┘
                   │
                   ▼
        ┌──────────────────────────────────────┐
        │  02. Curator Agent  (matcher)        │
        │   userCoverage*0.6 + recipeCov*0.4   │
        │   Filter: spice/time/diet            │
        │   Top 12 sorted by match score       │
        └──────────┬───────────────────────────┘
                   │
                   ▼
        ┌──────────────────────────────────────┐
        │  06. Narrator Agent  (composer)      │
        │   4 prose templates × 2 langs        │
        │   "tempeh, chili, shallot — these    │
        │    are the bones of Java cooking..."│
        └──────────┬───────────────────────────┘
                   │                          ┌────────────────────┐
                   ▼                          │  Click recipe card │
        ┌──────────────────────────┐          │         │          │
        │  Render result grid      │          │         ▼          │
        │  + narrator quote box    │          │  04. Coach Agent   │
        └──────────────────────────┘          │  (recipe detail)   │
                   │                          │  ingredient tags + │
                   ▼                          │  stats + ask chef  │
        ┌──────────────────────────┐          └─────────┬──────────┘
        │  Chat FAB available      │                    │
        │  any time                │                    │
        └──────────┬───────────────┘                    │
                   │                                    │
                   ▼                                    ▼
        ┌──────────────────────────────────────────────────────┐
        │  03. Chef MiMo Agent  (live chat)                    │
        │   POST text.pollinations.ai/openai?referrer=mimochef │
        │   model: openai-fast → Xiaomi MiMo V2.5              │
        │   System prompt switches EN/ID by state              │
        │   Light markdown render (**bold**, `code`, lists)    │
        └──────────────────────────────────────────────────────┘
```

---

## 🎨 Design language

- **Aesthetic**: Warm cookbook (terracotta + saffron + espresso/cream)
- **Display font**: Playfair Display 700 — editorial serif, italic accent on hero word
- **Body**: Inter 400/500/600
- **Mono**: JetBrains Mono — labels, mass-caps eyebrows, badges
- **Palette dark**: void espresso `#1a0f08`, terracotta `#e85d3a`, saffron `#f4b942`
- **Palette light**: warm cream `#faf6ee`, deep ink `#1a0f08`, brick `#c4471f`
- **Atmosphere**: Soft 3-radial gradient drift (22s loop), no animation harshness
- **Restraint**: One warm gradient (`#e85d3a` → `#f4b942`) reserved for primary action only

---

## 🚀 Try these examples

| Pantry | Expected match |
|---|---|
| `tempeh, chili, shallot, garlic` | Oseng Tempe Pedas (Java, 20 min) |
| `chicken, coconut milk, lemongrass` | Opor Ayam (Java, 90 min) |
| `rice, egg, kecap manis, garlic` | Nasi Goreng (Java, 15 min) |
| `beef, coconut milk, chili, galangal` | Rendang (Padang, 180 min) |
| `tofu, beansprout, peanut` | Gado-Gado / Tahu Tek |

---

## 🌐 Run locally

```bash
git clone https://github.com/huolinger010/mimochef.git
cd mimochef
python3 -m http.server 8780
# open http://localhost:8780
```

Zero build step. No npm. No environment variables.

---

## 🗺️ Roadmap

- [ ] Voice input for ingredient list (Web Speech API)
- [ ] Save favorite recipes to localStorage
- [ ] Shopping-list export from selected recipe
- [ ] User-submitted recipes (PR-based)
- [ ] Regional cuisine deep-dives (Padang series, Bali series, Manado series)
- [ ] Step-by-step cooking timer with audio cue
- [ ] Photo recognition (vision agent) — snap your pantry, get suggestions

---

## 🙏 Acknowledgements

- **Xiaomi MiMo V2.5** — the reasoning model powering Chef MiMo's chat
- **Pollinations.ai** — free LLM gateway with no API key required
- **Playfair Display, Inter, JetBrains Mono** — typography
- **Indonesian home cooks** — every recipe in the database descended from kitchens, not databases

---

## 📄 License

MIT © 2026 [@huolinger010](https://github.com/huolinger010)

**Built with ❤ on MiMo V2.5 · Submitted to [Xiaomi MiMo 100T](https://100t.xiaomimimo.com/)**
