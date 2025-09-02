let PrismaClient;
try {
  // Defer resolution to runtime to avoid hard crash if client isn't generated yet
  ({ PrismaClient } = require("@prisma/client"));
} catch (err) {
  // eslint-disable-next-line no-console
  console.error("@prisma/client is not generated. Run: npx prisma generate");
}

let prismaInstance = globalThis.__prisma || null;

if (!prismaInstance && PrismaClient) {
  try {
    prismaInstance = new PrismaClient();
    if (process.env.NODE_ENV !== "production") {
      globalThis.__prisma = prismaInstance;
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("Failed to initialize PrismaClient. Ensure prisma generate has run.", e);
    throw e;
  }
}

export const prisma = prismaInstance;


