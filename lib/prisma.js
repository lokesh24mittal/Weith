import { PrismaClient } from "@prisma/client";

export const db = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = db;
}

//globalThis.prisma:  global variable ensures that prisma client instance is reused across hot relods during development.
// without this each time your application relods a new instance of prisma client would be created, potentially leading to connection issues
