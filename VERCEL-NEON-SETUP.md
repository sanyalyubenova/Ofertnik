# Свързване на Neon база данни чрез Vercel

## Вашия Neon проект:
- **Project name:** ofertnik-db
- **Project ID:** royal-sea-34133631

## Стъпка 1: Вземете Connection String от Vercel/Neon

1. В лявата странична лента на Vercel Dashboard, намерете **"SQL Editor"** или **"Connection string"**
2. Или отидете в Neon Dashboard директно: https://console.neon.tech
3. Намерете вашия проект "ofertnik-db"
4. Копирайте **Connection string** (ще изглежда така):
   ```
   postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require
   ```

## Стъпка 2: Добавете Connection String

### За локално развитие:
Създайте файл `.env` в `D:\Ofertnik`:
```
DATABASE_URL=postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require
```

### За Netlify deployment:
1. Отидете в: https://app.netlify.com/projects/ofertnik-2000
2. Site settings → Environment variables
3. Добавете:
   - **Key:** `DATABASE_URL`
   - **Value:** вашия connection string
4. Запазете

## Стъпка 3: Създайте таблиците

1. В лявата странична лента → **SQL Editor**
2. Отворете файла `db/schema.sql` от проекта
3. Копирайте целия SQL код
4. Поставете го в SQL Editor
5. Натиснете **Run** (или Execute)

## Стъпка 4: Тествайте свързването

```bash
npm start
```

При успешно свързване ще видите:
```
✅ Connected to Neon PostgreSQL database
```

## Следващи стъпки:

След като таблиците са създадени, трябва да:
1. Мигрираме съществуващите данни от JSON файлове в базата (ако е необходимо)
2. Обновим `server.js` да използва базата данни вместо файловете

