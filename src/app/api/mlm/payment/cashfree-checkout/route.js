import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const session = searchParams.get("session") || searchParams.get("payment_session_id");
  const env = searchParams.get("env") || process.env.CASHFREE_ENV || "production";
  const orderId = searchParams.get("orderId") || "";

  if (!session) {
    return new NextResponse(
      "<html><body style='font-family:sans-serif;text-align:center;padding:50px;'><h2>Error: Missing Payment Session ID</h2><p>Please initiate payment from the NexVia app.</p></body></html>",
      { status: 400, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>NexVia Secure Payment</title>
  <script src="https://sdk.cashfree.com/js/v3/cashfree.js"></script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #0B2E59;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 16px;
    }
    .card {
      background: #FFFFFF;
      border-radius: 24px;
      padding: 32px 24px;
      max-width: 380px;
      width: 100%;
      text-align: center;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    }
    .spinner {
      width: 46px;
      height: 46px;
      border: 4px solid #E2E8F0;
      border-top-color: #2563EB;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 20px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    h2 {
      font-size: 19px;
      font-weight: 800;
      color: #0B2E59;
      margin-bottom: 8px;
    }
    p {
      font-size: 13px;
      color: #64748B;
      line-height: 1.5;
      margin-bottom: 20px;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #ECFDF5;
      color: #059669;
      font-size: 11px;
      font-weight: 700;
      padding: 6px 14px;
      border-radius: 20px;
      border: 1px solid #A7F3D0;
    }
    .retry-btn {
      display: none;
      margin-top: 16px;
      padding: 12px 20px;
      background: #2563EB;
      color: #FFF;
      border-radius: 12px;
      border: none;
      font-weight: 700;
      font-size: 13px;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div class="card" id="card">
    <div class="spinner" id="spinner"></div>
    <h2 id="title">Opening Cashfree Gateway...</h2>
    <p id="sub">Connecting securely to complete your platform activation fee payment.</p>
    <div class="badge">🔒 256-Bit Bank Encryption</div>
    <button class="retry-btn" id="retryBtn" onclick="initiateCheckout()">Tap to Pay Now</button>
  </div>

  <script>
    function initiateCheckout() {
      try {
        if (!window.Cashfree) {
          throw new Error("Cashfree SDK failed to load. Please check your internet connection.");
        }
        const mode = "${env === 'sandbox' ? 'sandbox' : 'production'}";
        const cashfree = window.Cashfree({ mode });
        cashfree.checkout({
          paymentSessionId: "${session}",
          redirectTarget: "_self"
        }).then(function(result) {
          if (result && result.error) {
            showError(result.error.message || "Payment cancelled or failed.");
          }
        }).catch(function(err) {
          showError(err.message || "Error opening payment gateway.");
        });
      } catch (err) {
        showError(err.message || "Could not launch checkout.");
      }
    }

    function showError(msg) {
      document.getElementById("spinner").style.display = "none";
      document.getElementById("title").innerText = "Payment Notice";
      document.getElementById("title").style.color = "#DC2626";
      document.getElementById("sub").innerText = msg;
      document.getElementById("retryBtn").style.display = "inline-block";
    }

    window.addEventListener("load", function() {
      setTimeout(initiateCheckout, 300);
    });
  </script>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
