# CalmExchange

Минимальный fullstack-проект: **Next.js (App Router)** + **Prisma** + **Neon PostgreSQL**, готовый к деплою на **Vercel**.

## Стек

- Next.js 15 (TypeScript, App Router)
- Prisma ORM
- Neon PostgreSQL
- Vercel (деплой)

## Быстрый старт (локально)

### 1. Установка зависимостей

```powershell
npm install
```

### 2. Настройка Neon

1. Создайте проект на [neon.tech](https://neon.tech)
2. Скопируйте connection strings из панели Neon:
   - **Pooled** → `DATABASE_URL` (для приложения)
   - **Direct** → `DIRECT_URL` (для миграций)

### 3. Переменные окружения

```powershell
Copy-Item .env.example .env
```

Отредактируйте `.env`:

```env
DATABASE_URL="postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"
```

### 4. Миграция и seed

```powershell
npm run db:migrate
npm run db:seed
```

При первом запуске миграции Prisma спросит имя — можно ввести `init`.

### 5. Запуск dev-сервера

```powershell
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000) — на главной странице отобразятся заметки из БД.

## Деплой на Vercel

1. Запушьте репозиторий на GitHub
2. Импортируйте проект в [vercel.com](https://vercel.com)
3. В **Settings → Environment Variables** добавьте:
   - `DATABASE_URL` — pooled connection string из Neon
   - `DIRECT_URL` — direct connection string из Neon
4. Деплой запустится автоматически

После деплоя выполните миграции и seed (один раз):

```powershell
# Локально, с production DATABASE_URL и DIRECT_URL в .env
npx prisma migrate deploy
npm run db:seed
```

Либо добавьте в Vercel **Build Command**:

```powershell
npx prisma migrate deploy && npm run build
```

## Структура

```
app/
  layout.tsx      # корневой layout
  page.tsx        # главная — читает Note из БД
  globals.css
lib/
  prisma.ts       # singleton PrismaClient
prisma/
  schema.prisma   # модель Note
  seed.ts         # начальные данные
  migrations/     # SQL-миграции
```

## Модель Note

| Поле       | Тип      | Описание              |
|------------|----------|-----------------------|
| id         | uuid     | первичный ключ        |
| title      | string   | заголовок заметки     |
| createdAt  | DateTime | дата создания         |

## Полезные команды

```powershell
npm run dev          # dev-сервер
npm run build        # production-сборка
npm run db:migrate   # создать/применить миграцию (dev)
npm run db:push      # синхронизировать схему без миграции
npm run db:seed      # заполнить тестовыми данными
npm run db:studio    # Prisma Studio (GUI для БД)
npx prisma migrate deploy  # применить миграции (production)
```
