import 'dotenv/config';
import { app } from './app';

/**
 * Server bootstrap terpisah dari app.ts
 * - Memudahkan pengujian & integrasi
 * - Jangan menambah middleware/business logic di sini
 */
const envPort = process.env.PORT;
const port: number = (envPort ? Number(envPort) : 3000);

app.listen(port, () => {
  // Logging sederhana; logging lanjutan akan ditambahkan di tahap berikutnya
  // Jangan mengimpor library lain di tahap ini.
  console.log(`[server] Listening on port ${port}`);
});