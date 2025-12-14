import "./globals.css";
import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Cycle-Aware Wellness Planner",
  description:
    "Track mood and energy across your cycle with gentle, data-backed insights.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={dmSans.className}>
        <div className="page-wrapper">
          <header className="site-header">
            <div className="site-header-inner">
              <a href="/" className="brand-link">
                <div className="brand-mark" />
                <div>
                  <div className="brand-text-main">Cycle Planner</div>
                  <div className="brand-text-sub">
                    hormone-aware daily check-ins
                  </div>
                </div>
              </a>

              <nav className="site-nav">
                <a href="/" className="nav-link">
                  Home
                </a>
                <a href="/today" className="nav-link">
                  Today
                </a>
                <a href="/settings" className="nav-link">
                  Settings
                </a>
                <a href="/analytics" className="nav-link">
                  Analytics
                </a>
                <a href="/login" className="nav-link nav-link-primary">
                  Log in
                </a>
              </nav>
            </div>
          </header>

          <main className="home-main">{children}</main>
        </div>
      </body>
    </html>
  );
}
