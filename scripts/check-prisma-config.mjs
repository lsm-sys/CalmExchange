import { readFileSync } from "node:fs";
import { join } from "node:path";

const pkgPath = join(process.cwd(), "package.json");
const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));

if (pkg.prisma && typeof pkg.prisma === "object") {
  console.error(
    "\n[CalmExchange] Обнаружен устаревший блок package.json#prisma.\n" +
      "Удалите его и используйте prisma.config.mjs.\n" +
      `Содержимое: ${JSON.stringify(pkg.prisma)}\n`,
  );
  process.exit(1);
}

console.log("[CalmExchange] OK: legacy package.json#prisma отсутствует");
