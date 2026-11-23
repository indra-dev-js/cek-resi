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

jnt
  .trackPackage(NO_RESI)
  .then(({ summary, history }) => {
    console.log(summary.status); // mis. DELIVERED
    console.log(history); // riwayat terbaru ada di indeks 0
    for (const event of history) {
      console.log(`${event.date} ${event.location} - ${event.desc}`);
    }
  })
  .catch(error => console.error('Gagal:', error.message));
