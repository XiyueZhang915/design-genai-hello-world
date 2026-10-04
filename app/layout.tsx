import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "NYC, According to AI",
  description: "Turn your New York moments into AI captions. Rate the punchlines and find your kind of city humor.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">{children}<footer className="site-footer"><Link href="/privacy">Privacy</Link> · <Link href="/terms">Terms</Link></footer></body>
    </html>
  );
}
