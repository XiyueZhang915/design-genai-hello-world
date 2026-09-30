"use server";

import { requireAccount } from "@/lib/profile";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type ProfileState = { error?: string };
export async function saveProfile(_previous: ProfileState, formData: FormData): Promise<ProfileState> {
  const { supabase, user, profile } = await requireAccount();
  const firstName = formData.get("first_name");
  const lastName = formData.get("last_name");
  if (typeof firstName !== "string" || typeof lastName !== "string" || !firstName.trim() || !lastName.trim()) {
    return { error: "Please add both your first and last name." };
  }
  if (firstName.trim().length > 80 || lastName.trim().length > 80) return { error: "Each name can be up to 80 characters." };
  const photo = formData.get("photo");
  let avatarPath = profile?.avatar_path ?? null;
  let newPath: string | null = null;
  if (photo instanceof File && photo.size > 0) {
    if (photo.size > 2 * 1024 * 1024) return { error: "Choose a photo smaller than 2 MB." };
    const bytes = new Uint8Array(await photo.arrayBuffer());
    const extension = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff ? "jpg"
      : bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 && bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a ? "png"
      : String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP" ? "webp" : null;
    const mime = extension === "jpg" ? "image/jpeg" : `image/${extension}`;
    if (!extension || photo.type !== mime) return { error: "Choose a valid JPG, PNG, or WebP photo." };
    newPath = `${user.id}/${crypto.randomUUID()}.${extension}`;
    const { error } = await supabase.storage.from("avatars").upload(newPath, bytes, { contentType: mime, upsert: false });
    if (error) return { error: "Your photo couldn’t be uploaded. Please try again." };
    avatarPath = newPath;
  }
  const { error } = await supabase.from("profiles").upsert({
    id: user.id, first_name: firstName.trim(), last_name: lastName.trim(), avatar_path: avatarPath,
  });
  if (error) {
    if (newPath) await supabase.storage.from("avatars").remove([newPath]);
    return { error: "Your profile couldn’t be saved. Please try again." };
  }
  if (newPath && profile?.avatar_path?.startsWith(`${user.id}/`)) await supabase.storage.from("avatars").remove([profile.avatar_path]);
  revalidatePath("/", "layout");
  redirect("/profile?saved=1");
}
