# ใช้ Official Image ของ Bun ที่เบาและเร็ว
FROM oven/bun:1.3.5-alpine AS base
WORKDIR /app

# 1. ติดตั้ง Ghostscript ผ่าน apk ของ Alpine (PDF compressor)
RUN apk add --no-cache ghostscript wget \
    && addgroup -S appgroup \
    && adduser -S appuser -G appgroup

# 2. Copy ไฟล์ที่จำเป็นสำหรับการลง Packages
COPY package.json bun.lock ./

# 3. ลง Dependencies (ใช้ --frozen-lockfile เพื่อความเสถียร)
RUN bun install --frozen-lockfile

# 4. Copy Source Code ทั้งหมด
COPY . .

RUN mkdir -p /app/uploads /app/tmp \
    && chown -R appuser:appgroup /app

# 5. เปิด Port 8081
EXPOSE 8081

# 6. สั่งรัน Production
USER appuser

CMD ["bun", "run", "start"]
