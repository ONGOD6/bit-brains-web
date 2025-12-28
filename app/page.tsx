// app/page.tsx
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <section className="hero">
      <div className="heroInner">
        <h1 className="heroTitle">Proof of Care comes first.</h1>

        <p className="heroSub">
          Bit Brains is a protocol for NFTs, ENS-based identity, zero-knowledge
          eligibility, and real-world asset integration — beginning on Ethereum.
        </p>

        <Link href="/proof-of-care" className="heroCta">
          Enter Proof of Care →
        </Link>

        <div className="brainWrap">
          <div className="brainOuter">
            <div className="brainInner">
              <Image
                src="/brain-10813_256.gif"
                alt="Rotating Brain"
                width={256}
                height={256}
                priority
                unoptimized
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
