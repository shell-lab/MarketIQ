// This file contains functions to interact with the MT5 bridge

export async function placeOrderOnBridge(order) {
  const BRIDGE_URL = process.env.MT5_BRIDGE_URL || "http://127.0.0.1:8000";
  try {
    const res = await fetch(`${BRIDGE_URL}/order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.MT5_BRIDGE_KEY
      },
      body: JSON.stringify(order)
    });
    if (!res.ok) throw new Error(`Bridge error: ${res.status} ${await res.text()}`);
    return res.json();
  } catch (err) {
    // Enhance fetch errors so callers see the attempted BRIDGE_URL and original error
    const msg = err && err.message ? err.message : String(err);
    throw new Error(`MT5 bridge fetch failed (url=${BRIDGE_URL}): ${msg}`);
  }
}

export async function getBridgePositions() {
  const BRIDGE_URL = process.env.MT5_BRIDGE_URL || "http://127.0.0.1:8000";
  try {
    const res = await fetch(`${BRIDGE_URL}/positions`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.MT5_BRIDGE_KEY
      }
    });
    if (!res.ok) throw new Error(`Bridge positions error: ${res.status} ${await res.text()}`);
    return res.json();
  } catch (err) {
    const msg = err && err.message ? err.message : String(err);
    // If the bridge returned 401 Unauthorized, give an actionable hint
    const lower = msg.toLowerCase();
    let hint = '';
    if (lower.includes('401') || lower.includes('unauthorized')) {
      hint = ' Ensure MT5_BRIDGE_KEY in your Next app matches the bridge key (set in .env.local) and restart the dev server.';
    }
    throw new Error(`MT5 bridge fetch failed (url=${BRIDGE_URL}): ${msg}.${hint}`);
  }
}

export async function getBridgeHistory(days = 7) {
  const BRIDGE_URL = process.env.MT5_BRIDGE_URL || "http://127.0.0.1:8000";
  try {
    const res = await fetch(`${BRIDGE_URL}/history?days=${encodeURIComponent(days)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.MT5_BRIDGE_KEY
      }
    });
    if (!res.ok) throw new Error(`Bridge history error: ${res.status} ${await res.text()}`);
    return res.json();
  } catch (err) {
    const msg = err && err.message ? err.message : String(err);
    throw new Error(`MT5 bridge fetch failed (url=${BRIDGE_URL}): ${msg}`);
  }
}