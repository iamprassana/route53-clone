# AWS Route 53 Clone

A full-stack clone of the AWS Route 53 console focused on managing
hosted zones and DNS records through a Route 53-inspired interface.

## Features

-   User authentication
-   Create, view, and delete hosted zones
-   Create, view, update, and delete DNS records
-   Route 53-inspired dashboard and navigation
-   REST API-based frontend/backend communication
-   Persistent database storage

## Tech Stack

**Frontend** - React / Next.js - TypeScript - Tailwind CSS

**Backend** - Python - FastAPI - Pydantic - SQLAlchemy - Uvicorn

**Database** - Relational database managed through SQLAlchemy ORM

## Architecture

``` text
Browser
   │
   ▼
Frontend (React / Next.js)
   │
   │ REST API
   ▼
FastAPI Backend
   │
   ├── Authentication
   ├── Hosted Zones
   └── DNS Records
   │
   ▼
SQLAlchemy ORM
   │
   ▼
Database
```

The frontend communicates with the backend through REST APIs.
Resource-specific backend modules handle authentication, hosted zones,
and DNS records, while SQLAlchemy manages database access.

## Project Structure

``` text
Route53/
├── backend/
│   ├── auth/
│   ├── database/
│   ├── records/
│   ├── schema/
│   ├── zones/
│   └── main.py
│
├── frontend/
└── README.md
```

## Database Schema

The core data model contains three entities:

``` text
users
  │
  │ 1:N
  ▼
hosted_zones
  │
  │ 1:N
  ▼
dns_records
```

### `users`

  Column         Type       Constraints
  -------------- ---------- -----------------
  `id`           Integer    Primary Key
  `email`        String     Unique, Indexed
  `password`     String     Not Null
  `username`     String     Not Null
  `created_at`   DateTime   Not Null

### `hosted_zones`

  Column           Type       Constraints
  ---------------- ---------- --------------------------
  `id`             Integer    Primary Key
  `user_id`        Integer    Foreign Key → `users.id`
  `name`           String     Unique, Not Null
  `comment`        String     Nullable
  `zone_type`      String     Not Null
  `private_zone`   Boolean    Not Null
  `tags`           JSON       Not Null
  `created_at`     DateTime   Not Null

### `dns_records`

  Column              Type      Constraints
  ------------------- --------- ---------------------------------
  `id`                Integer   Primary Key
  `zone_id`           Integer   Foreign Key → `hosted_zones.id`
  `name`              String    Not Null
  `record_type`       String    Indexed, Not Null
  `ttl`               Integer   Not Null
  `values`            JSON      Not Null
  `routing_policy`    String    Not Null
  `alias_target`      String    Nullable
  `health_check_id`   String    Nullable

A user can own multiple hosted zones, and each hosted zone can contain
multiple DNS records. Hosted zone and record relationships use cascading
deletion.

## API Overview

  ---------------------------------------------------------------------------------------------------
  Method                  Endpoint                                            Purpose
  ----------------------- --------------------------------------------------- -----------------------
  `GET`                   `/api/hosted-zones`                                 List hosted zones

  `POST`                  `/api/hosted-zones`                                 Create hosted zone

  `GET`                   `/api/hosted-zones/{zone_id}`                       Get hosted zone

  `DELETE`                `/api/hosted-zones/{zone_id}`                       Delete hosted zone

  `GET`                   `/api/hosted-zones/{zone_id}/records`               List DNS records

  `POST`                  `/api/hosted-zones/{zone_id}/records`               Create DNS record

  `PUT`                   `/api/hosted-zones/{zone_id}/records/{record_id}`   Update DNS record

  `DELETE`                `/api/hosted-zones/{zone_id}/records/{record_id}`   Delete DNS record
  ---------------------------------------------------------------------------------------------------

Supported DNS record types include A, AAAA, CNAME, MX, TXT, NS, and SOA
where supported by the implementation.

## Setup & Running

### 1. Clone the repository

``` bash
git clone https://github.com/iamprassana/route53-clone.git
cd route53-clone
```

### 2. Frontend

Install Bun if required:

``` bash
npm install -g bun
```

Install dependencies and start the development server:

``` bash
cd frontend
bun install
bun run dev
```

### 3. Backend

Open a new terminal:

``` bash
cd backend
python -m venv .venv
```

Activate the environment.

**Windows:**

``` bash
.venv\Scripts\activate
```

**macOS/Linux:**

``` bash
source .venv/bin/activate
```

Install dependencies:

``` bash
pip install -r requirements.txt
```

Start the backend:

``` bash
uvicorn app.main:app --reload
```

Run the frontend and backend simultaneously.

## API Documentation

### API Endpoints

### Hosted Zones

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/hosted-zones` | List all hosted zones |
| `POST` | `/api/hosted-zones` | Create a new hosted zone |
| `GET` | `/api/hosted-zones/{zone_id}` | Get hosted zone details |
| `DELETE` | `/api/hosted-zones/{zone_id}` | Delete a hosted zone |

### DNS Records

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/hosted-zones/{zone_id}/records` | List DNS records |
| `POST` | `/api/hosted-zones/{zone_id}/records` | Create a DNS record |
| `PUT` | `/api/hosted-zones/{zone_id}/records/{record_id}` | Update a DNS record |
| `DELETE` | `/api/hosted-zones/{zone_id}/records/{record_id}` | Delete a DNS record |

### Authentication

The application supports login, logout, and session persistence.
Authentication is implemented locally rather than through AWS IAM.

When the backend is running:

-   Swagger UI: `http://localhost:8000/docs`
-   ReDoc: `http://localhost:8000/redoc`