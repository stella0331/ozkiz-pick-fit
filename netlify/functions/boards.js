const { makeStore } = require("./_store");

function store() {
  return makeStore("boards");
}

exports.handler = async (event) => {
  const headers = { "Content-Type": "application/json" };
  try {
    if (event.httpMethod === "GET") {
      const shootId = event.queryStringParameters?.shootId;
      const s = store();
      const { blobs } = await s.list();
      let boards = await Promise.all(
        blobs.map(async (b) => {
          const data = await s.get(b.key, { type: "json" });
          return { id: b.key, ...data };
        })
      );
      if (shootId) boards = boards.filter((b) => b.shootId === shootId);
      boards.sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
      return { statusCode: 200, headers, body: JSON.stringify({ boards }) };
    }

    if (event.httpMethod === "POST") {
      const payload = JSON.parse(event.body || "{}");
      if (!payload.shootId || !Array.isArray(payload.modelIds)) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: "shootId와 modelIds가 필요합니다." }),
        };
      }
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const now = new Date().toISOString();
      const record = {
        shootId: payload.shootId,
        title: payload.title || "이름 없는 조합표",
        modelIds: payload.modelIds,
        columns: payload.columns || [{ id: "c1", label: "착장1" }],
        cells: payload.cells || {},
        createdAt: now,
        updatedAt: now,
      };
      await store().setJSON(id, record);
      return { statusCode: 200, headers, body: JSON.stringify({ id, ...record }) };
    }

    if (event.httpMethod === "PUT") {
      const payload = JSON.parse(event.body || "{}");
      const id = payload.id;
      if (!id) return { statusCode: 400, headers, body: JSON.stringify({ error: "id가 필요합니다." }) };
      const s = store();
      const existing = await s.get(id, { type: "json" });
      if (!existing) return { statusCode: 404, headers, body: JSON.stringify({ error: "찾을 수 없습니다." }) };
      const record = {
        ...existing,
        title: payload.title !== undefined ? payload.title : existing.title,
        modelIds: payload.modelIds !== undefined ? payload.modelIds : existing.modelIds,
        columns: payload.columns !== undefined ? payload.columns : existing.columns,
        cells: payload.cells !== undefined ? payload.cells : existing.cells,
        updatedAt: new Date().toISOString(),
      };
      await s.setJSON(id, record);
      return { statusCode: 200, headers, body: JSON.stringify({ id, ...record }) };
    }

    if (event.httpMethod === "DELETE") {
      const id = event.queryStringParameters?.id;
      if (!id) return { statusCode: 400, headers, body: JSON.stringify({ error: "id가 필요합니다." }) };
      await store().delete(id);
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: "지원하지 않는 메서드" }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
