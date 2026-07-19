import { handlers } from "@/auth";

export const { GET, POST } = handlers;

// Prisma не работает на Edge — только Node.js runtime
export const runtime = "nodejs";
