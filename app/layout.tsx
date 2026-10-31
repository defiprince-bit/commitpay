import "./globals.css";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Instrument_Serif } from "next/font/google";
import { MotionRoot } from "@/components/motion";
const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-serif" });
export const metadata = {
  title: "CommitPay",
  description: "Stake money on a habit. Or lose it.",
  icons: {
    icon: [{ url: "/favicon.png", type: "image/png" }, { url: "/icon.png", type: "image/png" }],
    apple: [{ url: "/apple-touch-icon.png" }],
  },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en" suppressHydrationWarning className={`${GeistSans.variable} ${GeistMono.variable} ${serif.variable}`}><head><script dangerouslySetInnerHTML={{ __html: `try{var t=localStorage.getItem("commitpay-theme");if(t==="light"||(!t&&matchMedia("(prefers-color-scheme: light)").matches))document.documentElement.classList.add("light")}catch(e){}` }} /></head><body><MotionRoot>{children}</MotionRoot></body></html>);
}
