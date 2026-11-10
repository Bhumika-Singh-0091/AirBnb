"use client";

import ErrorPanel from "@/components/ErrorPanel";

export default function GlobalError({ error }: { error: Error }) {
  return <ErrorPanel message={error.message || "Something went wrong"} />;
}
