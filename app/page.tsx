"use client";

import Link from "next/link";
import { supabase } from "../lib/supabaseClient";
import { useEffect, useState } from "react";

export default function HomePage() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    async function check() {
      const { data } = await supabase.auth.getUser();
      setLoggedIn(!!data.user);
    }
    check();
  }, []);

  return (
    <div className="home-inner">
      {/* HERO */}
      <section className="home-hero">
        <div>
          <p className="hero-kicker">HORMONE-AWARE DAILY PLANNING</p>
          <h1 className="hero-title">
            Understand your cycle. Plan your life with a kinder rhythm.
          </h1>
          <p className="hero-text">
            Instead of guessing why your energy and mood shift every week, track
            them against your cycle phases and see clear patterns in one calm
            dashboard.
          </p>

          <div className="hero-actions">
            {loggedIn ? (
              <>
                <Link href="/today" className="primary-btn">
                  Go to Today
                </Link>
                <Link href="/analytics" className="secondary-btn">
                  View Analytics
                </Link>
              </>
            ) : (
              <>
                <Link href="/signup" className="primary-btn">
                  Create an account
                </Link>
                <Link href="/login" className="secondary-btn">
                  Log in
                </Link>
              </>
            )}
          </div>

          <p className="hero-footnote">
            Track mood &amp; energy daily · See phase-aware trends · Designed for
            long-term hormone literacy, not quick fixes.
          </p>
        </div>

        {/* Visual side “image” */}
        <div className="hero-visual">
          <div className="hero-visual-bg" />
          <div className="hero-visual-card">
            <p className="hero-visual-title">Today’s snapshot</p>
            <p className="hero-visual-sub">
              Cycle day 17 · Phase Luteal · lower social energy, strong focus.
            </p>
            <div>
              <p className="hero-bar-label">Mood</p>
              <div className="hero-bar-track">
                <div className="hero-bar-fill-mood" />
              </div>
              <p className="hero-bar-label">Energy</p>
              <div className="hero-bar-track">
                <div className="hero-bar-fill-energy" />
              </div>
            </div>
          </div>

          <div className="hero-visual-small">
            <p className="hero-visual-title">Hormone trend</p>
            <p className="hero-small-text">
              Follicular &amp; ovulatory phases tend to support visibility and deep
              work. Luteal is better for detail-oriented execution and softer
              days.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION: Phases overview */}
      <section className="section">
        <h2 className="section-title">
          Your cycle has a structure. Your planning can, too.
        </h2>
        <p className="section-text">
          Hormonal shifts across your cycle affect sleep, motivation, sensitivity,
          and focus. This planner doesn’t “optimize” you; it helps you respect
          those shifts and match work, rest, and training to your body.
        </p>

        <div className="phase-grid">
          <div className="phase-card">
            <p className="phase-name">Menstrual</p>
            <p className="phase-text">
              Low hormones · inward focus · reflection, gentle work, rest.
            </p>
          </div>
          <div className="phase-card">
            <p className="phase-name">Follicular</p>
            <p className="phase-text">
              Rising hormones · clearer thinking · planning, learning, new
              projects.
            </p>
          </div>
          <div className="phase-card">
            <p className="phase-name">Ovulatory</p>
            <p className="phase-text">
              Peak hormones · social energy · collaboration, visibility,
              interviews.
            </p>
          </div>
          <div className="phase-card">
            <p className="phase-name">Luteal</p>
            <p className="phase-text">
              Shifting hormones · detail focus · execution, closing loops,
              admin.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION: How it works + hormone card */}
      <section className="section split-section">
        <div>
          <h2 className="section-title">What this planner actually does</h2>
          <ul className="bullets-list">
            <li>
              <span className="bullet-label">1. You set your cycle details.</span>{" "}
              Add your average cycle length and last period start date once in
              Settings.
            </li>
            <li>
              <span className="bullet-label">
                2. You log mood and energy in under 30 seconds.
              </span>{" "}
              On the Today screen, record how you feel on a simple 1–5 scale.
            </li>
            <li>
              <span className="bullet-label">
                3. The app maps it onto your phase.
              </span>{" "}
              Each entry is tagged with cycle day and phase automatically.
            </li>
            <li>
              <span className="bullet-label">
                4. Analytics surfaces patterns.
              </span>{" "}
              Over weeks and months, you see when you naturally have more social,
              deep-focus, or low-energy days.
            </li>
            <li>
              <span className="bullet-label">
                5. You log your monthly flow.
              </span>{" "}
              Over months, you see how your flow is changing.
            </li>
          </ul>
        </div>

        <div className="hormone-card">
          <p className="hormone-card-title">Hormonal health, not hustle</p>
          <p className="hormone-card-text">
            Instead of forcing the same output every single day, this flow helps
            you notice:
          </p>
          <ul className="hormone-card-list">
            <li>When you naturally feel more social or visible</li>
            <li>When your body wants slower pacing or more sleep</li>
            <li>Which days are great for hard decisions or strategy</li>
            <li>How PMS windows reliably change your perception</li>
          </ul>
          <p className="hormone-card-footnote">
            None of this replaces medical care. It simply gives you a clearer
            relationship with your own patterns, so your planning feels kinder
            and more realistic.
          </p>
        </div>
      </section>
    </div>
  );
}
