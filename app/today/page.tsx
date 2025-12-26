import { Suspense } from "react";
import TodayClient from "./TodayClient";

export default function TodayPage() {
  return (
    <Suspense fallback={<div style={{ padding: "2rem" }}>Loading…</div>}>
      <TodayClient />
    </Suspense>
  );
}
