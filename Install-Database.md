วิธีติดตั้งฐานข้อมูล PostgreSQL
1. เปิด VS Code กด Ctrl + Shift + p
2. พิมพ์และเลือก WSL: Connect to WSL
3. เลือกเมนู Terminal -> New Terminal บนเมนูบาร์
4. เปิดโฟลเดอร์ database
   > bash
   ```
   cd projects/digitalproject/database
   ```
5. พิมพ์คำสั่งด้านล่างนี้ใน Terminal เพื่อเริ่มรัน PostgreSQL
   > bash
   ```
   docker compose up -d
   ```
6. สร้างฐานข้อมูล bma_db ผ่าน psql
   > bash
   ```
   docker exec -it bma_postgres psql -U postgres -c "CREATE DATABASE bma_db;"
   ```
7. Import ไฟล์ SQL เข้าไปในฐานข้อมูล bma_db
   > bash
   ```
   docker exec -i bma_postgres psql -U postgres -d bma_db < dump-bma_db-202609141312.sql
   ```
8. ตรวจสอบตารางใน bma_db อีกครั้ง
   > bash
   ```
   docker exec -it bma_postgres psql -U postgres -d bma_db -c "\dt"
   ```
   ระบบจะแสดงรายการตาราง (List of relations) ทั้งหมดในฐานข้อมูล bma_db
9. ออกจากหน้าแสดงรายการตาราง (List of relations) พิมพ์ q


วิธีตั้งค่าฐานข้อมูล PostgreSQL@Localhost
1. ตรวจสอบไฟล์ .env ที่อยู่ /home/administrator/projects/digitalproject/backend/
2. กำหนด DATABASE_URL=postgresql://postgres:mysecretpassword@host.docker.internal:5432/bma_db
3. เปิดเบราว์เซอร์ไปที่: `http://localhost:8081/docs/`
4. ไปที่หมวด **Auth** -> เลือก `POST /api/v1/auth/login`
5. กด **Try it out** แล้วใส่ข้อมูล:
     ```json
     {
       "username": "SUPER_ADMIN",
       "password": "***********"
     }
     ```
   กด **Execute** (ระบบจะตอบกลับ `200 OK` พร้อมบันทึก Session Cookie ในเบราว์เซอร์)
