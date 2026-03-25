"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  forwardRef,
  type Ref,
} from "react";

type ButtonProps = {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  disabled?: boolean;
} & (
  | ({ href: string } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "className">)
  | ({ href?: undefined } & ButtonHTMLAttributes<HTMLButtonElement>)
);

const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", disabled, href, ...props },
    ref
  ) => {
    const base =
      "inline-flex items-center justify-center font-display font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
      primary: "bg-[#E31E24] text-white hover:bg-[#C41A1F] focus:ring-[#E31E24]",
      secondary:
        "bg-white text-[#111111] border border-[#E5E5E5] hover:bg-[#F9F9F9] focus:ring-[#E5E5E5]",
      danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
      ghost: "text-[#666666] hover:text-[#111111] hover:bg-[#F9F9F9] focus:ring-[#E5E5E5]",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base",
    };

    const cls = cn(base, variants[variant], sizes[size], className);

    if (href) {
      return (
        <Link
          ref={ref as Ref<HTMLAnchorElement>}
          href={href}
          className={cls}
          {...(props as Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className">)}
        />
      );
    }

    return (
      <button
        ref={ref as Ref<HTMLButtonElement>}
        className={cls}
        disabled={disabled}
        {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}
      />
    );
  }
);
Button.displayName = "Button";

export default Button;
