// src/shared/cache/memory-cache.ts

type CacheItem<T> = {
  data: T;
  expiry: number; // เก็บเวลาหมดอายุเป็น Timestamp
};

class MemoryCache {
  private cache = new Map<string, CacheItem<any>>();

  /**
   * ฟังก์ชัน getOrSet: ท่าไม้ตายสำหรับดึงข้อมูล
   * ถ้ามีใน Cache จะคืนค่าทันที ถ้าไม่มีจะไปรัน fetcher() เพื่อดึงจาก DB แล้วเก็บลง Cache ให้
   */
  async getOrSet<T>(
    key: string, 
    fetcher: () => Promise<T>, 
    ttlSeconds: number = 3600 // ค่าเริ่มต้น: หมดอายุใน 1 ชั่วโมง
  ): Promise<T> {
    const cached = this.cache.get(key);
    
    // ตรวจสอบว่ามี Cache อยู่ และยังไม่หมดอายุ
    if (cached && cached.expiry > Date.now()) {
      return cached.data;
    }

    // ถ้าไม่มี Cache หรือหมดอายุแล้ว ให้วิ่งไปดึงข้อมูลใหม่
    const data = await fetcher();
    
    // นำข้อมูลใหม่มาเก็บลง Cache พร้อมบวกเวลาหมดอายุ
    this.cache.set(key, {
      data,
      expiry: Date.now() + (ttlSeconds * 1000)
    });

    return data;
  }

  /**
   * สำหรับล้าง Cache เมื่อ Admin อัปเดตข้อมูล
   */
  clear(key?: string) {
    if (key) {
      this.cache.delete(key); // ลบเฉพาะคีย์
    } else {
      this.cache.clear(); // ล้างทั้งหมด
    }
  }
}

// Export เป็น Singleton Object เพื่อให้ใช้งานร่วมกันทั้งโปรเจกต์
export const appCache = new MemoryCache();
