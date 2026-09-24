วิธีอัพเดท Project ในเครื่องส่วนตัว PC
แบบ A - คัดลอกโฟลเดอร์มาลง
1. เข้าโฟลเดอร์ digitalproject
   > bash
   ```
   cd /projects/digitalproject
   ```
2. เปิด VS Code ในโปรเจกต์
   > bash
   ```
   code .
   ```
3. หยุดและลบคอนเทนเนอร์ (Containers) จากไฟล์ docker-compose.yml
   > bash
   ```
   docker compose down
   ```
4. ทำการ build image ใหม่
   แบบ A - ทุก Image ที่อยู่ในไฟล์ docker-compose.yml
   > bash
   ```
   docker compose build
   ```
   แบบ B - เฉพาะบาง Image
      > bash
   ```
   #docker build -t ชื่อ-image-ของคุณ
   docker build -t digitalproject-frontend .
   docker build -t digitalproject-backend .
   ```

5. สร้างและสั่งรัน (Build/Pull Image) จากไฟล์ docker-compose.yml
   > bash
   ```
   docker compose up -d
   ```

แบบ B - อัปเดตโค้ด/Image ใหม่ให้ Container
1. เข้าโฟลเดอร์ digitalproject
   > bash
   ```
   cd /projects/digitalproject
   ```
2. ทำการ build และ Up ในครั้งเดียว
   > bash
   ```
   docker compose up -d --build
   ```
   Docker จะทำการบิลด์ Image ใหม่ก่อน จากนั้นจะทำการ Recreate (ลบ Container เก่าแล้วสร้างใหม่ด้วย Image ใหม่) ให้ทันทีในคำสั่งเดียว โดยใช้เวลารีสตาร์ท Container เพียงไม่กี่วินาที ทำให้เกิด Downtime นานน้อยกว่าการสั่ง down แล้วค่อย up ครับ
