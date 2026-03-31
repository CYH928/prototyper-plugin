import Link from "next/link";
import { ModelProvider } from "@/contexts/ModelContext";
import { ModelSelector } from "@/components/ModelSelector";

export default function KioskLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ModelProvider>
      <div className="kiosk-mode min-h-screen flex flex-col bg-ust-gray">
        {/* Sticky Header */}
        <header className="sticky top-0 z-50 bg-white px-6 h-16 flex items-center justify-between shadow-sm">
          <Link href="/kiosk" className="flex items-center gap-0 hover:opacity-90 transition-opacity">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://souvenir.hkust.edu.hk/image/HKUST-Chi.svg"
              alt="HKUST"
              className="h-8"
            />
            <span className="mx-2.5 text-gray-300 text-xl font-light select-none">|</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://souvenir.hkust.edu.hk/image/Souvenir-Shop-Chi.svg"
              alt="Souvenir Shop"
              className="h-5"
            />
          </Link>
          <div className="flex items-center gap-4">
            <ModelSelector />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </ModelProvider>
  );
}
