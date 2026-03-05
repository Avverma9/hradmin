/* eslint-disable no-console */
import axios from "axios";
import { SIDEBAR_LINK_SEED_DATA } from "../src/components/dashboard/sidebar-links-seed.js";

const baseUrl = (process.env.API_BASE_URL || "https://hotelroomsstay.com/api").replace(/\/+$/, "");
const token = (process.env.RS_TOKEN || process.env.ADMIN_TOKEN || "").trim();

if (!token) {
  console.error("Missing auth token. Set RS_TOKEN (or ADMIN_TOKEN) and run again.");
  process.exit(1);
}

const headers = { Authorization: token };

const extractArrayPayload = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const extractLinkPath = (item) => item?.childLink || item?.route || item?.path || "";

const seedSidebarLinks = async () => {
  const existingResponse = await axios.get(`${baseUrl}/additional/sidebar-links`, { headers });
  const existingLinks = extractArrayPayload(existingResponse.data);
  const existingPaths = new Set(existingLinks.map(extractLinkPath).filter(Boolean));

  const missingLinks = SIDEBAR_LINK_SEED_DATA.filter(
    (item) => !existingPaths.has(item.childLink)
  );

  if (!missingLinks.length) {
    console.log("Sidebar links are already seeded. No missing records found.");
    return;
  }

  await axios.post(`${baseUrl}/additional/sidebar-links/bulk`, missingLinks, { headers });
  console.log(
    `Seed complete: ${missingLinks.length} links inserted (${SIDEBAR_LINK_SEED_DATA.length} total template links).`
  );
};

seedSidebarLinks().catch((error) => {
  console.error("Sidebar seed failed.");
  console.error(error?.response?.data || error.message);
  process.exit(1);
});
