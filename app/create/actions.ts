"use server";

import { getAccount } from "@/lib/profile";
import { parseMoment, makePrompt, generateCaption, defaultGeminiModel, type ActionState } from "@/lib/humor";
import { guestRatingKey } from "@/lib/guest-ratings";
import { revalidatePath } from "next/cache";

export async function createCaption(_previous: ActionState, form: FormData): Promise<ActionState> {
  const { supabase, user } = await getAccount();
  if (!user) return { error: "Sign in to generate a caption." };
  let moment;
  try { moment = parseMoment(form); }
  catch (error) { return { error: (error as Error).message }; }
  const key = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || defaultGeminiModel;
  if (!key) return { error: "AI generation isn’t available yet. Please come back soon." };
  const prompt = makePrompt(moment);
  // Reserve a request before calling AI. Database limits also apply to concurrent requests.
  const { data: generation, error: reserveError } = await supabase.from("generations")
    .insert({ user_id: user.id, prompt, model }).select("id").single();
  if (reserveError) return { error: reserveError.message.includes("generation_limit")
    ? "Take a breather: wait 30 seconds between requests, with up to 10 attempts per 24 hours."
    : "We couldn’t start your generation. Please try again later." };
  let caption;
  try { caption = await generateCaption(prompt, key, model); }
  catch (error) {
    return { error: error instanceof Error && error.name !== "TimeoutError" && error.name !== "TypeError"
      ? error.message : "The AI connection timed out or couldn’t connect. Please try again later." };
  }
  const { data: saved, error } = await supabase.from("captions").insert({ ...moment, caption, generation_id: generation.id })
    .select("id,place,category,experience,caption,created_at").single();
  if (error) return { error: "Your caption couldn’t be saved, so it hasn’t been published. Please try again later." };
  revalidatePath("/");
  revalidatePath("/members");
  return { caption: saved, saved: true };
}

export async function voteCaption(captionId: string, _previous: ActionState, form: FormData): Promise<ActionState> {
  const { supabase, user } = await getAccount();
  const value = Number(form.get("value"));
  if (!/^[0-9a-f-]{36}$/i.test(captionId) || ![1, -1].includes(value)) return { error: "Choose a valid caption and rating." };
  if (!user) {
    const key = await guestRatingKey(true);
    const { data, error } = await supabase.rpc("submit_guest_rating", { p_key: key, p_caption: captionId, p_value: value });
    if (error) return { error: error.message.includes("rating_limit") ? "You’ve rated a lot! Please try again in an hour." : "Your rating wasn’t saved. Please try again." };
    revalidatePath("/");
    return { saved: true, value: Number(data) };
  }
  const { error } = await supabase.from("caption_votes").insert({ caption_id: captionId, user_id: user.id, value });
  if (error?.code === "23505") {
    const { data, error: readError } = await supabase.from("caption_votes").select("value").eq("caption_id", captionId).eq("user_id", user.id).single();
    if (!readError && data) return { saved: true, value: data.value };
  }
  if (error) return { error: "Your rating wasn’t saved. Please try again." };
  revalidatePath("/");
  revalidatePath("/members");
  return { saved: true, value };
}
