"use client";

import dynamic from "next/dynamic";

const DealerMapInner = dynamic(
  () => import("@/components/public/DealerMap").then((mod) => mod.DealerMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-72 items-center justify-center rounded-lg border border-[#E5E5E5] bg-[#F9F9F9] sm:h-80">
        <div className="flex flex-col items-center gap-2">
          <div className="size-6 animate-spin rounded-full border-2 border-[#E5E5E5] border-t-[#E31E24]" />
          <span className="text-xs text-[#666666]">Karte wird geladen…</span>
        </div>
      </div>
    ),
  },
);

interface DealerMapWrapperProps {
  lat: number;
  lon: number;
  name: string;
  address: string;
}

export function DealerMapWrapper(props: DealerMapWrapperProps) {
  return <DealerMapInner {...props} />;
}
