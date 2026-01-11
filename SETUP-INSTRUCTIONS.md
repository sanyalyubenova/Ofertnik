# Инструкции за Setup на Database

## Стъпка 1: Вземете DATABASE_URL от Netlify

1. Отидете на https://app.netlify.com
2. Изберете вашия сайт
3. Отидете на: **Site settings** → **Environment variables**
4. Намерете `DATABASE_URL` и копирайте стойността му

## Стъпка 2: Актуализирайте .env файла

1. Отворете `.env` файла в root директорията на проекта
2. Намерете реда с `DATABASE_URL` (вероятно е коментиран с `#`)
3. Раскоментирайте го (премахнете `#`) и поставете connection string-а:

```
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
```

**Важно:** Заменете с реалния connection string от Netlify!

## Стъпка 3: Изпълнете Setup и Migration

След като актуализирате `.env` файла, изпълнете:

```bash
node scripts/setup-and-migrate.js
```

Това ще:
- ✅ Създаде всички таблици в базата данни
- ✅ Мигрира всички данни от JSON файловете
- ✅ Покаже статистика за мигрираните данни

## Алтернатива: Директно в Neon Dashboard

Ако предпочитате да не използвате .env файл, можете да:

1. Отидете в Neon Dashboard (https://console.neon.tech)
2. Изберете вашия проект
3. Отидете на **SQL Editor**
4. Копирайте и изпълнете `db/schema.sql`
5. След това използвайте admin панела в приложението за да качите данните

## Проверка

След setup, можете да проверите:

1. **Таблиците са създадени:**
   ```sql
   SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
   ```

2. **Данните са мигрирани:**
   ```sql
   SELECT COUNT(*) FROM insurers;
   SELECT COUNT(*) FROM casco_tariffs;
   SELECT COUNT(*) FROM mtpl_tariffs;
   ```

## Production (Netlify)

В production (Netlify deployment), `DATABASE_URL` се предоставя автоматично от Netlify - не е необходимо допълнително конфигуриране!

