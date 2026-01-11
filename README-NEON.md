# Свързване на Neon PostgreSQL база данни чрез Netlify DB

## Netlify DB (Powered by Neon)

Netlify DB е услуга, която използва Neon PostgreSQL и е оптимизирана за AI workflows. С една команда можете да създадете и свържете база данни.

## Стъпки за свързване

### Вариант 1: Чрез Netlify CLI (Препоръчително за Netlify deployment)

1. **Инсталирайте Netlify CLI** (ако още не е инсталиран):
   ```bash
   npm install -g netlify-cli
   ```

2. **Инициализирайте базата данни**:
   ```bash
   npx netlify db init
   ```

   Тази команда автоматично:
   - Създава Neon PostgreSQL база данни
   - Свързва я с вашия Netlify проект
   - Конфигурира environment variables
   - Инсталира Drizzle ORM и Studio

3. **Стартирайте сървъра**:
   ```bash
   npm start
   ```

   Базата данни автоматично ще бъде свързана чрез `DATABASE_URL` environment variable.

### Вариант 2: Ръчно свързване с Neon

1. **Създайте Neon база данни**:
   - Регистрирайте се на https://neon.tech
   - Създайте нов проект
   - Копирайте connection string

2. **Конфигурирайте environment variable**:
   
   За локално развитие, създайте файл `.env`:
   ```bash
   DATABASE_URL=postgresql://user:password@host/database?sslmode=require
   ```
   
   За Netlify deployment:
   - Отидете в Netlify Dashboard → вашия проект → Site settings → Environment variables
   - Добавете `DATABASE_URL` със стойността от Neon

3. **Създайте таблиците**:
   Изпълнете SQL файла `db/schema.sql` в Neon SQL Editor:
   
   - Отидете в Neon Dashboard → вашия проект → SQL Editor
   - Отворете файла `db/schema.sql`
   - Изпълнете SQL командите

   Или използвайте psql:
   ```bash
   psql $DATABASE_URL -f db/schema.sql
   ```

4. **Стартирайте сървъра**:
   ```bash
   npm start
   ```

## Структура на базата данни

### Таблици:

- **insurers** - Застрахователи
- **casco_tariffs** - CASCO тарифи
- **mtpl_tariffs** - MTPL тарифи
- **gap_tariffs** - GAP тарифи

Схемата е дефинирана в `db/schema.sql`.

## Проверка на свързването

При стартиране на сървъра, в конзолата ще видите:

- `✅ Connected to Neon PostgreSQL database` - ако свързването е успешно
- `⚠️ Database connection failed, using file system` - ако няма свързване, ще използва файлове

## Важно

- **Базата данни е опционална** - ако `DATABASE_URL` не е зададен, приложението използва JSON файлове (както преди)
- **За Netlify deployment** - използвайте `npx netlify db init` за автоматична конфигурация
- **За локално развитие** - може да използвате `.env` файл с connection string от Neon
- Netlify DB предлага безплатен tier и upgrade path към пълната Neon платформа

## Миграция на данни

Ако имате съществуващи данни в JSON файлове, може да създадете скрипт за миграция или да ги импортирате ръчно чрез админ панела.
