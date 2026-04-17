import Image from "next/image";

export function PoweredBySidebar() {
  return (
    <div>
      <p className="text-[10px] font-medium uppercase tracking-widest text-[#999999]">
        motorrad.news powered by
      </p>
      <a
        href="https://arider.com"
        target="_blank"
        rel="noopener noreferrer nofollow sponsored"
        className="mt-3 inline-block transition-opacity hover:opacity-80"
      >
        <Image
          src="/arider-logo.svg"
          alt="aRider"
          width={120}
          height={32}
          className="h-8"
          style={{ width: "auto" }}
        />
      </a>
    </div>
  );
}
