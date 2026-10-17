# FloraStudio — Garden & Plantation Monitoring

FloraStudio adalah demo dashboard pemantauan kebun dengan gaya editorial botani, palet krem–sage–rose, kartu membulat, navbar mengambang, mode terang/gelap, serta animasi ringan. Implementasi ini menggunakan fondasi visual dari proyek FloraStudio E-Commerce yang diberikan, dengan alur belanja diganti menjadi monitoring kebun.

> **Seluruh lokasi dan hasil pengukuran merupakan data simulasi.** Lokasi contoh bukan properti yang diverifikasi dan nilai suhu/kelembapan/curah hujan bukan pembacaan sensor. Panel admin tidak menyediakan autentikasi atau keamanan server.

## Stack

- Next.js 14 App Router dan TypeScript
- Tailwind CSS
- Framer Motion dan lucide-react
- Recharts untuk grafik
- next-themes untuk mode terang/gelap
- React Context API + `localStorage`
- Direct image URLs dari Unsplash (`images.unsplash.com`)

Tidak ada backend, database, API route, sistem login, maupun layanan server yang perlu dikonfigurasi.

## Jalankan lokal

Gunakan Node.js 18.17+ dan npm.

```bash
npm install
npm run dev
```

Buka `http://localhost:3000`. Untuk verifikasi produksi:

```bash
npm run lint
npm run build
npm start
```

## Rute

| Rute | Kegunaan |
|---|---|
| `/` dan `/dashboard` | Dashboard, ringkasan, kartu delapan lahan, jurnal terbaru |
| `/lahan` | Pencarian, filter, pengurutan, tambah/edit/hapus lahan |
| `/lahan/[id]` | Detail tanaman, pertumbuhan, lingkungan, jurnal, dan panel lokasi ilustratif |
| `/catatan` | Buat, edit, hapus, dan filter observasi harian |
| `/laporan` | Grafik analitik, filter, ekspor CSV, cetak / simpan PDF dari browser |
| `/admin` | Ringkasan admin demo dan aktivitas |
| `/admin/lahan` | Manajemen lahan (tabel desktop dan tampilan responsif) |
| `/admin/catatan` | Manajemen observasi |
| `/admin/laporan` | Manajemen laporan, CSV, dan cetak |
| `/settings` | Tema dan reset dataset demo |

## Data awal

Aplikasi pertama kali memuat tepat delapan plot: Cabai Merah (Kampar), Tomat (Pekanbaru), Terong Ungu (Siak), Kangkung (Pelalawan), Bayam Hijau (Bengkalis), Jagung Manis (Kuantan Singingi), Mentimun (Rokan Hulu), dan Pakcoy (Indragiri Hulu). Setiap plot mempunyai ID, gambar utama berbeda, data lingkungan, riwayat pertumbuhan, serta catatan observasi yang berbeda. Catatan baru terhubung dengan plot yang dipilih dan akan memengaruhi ringkasan lingkungan, dashboard, serta laporan.

Perubahan lahan, observasi, dan penghapusan disimpan dalam `localStorage` di browser aktif. Tombol **Reset demo** pada `/settings` memulihkan data awal. Data tidak tersinkron lintas browser/perangkat.

## Gambar Unsplash

Foto diambil sebagai URL langsung `https://images.unsplash.com/...` dan diberi ukuran responsif lewat query parameter. Halaman sumber berikut dipilih sesuai subjek utama; foto kangkung memakai foto sayuran daun di kebun sebagai ilustrasi ketika foto kangkung hidup yang cocok sulit ditemukan.

| Lahan | Subjek foto | Halaman sumber |
|---|---|---|
| Kebun Cabai | Cabai merah pada tanaman | [Unsplash — red chili peppers](https://unsplash.com/photos/red-chili-peppers-growing-on-a-plant-with-a-sign-4xYX1le59S0) |
| Kebun Tomat | Tomat tumbuh pada tanaman | [Unsplash — tomatoes growing on a plant](https://unsplash.com/photos/tomatoes-growing-on-a-plant-in-a-garden-S8YbhXgncN0) |
| Kebun Terong | Terong ungu | [Unsplash — purple eggplant](https://unsplash.com/photos/purple-eggplant-EnfA2ywEtzo) |
| Kebun Kangkung | Sayuran daun tumbuh di kebun (ilustrasi) | [Unsplash — green leafy vegetables in garden](https://unsplash.com/photos/green-leafy-vegetables-in-garden-V7onjw93TWI) |
| Kebun Bayam | Daun bayam hijau | [Unsplash — fresh spinach leaves](https://unsplash.com/photos/fresh-green-spinach-leaves-with-pink-stems-NoxzzaDGkfs) |
| Kebun Jagung | Jagung tumbuh di lahan | [Unsplash — fresh corn in a field](https://unsplash.com/photos/fresh-corn-is-growing-in-a-field--qpdGboGHxY) |
| Kebun Mentimun | Mentimun pada tanaman | [Unsplash — cucumber growing on a plant](https://unsplash.com/photos/a-cucumber-growing-on-a-plant-in-a-garden-GWjs449-qWQ) |
| Kebun Pakcoy | Pakcoy pada kebun | [Unsplash — bok choy in a garden](https://unsplash.com/photos/a-close-up-of-a-plant-in-a-garden-B-Bk_BFO-K4) |

Jika foto eksternal gagal dimuat, komponen gambar mencoba fallback botani. Koneksi internet diperlukan agar gambar Unsplash tampil. Gambar tambahan pada galeri dapat berupa ilustrasi dan diberi alt text yang sesuai.

## Catatan implementasi

- Aplikasi mulai dengan delapan lahan, tetapi admin demo dapat menambah atau menghapus lahan setelah itu. Reset demo mengembalikan persis delapan plot seed.
- Jika data `localStorage` tidak dapat dibaca, aplikasi memakai data seed. Jika browser menolak penulisan storage, sesi masih berfungsi dalam memori sampai dimuat ulang.
- Grafik menandai semua nilai contoh sebagai **Data simulasi**. Nilai pengukuran opsional yang kosong tetap `null`, bukan `0`.
- Diagram lokasi tidak menggunakan koordinat palsu. Tautan peta memakai nama kabupaten/provinsi sebagai pencarian perkiraan.
- CSV menggunakan UTF-8 BOM agar lebih mudah dibuka di aplikasi spreadsheet. Menu cetak browser dapat digunakan untuk menyimpan laporan ke PDF.
