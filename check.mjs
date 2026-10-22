import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join } from "node:path";
import { chromium } from "playwright";

const TYPES = { ".html": "text/html", ".js": "text/javascript", ".json": "application/json" };

const server = createServer(async (req, res) => {
  const path = new URL(req.url, "http://x").pathname;
  const file = extname(path) ? join("dist", path) : join("dist", "index.html");
  try {
    res.writeHead(200, { "content-type": TYPES[extname(file)] ?? "application/octet-stream" });
    res.end(await readFile(file));
  } catch {
    res.writeHead(404).end();
  }
}).listen(0);
const origin = `http://localhost:${server.address().port}`;

const browser = await chromium.launch();
const page = await browser.newPage();
const url = () => new URL(page.url()).pathname + new URL(page.url()).search;
const settle = () => page.waitForTimeout(300);

const rows = [];
async function row(name, expected, act) {
  await act();
  await settle();
  rows.push({ case: name, expected, actual: url(), ok: url() === expected ? "✓" : "✗" });
}

await row("link to /foo (group index, no query)", "/foo", async () => {
  await page.goto(origin);
  await page.getByText("open /foo", { exact: true }).click();
});
await row("link to /foo?q=1 (group index)", "/foo?q=1", async () => {
  await page.goto(origin);
  await page.getByText("open /foo?q=1").click();
});
await row("load /foo?q=1 directly", "/foo?q=1", async () => {
  await page.goto(`${origin}/foo?q=1`);
});
await row("router.setParams({ q: '2' }) on /foo", "/foo?q=2", async () => {
  await page.getByText(/press to set q=2/).click();
});
await row("link to /bar?q=1 (index, no group)", "/bar?q=1", async () => {
  await page.goto(origin);
  await page.getByText("open /bar?q=1").click();
});

await row("router.setParams({ q: '2' }) on /bar", "/bar?q=2", async () => {
  await page.getByText(/press to set q=2/).click();
});

console.table(rows);
await browser.close();
server.close();
process.exitCode = rows.every((r) => r.ok === "✓") ? 0 : 1;
