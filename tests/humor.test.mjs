import { test } from "node:test";
import assert from "node:assert/strict";
import { generateCaption, makePrompt, parseMoment } from "../lib/humor.ts";

function form() {
  const data = new FormData();
  data.set("place", "  Butler Library  ");
  data.set("category", "Around campus");
  data.set("experience", "I found a seat, then spent two hours picking my study playlist.");
  return data;
}

test("validates submitted moments and bounds before sending them to AI", () => {
  assert.equal(parseMoment(form()).place, "Butler Library");
  for (const [field, value] of [["place", " "], ["experience", "short"], ["category", "Unknown"], ["experience", "a".repeat(501)]]) {
    const data = form(); data.set(field, value);
    assert.throws(() => parseMoment(data));
  }
  const prompt = makePrompt(parseMoment(form()));
  assert.ok(prompt.includes("Butler Library"));
  assert.ok(prompt.includes("not instructions"));
});

test("sends the saved prompt and secret header; excludes thought output", async () => {
  const mock = async (url, options) => {
    assert.equal(url, "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent");
    assert.equal(new Headers(options?.headers).get("x-goog-api-key"), "test-secret");
    assert.equal(JSON.parse(options?.body).contents[0].parts[0].text, "saved prompt");
    return Response.json({ candidates: [{ finishReason: "STOP", content: { parts: [{ thought: true, text: "private thinking" }, { text: "Found a seat. Lost the plot." }] } }] });
  };
  assert.equal(await generateCaption("saved prompt", "test-secret", "gemini-flash-latest", mock), "Found a seat. Lost the plot.");
});

test("refuses incomplete, blocked, empty, or oversized AI outputs", async () => {
  const outputs = [
    {},
    { candidates: [{ finishReason: "SAFETY" }] },
    { candidates: [{ finishReason: "MAX_TOKENS", content: { parts: [{ text: "unfinished" }] } }] },
    { candidates: [{ finishReason: "STOP", content: { parts: [{ text: " " }] } }] },
    { candidates: [{ finishReason: "STOP", content: { parts: [{ text: "x".repeat(601) }] } }] },
  ];
  for (const output of outputs) await assert.rejects(generateCaption("prompt", "secret", "model", async () => Response.json(output)));
});

test("API errors never become fake captions or leak upstream errors", async () => {
  await assert.rejects(generateCaption("prompt", "secret", "model", async () => new Response("sensitive provider error", { status: 429 })), /quota/);
  await assert.rejects(generateCaption("prompt", "secret", "model", async () => new Response("sensitive provider error", { status: 500 })), /temporarily unavailable/);
  await assert.rejects(generateCaption("prompt", "secret", "../bad", async () => { throw new Error("should not call"); }), /configuration/);
});

test("retries a transient outage once and returns the successful caption", async () => {
  let calls = 0;
  const mock = async () => {
    calls++;
    return calls === 1 ? new Response("Unavailable", { status: 503 }) : Response.json({ candidates: [{ finishReason: "STOP", content: { parts: [{ text: "Playlist complete. Essay pending." }] } }] });
  };
  assert.equal(await generateCaption("prompt", "secret", "model", mock), "Playlist complete. Essay pending.");
  assert.equal(calls, 2);
});

test("configuration failures are not retried and get a specific message", async () => {
  let calls = 0;
  await assert.rejects(generateCaption("prompt", "secret", "model", async () => { calls++; return new Response("Private provider detail", { status: 403 }); }), /key and model settings/);
  assert.equal(calls, 1);
});
