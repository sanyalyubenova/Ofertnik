# Деплой на Netlify

## Стъпки за деплой:

1. **Инсталирайте зависимости:**
   ```bash
   npm install
   ```

2. **Качете проекта в Netlify:**
   - Отидете на https://app.netlify.com
   - Изберете "New site from Git"
   - Свържете вашия Git repository

3. **Конфигурация:**
   - Netlify автоматично ще използва `netlify.toml` за конфигурация
   - Build command: `npm install`
   - Publish directory: `public`
   - Functions directory: `netlify/functions`

4. **Зависимости:**
   - Уверете се, че `serverless-http` е в `package.json` (вече е включен)

5. **API Endpoints:**
   - Всички `/api/*` заявки се пренасочват към Netlify Function
   - Статичните файлове се обслужват от `public/`

## Забележки:

- Netlify Functions има ограничения за време на изпълнение (10 секунди на безплатен план)
- За големи файлове (DOCX генериране) може да е необходимо да се увеличи timeout-ът
- Проверете Netlify Function logs за грешки

