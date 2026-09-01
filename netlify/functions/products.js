const {
  queryDatabase,
  getTitle,
  getSelect,
  getStatus,
  getFileUrl,
} = require("./_notion");

const PRODUCT_DB_ID = "5d2ae3562c064494b6b1f0fc6469aa8a";

exports.handler = async () => {
  try {
    const pages = await queryDatabase(PRODUCT_DB_ID);
    const products = pages.map((page) => ({
      id: page.id,
      name: getTitle(page, "제품명"),
      image: getFileUrl(page, "대표이미지"),
      category: getSelect(page, "복종"),
      gender: getSelect(page, "성별"),
      season: getSelect(page, "시즌"),
      productType: getSelect(page, "제품유형"),
      status: getStatus(page, "진행상태"),
    }));
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ products }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: err.message }),
    };
  }
};
