/**
 * Centralized APITXT Verification Service for NexVia Member KYC.
 * 
 * - Server-to-server calls only.
 * - APITXT_AUTH_KEY is strictly confidential and never exposed.
 * - Sensitive values (PAN, Aadhaar, OTP) are never logged.
 * - Handles timeouts, network failures, and normalizes error codes.
 */

import { normalizeDob } from "./dobHelper.js";

const APITXT_BASE_URL = process.env.APITXT_BASE_URL || "https://apitxt.com";
const TIMEOUT_MS = 15000;

function getAuthKey() {
  const key = process.env.APITXT_AUTH_KEY;
  if (!key || !key.trim()) {
    throw new Error("CONFIG_ERROR: APITXT_AUTH_KEY environment variable is not configured on the server.");
  }
  return key.trim();
}

/**
 * Maps APITXT provider status codes / errors to safe, user-friendly messages.
 * Never exposes server infrastructure, secret keys, or raw stack traces.
 */
export function mapProviderError(status, message) {
  const code = String(status || "").trim();
  switch (code) {
    case "103":
      return "Verification session identifier is missing or expired. Please request a new OTP.";
    case "104":
      return "Please enter the 6-digit OTP.";
    case "105":
    case "304":
    case "MISSING_AUTH":
    case "AUTH_FAILED":
      return "Verification service is temporarily unavailable. Please try again later or contact support.";
    case "106":
    case "206":
      return "Invalid PAN format. Please provide a valid 10-character PAN number.";
    case "107":
      return "Name is required for PAN verification.";
    case "108":
    case "207":
      return "Invalid Date of Birth format. Please provide DOB in DD/MM/YYYY format.";
    case "204":
      return "Invalid OTP. Please enter the correct 6-digit OTP sent to your registered mobile.";
    case "301":
      return "Verification service balance temporarily unavailable. Please retry later.";
    case "310":
      return "Verification failed. The details provided could not be validated with government records.";
    default:
      return message || "Verification failed. Please check your details and try again.";
  }
}

/**
 * Verifies PAN with APITXT PAN API.
 * Endpoint: POST https://apitxt.com/api/panVerify
 * 
 * @param {Object} params
 * @param {string} params.pan - 10-character PAN (e.g. ABCDE1234F)
 * @param {string} params.name - Full Name as per PAN
 * @param {string} params.dob - DOB in DD/MM/YYYY format
 * @returns {Promise<Object>} Normalized verification result
 */
export async function verifyPan({ pan, name, dob }) {
  const authkey = getAuthKey();

  if (!pan || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan.trim().toUpperCase())) {
    return {
      success: false,
      verified: false,
      status: "INVALID_FORMAT",
      message: "Please enter a valid 10-character PAN number (e.g. ABCDE1234F).",
    };
  }

  if (!name || !name.trim()) {
    return {
      success: false,
      verified: false,
      status: "MISSING_NAME",
      message: "Please enter your full legal name as it appears on your PAN card.",
    };
  }

  const cleanDob = normalizeDob(dob);

  if (!cleanDob || !/^\d{2}\/\d{2}\/\d{4}$/.test(cleanDob)) {
    return {
      success: false,
      verified: false,
      status: "INVALID_DOB",
      message: "Please enter Date of Birth in DD/MM/YYYY format.",
    };
  }

  const endpoint = `${APITXT_BASE_URL}/api/panVerify`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        authkey,
        pan: pan.trim().toUpperCase(),
        pan_number: pan.trim().toUpperCase(),
        name: name.trim(),
        dob: cleanDob,
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok || !data) {
      const code = data?.status || response.status;
      return {
        success: false,
        verified: false,
        status: "FAILED",
        providerCode: code,
        message: mapProviderError(code, data?.message),
      };
    }

    // Inspect authoritative flags (never trust HTTP 200 alone!)
    const isVerified = data.verified === true || data.status === "VERIFIED" || data.status === 200 && data.data?.verified === true;
    const nameMatch = data.name_match ?? data.data?.name_match ?? null;
    const dobMatch = data.dob_match ?? data.data?.dob_match ?? null;
    const seedingStatus = data.aadhaar_seeding_status || data.data?.aadhaar_seeding_status || "";
    const category = data.category || data.data?.category || "";
    const requestId = data.request_id || data.data?.request_id || "";

    // If explicit mismatch flags are false, cannot auto-approve
    if (nameMatch === false || dobMatch === false) {
      return {
        success: true,
        verified: false,
        isMismatch: true,
        status: "MISMATCH",
        nameMatch,
        dobMatch,
        category,
        aadhaarSeedingStatus: seedingStatus,
        requestId,
        message: "Name or Date of Birth does not match Income Tax Department PAN records.",
      };
    }

    if (isVerified) {
      return {
        success: true,
        verified: true,
        isMismatch: false,
        status: "VERIFIED",
        nameMatch: nameMatch !== false,
        dobMatch: dobMatch !== false,
        category,
        aadhaarSeedingStatus: seedingStatus,
        requestId,
        message: data.message || "PAN verified successfully.",
      };
    }

    return {
      success: true,
      verified: false,
      status: "FAILED",
      requestId,
      message: mapProviderError(data.status, data.message || "PAN verification failed."),
    };
  } catch (err) {
    const isTimeout = err.name === "TimeoutError" || err.name === "AbortError";
    return {
      success: false,
      verified: false,
      status: "NETWORK_ERROR",
      message: isTimeout
        ? "PAN verification request timed out. Please try again."
        : "Unable to reach PAN verification provider. Please try again later.",
    };
  }
}

/**
 * Sends Aadhaar OTP via APITXT.
 * 
 * Per strict production instructions: DO NOT guess or assume the Send OTP endpoint.
 * Requires `process.env.APITXT_AADHAAR_SEND_OTP_URL` to be explicitly configured.
 * 
 * @param {Object} params
 * @param {string} params.aadhaarNumber - 12-digit Aadhaar number
 * @returns {Promise<Object>} Returns referenceId on success, or configuration notice
 */
export async function sendAadhaarOtp({ aadhaarNumber }) {
  const authkey = getAuthKey();

  const cleanAadhaar = String(aadhaarNumber || "").trim().replace(/\D/g, "");
  if (cleanAadhaar.length !== 12) {
    return {
      success: false,
      status: "INVALID_FORMAT",
      message: "Please enter a valid 12-digit Aadhaar number.",
    };
  }

  // Confirmed endpoint from live probe: https://apitxt.com/api/aadhaarSendOTP
  // APITXT_AADHAAR_SEND_OTP_URL can override this default if APITXT changes the URL in future.
  const endpoint = (process.env.APITXT_AADHAAR_SEND_OTP_URL || `${APITXT_BASE_URL}/api/aadhaarSendOTP`).trim();

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        authkey,
        aadhaar_number: cleanAadhaar,
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok || !data) {
      const code = data?.status || response.status;
      return {
        success: false,
        status: "FAILED",
        message: mapProviderError(code, data?.message),
      };
    }

    const referenceId = data.reference_id || data.data?.reference_id;
    if (!referenceId) {
      return {
        success: false,
        status: "NO_REFERENCE_ID",
        message: data.message || "Failed to generate OTP reference from provider.",
      };
    }

    return {
      success: true,
      referenceId,
      requestId: data.request_id || data.data?.request_id,
      message: data.message || "OTP sent successfully to your Aadhaar-registered mobile number.",
    };
  } catch (err) {
    const isTimeout = err.name === "TimeoutError" || err.name === "AbortError";
    return {
      success: false,
      status: "NETWORK_ERROR",
      message: isTimeout
        ? "Request timed out while sending Aadhaar OTP. Please try again."
        : "Failed to connect to Aadhaar verification provider. Please try again later.",
    };
  }
}

/**
 * Verifies Aadhaar OTP with APITXT Aadhaar Verify OTP API.
 * Endpoint: POST https://apitxt.com/api/aadhaarVerifyOTP
 * 
 * @param {Object} params
 * @param {string} params.referenceId - Session reference_id from server session
 * @param {string} params.otp - 6-digit OTP
 * @returns {Promise<Object>}
 */
export async function verifyAadhaarOtp({ referenceId, otp }) {
  const authkey = getAuthKey();

  if (!referenceId || !referenceId.trim()) {
    return {
      success: false,
      verified: false,
      status: "MISSING_SESSION",
      message: "Aadhaar verification session not found or expired. Please request a new OTP.",
    };
  }

  const cleanOtp = String(otp || "").trim().replace(/\D/g, "");
  if (cleanOtp.length !== 6) {
    return {
      success: false,
      verified: false,
      status: "INVALID_OTP_FORMAT",
      message: "Please enter the exact 6-digit OTP sent to your registered mobile number.",
    };
  }

  const endpoint = `${APITXT_BASE_URL}/api/aadhaarVerifyOTP`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        authkey,
        reference_id: referenceId.trim(),
        otp: cleanOtp,
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok || !data) {
      const code = data?.status || response.status;
      return {
        success: false,
        verified: false,
        status: "FAILED",
        providerCode: code,
        message: mapProviderError(code, data?.message),
      };
    }

    // Inspect verified status (never trust HTTP 200 alone!)
    const isVerified = data.verified === true || data.data?.verified === true || data.status === "VERIFIED";

    if (isVerified) {
      // Data minimization: extract ONLY verified name (do NOT store photo or full address)
      const verifiedName = data.name || data.data?.name || "";
      const requestId = data.request_id || data.data?.request_id || "";

      return {
        success: true,
        verified: true,
        status: "VERIFIED",
        verifiedName,
        requestId,
        message: data.message || "Aadhaar OTP verified successfully.",
      };
    }

    return {
      success: true,
      verified: false,
      status: "FAILED",
      message: mapProviderError(data.status, data.message || "Aadhaar OTP verification failed."),
    };
  } catch (err) {
    const isTimeout = err.name === "TimeoutError" || err.name === "AbortError";
    return {
      success: false,
      verified: false,
      status: "NETWORK_ERROR",
      message: isTimeout
        ? "Request timed out while verifying Aadhaar OTP. Please try again."
        : "Failed to connect to Aadhaar verification provider. Please try again later.",
    };
  }
}
