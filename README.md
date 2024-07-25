# 📝 Medium Clone NestJS Project

<p align="center">
  <img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" />
</p>

<p align="center">A robust backend for a Medium-like application built with NestJS, PostgreSQL, and JWT authentication.</p>

<p align="center">
  <a href="#-key-features">Key Features</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-Configuration">Configuration</a> •
  <a href="#-Running-the-app">Running the App</a> •
  <a href="#-Database-management">Database Management</a> •
  <a href="#-License">License</a>
</p>

## ✨ Key Features

- 🚀 NestJS framework for efficient and scalable server-side applications
- 🐘 PostgreSQL integration for robust data storage
- 🔐 JWT authentication for secure user management
- 🔄 TypeORM for database operations and migrations

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or later)
- PostgreSQL
- Yarn 

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/markiankmet/medium_nestjs.git
   ```
2. Install dependencies:
   ```bash
   yarn install
    ```

## ⚙️ Configuration
Create a .env file in the root directory with the following content:
    
```bash
POSTGRES_HOST
POSTGRES_PORT
POSTGRES_USER
POSTGRES_PASSWORD
POSTGRES_DB
JWT_SECRET
PORT
   ```

## 🏃‍♂️ Running the App
### Development
```bash 
yarn start
```

### Watch mode
```bash 
yarn start:dev
```

### Production mode
```bash
yarn start:prod
``` 

## 🗃️ Database Management

| Command              | Description                              | Script            |
|----------------------|------------------------------------------|-------------------|
| Drop database schema | Removes all tables and data              | `yarn db:drop`    |
| Create migration     | Generates a new migration file           | `yarn db:create`  |
| Run migration        | Applies pending migrations               | `yarn db:migrate` |
| Seed database        | Populates the database with initial data | `yarn db:seed`    |


### 📄 License
This project is UNLICENSED.

<p align="center">
  Made with ❤️ by Markiian Kmet
</p>
