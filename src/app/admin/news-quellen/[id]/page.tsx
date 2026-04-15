"use client";

import { use } from "react";
import NewsSourceForm from "@/components/admin/NewsSourceForm";

type Props = { params: Promise<{ id: string }> };

export default function QuelleBearbeitenPage({ params }: Props) {
  const { id } = use(params);
  return <NewsSourceForm sourceId={id} />;
}
