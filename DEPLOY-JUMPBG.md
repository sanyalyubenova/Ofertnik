# Деплой на Jump.bg

## Изисквания

За да деплойнеш Node.js приложение на Jump.bg, ти трябва:

1. **VPS (Virtual Private Server)** или **Dedicated Server** - НЕ shared hosting
   - Shared hosting на Jump.bg поддържа само PHP/MySQL
   - Node.js изисква VPS или dedicated server

2. **Достъп до сървъра** (SSH)

3. **Node.js** (версия 18 или по-нова)

4. **PostgreSQL** или **Neon DB** (като външна услуга)
   - Можеш да използваш Neon DB (като в момента) или да инсталираш PostgreSQL на сървъра

5. **PM2** (process manager) - за поддръжка на сървъра

6. **Nginx** (reverse proxy) - обикновено е вече инсталиран на VPS

---

## Стъпка 1: Провери какъв тип хостинг имаш

Провери в панела на Jump.bg:
- **Shared hosting** - ❌ НЕ работи за Node.js
- **VPS** - ✅ Работи за Node.js
- **Dedicated Server** - ✅ Работи за Node.js

Ако имаш само shared hosting, трябва да си поръчаш VPS план.

---

## Стъпка 2: Подготовка на сървъра

### 2.1. Свържи се чрез SSH

```bash
ssh username@your-server-ip
```

### 2.2. Инсталирай Node.js (ако няма)

```bash
# Провери дали Node.js е инсталиран
node --version

# Ако няма, инсталирай чрез NodeSource (за Ubuntu/Debian)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Или чрез nvm (node version manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18
```

### 2.3. Инсталирай PM2 (process manager)

```bash
sudo npm install -g pm2
```

### 2.4. Инсталирай PostgreSQL (опционално - ако не използваш Neon DB)

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# Създай база данни и потребител
sudo -u postgres psql
CREATE DATABASE ofertnik;
CREATE USER ofertnik_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE ofertnik TO ofertnik_user;
\q
```

---

## Стъпка 3: Качи приложението на сървъра

### Опция A: Чрез Git (препоръчително)

```bash
# На сървъра
cd /var/www  # или друга директория
git clone https://github.com/your-username/ofertnik.git
cd ofertnik
npm install --production
```

### Опция B: Чрез FTP/SFTP и архивиране

1. Архивирай проекта локално (без `node_modules` и `.env`)
2. Качи архивът на сървъра
3. Разархивирай
4. Инсталирай зависимостите

```bash
# На сървъра
cd /var/www
tar -xzf ofertnik.tar.gz
cd ofertnik
npm install --production
```

---

## Стъпка 4: Конфигурация

### 4.1. Създай `.env` файл

```bash
cd /var/www/ofertnik
nano .env
```

Добави следните променливи:

```env
# Database (използвай Neon DB или локална PostgreSQL)
DATABASE_URL=postgresql://username:password@host:5432/database

# Session Secret (генерирай силен secret)
SESSION_SECRET=your-very-long-random-secret-key-here

# Node Environment
NODE_ENV=production

# Port (ще използваме PM2 и Nginx, можеш да оставиш 3000)
PORT=3000
```

За да генерираш силен SESSION_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 4.2. Обнови server.js за production

Провери дали `server.js` използва правилния порт:

```javascript
const PORT = process.env.PORT || 3000;
```

---

## Стъпка 5: Стартирай с PM2

### 5.1. Стартирай приложението

```bash
cd /var/www/ofertnik
pm2 start server.js --name ofertnik
```

### 5.2. Настрой PM2 за автоматично рестартиране

```bash
# Запази текущата конфигурация
pm2 save

# Настрой PM2 да стартира при рестарт на сървъра
pm2 startup
# Следвай инструкциите, които PM2 ще покаже
```

### 5.3. Полезни PM2 команди

```bash
# Статус
pm2 status

# Логове
pm2 logs ofertnik

# Рестарт
pm2 restart ofertnik

# Спри
pm2 stop ofertnik

# Изтрий
pm2 delete ofertnik
```

---

## Стъпка 6: Конфигурация на Nginx

### 6.1. Създай Nginx конфигурация

```bash
sudo nano /etc/nginx/sites-available/ofertnik
```

Добави следната конфигурация:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Redirect HTTP to HTTPS (ако имаш SSL сертификат)
    # return 301 https://$server_name$request_uri;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # За session cookies
        proxy_cookie_path / "/; Secure; HttpOnly; SameSite=Lax";
    }

    # Големи файлове (за качване на тарифи)
    client_max_body_size 50M;
}
```

### 6.2. Активирай сайта

```bash
sudo ln -s /etc/nginx/sites-available/ofertnik /etc/nginx/sites-enabled/
sudo nginx -t  # Провери конфигурацията
sudo systemctl reload nginx
```

---

## Стъпка 7: SSL сертификат (HTTPS)

### Опция A: Let's Encrypt (безплатно)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

Certbot ще автоматично:
- Инсталира SSL сертификат
- Конфигурира Nginx за HTTPS
- Настрои автоматично подновяване

### Опция B: SSL сертификат от Jump.bg

Ако Jump.bg предоставя SSL сертификат, следвай техните инструкции.

---

## Стъпка 8: Обнови session конфигурация за HTTPS

В `server.js`, session конфигурацията вече има:

```javascript
cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
}
```

Това означава, че когато `NODE_ENV=production`, cookies ще се изпращат само чрез HTTPS.

---

## Стъпка 9: Настрой firewall (опционално)

```bash
# Ubuntu/Debian с UFW
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
```

---

## Стъпка 10: Тествай

1. Отвори браузъра и отиди на `http://your-domain.com`
2. Провери дали приложението работи
3. Тествай логин и всички функции

---

## Поддръжка и обновяване

### Обновяване на приложението

```bash
cd /var/www/ofertnik
git pull  # или качи новите файлове
npm install --production
pm2 restart ofertnik
```

### Преглед на логове

```bash
# PM2 логове
pm2 logs ofertnik

# Nginx логове
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# Приложението логове (ако има)
tail -f /var/www/ofertnik/logs/app.log
```

---

## Често срещани проблеми

### Проблем: "Port 3000 is already in use"

```bash
# Провери какво използва порта
sudo lsof -i :3000

# Или спри всички PM2 процеси
pm2 stop all
pm2 delete all
pm2 start server.js --name ofertnik
```

### Проблем: "Cannot connect to database"

- Провери `DATABASE_URL` в `.env` файла
- Провери дали базата данни е достъпна
- Ако използваш Neon DB, провери дали IP адресът на сървъра е разрешен

### Проблем: Session не работи

- Провери дали `SESSION_SECRET` е зададен в `.env`
- Провери дали `NODE_ENV=production` (за HTTPS cookies)
- Провери Nginx proxy headers (особено `X-Forwarded-Proto`)

### Проблем: Статични файлове не се зареждат

- Провери дали `public/` директорията съществува
- Провери правата на файловете
- Провери Nginx конфигурацията

---

## Алтернатива: Използвай Neon DB (като сега)

Ако не искаш да управляваш PostgreSQL на сървъра, можеш да продължиш да използваш Neon DB:

1. Остави `DATABASE_URL` в `.env` да сочи към Neon DB
2. Не е нужно да инсталираш PostgreSQL на сървъра
3. Всичко друго остава същото

---

## Резюме

✅ **Възможно е** да деплойнеш приложението на Jump.bg, но:
- Трябва да имаш **VPS или Dedicated Server** (не shared hosting)
- Трябва да инсталираш Node.js и PM2
- Трябва да конфигурираш Nginx като reverse proxy
- Можеш да използваш Neon DB (като сега) или да инсталираш PostgreSQL

Ако имаш само shared hosting, трябва да си поръчаш VPS план от Jump.bg.

