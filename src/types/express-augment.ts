// src/types/express-augment.ts

export {}; // jadikan modul agar deklarasi global berlaku

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      auth?: import('../core/middleware/auth').AuthContext;
    }
  }
}
