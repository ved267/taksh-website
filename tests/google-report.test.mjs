import test from "node:test";
import assert from "node:assert/strict";
import { base64url, dateRange, readServiceAccount, table } from "../scripts/google-report.mjs";

test("dateRange ends yesterday and spans the requested days", () => {
  assert.deepEqual(dateRange(28, new Date("2026-11-06T12:00:00Z")), { startDate: "2026-10-09", endDate: "2026-11-05" });
  assert.deepEqual(dateRange(1, new Date("2026-03-01T00:30:00Z")), { startDate: "2026-02-28", endDate: "2026-02-28" });
});

test("base64url has no padding or unsafe characters", () => {
  assert.equal(base64url("??>>"), "Pz8-Pg");
});

test("table renders markdown and an empty state", () => {
  assert.equal(table("T", ["a", "b"], []), "### T\n\nNo rows.\n");
  assert.match(table("T", ["a", "b"], [["1", "2"]]), /\| a \| b \|\n\| --- \| --- \|\n\| 1 \| 2 \|/u);
});

test("readServiceAccount requires an email and key", () => {
  assert.throws(() => readServiceAccount("{}"), /missing/u);
  assert.deepEqual(readServiceAccount(JSON.stringify({ client_email: "x@y", private_key: "k" })), { email: "x@y", key: "k" });
});
