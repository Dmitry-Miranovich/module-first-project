# first-task

Небольшой API на NestJS: регистрация, вход и пользователи. Данные хранятся в PostgreSQL.

## Запуск

1. Создайте файл `.env` и укажите переменные:

```
POSTGRES_USER=
POSTGRES_PASSWORD=
POSTGRES_DB=
POSTGRES_PORT=5432
ACCESS_TOKEN_SECRET=
REFRESH_TOKEN_SECRET=
NODE_ENV=dev
```

2. Поднимите базу и установите зависимости:

```bash
docker compose up -d
npm install
```

3. Запустите приложение:

```bash
npm run start:dev
```

Сервер слушает порт `3000` (или значение `PORT`). Описание API доступно по адресу `/api`.
