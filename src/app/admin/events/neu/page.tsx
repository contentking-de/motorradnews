import { EventForm } from "@/components/admin/EventForm";

export default function NewEventPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="font-display text-2xl font-bold text-[#111111]">
        Neues Event
      </h1>
      <EventForm />
    </div>
  );
}
