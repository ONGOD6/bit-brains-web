import Link from "next/link";

export const metadata = {
  title: "Genesis Docs | Bit Brains",
  description:
    "Genesis mint documentation and Meta EIP architecture for the Bit Brains protocol.",
};

export default function GenesisDocsPage() {
  return (
    <main className="page-shell">
      <section className="content-shell">
        <h1
          style={{
            fontSize: 32,
            fontWeight: 900,
            letterSpacing: "0.04em",
            marginBottom: 6,
          }}
        >
          Genesis Documentation
        </h1>

        <p style={{ opacity: 0.9, marginBottom: 24 }}>
          <strong>Genesis Hybrid Mint Architecture</strong> — Pickle Punks × Bit Brains
        </p>

        <div className="card">
          <h2>Overview</h2>
          <p>
            This page documents the Genesis mint architecture of the Bit Brains
            protocol. It describes the technology, structure, and intent behind
            the Genesis Hybrid Mint, which separates ownership, permanence, and
            identity into distinct layers and binds them together at Genesis.
          </p>

          <p>
            This documentation is informational only. It does not promise rewards,
            yield, or future protocol benefits.
          </p>
        </div>

        <div className="card">
          <h2>Genesis Identity Scope</h2>
          <p>
            The Bit Brains protocol defines a fixed Genesis identity ceiling of
            <strong> 10,000 identities</strong>. This limit is absolute and
            non-expandable.
          </p>

          <ul>
            <li>Exactly 10,000 Genesis identities will ever exist</li>
            <li>5,000 identities reference Pickle Punks as hybrid art NFTs</li>
            <li>Remaining identities reference other Genesis-defined assets</li>
          </ul>

          <p>
            This model allows artistic expression without inflating or fragmenting
            the canonical identity layer.
          </p>
        </div>

        <div className="card">
          <h2>Three-Step Genesis Hybrid Mint</h2>
          <p>
            The Genesis mint is intentionally designed as a three-step process.
            Each step solves a different structural problem and no single step is
            sufficient on its own.
          </p>

          <h3>1. ERC-721 NFT — Ownership Layer</h3>
          <p>
            The ERC-721 token establishes on-chain ownership, wallet-native
            visibility, and transferability. This layer represents ownership only
            and does not attempt to guarantee permanence or identity.
          </p>

          <h3>2. Ethscriptions — Permanence Layer</h3>
          <p>
            Each Genesis asset is paired with an Ethscription created via calldata
            inscription. This artifact contains the same visual payload as the
            ERC-721 and is permanently embedded in Ethereum transaction history,
            independent of metadata or external storage.
          </p>

          <h3>3. ENS Numeric Subdomain — Identity Layer</h3>
          <p>
            Each Genesis identity is assigned a numeric ENS subdomain under
            <code> &lt;number&gt;.bitbrains.eth</code>, ranging from 1 through
            10,000.
          </p>

          <p>
            ENS serves as the canonical identity layer of the protocol. Wallet
            addresses are treated as replaceable endpoints, while ENS identity
            persists across time.
          </p>
        </div>

        <div className="card">
          <h2>Pickle Punks as Hybrid Art NFTs</h2>
          <p>
            Pickle Punks function as hybrid art NFTs within the Genesis framework.
            They are artistically expressive ERC-721 assets paired with
            Ethscriptions and referenced by Genesis Bit Brains identities.
          </p>

          <p>
            Art remains expressive. Identity remains deterministic.
          </p>
        </div>

        <div className="card">
          <h2>Proof of Care (Non-Promissory)</h2>
          <p>
            The Bit Brains protocol makes no guarantees regarding rewards, yield,
            or future benefits. The architecture allows continuity to be observed
            over time through ENS resolution and preservation of paired Genesis
            assets.
          </p>

          <p>
            Any future recognition is retrospective, conditional, and
            non-obligatory.
          </p>
        </div>

        <div className="card">
          <h2>Meta EIP Reference</h2>
          <p>
            This page derives directly from{" "}
            <strong>Meta-EIP-0001b: Genesis Hybrid Mint Architecture</strong>.
          </p>

          <p>
            View the canonical specification in the EIP repository.
          </p>

          <Link href="https://github.com/ONGOD6/bit-brains-eip-/tree/main/eips">
            → View Meta EIPs on GitHub
          </Link>
        </div>

        <div className="card">
          <h2>Next</h2>
          <p>
            Genesis documentation bridges protocol architecture and the Genesis
            mint interfaces.
          </p>

          <ul>
            <li>
              <Link href="/bitbrains/mint">Bit Brains Genesis Mint</Link>
            </li>
            <li>
              <Link href="/picklepunks/mint">Pickle Punks Mint</Link>
            </li>
          </ul>
        </div>
      </section>
    </main>
  );
}
