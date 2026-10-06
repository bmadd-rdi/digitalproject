แบบ A: แก้ไข code ก่อนค่อย Bulid
1. เข้าโฟลเดอร์หลักของ Frontend
    >bash
    ```
    cd ~/digitalproject/frontend
    ```
2. ติดตั้งและอัปเดต Lockfile
    >bash
    ```
    pnpm install
    ```
3. เข้าโฟลเดอร์หลักของ Backend
    >bash
    ```
    cd ~/digitalproject/backend
    ```
4. ติดตั้งและอัปเดต Lockfile
    >bash
    ```
    pnpm install
    ```
5. ดำเนินการแก้ไข code ได้เลย

แบบ B: แก้ไข code แล้วมีผลทันที (เชื่อมตรงเข้า Docker Container)

โหมดนี้ใช้ไฟล์ `docker-compose.override.yml` ที่ root ของโปรเจกต์ ซึ่งจะทำการ
mount โฟลเดอร์ `frontend/` และ `backend/` เข้า container โดยตรง แก้ code บนเครื่อง
แล้ว hot reload มีผลทันที — ไม่ต้อง build image ใหม่

หมายเหตุ: ไฟล์ `docker-compose.override.yml` จะถูก merge อัตโนมัติเมื่อสั่ง
`docker compose ...` ที่ root เท่านั้น (ใช้สำหรับเครื่องพัฒนา ห้ามใช้บน production)

1. เข้าโฟลเดอร์หลักของโปรเจกต์ (root)
    >bash
    ```
    cd /home/administrator/digitalproject
    ```
2. เชื่อมโฟลเดอร์ Frontend เข้ากับ Container `digitalproject-frontend`
    >bash
    ```
    # frontend/ ถูก mount ตรงเข้า /app ของ container
    # container จะรัน `pnpm dev` (Next.js dev server + hot reload)
    docker compose up -d frontend
    ```
    ตรวจสอบว่า mount ถูกต้อง (ต้องเห็น path ของ frontend -> /app)
    >bash
    ```
    docker inspect digitalproject-frontend --format '{{range .Mounts}}{{.Source}} -> {{.Destination}}{{"\n"}}{{end}}'
    ```
    ทดสอบ hot reload: แก้ไฟล์ใน `frontend/src/...` แล้ว refresh เบราว์เซอร์ที่
    http://localhost:3000 (ไม่ต้อง build ใหม่)
3. เชื่อมโฟลเดอร์ Backend เข้ากับ Container `digitalproject-backend`
    >bash
    ```
    # backend/ ถูก mount ตรงเข้า /app ของ container
    # container จะรัน `bun run dev` (bun --hot + hot reload)
    docker compose up -d backend
    ```
    ตรวจสอบว่า mount ถูกต้อง (ต้องเห็น path ของ backend -> /app)
    >bash
    ```
    docker inspect digitalproject-backend --format '{{range .Mounts}}{{.Source}} -> {{.Destination}}{{"\n"}}{{end}}'
    ```
4. เปิดทั้งระบบพร้อมกัน (Frontend + Backend) — ทางเลือกแทนข้อ 2 และ 3
    >bash
    ```
    docker compose up -d
    ```
5. ตรวจสอบผลลัพธ์และดู log แบบ real-time
    >bash
    ```
    docker compose ps
    docker compose logs -f frontend
    docker compose logs -f backend
    ```
    - เว็บไซต์: http://localhost:3000
    - API: http://localhost:8081/api/v1 (Swagger UI: http://localhost:8081/docs/)
6. ดำเนินการแก้ไข code ได้เลย — บันทึกไฟล์แล้วมีผลทันที (hot reload ทั้งสองฝั่ง)

หมายเหตุเพิ่มเติม
- ไฟล์ `docker-compose.override.yml` ใช้ named volume แยกสำหรับ `node_modules`
  และ `.next` เพื่อไม่ให้ไฟล์จาก host (คนละ platform) มาทับของที่ติดตั้งใน container
- ถ้าต้องการกลับไปรันแบบ production image (โค้ดฝังใน image) ให้สั่งโดยระบุไฟล์ตรง ๆ
  เพื่อข้าม override:
    >bash
    ```
    docker compose -f docker-compose.yml up -d --build
    ```