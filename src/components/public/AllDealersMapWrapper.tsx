"use client";

import dynamic from "next/dynamic";
import type { DealerPin } from "./AllDealersMap";

const AllDealersMapInner = dynamic(
  () =>
    import("@/components/public/AllDealersMap").then(
      (mod) => mod.AllDealersMap,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[350px] items-center justify-center rounded-xl border border-[#E5E5E5] bg-[#F9F9F9] sm:h-[420px]">
        <div className="flex flex-col items-center gap-2">
          <div className="size-6 animate-spin rounded-full border-2 border-[#E5E5E5] border-t-[#E31E24]" />
          <span className="text-xs text-[#666666]">Karte wird geladen…</span>
        </div>
      </div>
    ),
  },
);

interface AllDealersMapWrapperProps {
  dealers: DealerPin[];
}

export function AllDealersMapWrapper({ dealers }: AllDealersMapWrapperProps) {
  return <AllDealersMapInner dealers={dealers} />;
}
