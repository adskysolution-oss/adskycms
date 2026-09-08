import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production"
);

const MLM_ROLES = ["mlm_member", "member"];
const ADMIN_ROLES = ["admin", "super_admin", "operations_admin", "superadmin"];

/**
 * Shared auth guard for MLM and Admin API routes.
 */
export async function requireModuleAuth(req, module, allowedRoles) {
  let token = null;

  // 1. Try NextRequest cookies object
  if (req?.cookies && typeof req.cookies.get === "function") {
    token = req.cookies.get("token")?.value ||
            req.cookies.get("admin_token")?.value ||
            req.cookies.get("recruitment_token")?.value;
  }

  // 2. Fallback to raw Cookie header
  if (!token && req?.headers && typeof req.headers.get === "function") {
    const cookieHeader = req.headers.get("cookie") || "";
    const match = cookieHeader.match(/(?:^|;\s*)(?:token|admin_token|recruitment_token)=([^;]+)/);
    if (match) {
      token = decodeURIComponent(match[1]);
    }
  }

  // 3. Fallback to Authorization: Bearer <token>
  if (!token && req?.headers && typeof req.headers.get === "function") {
    const authHeader = req.headers.get("authorization") || "";
    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.slice(7).trim();
    }
  }

  if (!token) {
    return NextResponse.json(
      { success: false, message: "Unauthorized — not authenticated" },
      { status: 401 }
    );
  }

  let payload;
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    payload = verified.payload;
  } catch {
    return NextResponse.json(
      { success: false, message: "Unauthorized — invalid token" },
      { status: 401 }
    );
  }

  const role = payload.role;

  // Admin always passes for admin or any general module
  if (ADMIN_ROLES.includes(role)) {
    return { payload };
  }

  if (module === "mlm") {
    const allowed = allowedRoles ?? [...MLM_ROLES];
    if (!allowed.includes(role)) {
      return NextResponse.json(
        { success: false, message: "Forbidden — role '" + role + "' cannot access NextView module" },
        { status: 403 }
      );
    }
  } else if (module === "recruitment") {
    if (role !== "recruitment_partner") {
      return NextResponse.json(
        { success: false, message: "Forbidden — Recruitment Partners only" },
        { status: 403 }
      );
    }
  } else if (module === "admin") {
    return NextResponse.json(
      { success: false, message: "Forbidden — admin only" },
      { status: 403 }
    );
  }

  return { payload };
}

export function getRequestMeta(req) {
  return {
    ip: req?.headers?.get?.("x-forwarded-for") ?? req?.headers?.get?.("x-real-ip") ?? "unknown",
    userAgent: req?.headers?.get?.("user-agent") ?? "unknown",
  };
}
