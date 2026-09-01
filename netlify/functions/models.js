const {
  queryDatabase,
  getTitle,
  getSelect,
  getStatus,
  getFileUrl,
  getUrl,
} = require("./_notion");

const MODEL_DB_ID = "054e6075951b4e79adfee58918f6fb41";

exports.handler = async () => {
  try {
    const pages = await queryDatabase(MODEL_DB_ID);
    const models = pages.map((page) => ({
      id: page.id,
      name: getTitle(page, "이름"),
      image: getFileUrl(page, "이미지"),
      category: getSelect(page, "카테고리"),
      status: getStatus(page, "진행여부"),
      nationality: getSelect(page, "국적"),
      size: getSelect(page, "사이즈"),
      instagram: getUrl(page, "인스타그램"),
    }));
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ models }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: err.message }),
    };
  }
};
