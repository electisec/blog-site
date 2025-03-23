import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Navbar from "../components/Navbar";
import { Space_Grotesk } from "next/font/google";
import Head from "next/head";
import Footer from "@/components/Footer";
import { useEffect } from "react";
import MermaidInitializer from "@/components/MermaidRenderer";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
});

export default function App({ Component, pageProps }: AppProps) {

  useEffect(() => {
    if (window.mermaid) {
      window.mermaid.initialize({ startOnLoad: true, securityLevel: 'loose' });
    }
  }, []);

  
  return (
    <>
      <Head>
        <title>Electisec Blogs (previously yAcademy & yAudit)</title>
      </Head>

      <main className={spaceGrotesk.className}>
        
        <Navbar />
        <Component {...pageProps} />
        <Footer />
        <MermaidInitializer />
      </main>
    </>
  );
}
