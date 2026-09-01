const {
  queryDatabase,
  getTitle,
  getSelect,
  getStatus,
  getFileUrl,
  getUrl,
} = require("./_notion");
const { makeStore } = require("./_store");

const MODEL_DB_ID = "054e6075951b4e79adfee58918f6fb41";
const CACHE_KEY = "models";

async function fetchFromNotion() {
  const pages = await queryDatabase(MODEL_DB_ID);
  return pages.map((page) => ({
    id: page.id,
    name: getTitle(page, "이름"),
    image: getFileUrl(page, "이미지"),
    category: getSelect(page, "카테고리"),
    status: getStatus(page, "진행여부"),
    nationality: getSelect(page, "국적"),
    size: getSelect(page, "사이즈"),
    instagram: getUrl(page, "인스타그램"),
  }));
}

exports.handler = async (event) => {
  const headers = { "Content-Type": "application/json" };
  const forceRefresh = event.queryStringParameters?.refresh === "1";
  const cache = makeStore("notion-cache");
  try {
    if (!forceRefresh) {
      const cached = await cache.get(CACHE_KEY, { type: "json" });
      if (cached) {
        return { statusCode: 200, headers, body: JSON.stringify({ models: cached.data, syncedAt: cached.syncedAt }) };
      }
    }
    const models = await fetchFromNotion();
    const syncedAt = new Date().toISOString();
    await cache.setJSON(CACHE_KEY, { data: models, syncedAt });
    return { statusCode: 200, headers, body: JSON.stringify({ models, syncedAt }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
