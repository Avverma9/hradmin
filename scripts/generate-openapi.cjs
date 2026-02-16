/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");

const root = process.cwd();
const mdPath = path.join(root, "docs", "PROJECT_API_WORKFLOW.md");
const outPath = path.join(root, "docs", "openapi.json");

const md = fs.readFileSync(mdPath, "utf8");
const lines = md.split(/\r?\n/);

const tableStart = lines.findIndex(
  (l) => l.trim() === "| Method | Endpoint | Used In | Observed Response Usage |",
);

if (tableStart === -1) {
  throw new Error("API table not found in docs/PROJECT_API_WORKFLOW.md");
}

const tableRows = [];

for (let i = tableStart + 2; i < lines.length; i += 1) {
  const line = lines[i].trim();
  if (!line.startsWith("|")) break;

  // Supports endpoint with and without markdown backticks.
  const withTicks = line.match(
    /^\|\s*([^|]+?)\s*\|\s*`([^`]+)`\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|$/,
  );
  const withoutTicks = line.match(
    /^\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|$/,
  );

  const m = withTicks || withoutTicks;
  if (!m) continue;

  tableRows.push({
    methodRaw: m[1].trim(),
    endpointRaw: m[2].trim(),
    usedInRaw: m[3].trim(),
    responseHintRaw: m[4].trim(),
  });
}

const inferMethod = (rawMethod, endpoint) => {
  const method = String(rawMethod || "").toUpperCase();
  if (["GET", "POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    return method;
  }

  const e = endpoint.toLowerCase();
  if (method === "FETCH") {
    if (e.includes("/mark-seen/") || e.includes("/and-mark-seen/")) return "PATCH";
    if (e.includes("/delete")) return "DELETE";
    if (e.includes("/create") || e.includes("/add")) return "POST";
    return "GET";
  }

  if (e.includes("/delete") || e.startsWith("/delete")) return "DELETE";
  if (
    e.includes("/update") ||
    e.includes("/remove") ||
    e.includes("/mark-seen") ||
    e.includes("/apply/")
  ) {
    return "PATCH";
  }
  if (
    e.includes("/get") ||
    e.includes("/find") ||
    e.includes("/statistics") ||
    e.includes("/valid-coupons") ||
    e.includes("/filters") ||
    e.includes("/query")
  ) {
    return "GET";
  }
  if (
    e.includes("/create") ||
    e.includes("/add") ||
    e.includes("/signup") ||
    e.includes("/send-otp") ||
    e.includes("/verify-otp") ||
    e.includes("/booking/")
  ) {
    return "POST";
  }
  return "POST";
};

const sanitizeVar = (raw) => {
  const cleaned = String(raw || "")
    .replace(/[{}$]/g, "")
    .replace(/\?/g, "")
    .replace(/\./g, "_")
    .replace(/[^a-zA-Z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
  return cleaned || "value";
};

const normalizePathAndParams = (endpointRaw) => {
  const [pathPartRaw, queryPartRaw = ""] = endpointRaw.split("?");

  const pathParamNames = [];
  const normalizedPath = pathPartRaw.replace(/\$\{([^}]+)\}/g, (_, g1) => {
    const param = sanitizeVar(g1);
    pathParamNames.push(param);
    return `{${param}}`;
  });

  const queryNames = [];
  if (queryPartRaw) {
    if (!queryPartRaw.includes("=")) {
      if (queryPartRaw.includes("${")) {
        const match = queryPartRaw.match(/\$\{([^}]+)\}/);
        queryNames.push(sanitizeVar(match ? match[1] : "query"));
      } else {
        queryNames.push("query");
      }
    } else {
      queryPartRaw.split("&").forEach((pair) => {
        const [nameRaw, valueRaw = ""] = pair.split("=");
        let name = sanitizeVar(nameRaw);
        if (!name) {
          const match = valueRaw.match(/\$\{([^}]+)\}/);
          name = sanitizeVar(match ? match[1] : "query");
        }
        if (name && !queryNames.includes(name)) queryNames.push(name);
      });
    }
  }

  return {
    normalizedPath,
    pathParamNames: Array.from(new Set(pathParamNames)),
    queryNames: Array.from(new Set(queryNames)),
  };
};

const tagForPath = (normalizedPath) => {
  const p = normalizedPath.toLowerCase();
  if (p.includes("/login") || p.includes("/mail") || p.includes("/signup")) return "Auth";
  if (p.includes("/hotels") || p.includes("/hotel")) return "Hotels";
  if (p.includes("/booking") && !p.includes("/tour-booking") && !p.includes("/travel"))
    return "Bookings";
  if (p.includes("/tour")) return "Tours";
  if (p.includes("/travel")) return "Travel";
  if (p.includes("/coupon")) return "Coupons";
  if (p.includes("/notification") || p.includes("/mark-seen") || p.includes("/push-a-new-notification"))
    return "Notifications";
  if (p.includes("/complaint")) return "Complaints";
  if (p.includes("/chatapp")) return "Messenger";
  if (p.includes("/additional")) return "AdditionalFields";
  if (p.includes("/gst")) return "GST";
  if (p.includes("/statistics")) return "Statistics";
  return "General";
};

const operationIdFor = (method, normalizedPath) => {
  const name = normalizedPath
    .replace(/[{}]/g, "")
    .split("/")
    .filter(Boolean)
    .map((s) => s.replace(/[^a-zA-Z0-9_]/g, "_"))
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join("");
  return `${method.toLowerCase()}${name || "Root"}`;
};

const requestSchemaRefFor = (method, endpointRaw) => {
  if (!["POST", "PUT", "PATCH"].includes(method)) return null;
  const endpoint = endpointRaw.toLowerCase();
  if (endpoint.includes("/login/dashboard/user")) return "#/components/schemas/LoginRequest";
  if (endpoint.includes("/mail/send-otp")) return "#/components/schemas/SendOtpRequest";
  if (endpoint.includes("/mail/verify-otp")) return "#/components/schemas/VerifyOtpRequest";
  if (endpoint.includes("/hotels/update/info/")) return "#/components/schemas/HotelInfoUpdateRequest";
  if (endpoint.includes("/tour-booking/create-tour-booking"))
    return "#/components/schemas/TourBookingCreateRequest";
  return "#/components/schemas/GenericObject";
};

const responseSchemaRefFor = (endpointRaw) => {
  const endpoint = endpointRaw.toLowerCase();
  if (endpoint.includes("/hotels/get-by-id/")) return "#/components/schemas/HotelDetailsResponse";
  if (endpoint.includes("/login/dashboard/get/all/user/"))
    return "#/components/schemas/MenuItemsResponse";
  if (
    endpoint.includes("/get-all/bookings-count") ||
    endpoint.includes("/get-hotels/count") ||
    endpoint.includes("/get-total/user-details")
  ) {
    return "#/components/schemas/DashboardCountsResponse";
  }
  return "#/components/schemas/ApiResponse";
};

const grouped = new Map();

for (const row of tableRows) {
  const method = inferMethod(row.methodRaw, row.endpointRaw);
  const normalized = normalizePathAndParams(row.endpointRaw);
  const key = `${method} ${normalized.normalizedPath}`;

  const usedIn = row.usedInRaw
    .split("<br>")
    .map((x) => x.trim())
    .filter(Boolean)
    .map((x) => x.replace(/\\/g, "/"));

  const responseHints =
    row.responseHintRaw && row.responseHintRaw !== "-" ? [row.responseHintRaw] : [];

  if (!grouped.has(key)) {
    grouped.set(key, {
      method,
      endpointRaw: row.endpointRaw,
      ...normalized,
      usedIn,
      responseHints,
    });
  } else {
    const existing = grouped.get(key);
    existing.usedIn = Array.from(new Set([...existing.usedIn, ...usedIn]));
    existing.responseHints = Array.from(
      new Set([...existing.responseHints, ...responseHints]),
    );
    existing.pathParamNames = Array.from(
      new Set([...existing.pathParamNames, ...normalized.pathParamNames]),
    );
    existing.queryNames = Array.from(
      new Set([...existing.queryNames, ...normalized.queryNames]),
    );
  }
}

const paths = {};

for (const [, op] of grouped) {
  const tag = tagForPath(op.normalizedPath);
  const operationId = operationIdFor(op.method, op.normalizedPath);
  const requestRef = requestSchemaRefFor(op.method, op.endpointRaw);
  const responseRef = responseSchemaRefFor(op.endpointRaw);

  const parameters = [];
  op.pathParamNames.forEach((p) => {
    parameters.push({
      name: p,
      in: "path",
      required: true,
      schema: { type: "string" },
      description: `Path parameter extracted from template: ${p}`,
    });
  });
  op.queryNames.forEach((q) => {
    parameters.push({
      name: q,
      in: "query",
      required: false,
      schema: { type: "string" },
      description: "Query parameter inferred from endpoint template.",
    });
  });

  const publicPaths = ["/login/dashboard/user", "/mail/send-otp", "/mail/verify-otp", "/Signup"];
  const isPublic = publicPaths.some((p) =>
    op.normalizedPath.toLowerCase().includes(p.toLowerCase()),
  );

  const operation = {
    tags: [tag],
    summary: `${op.method} ${op.normalizedPath}`,
    operationId,
    description: [
      `Original endpoint template: \`${op.endpointRaw}\``,
      op.responseHints.length
        ? `Observed response usage: ${op.responseHints.join(", ")}`
        : null,
    ]
      .filter(Boolean)
      .join("\n\n"),
    security: isPublic ? [] : [{ bearerAuth: [] }],
    parameters,
    responses: {
      200: {
        description: "Success",
        content: {
          "application/json": {
            schema: { $ref: responseRef },
          },
        },
      },
      400: {
        description: "Bad Request",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
          },
        },
      },
      401: {
        description: "Unauthorized",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
          },
        },
      },
      404: {
        description: "Not Found",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
          },
        },
      },
      500: {
        description: "Internal Server Error",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
          },
        },
      },
    },
    "x-used-in": op.usedIn,
  };

  if (requestRef) {
    operation.requestBody = {
      required: true,
      content: {
        "application/json": {
          schema: { $ref: requestRef },
        },
      },
    };
  }

  if (!paths[op.normalizedPath]) {
    paths[op.normalizedPath] = {};
  }
  paths[op.normalizedPath][op.method.toLowerCase()] = operation;
}

const openapi = {
  openapi: "3.0.3",
  info: {
    title: "HR Admin Panel API",
    version: "1.0.0",
    description:
      "Auto-generated OpenAPI spec from frontend usage scan in docs/PROJECT_API_WORKFLOW.md",
  },
  servers: [
    {
      url: "https://hotelroomsstay.com/api",
      description: "Production API",
    },
  ],
  tags: [
    { name: "Auth" },
    { name: "Hotels" },
    { name: "Bookings" },
    { name: "Travel" },
    { name: "Tours" },
    { name: "Coupons" },
    { name: "Notifications" },
    { name: "Complaints" },
    { name: "Messenger" },
    { name: "AdditionalFields" },
    { name: "GST" },
    { name: "Statistics" },
    { name: "General" },
  ],
  security: [{ bearerAuth: [] }],
  paths,
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      GenericObject: {
        type: "object",
        additionalProperties: true,
      },
      ApiResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          message: { type: "string", example: "Request completed successfully" },
          data: { $ref: "#/components/schemas/GenericObject" },
        },
      },
      ErrorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string", example: "Validation failed" },
          errors: { type: "array", items: { type: "string" } },
        },
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string", format: "password" },
        },
      },
      SendOtpRequest: {
        type: "object",
        required: ["email"],
        properties: {
          email: { type: "string", format: "email" },
        },
      },
      VerifyOtpRequest: {
        type: "object",
        required: ["email", "otp"],
        properties: {
          email: { type: "string", format: "email" },
          otp: { type: "string", example: "123456" },
        },
      },
      HotelInfoUpdateRequest: {
        type: "object",
        additionalProperties: true,
        description: "Dynamic key-value hotel info update payload.",
      },
      TourBookingCreateRequest: {
        type: "object",
        additionalProperties: true,
      },
      MenuItemsResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          menuItems: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string", example: "dashboard" },
              },
            },
          },
        },
      },
      DashboardCountsResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          data: {
            type: "object",
            properties: {
              bookingsCount: { type: "integer", example: 120 },
              hotelsCount: { type: "integer", example: 35 },
              usersCount: { type: "integer", example: 520 },
            },
          },
        },
      },
      HotelDetailsResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          data: {
            type: "object",
            properties: {
              _id: { type: "string" },
              basicInfo: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  owner: { type: "string" },
                  description: { type: "string" },
                  category: { type: "string" },
                  starRating: { type: "integer" },
                  images: { type: "array", items: { type: "string", format: "uri" } },
                  location: {
                    type: "object",
                    properties: {
                      address: { type: "string" },
                      city: { type: "string" },
                      state: { type: "string" },
                      pinCode: { oneOf: [{ type: "integer" }, { type: "string" }] },
                    },
                  },
                  contacts: {
                    type: "object",
                    properties: {
                      phone: { oneOf: [{ type: "number" }, { type: "string" }] },
                      email: { type: "string", format: "email" },
                      generalManager: { type: "string" },
                      salesManager: { type: "string" },
                    },
                  },
                },
              },
              rooms: {
                type: "array",
                items: { type: "object", additionalProperties: true },
              },
              policies: {
                type: "object",
                additionalProperties: true,
              },
              amenities: {
                type: "array",
                items: {
                  oneOf: [
                    { type: "string" },
                    { type: "array", items: { type: "string" } },
                    { type: "object", additionalProperties: true },
                  ],
                },
              },
              gstConfig: {
                type: "object",
                additionalProperties: true,
              },
            },
          },
        },
      },
    },
  },
};

fs.writeFileSync(outPath, JSON.stringify(openapi, null, 2), "utf8");
console.log(`Generated ${outPath}`);
console.log(`Detected table rows: ${tableRows.length}`);
console.log(`Generated paths: ${Object.keys(paths).length}`);
