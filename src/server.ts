import './types/express-augment';
import 'dotenv/config';
import { app } from './app';
import { appConfig } from './config';

const port: number = appConfig.port;

app.listen(port, () => {
  console.log(`[server] Listening on port ${port}`);
});