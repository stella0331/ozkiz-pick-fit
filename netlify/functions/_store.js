const { getStore } = require("@netlify/blobs");

// On some sites/deploys, Netlify doesn't auto-inject the Blobs context into
// the function runtime. When that happens, fall back to explicit siteID +
// token (read from environment variables) instead of the zero-config form.
function makeStore(name) {
  const siteID = process.env.NETLIFY_SITE_ID || process.env.SITE_ID;
  const token = process.env.NETLIFY_BLOBS_TOKEN;
  if (siteID && token) {
    return getStore({ name, siteID, token });
  }
  return getStore(name);
}

module.exports = { makeStore };
