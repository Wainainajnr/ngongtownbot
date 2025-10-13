import type { AppProps } from "next/app";
import "@/styles/globals.css"; // ✅ Make sure this path matches your folder structure

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
