"use client";

import { useActionState, useState } from "react";
import { saveProfile } from "@/app/profile/actions";
import type { Profile } from "@/lib/profile";

export function ProfileForm({ profile, email }: { profile: Profile | null; email: string }) {
  const [state, action, pending] = useActionState(saveProfile, {});
  const [photoError, setPhotoError] = useState("");
  return <form action={action} className="profile-form">
    <div className="name-fields">
      <label>First name<input name="first_name" autoComplete="given-name" defaultValue={profile?.first_name ?? ""} maxLength={80} required /></label>
      <label>Last name<input name="last_name" autoComplete="family-name" defaultValue={profile?.last_name ?? ""} maxLength={80} required /></label>
    </div>
    <label>Email<input value={email} readOnly type="email" aria-describedby="email-help" /></label>
    <p className="field-help" id="email-help">Connected to your Google account.</p>
    <label>Profile photo<input name="photo" type="file" accept="image/jpeg,image/png,image/webp" aria-describedby="photo-help" onChange={(event) => {
      const file = event.target.files?.[0];
      if (file && file.size > 2 * 1024 * 1024) { event.target.value = ""; setPhotoError("Choose a photo smaller than 2 MB."); }
      else setPhotoError("");
    }} /></label>
    <p className="field-help" id="photo-help">Optional. JPG, PNG, or WebP, up to 2 MB. Choose a new photo to replace your current one.</p>
    {(state.error || photoError) && <p className="message error" role="alert">{photoError || state.error}</p>}
    <button className="button" disabled={pending}>{pending ? "Saving…" : "Save profile"}</button>
  </form>;
}
