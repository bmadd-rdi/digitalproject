"use client";

import { useMemo } from "react";
import Image from "next/image";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

const carouselData = [
  {
    id: 1,
    image: "/pics/forest.jpg",
    title: "เพิ่มพื้นที่สีเขียวปอดของคนกรุง",
    description: "โครงการสวนสาธารณะ 15 นาที เพื่อสุขภาพที่ดีของทุกคน",
  },
  {
    id: 2,
    image: "/pics/food_city.jpg",
    title: "ยกระดับคุณภาพชีวิต",
    description: "พัฒนาโครงสร้างพื้นฐาน สู่การเดินทางที่ไร้รอยต่อ",
  },
  {
    id: 3,
    image: "/pics/man.webp",
    title: "ระบบสาธารณสุขเชิงรุก",
    description: "ยกระดับศูนย์บริการสาธารณสุข ครอบคลุมทุกพื้นที่",
  },
];

export function HeroCarousel() {
  // ใช้ useMemo เก็บ Instance แทน useRef เพื่อแก้ปัญหาเรื่องสิทธิ์การเข้าถึงขณะเรนเดอร์
  const autoplay = useMemo(() => Autoplay({ delay: 4000, stopOnInteraction: false }), []);

  return (
    <div className="w-full h-full min-h-100 sm:min-h-125 rounded-4xl sm:rounded-container overflow-hidden shadow-level-2 relative border-4 border-surface group">
      <Carousel
        plugins={[autoplay]}
        className="w-full h-full"
        onMouseEnter={() => autoplay.stop()} // หยุดเล่นชั่วคราวเมื่อเมาส์ชี้
        onMouseLeave={() => autoplay.reset()} // เล่นต่อเมื่อเอาเมาส์ออก
      >
        <CarouselContent className="h-full ml-0">
          {carouselData.map((slide) => (
            <CarouselItem
              key={slide.id}
              className="relative h-full w-full pl-0"
            >
              <div className="relative w-full h-100 sm:h-125">
                {/* 1. รูปภาพพื้นหลัง */}
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  sizes="(max-width: 640px) 100vw, 100vw"
                  className="object-cover"
                  priority={slide.id === 1} // โหลดรูปแรกแบบด่วนที่สุด
                />

                {/* 2. Layer ไล่เฉดสีเพื่อให้ตัวอักษรอ่านง่ายขึ้น */}
                <div className="absolute inset-0 bg-linear-to-t from-foreground/80 via-foreground/20 to-transparent" />

                {/* 3. ส่วนแสดงข้อความรายละเอียด */}
                <div className="absolute bottom-0 left-0 w-full p-8 sm:p-10 transform transition-transform duration-500">
                  <h2 className="text-2xl sm:text-3xl font-bold text-surface mb-2 leading-tight">
                    {slide.title}
                  </h2>
                  <p className="text-surface/80 text-sm sm:text-base">
                    {slide.description}
                  </p>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}