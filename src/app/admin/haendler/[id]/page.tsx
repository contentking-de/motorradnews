import { DealerForm, type DealerFormDealer } from "@/components/admin/DealerForm";
import { getRequestBaseUrl } from "@/lib/server-base-url";
import { notFound } from "next/navigation";

export default async function EditDealerPage({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const { id } = await params;
  const base = await getRequestBaseUrl();

  const res = await fetch(`${base}/api/dealers/${id}`, { cache: "no-store" });

  if (res.status === 404) notFound();
  if (!res.ok) throw new Error("Händler konnte nicht geladen werden.");

  const raw = (await res.json()) as DealerFormDealer;

  const dealer: DealerFormDealer = {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    brand: raw.brand,
    street: raw.street ?? "",
    zip: raw.zip ?? "",
    city: raw.city,
    phone: raw.phone,
    email: raw.email,
    website: raw.website,
    logoUrl: raw.logoUrl,
    isActive: raw.isActive,
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="font-display text-2xl font-bold text-[#111111]">
        Händler bearbeiten
      </h1>
      <DealerForm dealer={dealer} />
    </div>
  );
}
