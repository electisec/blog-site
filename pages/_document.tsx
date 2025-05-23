import { Html, Head, Main, NextScript } from "next/document";
import Script from "next/script";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="utf-8" />
        <meta name="description" content="ZK & Smart Contract Security" />
        <meta
          name="keywords"
          content="Electisec, Zero Knowledge, Smart Contract Security, Blockchain Security, Ethereum, Cryptography, DeFi"
        />
        <meta name="referrer" content="origin" />
        <meta name="creator" content="Electisec Team" />
        <meta name="robots" content="follow, index" />

        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://blog.electisec.com" />
        <meta property="og:title" content="Electisec" />
        <meta
          property="og:description"
          content="ZK & Smart Contract Security"
        />
        <meta property="og:site_name" content="Electisec" />
        <meta
          property="og:image"
          content="https://electisec.com/twitter.png"
        />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@electisec" />
        <meta name="twitter:creator" content="@electisec" />
        <meta name="twitter:image" content="https://electisec.com/twitter.png" />

        <link rel="icon" href="/favicon.ico" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css"
          integrity="sha384-n8MVd4RsNIU0tAv4ct0nTaAbDJwPJzDEaqSD1odI+WdtXRGWt2kTvGFasHpSy3SV"
          crossOrigin="anonymous"
        />
      </Head>
      <body>
        <Main />
        <NextScript />

        <Script
          strategy="afterInteractive"
          src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"
        />
        <Script
          strategy="afterInteractive"
          src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/solidity.min.js"
        />

        {/* Initialize highlight.js after libraries are loaded */}
        <Script id="highlight-init" strategy="afterInteractive">
          {`
            window.onload = function() {
              // Initialize syntax highlighting
              hljs.highlightAll();

              // Make hljs available globally for theme switching
              window.hljs = hljs;
            }
          `}
        </Script>

        {/* Initialize mermaid diagrams */}
        <Script
          type="module"
          id="mermaid-init"
          src="https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs"
        >
          {`
            mermaid.initialize({ startOnLoad: true });
          `}
        </Script>
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-Q647YTPGSE"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-Q647YTPGSE');
          `}
        </Script>
      </body>
    </Html>
  );
}
