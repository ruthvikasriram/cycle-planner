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
    "Track mood and energy across your cycle with gentle, data-backed insights by Ruthvika Sriram.",
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
                    hormone-aware daily check-ins <b> by RUTHVIKA SRIRAM</b>
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
          <footer
  style={{
    textAlign: "center",
    padding: "1.5rem 1rem 2rem",
    fontSize: "0.7rem",
    color: "rgba(127, 29, 29, 0.8)",
  }}
>
  Built and designed by <strong>Ruthvika Sriram</strong> · Cycle-aware wellness
  analytics
</footer>
        </div>
      </body>
    </html>
  );
}
