import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Navbar from "../components/Navbar";
import { Space_Grotesk } from "next/font/google";
import { Metadata } from "next";
import Head from "next/head";
import Footer from "@/components/Footer";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Electisec Blogs (previously yAcademy & yAudit)",
  description: "ZK & Smart Contract Security",
  keywords:
    "Electisec, Zero Knowledge, Smart Contract Security, Blockchain Security, Ethereum, Cryptography, DeFi",
  referrer: "origin",
  creator: "Electisec Team",
  robots: "follow, index",
  openGraph: {
    type: "website",
    url: "https://blog.electisec.tech",
    title: "Electisec (previously yAcademy & yAudit)",
    description: "ZK & Smart Contract Security",
    siteName: "Electisec",
    images: [
      {
        url: "https://blog.electisec.tech/logo.svg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@electisec",
    creator: "@electisec",
    images: "https://electisec.tech/logo.svg",
  },
};

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Electisec Blogs (previously yAcademy & yAudit)</title>
      </Head>

      <main className={spaceGrotesk.className}>
        
        <Navbar />
        <Component {...pageProps} />
        <Footer />
      </main>
    </>
  );
}
