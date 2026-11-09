// Read-only Google Analytics 4 and Search Console report for Taksh.
// Runs only in the trusted GitHub Actions job `google-report.yml`.
// Prints aggregate numbers only; GA4 and Search Console hold no customer contact data.
import { createSign } from "node:crypto";
import { pathToFileURL } from "node:url";

const SCOPES = [
  "https://www.googleapis.com/auth/analytics.readonly",
  "https://www.googleapis.com/auth/webmasters.readonly",
];

export function base64url(input) {
  return Buffer.from(input).toString("base64").replace(/=+$/u, "").replace(/\+/gu, "-").replace(/\//gu, "_");
}

export function dateRange(days, today = new Date()) {
  const end = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - 1));
  const start = new Date(end);
  start.setUTCDate(end.getUTCDate() - (days - 1));
  const fmt = (d) => d.toISOString().slice(0, 10);
  return { startDate: fmt(start), endDate: fmt(end) };
}

/** One line saying how many users the data-centre city filter removed. */
export function filteredLine(all, real) {
  const a = Number(all?.[0]?.[0] || 0), r = Number(real?.[0]?.[0] || 0);
  return `Filtered as data-centre traffic: ${Math.max(a - r, 0)} of ${a} users. Bots seen by the site itself are never sent to Google (taksh_auto cookie).`;
}

export function table(title, headers, rows) {
  if (!rows.length) return `### ${title}\n\nNo rows.\n`;
  const line = (cells) => `| ${cells.join(" | ")} |`;
  return [`### ${title}`, "", line(headers), line(headers.map(() => "---")), ...rows.map(line), ""].join("\n");
}

export function readServiceAccount(raw) {
  const parsed = JSON.parse(raw);
  if (!parsed.client_email || !parsed.private_key) throw new Error("Service account JSON is missing client_email or private_key.");
  return { email: parsed.client_email, key: parsed.private_key };
}

async function accessToken({ email, key }) {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = base64url(JSON.stringify({ iss: email, scope: SCOPES.join(" "), aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 600 }));
  const signer = createSign("RSA-SHA256");
  signer.update(`${header}.${claims}`);
  const assertion = `${header}.${claims}.${base64url(signer.sign(key))}`;
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion }),
  });
  if (!response.ok) throw new Error(`Google sign-in failed: HTTP ${response.status}`);
  return (await response.json()).access_token;
}

async function post(url, token, body) {
  const response = await fetch(url, {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const detail = (await response.text()).slice(0, 300).replace(/\s+/gu, " ");
    throw new Error(`HTTP ${response.status} from ${new URL(url).hostname}: ${detail}`);
  }
  return response.json();
}

// Cities that host cloud servers and crawlers. Their traffic is excluded from every table except the unfiltered total, so real visitors stand out. An estimate, not a bot filter.
export const DATA_CENTRE_CITIES = ["Ashburn", "Boardman", "Council Bluffs", "Glenview", "Prineville", "The Dalles", "Dallas", "Des Moines", "Columbus", "Hillsboro", "Flower Mound"];

async function ga(token, property, range, dimensions, metrics, limit = 25, orderMetric = metrics[0], includeBots = false) {
  const data = await post(`https://analyticsdata.googleapis.com/v1beta/properties/${property}:runReport`, token, {
    dateRanges: [range],
    ...(includeBots ? {} : { dimensionFilter: { notExpression: { filter: { fieldName: "city", inListFilter: { values: DATA_CENTRE_CITIES } } } } }),
    dimensions: dimensions.map((name) => ({ name })),
    metrics: metrics.map((name) => ({ name })),
    orderBys: [{ metric: { metricName: orderMetric }, desc: true }],
    limit,
  });
  return (data.rows ?? []).map((row) => [
    ...(row.dimensionValues ?? []).map((v) => v.value || "(not set)"),
    ...(row.metricValues ?? []).map((v) => v.value),
  ]);
}

async function searchConsole(token, site, range, dimension) {
  const data = await post(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site)}/searchAnalytics/query`, token, {
    ...range,
    dimensions: [dimension],
    rowLimit: 25,
  });
  return (data.rows ?? []).map((row) => [row.keys[0], String(row.clicks), String(row.impressions), (row.ctr * 100).toFixed(1) + "%", row.position.toFixed(1)]);
}

async function main() {
  const days = Math.min(Math.max(Number.parseInt(process.env.TAKSH_REPORT_DAYS || "28", 10) || 28, 1), 90);
  const property = (process.env.GA_PROPERTY_ID || "").trim();
  const site = (process.env.GSC_SITE || "").trim();
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_JSON) throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON secret is not set.");
  if (!/^\d+$/u.test(property)) throw new Error("GA_PROPERTY_ID variable must be the numeric GA4 property ID.");
  const token = await accessToken(readServiceAccount(process.env.GOOGLE_SERVICE_ACCOUNT_JSON));
  const range = dateRange(days);
  const out = [`## Taksh Google report: ${range.startDate} to ${range.endDate} (${days} days)`, ""];

  const totalsHeader = ["Users", "New users", "Sessions", "Engaged sessions", "Page views", "Engagement per user (s)"];
  const perUser = (rows) => rows.map((r) => [...r.slice(0, 5), String(Math.round(Number(r[5]) / Math.max(Number(r[0]), 1)))]);
  const totalMetrics = ["totalUsers", "newUsers", "sessions", "engagedSessions", "screenPageViews", "userEngagementDuration"];
  const real = await ga(token, property, range, [], totalMetrics, 1);
  const all = await ga(token, property, range, [], totalMetrics, 1, totalMetrics[0], true);
  out.push(table("Totals, likely real visitors (data-centre cities removed)", totalsHeader, perUser(real)));
  out.push(table("Totals, all traffic including bots", totalsHeader, perUser(all)));
  out.push(filteredLine(all, real), "");
  out.push(table("Daily", ["Date", "Users", "Sessions", "Page views"],
    (await ga(token, property, range, ["date"], ["totalUsers", "sessions", "screenPageViews"], 90, "totalUsers")).sort((a, b) => a[0].localeCompare(b[0]))));
  out.push(table("Pages", ["Page", "Views", "Users", "Total engagement (s)"],
    await ga(token, property, range, ["pagePath"], ["screenPageViews", "totalUsers", "userEngagementDuration"])));
  out.push(table("Sources", ["Source / medium", "Sessions", "Users", "Engaged sessions"],
    await ga(token, property, range, ["sessionSourceMedium"], ["sessions", "totalUsers", "engagedSessions"])));
  out.push(table("Devices", ["Device", "Users", "Sessions"], await ga(token, property, range, ["deviceCategory"], ["totalUsers", "sessions"])));
  out.push(table("Cities", ["City", "Users"], await ga(token, property, range, ["city"], ["totalUsers"], 15)));
  out.push(table("Events", ["Event", "Count", "Users"], await ga(token, property, range, ["eventName"], ["eventCount", "totalUsers"], 40)));
  out.push(table("Products viewed (view_item)", ["Item", "Views"],
    await ga(token, property, range, ["itemName"], ["itemsViewed"], 20).catch(() => [])));

  if (site) {
    try {
      out.push(table("Search queries (Search Console)", ["Query", "Clicks", "Impressions", "CTR", "Avg position"], await searchConsole(token, site, range, "query")));
      out.push(table("Search pages (Search Console)", ["Page", "Clicks", "Impressions", "CTR", "Avg position"], await searchConsole(token, site, range, "page")));
    } catch (error) {
      out.push(`### Search Console\n\nUnavailable: ${error.message}\n`);
    }
  } else {
    out.push("### Search Console\n\nNot configured (set repository variable GSC_SITE, e.g. sc-domain:taksh.store).\n");
  }

  const report = out.join("\n");
  console.log(report);
  if (process.env.GITHUB_STEP_SUMMARY) {
    const { appendFile } = await import("node:fs/promises");
    await appendFile(process.env.GITHUB_STEP_SUMMARY, report + "\n");
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main().catch((error) => {
    console.error(`Google report failed: ${error.message}`);
    process.exit(1);
  });
}
