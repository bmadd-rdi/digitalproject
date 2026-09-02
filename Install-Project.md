วิธีที่ติดตั้ง Docker and Docker Desktop on WSL2 of Windows
1. ติดตั้ง VS Code -> https://code.visualstudio.com/
2. ติดตั้ง Docker Desktop -> [https://www.docker.com/products/docker-desktop/](https://docs.docker.com/desktop/setup/install/windows-install/)
3. เลือก "Use WSL 2 instead of Hyper-V" (แนะนำเพราะทำงานได้เร็วกว่าและเสถียรกว่า)
4. รีสตาร์ทเครื่อง 1 ครั้ง เมื่อเปิดโปรแกรม Docker Desktop ขึ้นมาครั้งแรก ให้ทำตามขั้นตอนแนะนำจนสถานะขึ้นว่า "Engine running"
5. เปิด VS Code ไปที่เมนู Extensions (หรือกด Ctrl+Shift+X)
6. ค้นหาและติดตั้ง Extension ชื่อ "Docker" (โดย Microsoft)
7. ค้นหาและติดตั้ง Extension ชื่อ "Dev Containers" (ตัวนี้สำคัญมากสำหรับการจำลอง Environment)

วิธีที่ตรวจสอบว่าคุณตั้งค่าเป็น WSL 2 แล้วหรือยัง
1. เปิด Docker Desktop Settings (รูปเฟือง)
2. ไปที่เมนู Resources > WSL Integration
3. ตรวจสอบว่าสวิตช์ "Enable integration with my default WSL distro" ถูกเปิดอยู่ (ควรเปิด)
4. เลือก Distro (เช่น Ubuntu) ที่คุณติดตั้งไว้ใน WSL ให้เป็น ON

วิะีติดตั้งโปรแกรม Digital project
1. เปิด VS Code กด Ctrl + Shift + p
2. พิมพ์และเลือก WSL: Connect to WSL
3. เลือกเมนู Terminal -> New Terminal บนเมนูบาร์
4. ตรวจสอบสถานะและเวอร์ชัน
   > bash
   ```
   docker -v
   docker-compose version
   git -v
   ```
5. สร้างโฟลเดอร์สำหรับเก็บโปรเจกต์
   > bash
   ```
   mkdir -p ~/projects/digitalproject
   cd ~/projects/digitalproject
   ```
6. Clone โปรเจกต์
   > bash
   ```
   git clone https://github.com/bmadd-rdi/digitalproject .
   ```
7. เปิด VS Code ในโปรเจกต์
   > bash
   ```
   code .
   ```
8. ทำสำเนาไฟล์และเปลี่ยนชื่อ
   > bash
   ```
   cp backend/.env.example backend/.env
      cp backend/bun.lock.example backend/bun.lock
      cp frontend/.env.example frontend/.env
   ```
9. สร้างและสั่งรัน (Build/Pull Image)
   > bash
   ```
   docker compose up -d
   ```
