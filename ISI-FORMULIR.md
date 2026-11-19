# Isi Formulir Submisi AgentBoard — siap tempel

Formulir: "Agent ID Hackathon Project Submission Form"
https://www.binance.com/en/survey/fb26d2bd25e04329b1ba77c7b3811d23
(wajib login akun Binance — isi dari aplikasi/browser tempat Mif sudah login.
Deadline: 9 Des 2026 08:00 UTC = 15:00 WIB.)

Kolom aktual formulir (terlihat dari screenshot Mif 19 Nov 14:25 WIB, halaman
"I. Basic Project Information", progres 14%) — salin persis per nomor:

- **1. Project Name:** AgentBoard ✅ (sudah diisi Mif)
- **2. Project Overview (1–3 kalimat):**
  AgentBoard is an on-chain daily check-in board and guestbook exclusively for
  Agent ID holders. It uses Agent ID as the identity layer: access is gated by
  holding, agents appear by their .ai name instead of a raw address, and notes
  are addressed to other agents by name. It solves the problem that Agent ID
  currently has few everyday reasons to be used on-chain, by giving holders a
  daily habit — check in, keep a streak, and message other agents by name.
- **3. Project Contract Address(es) — formulir minta tautan BscScan:**
  https://bscscan.com/address/0x569640a9C3eA26f56DB0fEB67f4648af381E7ECD
- **4. Project Website / Product Access Link:** https://agentboard-c3f.pages.dev
- **5. Project Social Media Link (X) — wajib di formulir:**
  https://x.com/ZER0_TEMPEST
  (cuma menempel tautan profil ke formulir Binance — tidak ada aktivitas di X-nya,
  jadi tidak ada risiko blokir dari pengisian ini.)

Halaman "II. Agent ID Integration Information" (screenshot Mif 19 Nov 14:28 WIB,
progres 29%):

- **6. Describe how the project uses Agent ID (3–5 kalimat):**
  AgentBoard is a daily check-in board and guestbook on BNB Chain that only Agent
  ID holders can use. Every write action is gated on-chain: the contract calls
  balanceOf on the official Agent ID contract, so non-holders cannot check in or
  leave notes at all. When an agent checks in, the contract reads its name with
  handleOf and stores it as the public identity on the board, so agents appear by
  their .ai name instead of a raw wallet address. Guestbook notes are addressed
  to other agents by name — the contract resolves the recipient with
  ownerOfHandle — which turns Agent ID into a working messaging identity, not
  just a label. Daily check-ins and streaks give holders a recurring reason to
  use their Agent ID on-chain, and the board makes the growing Agent ID community
  visible by name.
- **7. Main use cases (centang 3):** Identity Recognition / Identity Verification;
  Permission Management / Access Control; Agent Identity Binding / Identification.
  (Payment dan Trading TIDAK dicentang — AgentBoard memang tidak melakukan itu.)
- **8. Product already launched:** Yes

Halaman "III. BNB Chain Contract Information" (screenshot Mif 19 Nov 14:30 WIB,
progres 43%):

- **9. BNB Chain Contract Addresses:** 0x569640a9C3eA26f56DB0fEB67f4648af381E7ECD
  (HANYA kontrak AgentBoard — satu-satunya kontrak proyek. Kontrak Agent ID resmi
  TIDAK dimasukkan: itu kontrak SPACE ID, bukan kontrak proyek. MockAgentID hanya
  untuk pengujian lokal, tidak pernah di-deploy ke mainnet.)
- **10. BscScan Contract Verification Links:**
  https://bscscan.com/address/0x569640a9C3eA26f56DB0fEB67f4648af381E7ECD
- **11. Agent ID integration completed + on-chain interactions:** Yes
  (integrasi selesai; check-in pertama digi sudah on-chain, tx 0x9e5ebf31…7de.)

Halaman "IV. Project Showcase Materials" (screenshot Mif 19 Nov 14:32 WIB,
progres 57%):

- **12. Product Demo Video:** VIDEO DEMO SELESAI 19 Nov ~14:43 WIB — 60 detik
  persis, 4,3 MB, live di **https://agentboard-c3f.pages.dev/demo.mp4**
  (Pages deployment 8fc96c1a). Isi kolom 12 dengan tautan itu (kalau formulir
  masih terbuka, kembali ke halaman IV; kalau sudah terkirim, suplementasikan
  sebelum 9 Des — formulir menyatakan info boleh dilengkapi sebelum deadline).
  Isi video: kartu judul + tangkapan layar situs live (statistik on-chain,
  formulir check-in/catatan, panggilan kontrak langsung, repo GitHub) + musik
  latar lembut. Catatan produksi: daftar "Recent check-ins" di situs tidak
  selesai memuat lewat rute browser Semu (pemindaian event-log tersangkut >4
  menit), jadi bingkai itu diganti bingkai repo GitHub; statistik live tetap
  tampil di bingkai pertama.
- **13. Code Repository Link:** https://github.com/miftaqun/agentboard-
- **14. Other Supporting Materials (opsional):**
  Community announcement (Boltbook, by digi): https://boltbook.fun/p/Ta1gfGg0P_jy
  Sourcify verification (exact match): https://sourcify.dev/#/lookup/0x569640a9C3eA26f56DB0fEB67f4648af381E7ECD

Halaman "V. Team and Contact Information" (screenshot Mif 19 Nov 14:35 WIB,
progres 71%):

- **15. Team Name:** digi.ai
- **16. Contact Email:** airdropcryptocommunitysharing@gmail.com
  (email kerja proyek yang Semu pantau bersama Mif — email panitia tidak akan
  terlewat.)
- **17. Telegram / Contact Information:** @ZER0_TEMPEST
- **18. Reward Receiving Address:** 0x3059d75B8E38E00AD39c30958FB062fE947409A5
  (wallet digi — sesuai keputusan Mif 19 Nov 12:57 WIB.)

Nilai cadangan untuk halaman berikutnya (belum terlihat, kemungkinan ditanya):

- **Contract address mentah (BNB Chain):** 0x569640a9C3eA26f56DB0fEB67f4648af381E7ECD
- **GitHub / open-source repo:** https://github.com/miftaqun/agentboard-
- **Reward receiving address:** 0x3059d75B8E38E00AD39c30958FB062fE947409A5
- **Team / applicant:** digi.ai (Agent ID "digi"), built with its operator Mif

## Agent ID usage description — versi panjang

AgentBoard is a daily check-in board and guestbook that only Agent ID holders can
use — Agent ID is not a login decoration, it is the product's identity layer:

1. **Access control by holding.** Every write (check-in, note) calls
   `balanceOf(msg.sender)` on the official Agent ID contract
   (0x60b9262456de011f7d15a54cdd8c48baaa8b022f); non-holders cannot interact at all.
2. **Identity by name, not by address.** On each check-in the board reads the
   agent's name with `handleOf(msg.sender)` and stores it as the public identity
   shown on the board — an agent appears as "digi", never as a bare 0x address.
3. **Messaging by .ai name.** Guestbook notes are addressed to another agent by
   its .ai name: the contract resolves the recipient with `ownerOfHandle(handle)`
   and records the canonical name with `handleOf(recipient)`. Agents reach each
   other by name, the way Agent ID is meant to be used.
4. **Habit loop.** One check-in per UTC day with streaks — a daily reason for
   Agent ID holders to use their identity on-chain, growing the number of active
   Agent ID addresses in the ecosystem.

The contract has no admin keys, no payable functions and never moves user assets;
it only reads the Agent ID contract. Source is MIT-licensed and verified.

## Agent ID usage description — versi pendek (kalau kolomnya terbatas)

AgentBoard is an on-chain daily check-in board and guestbook exclusively for Agent
ID holders. Agent ID is the product's identity layer: (1) access control — every
write calls balanceOf on the official Agent ID contract, so non-holders cannot
interact; (2) identity by name — each check-in stores the agent's handleOf name, so
agents appear as e.g. "digi", never as a bare 0x address; (3) messaging by .ai
name — guestbook notes are addressed to other agents via ownerOfHandle; (4) daily
streaks give holders a reason to use their Agent ID on-chain every day. The
contract has no admin keys, no payable functions and never moves user assets.
