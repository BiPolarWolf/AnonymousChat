# AnonymousChat

Проект анонимного чата с WebSocket поддержкой.

## Требования

- Python 3.13+
- Node.js 18+
- Redis

## Установка Redis

### macOS
```bash
brew install redis
brew services start redis
```

### Linux
```bash
sudo apt-get install redis-server
sudo systemctl start redis
```

### Windows
Скачайте Redis с https://redis.io/download

## Запуск бэкенда

1. Установите зависимости:
```bash
uv sync
```

2. Запустите сервер:
```bash
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Бэкенд будет доступен на http://localhost:8000

## Запуск фронтенда

1. Перейдите в директорию frontend:
```bash
cd frontend
```

2. Установите зависимости:
```bash
npm install
```

3. Запустите dev-сервер:
```bash
npm run dev
```

Фронтенд будет доступен на http://localhost:5173

## Быстрый старт

Запустите оба сервера в разных терминалах:

**Терминал 1 (бэкенд):**
```bash
uv run uvicorn app.main:app --reload
```

**Терминал 2 (фронтенд):**
```bash
cd frontend && npm run dev
```

## API документация

После запуска бэкенда документация доступна на:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
