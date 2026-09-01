const NOTION_VERSION = "2022-06-28";

async function notionFetch(path, options = {}) {
  const token = process.env.NOTION_TOKEN;
  if (!token) {
    throw new Error("NOTION_TOKEN 환경변수가 설정되지 않았습니다.");
  }
  const res = await fetch(`https://api.notion.com/v1${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Notion API 오류 (${res.status}): ${body}`);
  }
  return res.json();
}

// Query a full database, following pagination until all rows are collected.
async function queryDatabase(databaseId, extraBody = {}) {
  let results = [];
  let cursor = undefined;
  do {
    const body = { page_size: 100, ...extraBody };
    if (cursor) body.start_cursor = cursor;
    const data = await notionFetch(`/databases/${databaseId}/query`, {
      method: "POST",
      body: JSON.stringify(body),
    });
    results = results.concat(data.results);
    cursor = data.has_more ? data.next_cursor : undefined;
  } while (cursor);
  return results;
}

async function retrievePage(pageId) {
  return notionFetch(`/pages/${pageId}`);
}

// --- Property extraction helpers ---
function getTitle(page, propName) {
  const prop = page.properties[propName];
  if (!prop || !prop.title) return "";
  return prop.title.map((t) => t.plain_text).join("");
}

function getSelect(page, propName) {
  const prop = page.properties[propName];
  return prop?.select?.name || "";
}

function getStatus(page, propName) {
  const prop = page.properties[propName];
  return prop?.status?.name || "";
}

function getFileUrl(page, propName) {
  const prop = page.properties[propName];
  const file = prop?.files?.[0];
  if (!file) return "";
  return file.type === "external" ? file.external.url : file.file?.url || "";
}

function getUrl(page, propName) {
  const prop = page.properties[propName];
  return prop?.url || "";
}

function getDate(page, propName) {
  const prop = page.properties[propName];
  return prop?.date?.start || "";
}

module.exports = {
  notionFetch,
  queryDatabase,
  retrievePage,
  getTitle,
  getSelect,
  getStatus,
  getFileUrl,
  getUrl,
  getDate,
};
