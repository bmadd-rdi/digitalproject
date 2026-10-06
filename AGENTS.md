# AGENTS.md — คู่มือสำหรับ AI Agent (อ่านก่อนทำงานเสมอ)

> ไฟล์นี้เป็นจุดเริ่มต้นสำหรับ agent ทุกตัวที่เข้ามาทำงานใน repo `digitalproject`
> (https://github.com/bmadd-rdi/digitalproject, branch `main`)
> ไฟล์เฉพาะทางอื่น ๆ: [`backend/README.md`](backend/README.md), [`frontend/README.md`](frontend/README.md),
> [`frontend/AGENTS.md`](frontend/AGENTS.md) (กฎ Next.js), เอกสารไทยที่ root (`Install-*.md`, `Update-*.md`, `Config-Develop.md`)

---

## 1. ภาพรวมระบบ

ระบบ BMA Digital Project — ระบบเสนอ/ตรวจ/ติดตามโครงการดิจิทัลของ กรุงเทพมหานคร

| ส่วน | เทคโนโลยี | Port | หมายเหตุ |
|---|---|---|---|
| `backend/` | Bun 1.3.5 + Hono + `@hono/zod-openapi` + Drizzle ORM + PostgreSQL | 8081 | System-of-record, ทุก workflow/authorization อยู่ที่นี่ |
| `frontend/` | Next.js 16 (App Router) + React 19 + Tailwind 4 + TanStack Query + pnpm | 3000 | กิน API ของ backend เท่านั้น |
| `database/` | PostgreSQL ผ่าน docker-compose ของตัวเอง + dump SQL | 5432 | แยกจาก compose หลัก |
| root | `docker-compose.yml` | — | รัน frontend + backend เป็น production image |

- API base: `http://localhost:8081/api/v1`
- OpenAPI: `GET /openapi-v1.json` · Swagger UI: `GET /docs/`
- Health: `GET /health/live` (ไม่ต้องใช้ DB) · `GET /health/ready` (เช็ก DB + upload dir)

---

## 2. โครงสร้างไดเรกทอรี

```
digitalproject/
├── AGENTS.md / CLAUDE.md      ← ไฟล์นี้ (คู่มือ agent)
├── .gitignore                 ← กัน logs/ ไม่ให้ขึ้น GitHub
├── docker-compose.yml         ← services: frontend(3000), backend(8081), network bma_network, volume bma_uploads (production image)
├── docker-compose.override.yml ← โหมดพัฒนา: mount ./frontend, ./backend เข้า container โดยตรง (hot reload) — merge อัตโนมัติเมื่อสั่ง `docker compose` ที่ root
├── logs/                      ← บันทึกงานทุกครั้งที่มีการแก้ไข (NOT in git)
├── database/                  ← docker-compose + dump-bma_db-*.sql
├── Config-Develop.md, Install-*.md, Update-*.md   ← คู่มือไทยสำหรับมนุษย์
├── backend/
│   ├── src/
│   │   ├── index.ts, app.ts          ← entry point
│   │   ├── config/                   ← app-env.ts (validate env), permissions.config.ts
│   │   ├── db/schema|scripts|seeds   ← Drizzle schema, migrate, seed
│   │   ├── modules/<feature>/        ← route + controller + service + schema + policy
│   │   │     (auth, users, projects, proposals, meeting, uploads, lookups, health, internal)
│   │   ├── middlewares/              ← auth/request middleware
│   │   ├── infrastructure/           ← audit, email, files
│   │   ├── shared/                   ← auth, http, security, time, cache
│   │   └── jobs/                     ← background jobs
│   ├── drizzle/                      ← migration SQL + meta snapshots
│   └── tests/unit|integration|contract|helpers|fixtures|setup
└── frontend/
    ├── src/
    │   ├── app/                      ← App Router (มี (protected)/, login, projects, ...)
    │   ├── features/<domain>/        ← components|hooks|actions|stores|data (auth, projects, proposals, meetings, ...)
    │   ├── components/ (custom + ui) ← shadcn/ui
    │   ├── lib/                      ← client-api.ts, server-fetch.ts, session.ts, react-query.ts
    │   ├── types/                    ← api.d.ts + api-schemas.ts = GENERATED, ห้ามแก้มือ
    │   ├── hooks/, data/, utils/
    └── scripts/generate-openapi.mjs, scan-browser-bundle.mjs
```


---

## 3. คำสั่งที่ใช้จริง

### Backend (`cd backend`)
```bash
bun install --frozen-lockfile     # ติดตั้ง (README) — ใน repo มีทั้ง bun.lock และ pnpm-lock.yaml
bun run dev                       # start + hot reload
bun run typecheck                 # tsc --noEmit
bun test tests/unit               # unit tests (bun run test)
bun run test:integration          # ต้องมี test DB ก่อน
bun run db:migrate                # migrate (ต้องระบุ DATABASE_URL ให้ถูก)
bun run db:seed:required          # seed lookup data (บังคับก่อนใช้งาน)
bun run db:seed:demo              # seed ข้อมูลตัวอย่าง — ห้ามใช้กับ shared/staging/prod
```
Test DB: `bun run test:db:up` → `bun run test:db:prepare` → `bun run test:all` → `bun run test:db:down`
(ใช้ `../infrastructure/compose.test.yml` — repo sibling อาจไม่มีในเครื่องนี้ ให้ test ก่อนเชื่อ)

### Frontend (`cd frontend`)
```bash
pnpm install --frozen-lockfile    # packageManager: pnpm@11.20.0
pnpm dev                          # next dev
pnpm build && pnpm scan:browser-bundle
pnpm lint && pnpm typecheck && pnpm test
OPENAPI_URL=http://localhost:8081/openapi-v1.json pnpm generate:types     # → src/types/api.d.ts
OPENAPI_URL=http://localhost:8081/openapi-v1.json pnpm generate:schemas   # → src/types/api-schemas.ts
```

### Docker (root)
```bash
# โหมดพัฒนา (ค่าเริ่มต้น) — ใช้ docker-compose.override.yml: mount ./frontend, ./backend เข้า container ตรง ๆ (hot reload)
docker compose up -d              # รันทั้งระบบแบบ dev (โค้ดมีผลทันที)
docker compose logs -f frontend   # ดู log frontend (next dev)
docker compose logs -f backend    # ดู log backend (bun --hot)

# โหมด production image (โค้ดฝังใน image) — ข้าม override
docker compose -f docker-compose.yml up -d --build
docker compose down                # หยุด
```

### Database (`root/database`)
```bash
cd database && docker compose up -d
docker exec -it bma_postgres psql -U postgres -c "CREATE DATABASE bma_db;"
docker exec -i bma_postgres psql -U postgres -d bma_db < dump-bma_db-*.sql
```


---

## 4. กฎเหล็กเวลาแก้โค้ด

1. **ห้ามแก้ไฟล์ generated** — `frontend/src/types/api.d.ts`, `frontend/src/types/api-schemas.ts` → regenerate ด้วย `pnpm generate:*` เท่านั้น
2. **การเงินใช้ decimal จริง** — ห้ามแทนที่การคำนวณ budget/cost ด้วย JS floating-point (`proposal-budget.util.ts`, `proposal-estimated-cost.util.ts`)
3. **Authorization อยู่ที่ backend เสมอ** — ค่า `canEditProject` / `canEditProposal` / `canSubmitProposal` ที่ API ส่งมาคือ source of truth; ฝั่ง frontend ที่ซ่อนปุ่มเป็น UX อย่างเดียว ไม่ใช่จุดคุมสิทธิ์
4. **ห้าม commit `.env`** ทุกชนิด (ยกเว้น `.env.example`) และห้ามใส่ `DATABASE_URL` / `JWT_SECRET` ในตัวแปร `NEXT_PUBLIC_*`
5. **ห้ามแก้ generated migration เอง** — ใช้ `bun run db:generate` แล้วตรวจ SQL ที่ออกเท่านั้น
6. **App start ไม่รัน migrate/seed เอง** — ต้องสั่ง `db:migrate` / `db:seed:required` ด้วยมือกับ database ที่ตั้งใจเท่านั้น
7. **รูปแบบโค้ดตามที่มีอยู่** — backend: `routes → controller → service` ต่อ module; frontend: domain logic อยู่ใน `src/features/*` ห้ามโยน logic ไปไว้ใน `src/app/*`
8. **ก่อนเริ่มงาน**: อ่าน `AGENTS.md` นี้ + `backend/README.md` หรือ `frontend/README.md` ของส่วนที่เกี่ยวข้อง

---

## 5. บังคับ: บันทึกลง `logs/` ทุกครั้งที่มีการแก้ไข

**ทุกครั้งที่สร้าง/แก้/ลบไฟล์ใด ๆ ในโปรเจกต์นี้ จะต้องสร้างไฟล์สรุปเป็น `.md` ใน
`/home/administrator/projects/digitalproject/logs/` พร้อมหัวข้อดังนี้:**

| หัวข้อ | เนื้อหา |
|---|---|
| **หัวข้อ** | ชื่องาน/ธีมที่ทำ (เช่น "เพิ่มฟิลด์งบประมาณใน proposal") |
| **ชื่อไฟล์** | path สัมพัทธ์ของไฟล์ที่ถูกแก้ทุกไฟล์ |
| **บรรทัด** | ช่วงบรรทัดที่แตะ (เช่น `120-145`) หรือ `ทั้งไฟล์` ถ้าสร้างใหม่ |
| **ก่อนทำ** | เนื้อหา/พฤติกรรมเดิม (ย่อ แต่พอเข้าใจได้) |
| **สิ่งที่ทำ** | การแก้ไขที่ลงมือทำจริง |
| **ผลลัพธ์** | ผลตรวจสอบ (test/typecheck/lint ผ่าน หรือ ข้อจำกัดที่เหลือ) |

- ชื่อไฟล์: `YYYY-MM-DD_NNN_ชื่อสั้นๆ.md` (เรียงเลขรันในวัน) ดูตัวอย่างใน `logs/TEMPLATE.md`
- `logs/` **ถูกกันไว้ใน `.gitignore` ที่ root → ห้ามขึ้น GitHub**
- ถ้าทำงานหลาย ๆ ไฟล์ในรอบเดียว ให้สร้างไฟล์สรุป 1 ไฟล์ครอบคลุมทุกไฟล์ที่แตะ

---

## 6. ข้อจำกัดที่ควรรู้

- สถานะ repo: มีไฟล์ค้างแก้ (uncommitted) หลายสิบไฟล์ — อย่าเพิ่ง `git checkout`/`reset` ทิ้งโดยไม่ได้รับคำสั่ง
- `backend/README.md` อ้างถึง `../infrastructure/` (repo sibling) — ถ้าไม่มีให้ข้ามขั้นตอน test-DB ที่เกี่ยวข้อง
- เวอร์ชัน pnpm ตรง package.json = `11.20.0` (README เขียน `11.13.0` — ใช้ค่าใน package.json)
- Next.js ใน repo นี้เป็น v16 — กฎ/API อาจต่างจากที่ model เคยเห็น อ่าน
  `frontend/node_modules/next/dist/docs/` ก่อนเขียนโค้ด (ดู `frontend/AGENTS.md`)
