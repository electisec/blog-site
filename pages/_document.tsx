import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Basic Metadata */}
        <meta charSet="utf-8" />
        <meta
          name="title"
          content="Electisec Blogs (previously yAcademy & yAudit)"
        />
        <meta name="description" content="ZK & Smart Contract Security" />
        <meta
          name="keywords"
          content="Electisec, Zero Knowledge, Smart Contract Security, Blockchain Security, Ethereum, Cryptography, DeFi"
        />
        <meta name="referrer" content="origin" />
        <meta name="creator" content="Electisec Team" />
        <meta name="robots" content="follow, index" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://blogs.electisec.tech" />
        <meta
          property="og:title"
          content="Electisec (previously yAcademy & yAudit)"
        />
        <meta
          property="og:description"
          content="ZK & Smart Contract Security"
        />
        <meta property="og:site_name" content="Electisec" />
        <meta
          property="og:image"
          content="https://blogs.electisec.tech/logo.svg"
        />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@electisec" />
        <meta name="twitter:creator" content="@electisec" />
        <meta name="twitter:image" content="https://electisec.tech/logo.svg" />

        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
