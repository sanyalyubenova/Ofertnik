# Деплой на Render - Стъпка по стъпка

## Защо Render?

- ✅ **Безплатно** - истински безплатен tier (не ограничава с кредити като Netlify)
- ✅ **По-добро за Express** - традиционен Node.js сървър (не serverless)
- ✅ **По-лесно за sessions** - не се нуждаеш от специални конфигурации
- ✅ **Автоматичен HTTPS**
- ✅ **Лесно за деплой** - автоматично от GitHub

---

## Стъпка 1: Подготовка

### 1.1. Увери се, че кодът е в GitHub

```bash
git status
git add .
git commit -m "Prepare for Render deployment"
git push
```

### 1.2. Генерирай SESSION_SECRET

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Запиши резултата - ще ти трябва по-късно.

---

## Стъпка 2: Създай акаунт на Render

1. Отиди на https://render.com
2. Кликни "Get Started for Free"
3. Влез с GitHub акаунт (препоръчително)

---

## Стъпка 3: Създай Web Service

### 3.1. New Web Service

1. В Dashboard, кликни "New +"
2. Избери "Web Service"

### 3.2. Connect Repository

1. Ако не си свързал GitHub, свържи го
2. Избери твоя repository (`ofertnik` или както се казва)
3. Кликни "Connect"

### 3.3. Конфигурация

**Name:**
```
ofertnik
```

**Environment:**
```
Node
```

**Region:**
```
Frankfurt (EU)  # или най-близкия до България
```

**Branch:**
```
main  # или master, в зависимост от твоя branch
```

**Root Directory:**
```
.  # (остави празно или точка)
```

**Build Command:**
```
npm install
```

**Start Command:**
```
npm start
```

### 3.4. Environment Variables

Добави следните environment variables:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | Твоя Neon DB connection string |
| `SESSION_SECRET` | Генерираният secret (от стъпка 1.2) |
| `NODE_ENV` | `production` |

**DATABASE_URL пример:**
```
postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/database?sslmode=require
```

### 3.5. Plan

Избери:
- **Free** (достатъчно за начало)

**Важно:** Free tier "sleeps" след 15 минути inactivity, но се зарежда автоматично при заявка (може да отнеме ~30 секунди).

### 3.6. Create Web Service

Кликни "Create Web Service"

---

## Стъпка 4: Очаквай деплой

Render ще:
1. Клонира repository-то
2. Инсталира зависимостите (`npm install`)
3. Стартира сървъра (`npm start`)
4. Направи приложението достъпно

**Време:** ~3-5 минути за първи път

---

## Стъпка 5: Тествай

1. Render ще ти даде URL: `https://ofertnik.onrender.com` (или подобен)
2. Отвори URL-а в браузъра
3. Тествай приложението

---

## Стъпка 6: Custom Domain (Опционално)

Ако искаш да използваш собствен домейн:

1. В Render Dashboard, отиди на твоя Web Service
2. Кликни "Settings"
3. Скрол надолу до "Custom Domains"
4. Добави домейна
5. Следвай инструкциите за DNS настройки

---

## Стъпка 7: Обновяване

При всеки `git push`:
- Render автоматично ще деплойне новите промени
- Ще видиш progress в Dashboard
- Deploy-ът отнема ~2-3 минути

---

## Често срещани проблеми

### Проблем: "Build failed"

**Решение:**
- Провери логовете в Render Dashboard
- Увери се, че `package.json` има правилни dependencies
- Провери дали `npm install` работи локално

### Проблем: "Application error"

**Решение:**
- Провери логовете (Logs tab в Render)
- Провери environment variables
- Увери се, че `DATABASE_URL` е правилен
- Увери се, че `SESSION_SECRET` е зададен

### Проблем: "Slow first load"

**Решение:**
- Free tier "sleeps" след inactivity
- Първото зареждане може да отнеме ~30 секунди
- След това е бързо
- Ако искаш по-бързо, можеш да използваш "Keep Alive" service (но не е безплатно)

### Проблем: "Database connection failed"

**Решение:**
- Провери `DATABASE_URL` environment variable
- Увери се, че Neon DB е достъпен
- Провери дали IP адресът на Render не е блокиран в Neon DB настройки

---

## Полезни команди

### Виж логове в реално време

В Render Dashboard:
- Отиди на твоя Web Service
- Кликни "Logs" tab
- Виждаш логове в реално време

### Рестартирай сървъра

В Render Dashboard:
- Отиди на твоя Web Service
- Кликни "Manual Deploy"
- Избери "Clear build cache & deploy"

---

## Сравнение Netlify vs Render

| Аспект | Netlify | Render |
|--------|---------|--------|
| **Цена** | Ограничени кредити | Безплатно (true free) |
| **Serverless** | Да | Не (традиционен сървър) |
| **Express поддръжка** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Sessions** | По-сложно | По-лесно |
| **First load** | Бързо | Може да е бавно (free tier sleeps) |
| **Subsequent loads** | Бързо | Бързо |
| **Деплой** | Автоматичен | Автоматичен |

---

## Заключение

Render е отлична алтернатива на Netlify за Express приложения:
- ✅ Безплатно
- ✅ По-добро за Node.js/Express
- ✅ По-лесно за sessions
- ✅ Няма проблеми с кредити

**Препоръка:** Премини на Render, за да избегнеш проблемите с кредитите на Netlify!

