# Rencana — Agent ID Hackathon (Binance Wallet × BNB Chain)

Status: DISETUJUI Mif 2026-11-19 12:57 WIB — (1) ikut, (2) Konsep A, (3) nama proyek "AgentBoard", (4) alamat penerima hadiah = wallet digi 0x3059d75B8E38E00AD39c30958FB062fE947409A5. Eksekusi berjalan sesuai rencana di bawah.
Sumber: pengumuman resmi Binance (detail/95f5dbe0ea674a48a739b59e046648bf), dibaca 2026-11-19.

## Fakta kompetisi (terverifikasi dari pengumuman)

- Total hadiah 60.000 USDC: Ecosystem Award 29.000 (ranking data on-chain), Innovation Award 29.000 (penilaian juri), Community Award 2.000 (postingan X — JALUR INI DILEWATI, risiko blokir X).
- Submission: 18 Nov – 9 Des 2026 08:00 UTC (15:00 WIB). Review internal 9–17 Des, publik 17–20 Des, hadiah ≤14 hari kerja setelah pengumuman, ke alamat yang didaftarkan saat submission.
- Syarat proyek: kontrak terdeploy di BNB Chain, source terverifikasi + open-source (BscScan), aktif memakai Agent ID. Tanpa registrasi terpisah; submit = nama proyek, website, alamat kontrak, deskripsi pemakaian Agent ID.
- Innovation Award: produk wajib sudah live + minimal 30 alamat Agent ID berinteraksi dengan kontrak selama periode submission. Kriteria juri: kedalaman integrasi Agent ID 30%, kepraktisan 25%, kelengkapan produk 25%, inovasi 20%.
- Pemenang proyek juga dapat 1 jatah klaim Agent ID dua digit.
- Red lines: tanpa login QR web untuk Agentic Wallet; tanpa bypass konfirmasi transaksi user; tanpa transfer aset tanpa izin; kontrak open-source dengan izin owner terdokumentasi; tanpa janji profit ("passive income" dll dilarang); produk trading wajib pasang peringatan risiko; Agent ID tidak boleh dikemas sebagai alat mengintip wallet orang.

## Fakta teknis (terverifikasi on-chain oleh Semu, 2026-11-19)

- Kontrak Agent ID: 0x60b9262456de011f7d15a54cdd8c48baaa8b022f (SPACE ID Agent ID, ERC-721 non-transferable), Sourcify exact_match (verified 2026-10-16).
- Fungsi yang relevan untuk integrasi:
  - balanceOf(address) → jumlah Agent ID (gerbang akses)
  - handleOf(address) → string nama .ai pemilik alamat (resolusi nama ON-CHAIN)
  - ownerOfHandle(string) → address pemilik nama (resolusi balik)
  - isValidHandle(string) → bool
- Wallet digi (0x3059d75B8E38E00AD39c30958FB062fE947409A5): balanceOf = 1, handleOf = "digi" — dikonfirmasi di 2 endpoint BSC.

## Konsep produk

### Konsep A — AgentBoard (REKOMENDASI)
Papan check-in + buku tamu on-chain khusus pemegang Agent ID.
- checkIn(): hanya alamat dengan Agent ID; 1x per hari; kontrak membaca handleOf(msg.sender) dan menyimpan nama agen + streak + total check-in. Nama TIDAK bisa dipalsukan karena dibaca dari kontrak Agent ID, bukan input user.
- leaveNote(handleTujuan, pesan): tinggalkan catatan untuk agen lain dengan menyebut nama .ai-nya; kontrak menyelesaikan nama → alamat via ownerOfHandle. Memakai resolusi dua arah = integrasi dalam.
- Halaman web publik menampilkan papan: daftar agen yang check-in (nama .ai, streak), catatan antar-agen, statistik unik.
- Kenapa kuat: integrasi Agent ID adalah fungsi inti (gerbang + identitas), bukan tempelan; kontrak kecil → kelengkapan produk mudah 100%; setiap check-in = 1 interaksi alamat Agent ID (menghitung untuk syarat 30 alamat dan metrik Ecosystem); gratis untuk pengguna (hanya gas BSC yang sangat kecil); tidak menyentuh aset siapa pun → aman dari red lines.
- Target pengguna awal: komunitas agen di Boltbook (digi aktif di sana; para agen di sana adalah pemegang Agent ID dengan Agentic Wallet — persis target kompetisi). Promosi lewat postingan Boltbook digi + halaman web.

### Konsep B — AgentPay Links
Tautan permintaan pembayaran yang dialamatkan ke nama .ai (ownerOfHandle), pembayaran BNB/token dengan escrow sederhana.
- Nilai praktis tinggi (use case "payments" disebut eksplisit di pengumuman), tapi: kontrak escrow lebih besar dan lebih berisiko bug; interaksi mengharuskan orang memindahkan nilai → lebih sulit mencapai 30 alamat; halaman wajib peringatan risiko. Cadangan bila Mif ingin ambisi lebih besar dari waktu yang ada.

### Konsep C — AgentAttest
Agen saling memberi atestasi/rekomendasi by-name; graf reputasi publik.
- Menarik, tapi cerita kepraktisannya lebih lemah di mata juri dibanding A. Tidak direkomendasikan sebagai entri utama.

## Rencana bangun (Konsep A)

1. Kontrak Solidity `AgentBoard` (±150–250 baris):
   - Interface IAgentID minimal (balanceOf, handleOf, ownerOfHandle) ke alamat resmi di atas.
   - checkIn, leaveNote, fungsi view (totalAgents, streakOf, notesFor, boardPage).
   - TANPA fungsi admin/owner sama sekali (tidak ada mint/pause/withdraw) → izin owner terdokumentasi = "tidak ada".
   - Event untuk indexing halaman web.
2. Uji lokal + deploy ke BSC testnet, uji alur penuh (check-in dari alamat ber-Agent ID tidak tersedia di testnet → uji dengan kontrak Agent ID mock di testnet; logika gerbang sama).
3. Deploy mainnet BSC + verifikasi Sourcify/BscScan + repo GitHub publik (open-source, MIT).
   - Jalur deploy = item terbuka: (a) baw bila mendukung pembuatan kontrak, (b) Remix di browser dalam aplikasi Binance Web3 oleh Mif dengan panduan Semu, atau (c) wallet deployer khusus yang didanai secukupnya. Diputuskan saat eksekusi; perkiraan gas deploy total < 0,005 BNB.
4. Halaman web statis (Cloudflare Pages, pipeline yang sudah ada): baca papan via RPC publik; tombol check-in/tulis catatan via wallet browser pengguna sendiri (standar, BUKAN login QR Agentic Wallet). Tanpa elemen trading → tanpa kewajiban peringatan risiko, tapi tetap pasang disclaimer singkat.
5. Submit ke hackathon sebelum 9 Des 15:00 WIB: nama proyek, website, alamat kontrak, deskripsi pemakaian Agent ID, alamat penerima hadiah.
6. Fase interaksi (sejak live s.d. 9 Des): postingan pengumuman + ajakan check-in di Boltbook oleh digi, pantau jumlah alamat Agent ID unik yang berinteraksi on-chain setiap hari; target ≥30 alamat sebelum deadline (syarat minimum Innovation). Metrik yang sama ikut mengangkat peluang Ecosystem Award sebagai bonus.

## Linimasa (usulan)

- 20–21 Nov: kontrak ditulis + uji lokal/testnet.
- 22 Nov: deploy mainnet + verifikasi + repo publik.
- 23 Nov: halaman web live.
- 24 Nov: submission masuk.
- 24 Nov – 9 Des: fase interaksi + pemantauan (target 30 alamat tercapai jauh sebelum deadline).
- Buffer ±2 minggu sebelum deadline untuk perbaikan.

## Status eksekusi

- 2026-11-19: Kontrak `AgentBoard.sol` + `MockAgentID.sol` (test-only) SELESAI ditulis di `contracts/`. Kompilasi solc 0.8.28 dengan evmVersion "paris" (menghindari opcode Cancun MCOPY; paling aman untuk BSC). Uji lokal end-to-end di chain in-process: **23/23 lolos** — gerbang non-holder, check-in harian + streak (naik, reset setelah jeda), larangan check-in ganda sehari, catatan by-name dua arah (termasuk penolakan handle tak dikenal / catatan ke diri sendiri / kosong / >280 byte), statistik, saldo kontrak 0. Artefak: `build/AgentBoard.json`, skrip `scripts/test-local.mjs`.
- Uji testnet BSC: DILEWATI — wallet burner 0 tBNB (3 endpoint) dan faucet web hampir pasti kena gerbang bot yang sama; logika sudah terbukti lokal. Bukan syarat untuk lanjut.
- Jalur deploy mainnet (diputuskan saat eksekusi): baw TIDAK bisa membuat kontrak (contract-call preview mewajibkan `--to`). Pilihan: (a) Mif deploy via Remix di browser dalam aplikasi Binance Web3 (wallet Web3-nya sendiri, Semu memandu), atau (b) deploy dari wallet burner Semu setelah didanai ±0,005 BNB. Alamat Agent ID resmi menjadi argumen constructor (immutable), jadi bytecode yang diuji lokal identik dengan yang di-deploy.
- DIPUTUSKAN Mif 13:07 WIB: rute (b) — wallet burner. Pendanaan: Mif top-up digi; kirim 0,005 BNB digi→burner awalnya ditolak 351703 (burner belum di Address Book) — Mif menambahkan "burner" ke Address Book (13:35 WIB), kirim ulang SUKSES tx 0xf23517f1…ec. Cron agentboard-deploy-watch dimatikan; deploy diambil alih di sesi.
- **DEPLOY MAINNET SUKSES 2026-11-19 13:36 WIB**: AgentBoard di **0x569640a9C3eA26f56DB0fEB67f4648af381E7ECD**, tx 0x6aee8680…769, blok 134456467. Verifikasi endpoint kedua: kode ada, agentId() = kontrak resmi. **Check-in pertama oleh digi** tx 0x9e5ebf31…7de — stats (1, 1, 0), handleSnapshot(digi) = "digi": integrasi Agent ID asli terbukti di mainnet.
- **Sourcify exact_match** (creation + runtime), verifiedAt 2026-11-19T06:38:36Z, matchId 59510305.
- **Situs LIVE**: https://agentboard-c3f.pages.dev (Pages project "agentboard", deployment 3b6cccd4-8825-40fc-8c0a-c2f927e087f9).
- Repo GitHub publik: GitHub App TIDAK bisa membuat repo baru (403) — menunggu Mif membuat repo kosong "agentboard"; snapshot lalu di-push Semu.
- Sisa: submit proyek sebelum 9 Des 15:00 WIB; fase interaksi ≥30 alamat Agent ID unik.

## Biaya

- Gas deploy + verifikasi: < 0,005 BNB (±Rp <10 ribu). Testnet gratis. Domain/hosting: Rp0 (Cloudflare Pages). Tidak ada biaya lain; tidak ada pembelian apa pun.

## Risiko & catatan jujur

- Syarat 30 alamat Agent ID adalah risiko utama — bukan teknis, melainkan jangkauan. Boltbook adalah saluran nyata yang sudah kita miliki, tapi jumlah agen yang benar-benar bertransaksi tidak bisa dijamin; karena itu fase interaksi dimulai ±2 minggu sebelum deadline, bukan mepet.
- Ecosystem Award murni adu volume/interaksi — proyek solo realistisnya tidak menang di jalur ini; target utama Innovation Award (peringkat 6–10 pun 800 USDC + jatah Agent ID dua digit).
- Nama proyek tidak boleh memakai "Binance"/"BNB" (red line impersonasi).
- Keputusan yang dibutuhkan dari Mif: (1) ikut atau tidak; (2) konsep A/B/C; (3) nama proyek; (4) alamat penerima hadiah bila menang (default: wallet digi).
- 2026-11-19 (lanjutan): Halaman web `site/index.html` SELESAI — satu file tanpa dependensi; membaca papan langsung dari RPC publik BSC (statistik, 10 catatan terakhir, check-in terbaru dari event log) dan menulis lewat wallet browser pengguna sendiri (alur connect standar, tanpa QR, tanpa approval). Decoder ABI mentah halaman diverifikasi terhadap kontrak lokal: **14/14 lolos** (termasuk teks catatan unicode dan layout event CheckedIn; satu bug nyata ditemukan & diperbaiki: return struct dinamis tunggal punya kata offset di depan). README + LICENSE ditulis; repo git lokal diinisialisasi (commit pertama). Alamat kontrak + blok deploy di halaman masih placeholder — diisi dan diterbitkan bersamaan dengan deploy mainnet.
- 2026-11-19 13:07 WIB: Mif MEMUTUSKAN jalur deploy = wallet burner Semu setelah didanai 0,005 BNB. Skrip `scripts/deploy-mainnet.mjs` siap dan teruji sampai gerbang pendanaan (menolak bersih `NOT_FUNDED` pada saldo 0; idempoten via `deployments/mainnet.json`). Cron `agentboard-deploy-watch` (/15 mnt) menjalankan skrip itu dan men-deploy otomatis begitu saldo ≥0,002 BNB, lalu melapor + berhenti sendiri. Estimasi biaya deploy pada gas 0,05 gwei: ±0,00007 BNB — dana 0,005 jauh di atas kebutuhan, sisanya tetap di wallet burner.
