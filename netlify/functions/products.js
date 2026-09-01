const {
  queryDatabase,
  getTitle,
  getSelect,
  getStatus,
  getFileUrl,
} = require("./_notion");
const { makeStore } = require("./_store");

const PRODUCT_DB_ID = "5d2ae3562c064494b6b1f0fc6469aa8a";
const CACHE_KEY = "products";

async function fetchFromNotion() {
  const pages = await queryDatabase(PRODUCT_DB_ID);
  return pages.map((page) => ({
    id: page.id,
    name: getTitle(page, "제품명"),
    image: getFileUrl(page, "대표이미지"),
    category: getSelect(page, "복종"),
    gender: getSelect(page, "성별"),
    season: getSelect(page, "시즌"),
    productType: getSelect(page, "제품유형"),
    status: getStatus(page, "진행상태"),
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
        return { statusCode: 200, headers, body: JSON.stringify({ products: cached.data, syncedAt: cached.syncedAt }) };
      }
    }
    const products = await fetchFromNotion();
    const syncedAt = new Date().toISOString();
    await cache.setJSON(CACHE_KEY, { data: products, syncedAt });
    return { statusCode: 200, headers, body: JSON.stringify({ products, syncedAt }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
