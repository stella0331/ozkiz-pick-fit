const { makeStore } = require("./_store");

const CATEGORIES = ["컨셉 촬영", "호리존 촬영"];

function shootsStore() {
  return makeStore("shoots");
}
function boardsStore() {
  return makeStore("boards");
}

exports.handler = async (event) => {
  const headers = { "Content-Type": "application/json" };
  try {
    if (event.httpMethod === "GET") {
      const s = shootsStore();
      const { blobs } = await s.list();
      const shoots = await Promise.all(
        blobs.map(async (b) => {
          const data = await s.get(b.key, { type: "json" });
          return { id: b.key, ...data };
        })
      );
      shoots.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
      return { statusCode: 200, headers, body: JSON.stringify({ shoots }) };
    }

    if (event.httpMethod === "POST") {
      const payload = JSON.parse(event.body || "{}");
      const title = (payload.title || "").trim();
      const category = payload.category;
      const shootDate = payload.shootDate || "";
      if (!title) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: "큰제목을 입력해주세요." }) };
      }
      if (!CATEGORIES.includes(category)) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: "카테고리를 선택해주세요." }) };
      }
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const record = { title, category, shootDate, createdAt: new Date().toISOString() };
      await shootsStore().setJSON(id, record);
      return { statusCode: 200, headers, body: JSON.stringify({ id, ...record }) };
    }

    if (event.httpMethod === "PUT") {
      const payload = JSON.parse(event.body || "{}");
      const id = payload.id;
      if (!id) return { statusCode: 400, headers, body: JSON.stringify({ error: "id가 필요합니다." }) };
      const s = shootsStore();
      const existing = await s.get(id, { type: "json" });
      if (!existing) return { statusCode: 404, headers, body: JSON.stringify({ error: "찾을 수 없습니다." }) };
      const title = payload.title !== undefined ? payload.title.trim() : existing.title;
      const shootDate = payload.shootDate !== undefined ? payload.shootDate : existing.shootDate || "";
      const category = payload.category !== undefined ? payload.category : existing.category;
      if (!title) return { statusCode: 400, headers, body: JSON.stringify({ error: "큰제목을 입력해주세요." }) };
      if (!CATEGORIES.includes(category)) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: "카테고리를 선택해주세요." }) };
      }
      const record = { ...existing, title, category, shootDate };
      await s.setJSON(id, record);
      return { statusCode: 200, headers, body: JSON.stringify({ id, ...record }) };
    }

    if (event.httpMethod === "DELETE") {
      const id = event.queryStringParameters?.id;
      if (!id) return { statusCode: 400, headers, body: JSON.stringify({ error: "id가 필요합니다." }) };
      await shootsStore().delete(id);
      // cascade: remove boards that belong to this shoot
      const bs = boardsStore();
      const { blobs } = await bs.list();
      await Promise.all(
        blobs.map(async (b) => {
          const data = await bs.get(b.key, { type: "json" });
          if (data && data.shootId === id) await bs.delete(b.key);
        })
      );
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: "지원하지 않는 메서드" }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
