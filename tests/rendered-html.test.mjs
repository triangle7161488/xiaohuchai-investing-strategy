import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the long-term investing guide", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<html lang="zh-CN">/i);
  assert.match(html, /<title>小虎柴柴长期投资策略 \/ 让复利跑，先让自己睡得着<\/title>/i);
  assert.match(html, /让复利跑/);
  assert.match(html, /收益和波动/);
  assert.match(html, /需要择时吗/);
  assert.match(html, /四层缓冲接住它/);
  assert.match(html, /聪明的投资者/);
  assert.match(html, /小虎柴柴/);
  assert.doesNotMatch(html, /批注本节|开始批注|写下你的评论/);
  assert.doesNotMatch(html, /行动自检/);
  assert.match(html, /annual-returns-split-bars/);
  assert.match(html, /1986 — 2005/);
  assert.match(html, /2006 — 2025/);
  assert.match(html, /纳斯达克 100 有 33 年上涨、7 年下跌/);
  assert.match(html, /标普 500 有 30 年上涨、10 年下跌/);
  assert.doesNotMatch(html, /-0\.0%/);
  assert.doesNotMatch(html, /annual-returns\.png/);
  assert.doesNotMatch(html, /Your site is taking shape|react-loading-skeleton|codex-preview/i);
});

test("keeps the site content and assets wired", async () => {
  const [page, layout, css] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(page, /setDataView/);
  assert.match(page, /setExpanded/);
  assert.match(page, /AnnualReturnsSplitBars/);
  assert.match(page, /selectedPoint/);
  assert.match(page, /split-bar-chart/);
  assert.doesNotMatch(page, /long-term-memo-comments|copyAllComments|批注本节|editor-panel/);
  assert.match(page, /inline-book/);
  assert.match(page, /id="data"/);
  assert.match(page, /id="timing"/);
  assert.match(page, /id="system"/);
  assert.doesNotMatch(page, /id="reading"/);
  assert.doesNotMatch(page, /id="action"/);
  assert.match(layout, /lang="zh-CN"/);
  assert.match(layout, /小虎柴柴长期投资策略/);
  assert.match(css, /@media \(max-width: 640px\)/);
  assert.match(css, /--forest:/);
});
