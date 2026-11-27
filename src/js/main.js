import { createElement } from "./util/dom.js"
// Pelacakan resi via proxy Cloudflare Worker (script biasa, tanpa module)

class TrackingApp {
  /**
   * @param {string} proxyUrl URL Worker, mis. https://nama-worker.akun.workers.dev
   * @param {string} [courier='jnt_cargo'] Kode kurir default
   */
  constructor(proxyUrl, courier = 'jnt_cargo') {
    this.proxyUrl = proxyUrl;
    this.courier = courier;
    this.timeoutMs = 10000; // batas waktu request
  }

  /**
   * Melacak paket berdasarkan nomor resi.
   * @param {string} awb Nomor resi
   * @param {string} [courier] Kode kurir; default mengikuti this.courier
   * @returns {Promise<object>} Objek `data` (summary, detail, history)
   * @throws {Error} Jika awb kosong, timeout, jaringan gagal, atau API mengembalikan error
   */
  async trackPackage(awb, courier = this.courier) {
    if (!awb) throw new Error('Harap masukkan nomor resi/AWB');

    // Batalkan request jika melewati batas waktu
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      // URLSearchParams meng-encode query string otomatis
      const params = new URLSearchParams({ courier, awb });
      const response = await fetch(`${this.proxyUrl}/?${params}`, {
        signal: controller.signal,
      });

      // API mengembalikan body JSON juga untuk error (400/403/503)
      const result = await response.json().catch(() => null);

      if (!response.ok || result?.status !== 200) {
        throw new Error(result?.message ?? `HTTP ${response.status}`);
      }

      return result.data;
    } catch (error) {
      if (error.name === 'AbortError') throw new Error('Request timeout');
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

// Pemakaian
const NO_RESI = '570702565703';
const jnt = new TrackingApp(
  'https://shrill-haze-1758.zpanralfae.workers.dev/',
  'jnt_cargo',
);

// jnt
//   .trackPackage(NO_RESI)
//   .then(({ summary, history }) => {
//     console.log(summary.status); // mis. DELIVERED
//     console.log(history); // riwayat terbaru ada di indeks 0
//     for (const event of history) {
//       console.log(`${event.date} ${event.location} - ${event.desc}`);
//     }
//   })
//   .catch(error => console.error('Gagal:', error.message));


/*11) [{…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}]
0
: 
{date: '2026-11-23 12:27:57', desc: 'paket sudah diterima!penerima adalah【Diterima Pene…silakan hubungi nomor telepon outlet 085341045205', location: 'Kab Buol (TLI002A)'}
1
: 
{date: '2026-11-23 10:59:46', desc: '【TLI002A】kami BAKRI(0895326608519)sedang mengantar…ilakan hubungi nomor telepon outlet 085341045205 ', location: 'Kab Buol (TLI002A)'}
2
: 
{date: '2026-11-22 21:44:24', desc: 'Paket Anda sudah tiba di【TLI002A】', location: 'Kab Buol (TLI002A)'}
3
: 
{date: '2026-11-20 22:16:46', desc: 'Paket sudah meninggalkan【GW-Palu】menuju【TLI002A】', location: 'Kota Palu (GW-Palu)'}
4
: 
{date: '2026-11-19 23:40:09', desc: 'Paket sudah tiba di 【GW-Palu】', location: 'Kota Palu (GW-Palu)'}
5
: 
{date: '2026-11-11 23:00:13', desc: 'Paket sudah meninggalkan【GW-SurabayaSEA】menuju【GW-Palu】', location: 'Kota Surabaya (GW-SurabayaSEA)'}
6
: 
{date: '2026-11-11 22:42:06', desc: 'Paket sudah tiba di 【GW-SurabayaSEA】', location: 'Kota Surabaya (GW-SurabayaSEA)'}
7
: 
{date: '2026-11-10 22:40:16', desc: 'Paket sudah meninggalkan【GW-Jakarta】menuju【GW-SurabayaSEA】', location: 'Kab Tangerang (GW-Jakarta)'}
8
: 
{date: '2026-11-10 22:01:00', desc: 'Paket sudah tiba di 【GW-Jakarta】', location: 'Kab Tangerang (GW-Jakarta)'}
9
: 
{date: '2026-11-10 18:19:19', desc: 'Paket sudah meninggalkan【JKT175A】menuju【GW-Jakarta】', location: 'Jakarta Utara (JKT175A)'}
10
: 
{date: '2026-11-09 18:37:32', desc: '【JKT175A】Kuri J&T Cargo Anda ACHMAD(87898630778)su…silakan hubungi nomor telepon outlet 081385259981', location: 'Jakarta Utara (JKT175A)'}
length
: 
11
[[Prototype]]
: 
Array(0) */