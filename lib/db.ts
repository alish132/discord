// import { PrismaClient } from "@/lib/generated/prisma/client";

// declare global{
//     var prisma: PrismaClient | undefined
// }

// export const db:PrismaClient = globalThis.prisma || new PrismaClient()

// if(process.env.NODE_ENV !== "production") globalThis.prisma = db

import { PrismaClient } from "@/lib/generated/prisma/client";

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,   // ⭐ REQUIRED for Prisma 6.18+
});

declare global {
  // avoid hot reload issues in dev
  var prismaGlobal: PrismaClient | undefined;
}

export const db: PrismaClient = globalThis.prismaGlobal || prisma;

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = db;
}
