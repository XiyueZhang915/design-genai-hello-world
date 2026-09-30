"use client";
import { useFormStatus } from "react-dom";

export function GoogleButton() {
  const { pending } = useFormStatus();
  return <button className="button" disabled={pending}>{pending ? "Connecting…" : "Continue with Google"}</button>;
}
