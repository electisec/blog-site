import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Navbar from '../components/Navbar';
import { Space_Grotesk } from 'next/font/google'
import { Metadata } from "next";
import Footer from "@/components/Footer";

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
})

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
    url: "https://blogs.electisec.dev",
    title: "Electisec (previously yAcademy & yAudit)",
    description: "ZK & Smart Contract Security",
    siteName: "Electisec",
    images: [
      {
        url: "https://blogs.electisec.dev/logo.svg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@electisec",
    creator: "@electisec",
    images: "https://electisec.dev/logo.svg",
  },
};

export default function App({ Component, pageProps }: AppProps) {
  return (
    <main className={spaceGrotesk.className}>
      <Navbar />
      <Component {...pageProps} />
      <Footer />
    </main>
  );
}