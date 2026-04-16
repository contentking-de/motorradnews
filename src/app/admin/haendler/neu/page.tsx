import { DealerForm } from "@/components/admin/DealerForm";

export default function NewDealerPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="font-display text-2xl font-bold text-[#111111]">
        Neuer Händler
      </h1>
      <DealerForm />
    </div>
  );
}
