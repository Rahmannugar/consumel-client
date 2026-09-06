import Image from "next/image";
import Link from "next/link";

type BrandProps = {
  inverse?: boolean;
};

export function Brand({ inverse = false }: BrandProps) {
  return (
    <Link
      className={`brand${inverse ? " brand--inverse" : ""}`}
      href="/"
      aria-label="Consumel home"
    >
      <span className="brand__mark">
        <Image src="/assets/logo.png" alt="" width={44} height={44} priority />
      </span>
      <span>Consumel</span>
    </Link>
  );
}
