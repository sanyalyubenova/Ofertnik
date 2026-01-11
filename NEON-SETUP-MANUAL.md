# Ръчно свързване на Neon база данни

## Стъпка 1: Създайте Neon база данни

1. Отидете на https://neon.tech
2. Регистрирайте се или влезте в акаунта си
3. Създайте нов проект
4. Копирайте **Connection string** (ще изглежда така):
   ```
   postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require
   ```

## Стъпка 2: Добавете Connection String като Environment Variable

### За локално развитие:

Създайте файл `.env` в `D:\Ofertnik` с:
```
DATABASE_URL=postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require
```

### За Netlify deployment:

1. Отидете в Netlify Dashboard: https://app.netlify.com/projects/ofertnik-2000
2. Site settings → Environment variables
3. Добавете нова променлива:
   - **Key:** `DATABASE_URL`
   - **Value:** вашия connection string от Neon
4. Запазете

## Стъпка 3: Създайте таблиците в базата данни

1. В Neon Dashboard → вашия проект → **SQL Editor**
2. Отворете файла `db/schema.sql` от проекта
3. Копирайте целия SQL код
4. Поставете го в SQL Editor
5. Натиснете **Run** (или F5)

## Стъпка 4: Рестартирайте сървъра

```bash
npm start
```

При успешно свързване ще видите:
```
✅ Connected to Neon PostgreSQL database
```

## Проверка

След като сървърът стартира, може да проверите дали базата работи като:
- Отворите админ панела и проверите дали тарифите се зареждат
- Или направете тестова заявка

## Важно

- **Не споделяйте** connection string публично
- Файлът `.env` вече е в `.gitignore` и няма да бъде качен в Git
- За production винаги използвайте environment variables в Netlify Dashboard

