from fastapi import FastAPI, HTTPException, Request
import MetaTrader5 as mt5
import os
from datetime import datetime, timedelta

app = FastAPI(title="MT5 Bridge")

API_KEY = os.environ.get("MT5_BRIDGE_KEY", "change-me")

# Initialize MT5 (talks to the running MT5 terminal)
if not mt5.initialize():
    raise SystemExit(f"MT5 initialize() failed, error code = {mt5.last_error()}")

@app.get("/health")
async def health():
    # Attempt to call a simple function to confirm connection
    connected = mt5.initialize()
    return {"status": "ok", "connected": bool(connected)}

@app.post("/order")
async def place_order(req: Request):
    token = req.headers.get("x-api-key")
    if token != API_KEY:
        raise HTTPException(status_code=401, detail="Unauthorized")

    body = await req.json()
    symbol = body.get("symbol")
    side = body.get("side")  # 'buy' or 'sell'
    # accept either 'volume' or 'lots'
    volume = float(body.get("volume", body.get("lots", 0.01)))
    sl = body.get("stopLoss")
    tp = body.get("takeProfit")
    deviation = int(body.get("deviation", 10))

    if not symbol or side not in ("buy", "sell"):
        raise HTTPException(status_code=400, detail="symbol and side required")

    symbol_info = mt5.symbol_info(symbol)
    if symbol_info is None:
        raise HTTPException(status_code=400, detail=f"Symbol {symbol} not found in terminal")

    # ensure symbol is enabled in Market Watch
    if not symbol_info.visible:
        mt5.symbol_select(symbol, True)

    tick = mt5.symbol_info_tick(symbol)
    if tick is None:
        raise HTTPException(status_code=500, detail="Could not get tick for symbol")

    price = tick.ask if side == "buy" else tick.bid
    order_type = mt5.ORDER_TYPE_BUY if side == "buy" else mt5.ORDER_TYPE_SELL

    request = {
        "action": mt5.TRADE_ACTION_DEAL,
        "symbol": symbol,
        "volume": float(volume),
        "type": order_type,
        "price": price,
        "sl": float(sl) if sl else 0.0,
        "tp": float(tp) if tp else 0.0,
        "deviation": deviation,
        "magic": 123456,
        "comment": "api_trade"
    }

    result = mt5.order_send(request)
    if result is None:
        raise HTTPException(status_code=500, detail=f"Order send returned None. mt5.last_error: {mt5.last_error()}")

    # Some brokers use different return codes; include result for debugging
    try:
        res_dict = result._asdict()
    except Exception:
        res_dict = {"raw": str(result)}

    return {"order_result": res_dict}

@app.get("/positions")
async def get_positions(request: Request):
    token = request.headers.get("x-api-key")
    if token != API_KEY:
        raise HTTPException(status_code=401, detail="Unauthorized")

    positions = mt5.positions_get()
    if positions is None:
        return {"positions": []}

    out = []
    for p in positions:
        try:
            out.append(p._asdict())
        except Exception:
            out.append(str(p))
    return {"positions": out}

@app.get("/history")
async def get_history(request: Request, days: int = 7):
    token = request.headers.get("x-api-key")
    if token != API_KEY:
        raise HTTPException(status_code=401, detail="Unauthorized")

    utc_to = datetime.utcnow()
    utc_from = utc_to - timedelta(days=days)
    deals = mt5.history_deals_get(utc_from, utc_to)
    if deals is None:
        return {"history": []}

    out = []
    for d in deals:
        try:
            out.append(d._asdict())
        except Exception:
            out.append(str(d))
    return {"history": out}

# optional: shutdown hook
@app.on_event("shutdown")
def shutdown_event():
    try:
        mt5.shutdown()
    except Exception:
        pass
