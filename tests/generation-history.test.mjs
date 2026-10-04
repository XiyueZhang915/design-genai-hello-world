import { test } from "node:test";
import assert from "node:assert/strict";
import { publishedCaption } from "../lib/generation-history.ts";

test("history handles failed attempts and successful one-to-one captions", () => {
  assert.equal(publishedCaption(null), null);
  assert.equal(publishedCaption(undefined), null);
  assert.equal(publishedCaption([]), null);
  const caption = { id: "caption-id", place: "Butler Library", caption: "Playlist ready. Essay pending." };
  assert.deepEqual(publishedCaption(caption), caption);
  assert.deepEqual(publishedCaption([caption]), caption);
  assert.equal(publishedCaption({ id: "caption-id" }), null);
});
