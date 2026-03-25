import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-10 h-10",
};

export default function Spinner({ size = "md", className }: SpinnerProps) {
  return <Loader2 className={cn("animate-spin text-[#E31E24]", sizes[size], className)} />;
}
