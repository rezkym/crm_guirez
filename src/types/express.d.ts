// src/types/express.d.ts

export {}; // penting: jadikan modul

declare namespace Express {
  interface Request {
    requestId?: string;
    auth?: import('../core/middleware/auth').AuthContext;
  }
}