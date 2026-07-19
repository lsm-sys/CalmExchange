# Настройка аутентификации (Auth.js + Google OAuth)

Пошаговая инструкция для получения `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` и `AUTH_SECRET` для проекта **CalmExchange**.

---

## Что понадобится

| Переменная | Где используется |
|------------|------------------|
| `AUTH_SECRET` | Подпись сессий Auth.js |
| `GOOGLE_CLIENT_ID` | OAuth-приложение Google |
| `GOOGLE_CLIENT_SECRET` | OAuth-приложение Google |
| `DATABASE_URL` | PostgreSQL (Neon) — уже должен быть в `.env` |
| `DIRECT_URL` | Prisma migrations — уже должен быть в `.env` |

---

## Шаг 1. Сгенерировать AUTH_SECRET

`AUTH_SECRET` — случайная строка для шифрования cookie и сессий. **Не публикуйте её в Git.**

### Вариант A — PowerShell (Windows)

```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

Скопируйте вывод — это ваш `AUTH_SECRET`.

### Вариант B — OpenSSL (если установлен)

```powershell
openssl rand -base64 32
```

---

## Шаг 2. Создать OAuth-приложение в Google Cloud

### 2.1. Открыть Google Cloud Console

1. Перейдите на [https://console.cloud.google.com/](https://console.cloud.google.com/)
2. Войдите под Google-аккаунтом
3. Создайте проект (или выберите существующий):
   - **Select a project** → **New Project**
   - Имя, например: `CalmExchange`
   - **Create**

### 2.2. Настроить OAuth consent screen (экран согласия)

1. Меню **APIs & Services** → **OAuth consent screen**
2. User Type:
   - **External** — для обычных Google-аккаунтов (рекомендуется для SaaS)
   - **Internal** — только для Google Workspace организации
3. Заполните обязательные поля:
   - **App name**: `CalmExchange`
   - **User support email**: ваш email
   - **Developer contact email**: ваш email
4. **Save and Continue**
5. **Scopes** → **Save and Continue** (базовых scope от Google достаточно)
6. **Test users** (если приложение в режиме Testing):
   - Добавьте свой Google-email
   - Пока приложение не опубликовано, войти смогут только test users
7. **Save and Continue** → **Back to Dashboard**

### 2.3. Создать OAuth Client ID

1. **APIs & Services** → **Credentials**
2. **+ Create Credentials** → **OAuth client ID**
3. Application type: **Web application**
4. Name: `CalmExchange Web`
5. **Authorized JavaScript origins** — добавьте:

   ```
   http://localhost:3000
   ```

   Для production добавьте также:

   ```
   https://ВАШ-ДОМЕН.vercel.app
   ```

6. **Authorized redirect URIs** — добавьте **точно** эти URL:

   ```
   http://localhost:3000/api/auth/callback/google
   ```

   Для production:

   ```
   https://ВАШ-ДОМЕН.vercel.app/api/auth/callback/google
   ```

   > Важно: путь `/api/auth/callback/google` — стандартный для Auth.js. Опечатка в URI = ошибка входа.

7. **Create**
8. Скопируйте:
   - **Client ID** → `GOOGLE_CLIENT_ID`
   - **Client secret** → `GOOGLE_CLIENT_SECRET`

---

## Шаг 3. Записать переменные в `.env`

В корне проекта:

```powershell
cd c:\Work\CalmExchange
Copy-Item .env.example .env
```

Откройте `.env` и заполните:

```env
AUTH_SECRET="вставьте-сгенерированный-секрет"
GOOGLE_CLIENT_ID="123456789-abc.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-xxxxxxxx"

DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
```

Файл `.env` уже в `.gitignore` — в репозиторий не попадёт.

---

## Шаг 4. Проверить локально

```powershell
npm run dev
```

1. Откройте [http://localhost:3000/login](http://localhost:3000/login)
2. Нажмите **«Войти через Google»**
3. Выберите Google-аккаунт (должен быть в Test users, если приложение в Testing)
4. После успеха — редирект на `/dashboard`

### Частые ошибки

| Ошибка | Причина | Решение |
|--------|---------|---------|
| `redirect_uri_mismatch` | Неверный redirect URI | Проверьте URI в Google Console (шаг 2.3) |
| `Access blocked: app has not been verified` | External app в Testing | Добавьте email в Test users |
| `Configuration` / `AUTH_SECRET` | Нет или пустой секрет | Заполните `AUTH_SECRET` в `.env` |
| `invalid_client` | Неверный Client ID/Secret | Перепроверьте значения в `.env`, перезапустите `npm run dev` |

---

## Шаг 5. Настроить Vercel (production)

1. [vercel.com](https://vercel.com) → проект **CalmExchange**
2. **Settings** → **Environment Variables**
3. Добавьте для **Production** (и при необходимости Preview):

   | Name | Value |
   |------|-------|
   | `AUTH_SECRET` | тот же или новый секрет (лучше отдельный для prod) |
   | `AUTH_URL` | `https://calm-exchange.vercel.app` |
   | `GOOGLE_CLIENT_ID` | Client ID |
   | `GOOGLE_CLIENT_SECRET` | Client secret |
   | `DATABASE_URL` | pooled Neon URL |
   | `DIRECT_URL` | direct Neon URL |

4. В Google Console добавьте production redirect URI (шаг 2.3)
5. **Deployments** → **Redeploy** последнего деплоя

### Ошибка `redirect_uri_mismatch` на preview-URL Vercel

В **Détails de la requête** Google может показать не production-домен, а preview:

```
redirect_uri=https://calm-exchange-xxxxx.vercel.app/api/auth/callback/google
```

Это происходит, если вы открываете **ссылку на конкретный деплой** (preview), а не production.

**Решение A (рекомендуется):** входите только через production:

```
https://calm-exchange.vercel.app/login
```

**Решение B:** задайте на Vercel (для **Production** и **Preview**):

```
AUTH_URL=https://calm-exchange.vercel.app
```

В Google Console достаточно одного redirect URI:

```
https://calm-exchange.vercel.app/api/auth/callback/google
```

Код проекта также использует `VERCEL_PROJECT_PRODUCTION_URL`, чтобы preview-деплои не подставляли случайный домен.

### Ошибка на Vercel: «Server error / problem with the server configuration»

Если при нажатии «Войти через Google» открывается ошибка сервера, почти всегда на Vercel **не заданы переменные Auth.js**.

Проверьте в **Settings → Environment Variables → Production**:

1. `AUTH_SECRET` — **обязательно** (без него вход не работает)
2. `GOOGLE_CLIENT_ID`
3. `GOOGLE_CLIENT_SECRET`
4. `AUTH_URL` = `https://calm-exchange.vercel.app`
5. `DATABASE_URL` и `DIRECT_URL`

После добавления переменных — **Redeploy** (не просто push, а именно redeploy).

Проверка: откройте  
[https://calm-exchange.vercel.app/api/auth/signin/google](https://calm-exchange.vercel.app/api/auth/signin/google)  
— должна открыться страница Google, а не «Server error».

### Google Console для production

**Authorized redirect URIs** (точное совпадение):

```
https://calm-exchange.vercel.app/api/auth/callback/google
```

**Authorized JavaScript origins**:

```
https://calm-exchange.vercel.app
```

---

## Шаг 6. Опубликовать OAuth-приложение (опционально)

Пока статус **Testing**, вход доступен только **Test users**.

Чтобы любой пользователь мог войти:

1. **OAuth consent screen** → **Publish App**
2. Для публичного SaaS Google может потребовать верификацию приложения

---

## Чеклист

- [ ] `AUTH_SECRET` сгенерирован
- [ ] OAuth Client создан в Google Cloud
- [ ] Redirect URI: `http://localhost:3000/api/auth/callback/google`
- [ ] Redirect URI production добавлен на Vercel-домен
- [ ] `.env` заполнен локально
- [ ] Переменные добавлены в Vercel
- [ ] Вход через Google работает на `/login`
- [ ] `/dashboard` открывается после входа
- [ ] Выход («Выйти») работает

---

## Связанные файлы проекта

```
auth.ts              — Auth.js + PrismaAdapter (server-side sessions)
auth.config.ts       — Google provider, middleware
middleware.ts        — защита /dashboard, /my-meditations
app/login/page.tsx   — страница входа
app/api/auth/[...nextauth]/route.ts
```

Подробнее о моделях БД: `DATABASE.md`
