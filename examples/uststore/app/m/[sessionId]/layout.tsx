export default function MobileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Sticky mobile header */}
      <header className="sticky top-0 z-50 bg-white px-4 py-2.5 flex items-center gap-0 shadow-sm border-b border-gray-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://souvenir.hkust.edu.hk/image/HKUST-Chi.svg"
          alt="HKUST"
          className="h-7"
        />
        <span className="mx-2 text-gray-300 text-lg font-light select-none">|</span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://souvenir.hkust.edu.hk/image/Souvenir-Shop-Chi.svg"
          alt="Souvenir Shop"
          className="h-5"
        />
      </header>

      {/* Content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
