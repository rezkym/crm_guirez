// src/types/express-augment.ts

export {}; // jadikan modul agar deklarasi global berlaku

declare global {
  namespace Express {
    interface Request {
      id: string;
      requestId?: string;
      auth?: import('../domain/auth').AuthContext;
    }
  }
}
