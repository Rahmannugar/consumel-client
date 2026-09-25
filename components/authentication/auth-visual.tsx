import Image from "next/image";

export function AuthVisual() {
  return (
    <div className="relative h-full min-h-[560px] w-full overflow-hidden">
      <Image
        className="object-cover"
        src="/assets/auth-architecture.jpg"
        alt="A person moving through large-scale modern architecture"
        fill
        priority
        sizes="(min-width: 1024px) 50vw, 0px"
      />
      <div className="absolute inset-0 bg-black/20" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/45" />
      <p className="absolute right-10 bottom-10 left-10 text-right text-sm font-medium tracking-[-0.01em] text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.75)] xl:right-12 xl:bottom-12 xl:left-12">
        Meter usage. Manage entitlements. Connect billing.
      </p>
    </div>
  );
}
