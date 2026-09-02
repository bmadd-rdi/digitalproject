import Image from "next/image";
import Link from "next/link";
import {
  ExternalLink,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { HeroCarousel } from "@/features/landing/components/HeroCarousel";

const usefulLinks = [
  "คู่มือการใช้งานระบบ",
  "นโยบายความเป็นส่วนตัว",
  "เงื่อนไขการให้บริการ",
];

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="fixed inset-x-0 top-0 z-50 px-4 py-3 sm:px-6">
        <nav className="mx-auto flex max-w-7xl items-center justify-between rounded-full bg-background/80 px-4 py-3 shadow-level-1 backdrop-blur-xl sm:px-5 border">
          <Link href="/" className="flex min-w-0 items-center gap-3 sm:gap-4 md:gap-6">
            <span className="flex size-10 sm:size-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-container-low shadow-sm">
              <Image
                src="/pics/logo.png"
                alt="BMA Logo"
                width={40}
                height={40}
                className="h-10 w-10 sm:h-12 sm:w-12 object-contain"
                priority
              />
            </span>
            <span className="hidden sm:block truncate font-bold tracking-normal text-foreground text-sm md:text-lg uppercase">
              bmadigitalproject
            </span>
          </Link>

          <div className="flex shrink-0 items-center gap-2">
            <Button
              asChild
              variant="ghost"
              className="h-9 px-3 text-xs sm:h-11 sm:px-6 sm:text-base rounded-full"
            >
              <Link href="/register">
                <span className="text-foreground">ลงทะเบียน</span>
              </Link>
            </Button>

            <Button
              asChild
              variant="default"
              className="h-9 px-3 text-xs sm:h-11 sm:px-6 sm:text-base rounded-full"
            >
              <Link href="/login">
                <span className="text-background">เข้าสู่ระบบ</span>
              </Link>
            </Button>
          </div>
        </nav>
      </header>

      <section className="relative isolate overflow-hidden px-4 pb-16 pt-28 sm:px-6 sm:pb-24 sm:pt-40">
        <div className="absolute inset-x-0 top-24 -z-10 h-72 bg-surface-container-low/70" />
        <div className="absolute inset-x-0 top-0 -z-20 h-full bg-[linear-gradient(90deg,rgba(0,115,75,0.05)_1px,transparent_1px),linear-gradient(180deg,rgba(0,115,75,0.04)_1px,transparent_1px)] bg-[size:56px_56px]" />

        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          
          <div className="max-w-3xl space-y-0 flex flex-col items-start text-left">
            <p className="mb-4 sm:mb-5 text-sm sm:text-xl font-bold uppercase tracking-[0.04em] text-primary">
              กองยุทธศาสตร์ดิจิทัล สํานักดิจิทัลกรุงเทพมหานคร
            </p>
            <h1 className="max-w-4xl text-4xl font-semibold leading-[1.08] tracking-normal text-foreground sm:text-5xl lg:text-6xl">
              ขับเคลื่อนโครงการของกรุงเทพมหานคร สู่อนาคตที่ยั่งยืนและโปร่งใส
            </h1>
            <p className="mt-4 sm:mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              ระบบสารสนเทศเพื่อการบริหารจัดการและติดตามประเมินผลโครงการด้านเทคโนโลยีดิจิทัล
            </p>

            <div className="mt-6 flex flex-col w-full sm:w-auto gap-3 sm:flex-row">
              <Button asChild size="lg" className="w-full sm:w-auto px-5">
                <a
                  href="https://webportal.bangkok.go.th/dsd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2"
                >
                  <span className="text-background">เว็บไซต์ กทม.</span>
                  <ExternalLink className="size-4 text-background" />
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" className="w-full sm:w-auto px-5">
                <Link href="/projects/public">ดูโครงการที่เผยแพร่สู่สาธารณะ</Link>
              </Button>
            </div>
          </div>

          <div className="w-full max-w-md sm:max-w-2xl mx-auto lg:max-w-none lg:mr-0 mt-8 lg:mt-0">
            <HeroCarousel />
          </div>
        </div>
      </section>

      <footer className="bg-surface-container-low px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-7xl">

          <div className="grid gap-10 rounded-[40px] border-none bg-surface p-6 shadow-level-1 sm:p-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">

            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-4 sm:gap-6">
                <span className="flex size-11 items-center justify-center overflow-hidden rounded-full bg-surface-container-low shadow-sm">
                  <Image
                    src="/pics/logo.png"
                    alt="BMA Logo Footer"
                    width={34}
                    height={34}
                    className="h-8 w-8 object-contain"
                  />
                </span>
                <span className="text-lg font-bold">
                  ระบบจัดการโครงการ กทม.
                </span>
              </div>
              <p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground">
                ระบบสารสนเทศเพื่อการบริหารจัดการโครงการแบบรวมศูนย์
                มุ่งเน้นความโปร่งใสและประสิทธิภาพในการใช้จ่ายงบประมาณเพื่อพัฒนาคุณภาพชีวิตชาวกรุงเทพฯ
              </p>
            </div>

            <div>
              <h2 className="text-sm font-bold uppercase leading-4 tracking-[0.04em]">
                ติดต่อเรา
              </h2>
              <address className="mt-4 space-y-3 text-sm not-italic text-muted-foreground">
                <span className="flex gap-3">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span>
                    173 ถนนดินสอ แขวงเสาชิงช้า
                    <br />
                    เขตพระนคร กรุงเทพมหานคร 10200
                  </span>
                </span>
                <span className="flex gap-3">
                  <Phone className="mt-0.5 size-4 shrink-0 text-primary" />
                  0-2224-9895
                </span>
                <span className="flex gap-3">
                  <Mail className="mt-0.5 size-4 shrink-0 text-primary" />
                  saraban.bmadd.dsd@bangkok.go.th
                </span>
              </address>
            </div>

            <div>
              <h2 className="text-sm font-bold uppercase leading-4 tracking-[0.04em]">
                ลิงก์ที่เกี่ยวข้อง
              </h2>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                {usefulLinks.map((link) => (
                  <li key={link}>
                    <a
                      className="transition-colors hover:text-primary"
                      href="#"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} กรุงเทพมหานคร (Bangkok
            Metropolitan Administration). สงวนลิขสิทธิ์.
          </p>
        </div>
      </footer>
    </main>
  );
}
