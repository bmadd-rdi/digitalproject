# BMA Digital Project — ระบบเสนอโครงการดิจิทัล กรุงเทพมหานคร

ระบบเสนอ ตรวจ และติดตามโครงการดิจิทัลของสำนัก/หน่วยงาน กรุงเทพมหานคร
ครอบคลุมตั้งแต่การร่างข้อเสนอโครงการ งบประมาณ เอกสารประกอบ การตรวจของเจ้าหน้าที่
การประชุม และมติคณะกรรมการ — ทุกขั้นตอนมีสถานะและประวัติการแก้ไขตรวจสอบได้

- **Repository ปัจจุบัน:** https://github.com/bmadd-rdi/digitalproject
- **เริ่มโครงการ:** 2 กันยายน 2569 (2026-09-02) — commit แรก "Initial commit"
- **ผู้เริ่มต้นโครงการ:** ดูหัวข้อ Credit ด้านท้าย

---

## โครงสร้างโปรเจกต์

```
digitalproject/
├── README.md               ← ไฟล์นี้
├── AGENTS.md / CLAUDE.md   ← คู่มือสำหรับ AI agent / ผู้พัฒนาใหม่
├── docker-compose.yml      ← รันระบบทั้งหมด (frontend + backend)
├── logs/                   ← บันทึกงาน (ไม่ถูก push ขึ้น GitHub)
├── database/               ← PostgreSQL + ข้อมูลฐานข้อมูลตั้งต้น (ดูหัวข้อถัดไป)
├── backend/                ← API ฝั่งเซิร์ฟเวอร์ (Bun + Hono + Drizzle)
│   ├── src/
│   │   ├── modules/        ← ฟีเจอร์: auth, projects, proposals, meeting, users, uploads...
│   │   ├── db/             ← schema, migration, seed
│   │   ├── config/ middlewares/ infrastructure/ shared/ jobs/
│   │   └── index.ts, app.ts
│   ├── drizzle/            ← SQL migration
│   └── tests/              ← unit / integration / contract
├── frontend/               ← ส่วนติดต่อผู้ใช้ (Next.js)
│   └── src/
│       ├── app/            ← หน้าเว็บ (App Router)
│       ├── features/       ← ฟีเจอร์: projects, proposals, meetings, auth...
│       ├── components/     ← UI components (shadcn/ui)
│       ├── lib/            ← API client, session
│       └── types/          ← ไฟล์ generated จาก OpenAPI (ห้ามแก้มือ)
└── *.md                    ← เอกสารติดตั้ง/อัปเดต (Install-*, Update-*, Config-Develop)
```

| ส่วน | ทำหน้าที่ | Port |
|---|---|---|
| `frontend/` | ส่วนติดต่อผู้ใช้ สำหรับเจ้าหน้าที่ เลขานุการ นักวิเคราะห์ กรรมการ | 3000 |
| `backend/` | API กลาง — สิทธิ์ผู้ใช้ สถานะ workflow งบประมาณ การประชุม | 8081 |
| `database/` | PostgreSQL เก็บข้อมูลจริง | 5432 |

---

## ภาษาที่ใช้และเวอร์ชัน

| เทคโนโลยี | เวอร์ชัน | ใช้ที่ไหน |
|---|---|---|
| TypeScript | 5.x (backend: 7.x) | ทั้ง backend และ frontend |
| Bun | 1.3.5 | runtime ของ backend + รัน test |
| Hono | ^4.12.25 | web framework ของ backend |
| `@hono/zod-openapi` | ^1.4.0 | เปิด API docs อัตโนมัติ (Swagger ที่ `/docs/`) |
| Drizzle ORM + Drizzle Kit | ^0.45.2 / ^0.31.10 | เชื่อม PostgreSQL + migration |
| Zod | ^4.4.3 | ตรวจสอบข้อมูล (validation) ทั้งสองฝั่ง |
| Next.js | 16.2.7 (App Router) | frontend |
| React | 19.2.4 | frontend |
| Tailwind CSS | 4.x | ระบบ styling |
| TanStack Query | ^5.x | จัดการข้อมูลจาก API |
| pnpm | 11.20.0 | ติดตั้ง package ฝั่ง frontend |
| Node.js | 24.6.0 (Docker image) | รัน production ฝั่ง frontend |
| PostgreSQL | 15 (image `postgres:15`) | ฐานข้อมูล |
| Docker / Docker Compose | — | รันทั้งระบบ |
| รุ่น image ปัจจุบัน | `digitalproject-frontend:v3.0.0`, `digitalproject-backend:v3.0.0` | `docker-compose.yml` |

ภาษาอื่นที่ใช้: SQL (migration), JavaScript/ESM (`scripts/`), Bash (`script.bash`)

---

## ฐานข้อมูล (`database/`)

โฟลเดอร์ `database/` เป็นชุดติดตั้ง PostgreSQL แบบพกพา รันแยกจากตัวแอป:

- **ไฟล์ `docker-compose.yml`** — รัน PostgreSQL 15 ในคอนเทนเนอร์ชื่อ `bma_postgres`
  port `5432`, เก็บข้อมูลใน volume `postgres_data`
- **ไฟล์ `dump-bma_db-202609141312.sql`** — dump ฐานข้อมูล `bma_db` ทั้งก้อน
  - dump จาก PostgreSQL **15.18** (ด้วย pg_dump 17.0) เมื่อ **14 กันยายน 2569**
  - มีทั้ง schema และข้อมูลตั้งต้น — **43 ตาราง**
  - ระบบจะ import อัตโนมัติครั้งแรกที่ volume ยังว่าง
    (map ไฟล์เข้า `/docker-entrypoint-initdb.d/init.sql`)

เริ่มใช้งาน:

```bash
cd database
docker compose up -d
# ถ้า dump ไม่ถูก import อัตโนมัติ (volume เดิม) สั่ง import มือ:
docker exec -i bma_postgres psql -U postgres -d bma_db < dump-bma_db-202609141312.sql
```

ค่าเริ่มต้น: user `postgres` / password `mysecretpassword` (ใช้เฉพาะเครื่องพัฒนาเท่านั้น — เปลี่ยนก่อนใช้จริง)

---

## เริ่มใช้งานอย่างรวดเร็ว

```bash
# 1. Clone และตั้งค่าไฟล์ env
git clone https://github.com/bmadd-rdi/digitalproject .
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 2. รันฐานข้อมูล (import dump อัตโนมัติครั้งแรก)
cd database && docker compose up -d && cd ..

# 3. รันทั้งระบบ
docker compose up -d
```

- เว็บไซต์: http://localhost:3000
- API: http://localhost:8081/api/v1
- Swagger UI (API docs): http://localhost:8081/docs/

เอกสารละเอียด: [`Install-Project.md`](Install-Project.md) · [`Install-Database.md`](Install-Database.md) · [`Config-Develop.md`](Config-Develop.md) · [`Update-Project.md`](Update-Project.md)
พัฒนาแบบแยกส่วน: ดู `backend/README.md` และ `frontend/README.md`

---

## Credit / ผู้เริ่มต้นโครงการ

โครงการนี้สร้างต่อยอดจากผลงานต้นฉบับของ **[Aluminium51](https://github.com/Aluminium51)** — ขอขอบคุณสำหรับจุดเริ่มต้นของระบบ:

|  Repository | สิ่งที่เป็น |
|---|---|
| [Aluminium51/bmadigitalproject](https://github.com/Aluminium51/bmadigitalproject) | ต้นแบบโปรเจกต์ (Next.js) |
| [Aluminium51/bmadigitalproject-backend](https://github.com/Aluminium51/bmadigitalproject-backend) | ต้นแบบ API ฝั่ง backend (87 commits) |
| [Aluminium51/bmadigitalproject-frontend](https://github.com/Aluminium51/bmadigitalproject-frontend) | ต้นแบบส่วนติดต่อผู้ใช้ (139 commits) |
| [Aluminium51/bmadigitalproject-infrastructure](https://github.com/Aluminium51/bmadigitalproject-infrastructure) | ต้นแบบ infra/Docker/Nginx/backup (16 commits) |

ปัจจุบันดูแลใน: https://github.com/bmadd-rdi/digitalproject

