# 🌍 ClimateIQ — Air Quality Dashboard

> **Making climate data understandable for communities.**
>
> An interactive dashboard that transforms complex AQI (Air Quality Index) data into visual, actionable insights for Indian cities. Also displays temperature data for environmental context.

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)
![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6?logo=typescript)

---

## ✨ Features

### 🎯 AQI Focus
- **Real-time AQI gauges** — Color-coded circular gauges with animated arcs
- **Trend charts** — Interactive AQI time-series with PM2.5/PM10 overlays
- **Category distribution** — Bar chart showing AQI category breakdown (24h)
- **City rankings** — Heatmap table ranking all cities worst-to-best
- **Pollutant breakdown** — Pie chart of individual pollutant contributions
- **Health recommendations** — Actionable advice based on current AQI level
- **Active alerts** — Real-time health advisories with severity indicators

### 🌡️ Temperature (Secondary)
- Current temperature and humidity display per city
- Temperature trend charts alongside AQI data
- Contextual notes on how temperature affects air quality

### 🗺️ Interactive Map
- Leaflet map of India with AQI-colored circle markers
- Marker size proportional to AQI severity
- Popup with city AQI + temperature on click

---

## 🏗️ Architecture

```
Frontend (Next.js + React + Tailwind CSS)
  → API Layer (Next.js API routes)
    → Database (PostgreSQL + Prisma ORM)
    → Caching Layer (Redis via ioredis)
      → Containerization (Docker + Docker Compose)
        → Cloud Ready (AWS / Azure)
```

### Tech Stack

| Layer           | Technology                       |
|-----------------|----------------------------------|
| Frontend        | Next.js 14, React 18, Tailwind   |
| Charts          | Recharts (line, area, bar, pie)  |
| Maps            | React-Leaflet + OpenStreetMap    |
| Animations      | Framer Motion                    |
| API             | Next.js API Routes               |
| Database        | PostgreSQL 16 + Prisma 5         |
| Cache           | Redis 7 (ioredis)                |
| Containers      | Docker + Docker Compose          |
| Language        | TypeScript 5.4                   |

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ 
- **Docker** & Docker Compose (for PostgreSQL + Redis)
- **npm** or **yarn**

### 1. Clone & Install

```bash
cd climate-dashboard
npm install
```

### 2. Start Database & Redis (Docker)

```bash
docker-compose up -d db redis
```

This starts PostgreSQL on `localhost:5432` and Redis on `localhost:6379`.

### 3. Set Up Database

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed with sample data (10 Indian cities, 30 days of data)
npm run db:seed
```

### 4. Start Development Server

```bash
npm run dev
```

Open **http://localhost:3000** 🎉

---

## 🐳 Full Docker Deployment

Run the entire stack (app + db + redis) in containers:

```bash
docker-compose up --build
```

This will:
1. Start PostgreSQL with persistent data volume
2. Start Redis with AOF persistence
3. Build and start the Next.js app
4. App available at **http://localhost:3000**

---

## 📁 Project Structure

```
├── prisma/
│   ├── schema.prisma          # Database models (City, AqiReading, etc.)
│   └── seed.ts                # Seed script with sample data
├── src/
│   ├── components/
│   │   ├── AqiGauge.tsx       # Circular AQI gauge with SVG arc
│   │   ├── AqiChart.tsx       # AQI trend area chart
│   │   ├── AqiDistributionChart.tsx
│   │   ├── AqiHeatmapTable.tsx
│   │   ├── AqiMap.tsx         # Leaflet map with AQI markers
│   │   ├── AqiScaleLegend.tsx
│   │   ├── AlertsBanner.tsx
│   │   ├── HealthRecommendations.tsx
│   │   ├── Layout.tsx
│   │   ├── LoadingSkeleton.tsx
│   │   ├── PeriodSelector.tsx
│   │   ├── PollutantBreakdown.tsx
│   │   ├── StatCard.tsx
│   │   └── TemperatureChart.tsx
│   ├── hooks/
│   │   └── useFetch.ts        # Data fetching hook with auto-refresh
│   ├── lib/
│   │   ├── aqi-utils.ts       # AQI scale, colors, health advice
│   │   ├── db.ts              # Prisma client singleton
│   │   ├── redis.ts           # Redis client + cache helpers
│   │   └── utils.ts           # Formatting utilities
│   ├── pages/
│   │   ├── api/
│   │   │   ├── aqi/           # GET /api/aqi
│   │   │   ├── alerts/        # GET /api/alerts
│   │   │   ├── cities/        # GET /api/cities, /api/cities/[id]
│   │   │   ├── dashboard/     # GET /api/dashboard
│   │   │   └── temperature/   # GET /api/temperature
│   │   ├── about/
│   │   ├── alerts/
│   │   ├── cities/
│   │   │   ├── index.tsx      # City grid view
│   │   │   └── [id].tsx       # City detail page
│   │   ├── _app.tsx
│   │   └── index.tsx          # Main dashboard
│   └── styles/
│       └── globals.css
├── docker-compose.yml
├── Dockerfile
├── .env.example
└── package.json
```

---

## 🔌 API Endpoints

| Method | Endpoint               | Description                     | Cache TTL |
|--------|------------------------|---------------------------------|-----------|
| GET    | `/api/dashboard`       | Dashboard summary + all cities  | 3 min     |
| GET    | `/api/cities`          | List all cities with latest AQI | 24 hr     |
| GET    | `/api/cities/[id]`     | Single city detail              | 2 min     |
| GET    | `/api/aqi`             | AQI readings (filterable)       | 2-60 min  |
| GET    | `/api/temperature`     | Temperature readings            | 5 min     |
| GET    | `/api/alerts`          | Active health alerts            | 2 min     |

**Query Parameters:** `cityId`, `period` (`24h` | `7d` | `30d`)

---

## ☁️ Cloud Deployment

### AWS (ECS + RDS + ElastiCache)
1. Push Docker image to **ECR**
2. Create **RDS PostgreSQL** instance
3. Create **ElastiCache Redis** cluster
4. Deploy on **ECS Fargate** with environment variables
5. Use **ALB** for load balancing

### Azure (Container Apps + Azure DB + Azure Cache)
1. Push image to **Azure Container Registry**
2. Create **Azure Database for PostgreSQL**
3. Create **Azure Cache for Redis**
4. Deploy on **Azure Container Apps**
5. Configure **Azure Front Door** for CDN

---

## 📝 License

MIT — Built for educational and community awareness purposes.
