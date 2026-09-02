import Image from "next/image";
import Link from "next/link";

type AuthShellProps = {
  title: string;
  description: string;
  children: React.ReactNode;
  maxWidth?: string;
};

export function AuthShell({
  title,
  description,
  children,
  maxWidth = "max-w-lg",
}: AuthShellProps) {
  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-background px-4 py-8 text-foreground sm:px-6 sm:py-12">
      <div className="absolute inset-x-0 top-24 -z-20 h-72 bg-surface-container-low/70" />
      <div className="absolute inset-x-0 top-0 -z-30 h-full bg-[linear-gradient(90deg,rgba(0,115,75,0.05)_1px,transparent_1px),linear-gradient(180deg,rgba(0,115,75,0.04)_1px,transparent_1px)] bg-size-[56px_56px]" />
      <div className="absolute -right-24 top-10 -z-20 size-80 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -left-24 bottom-10 -z-20 size-72 rounded-full bg-white/70 blur-3xl" />

      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-7xl items-center justify-center py-4 sm:min-h-[calc(100vh-6rem)]">
        <section
          className={`w-full ${maxWidth} rounded-4xl border bg-surface-container-low/95 p-6 shadow-level-1 backdrop-blur-xl sm:p-8`}
        >
          <div className="flex items-center gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface shadow-sm">
              <Link href="/">
                <Image
                  src="/pics/logo.png"
                  alt="Agency Logo"
                  width={42}
                  height={42}
                  className="h-12 w-12 object-contain"
                  priority
                />
              </Link>
            </span>
            <div className="min-w-0">
              <p className="truncate text-md font-bold uppercase tracking-[0.18em] text-primary">
                bmadigitalproject
              </p>
              <p className="truncate text-sm font-medium text-muted-foreground">
                ระบบจัดการโครงการ กรุงเทพมหานคร
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {title}
            </h1>
            <p className="text-sm leading-6 text-muted-foreground sm:text-base">
              {description}
            </p>
          </div>

          <div className="mt-8">{children}</div>
        </section>
      </div>
    </main>
  );
}
