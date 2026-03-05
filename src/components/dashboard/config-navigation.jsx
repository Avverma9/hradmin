import AddTaskIcon from "@mui/icons-material/AddTask";
import AirplaneTicketIcon from "@mui/icons-material/AirplaneTicket";
import AirportShuttleRoundedIcon from "@mui/icons-material/AirportShuttleRounded";
import CarCrashIcon from "@mui/icons-material/CarCrash";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import LocalActivityIcon from "@mui/icons-material/LocalActivity";
import TourIcon from "@mui/icons-material/Tour";
import axios from "axios";
import { BsInfoSquare } from "react-icons/bs";
import { CiBellOn, CiImageOn } from "react-icons/ci";
import { FaDollarSign, FaRegUserCircle } from "react-icons/fa";
import {
  MdDashboard,
  MdManageAccounts,
  MdMenu,
  MdOutlineAdminPanelSettings,
  MdOutlineCarRental,
  MdOutlineHotel,
  MdPeople,
  MdPerson,
  MdSettings,
  MdSpaceDashboard,
} from "react-icons/md";
import { RiCoupon3Line, RiMessengerLine } from "react-icons/ri";
import { SiTicktick } from "react-icons/si";
import { VscFeedback } from "react-icons/vsc";
import { localUrl } from "../../../utils/util";
import {
  getRoleBasedFallbackSidebar,
  normalizeRoleForSidebar,
  SIDEBAR_LINK_SEED_DATA,
  SIDEBAR_ROUTE_DEFINITIONS,
} from "./sidebar-links-seed";

const ICON_STYLE = { width: "24px", height: "24px" };
const ADMIN_SEED_ROLES = new Set(["Admin", "Developer", "superAdmin", "SuperAdmin"]);
const DEPRECATED_COUPON_PATHS = new Set(["/partner-coupon", "/user-coupon"]);

const ROUTE_TITLE_BY_PATH = new Map(
  SIDEBAR_ROUTE_DEFINITIONS.map((item) => [item.path, item.title])
);

let navConfigPromise = null;
let navConfigCache = null;

const iconComponents = {
  AddTaskIcon,
  AirplaneTicketIcon,
  AirportShuttleRoundedIcon,
  BsInfoSquare,
  CarCrashIcon,
  CiBellOn,
  CiImageOn,
  FaDollarSign,
  FaRegUserCircle,
  FormatListNumberedIcon,
  GroupAddIcon,
  LocalActivityIcon,
  MdDashboard,
  MdManageAccounts,
  MdOutlineAdminPanelSettings,
  MdOutlineCarRental,
  MdOutlineHotel,
  MdPeople,
  MdPerson,
  MdSettings,
  MdSpaceDashboard,
  RiCoupon3Line,
  RiMessengerLine,
  SiTicktick,
  TourIcon,
  VscFeedback,
};

const iconAliases = {
  addBooking: "AddTaskIcon",
  admin: "MdOutlineAdminPanelSettings",
  addCar: "CarCrashIcon",
  addTour: "AirportShuttleRoundedIcon",
  available: "SiTicktick",
  banner: "CiImageOn",
  bookings: "LocalActivityIcon",
  car: "MdOutlineCarRental",
  complaints: "BsInfoSquare",
  coupon: "RiCoupon3Line",
  dashboard: "MdDashboard",
  hotels: "MdOutlineHotel",
  manage: "MdManageAccounts",
  messenger: "RiMessengerLine",
  notification: "CiBellOn",
  owner: "GroupAddIcon",
  ownerList: "FormatListNumberedIcon",
  partners: "MdPerson",
  review: "VscFeedback",
  setMonthlyPrice: "FaDollarSign",
  settings: "MdSettings",
  tour: "TourIcon",
  travel: "AirplaneTicketIcon",
  user: "FaRegUserCircle",
};

const buildAuthHeaders = () => {
  const authToken = sessionStorage.getItem("rs_token");
  return authToken ? { Authorization: authToken } : {};
};

const resolveIconComponent = (iconKey = "") => {
  const sanitizedKey = String(iconKey || "").trim();
  const resolvedKey = iconAliases[sanitizedKey] || sanitizedKey;
  return iconComponents[resolvedKey] || null;
};

const renderIcon = (iconKey) => {
  const IconComponent = resolveIconComponent(iconKey);
  if (!IconComponent) return <MdMenu style={ICON_STYLE} />;
  return <IconComponent style={ICON_STYLE} />;
};

const extractArrayPayload = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.sidebarLinks)) return payload.sidebarLinks;
  return [];
};

const extractGroupedPayload = (payload) => {
  const grouped = payload?.data ?? payload?.sidebarLinks;
  if (grouped && typeof grouped === "object" && !Array.isArray(grouped)) {
    return grouped;
  }
  return null;
};

const normalizeBooleanFlag = (value) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "true" || normalized === "1" || normalized === "yes";
  }
  return false;
};

const normalizeSidebarPath = (rawPath = "") => {
  const path = String(rawPath || "").trim();
  if (!path || path === "#") return "";
  return path.startsWith("/") ? path : `/${path}`;
};

const formatPathToTitle = (path = "") => {
  const cleanPath = String(path || "")
    .split("?")[0]
    .replace(/^\/+|\/+$/g, "");

  if (!cleanPath) return "Home";

  const lastSegment = cleanPath.split("/").filter(Boolean).pop() || "Home";

  return lastSegment
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const normalizeSidebarLinkRecord = (rawItem, fallbackParent = "") => {
  if (!rawItem || typeof rawItem !== "object") return null;

  const rawPath = rawItem.childLink || rawItem.route || rawItem.path;
  const path = normalizeSidebarPath(rawPath);
  const parentLink = rawItem.parentLink || rawItem.group || fallbackParent || "Menu";
  const isParentOnly =
    normalizeBooleanFlag(rawItem.isParentOnly) || String(rawPath || "").trim() === "#";

  if (!parentLink) return null;
  if (!path && !isParentOnly) return null;

  const parsedOrder = Number(rawItem.order);
  const status = String(rawItem.status || "active").toLowerCase();
  const routeTitle =
    rawItem.title ||
    rawItem.childTitle ||
    (path ? ROUTE_TITLE_BY_PATH.get(path) || formatPathToTitle(path) : parentLink);

  return {
    id: rawItem._id || rawItem.id || `${parentLink}-${path || "parent-only"}`,
    parentLink: String(parentLink),
    title: String(routeTitle),
    path: String(path || ""),
    childLink: path || (isParentOnly ? "#" : ""),
    isParentOnly,
    iconKey: rawItem.icon || "MdDashboard",
    order: Number.isFinite(parsedOrder) ? parsedOrder : Number.MAX_SAFE_INTEGER,
    status,
  };
};

const normalizeSidebarLinks = (items = []) =>
  items
    .map((item) => normalizeSidebarLinkRecord(item))
    .filter((item) => item && item.status === "active");

const flattenGroupedSidebarLinks = (groupedPayload = {}) => {
  if (!groupedPayload || typeof groupedPayload !== "object") return [];

  const flattenedLinks = [];
  Object.entries(groupedPayload).forEach(([parentLink, children]) => {
    if (!Array.isArray(children)) return;

    children.forEach((child) => {
      const normalized = normalizeSidebarLinkRecord(
        {
          ...child,
          parentLink: child?.parentLink || parentLink,
        },
        parentLink
      );

      if (normalized && normalized.status === "active") {
        flattenedLinks.push(normalized);
      }
    });
  });

  return flattenedLinks;
};

const dedupeAndSortSidebarLinks = (links = []) => {
  const mapByKey = new Map();

  links.forEach((item) => {
    if (!item?.parentLink) return;
    if (item.path && DEPRECATED_COUPON_PATHS.has(item.path)) return;
    if (item.path && !item.path.startsWith("/")) return;

    const key = item.path
      ? `${item.parentLink}::${item.path}`
      : `${item.parentLink}::parent-only`;
    const existing = mapByKey.get(key);
    if (!existing || item.order < existing.order) {
      mapByKey.set(key, item);
    }
  });

  return Array.from(mapByKey.values()).sort(
    (a, b) =>
      a.order - b.order ||
      a.parentLink.localeCompare(b.parentLink) ||
      String(a.path || "").localeCompare(String(b.path || ""))
  );
};

const mapSidebarLinksToNavConfig = (links = []) => {
  const grouped = new Map();

  dedupeAndSortSidebarLinks(links).forEach((item) => {
    const existingGroup = grouped.get(item.parentLink) || {
      title: item.parentLink,
      iconKey: item.iconKey,
      order: item.order,
      parentPath: "",
      hasParentOnly: false,
      childPaths: new Set(),
      children: [],
    };

    existingGroup.order = Math.min(existingGroup.order, item.order);
    if (item.iconKey && !existingGroup.iconKey) {
      existingGroup.iconKey = item.iconKey;
    }

    if (item.isParentOnly || !item.path) {
      existingGroup.hasParentOnly = true;
      if (!existingGroup.parentPath && item.path) {
        existingGroup.parentPath = item.path;
      }
    } else if (!existingGroup.childPaths.has(item.path)) {
      existingGroup.childPaths.add(item.path);
      existingGroup.children.push({
        title: item.title,
        path: item.path,
        icon: renderIcon(item.iconKey),
        order: item.order,
      });
    }

    grouped.set(item.parentLink, existingGroup);
  });

  return Array.from(grouped.values())
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title))
    .map((group) => {
      const sortedChildren = group.children.sort(
        (a, b) => a.order - b.order || a.title.localeCompare(b.title)
      );

      if (
        sortedChildren.length === 1 &&
        !group.hasParentOnly &&
        !group.parentPath
      ) {
        const [single] = sortedChildren;
        return {
          title: group.title,
          path: single.path,
          icon: single.icon,
        };
      }

      return {
        title: group.title,
        ...(group.parentPath ? { path: group.parentPath } : {}),
        icon: renderIcon(group.iconKey),
        children: sortedChildren.map((child) => ({
          title: child.title,
          path: child.path,
          icon: child.icon,
        })),
      };
    })
    .filter((group) => group.path || (Array.isArray(group.children) && group.children.length));
};

const buildFallbackNavConfig = (role) => {
  const fallbackLinks = getRoleBasedFallbackSidebar(role).map((item) => ({
    parentLink: item.parentLink,
    title: item.title,
    path: item.path,
    iconKey: item.icon,
    order: item.order,
    status: "active",
  }));

  return mapSidebarLinksToNavConfig(fallbackLinks);
};

const parseSessionSidebarLinks = (rawValue) => {
  if (!rawValue) return [];

  try {
    const parsed = JSON.parse(rawValue);
    if (Array.isArray(parsed)) {
      return normalizeSidebarLinks(parsed);
    }

    if (parsed && typeof parsed === "object") {
      return flattenGroupedSidebarLinks(parsed);
    }
  } catch {
    return [];
  }

  return [];
};

const loadSessionSidebarFallback = () => {
  const sessionSidebarLinks = parseSessionSidebarLinks(
    sessionStorage.getItem("sidebar_links")
  );
  if (sessionSidebarLinks.length) return sessionSidebarLinks;

  const adminSidebarInSession = parseSessionSidebarLinks(
    sessionStorage.getItem("adminSidebar")
  );
  if (adminSidebarInSession.length) return adminSidebarInSession;

  const adminSidebarInLocal = parseSessionSidebarLinks(
    localStorage.getItem("adminSidebar")
  );
  return adminSidebarInLocal;
};

const fetchFlatSidebarLinks = async (role, headers) => {
  const params = { status: "active" };
  if (role) params.role = role;

  const response = await axios.get(`${localUrl}/additional/sidebar-links`, {
    params,
    headers,
  });

  return normalizeSidebarLinks(extractArrayPayload(response.data));
};

const fetchRoleBasedSidebarLinks = async (role, headers) => {
  const params = {};
  if (role) params.role = role;

  try {
    const response = await axios.get(`${localUrl}/additional/sidebar-links/grouped`, {
      params,
      headers,
    });

    const groupedPayload = extractGroupedPayload(response.data);
    if (groupedPayload) {
      return flattenGroupedSidebarLinks(groupedPayload);
    }

    return normalizeSidebarLinks(extractArrayPayload(response.data));
  } catch {
    return fetchFlatSidebarLinks(role, headers);
  }
};

const fetchUserEffectiveSidebarLinks = async (userId, headers) => {
  if (!userId) return [];

  const response = await axios.get(
    `${localUrl}/additional/sidebar-links/for-user/${userId}`,
    {
      params: { grouped: "true" },
      headers,
    }
  );

  const groupedPayload = extractGroupedPayload(response.data);
  if (groupedPayload) {
    return flattenGroupedSidebarLinks(groupedPayload);
  }

  return normalizeSidebarLinks(extractArrayPayload(response.data));
};

const seedSidebarLinksIfMissing = async (role, headers) => {
  if (!headers.Authorization) return false;
  if (!ADMIN_SEED_ROLES.has(role)) return false;

  try {
    const response = await axios.get(`${localUrl}/additional/sidebar-links`, {
      headers,
    });

    const existingLinks = normalizeSidebarLinks(extractArrayPayload(response.data));
    const existingPaths = new Set(existingLinks.map((item) => item.path));

    const missingSeedPayload = SIDEBAR_LINK_SEED_DATA.filter(
      (item) => !existingPaths.has(item.childLink)
    );

    if (!missingSeedPayload.length) return false;

    await axios.post(
      `${localUrl}/additional/sidebar-links/bulk`,
      missingSeedPayload,
      { headers }
    );

    return true;
  } catch {
    return false;
  }
};

const getNavConfig = async () => {
  const userRole = sessionStorage.getItem("user_role");
  const normalizedRole = normalizeRoleForSidebar(userRole);
  const userId = sessionStorage.getItem("user_id");
  const headers = buildAuthHeaders();

  try {
    await seedSidebarLinksIfMissing(userRole, headers);

    let sidebarLinks = await fetchRoleBasedSidebarLinks(normalizedRole, headers);

    if (!sidebarLinks.length && userId) {
      sidebarLinks = await fetchUserEffectiveSidebarLinks(userId, headers);
    }

    if (!sidebarLinks.length) {
      sidebarLinks = loadSessionSidebarFallback();
    }

    if (sidebarLinks.length) {
      const mappedConfig = mapSidebarLinksToNavConfig(sidebarLinks);
      if (mappedConfig.length) {
        sessionStorage.setItem("sidebar_links", JSON.stringify(sidebarLinks));
        return mappedConfig;
      }
    }
  } catch (error) {
    console.error(
      "Failed to fetch dynamic sidebar links:",
      error?.response?.data || error.message
    );
  }

  return buildFallbackNavConfig(normalizedRole);
};

export const fetchNavConfig = async ({ forceRefresh = false } = {}) => {
  if (forceRefresh) {
    navConfigCache = null;
    navConfigPromise = null;
  }

  if (navConfigCache) return navConfigCache;

  if (!navConfigPromise) {
    navConfigPromise = getNavConfig()
      .then((config) => {
        navConfigCache = config;
        return config;
      })
      .finally(() => {
        navConfigPromise = null;
      });
  }

  return navConfigPromise;
};
