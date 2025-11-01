# MT5 Bridge (Local MT5 Terminal + FastAPI)

This document shows how to run a local MetaTrader 5 bridge (FastAPI + MetaTrader5 Python package) and how to wire your Next.js backend to it.

Prerequisites
- Windows machine (desktop or VPS) with MetaTrader 5 installed and logged into a **demo** account.
- Python 3.10+ installed on the same machine.

Setup
1. Copy the bridge files to the machine (folder: `C:\mt5-bridge` recommended).
2. Create and activate a virtualenv:

```powershell
python -m venv venv
venv\Scripts\Activate.ps1
pip install --upgrade pip
pip install -r requirements.txt
```

3. Set the bridge API key (secure value):

```powershell
setx MT5_BRIDGE_KEY "a-strong-secret-value"
```

4. Run the bridge locally:

```powershell
uvicorn mt5_bridge:app --host 0.0.0.0 --port 8000
```

5. Test endpoints locally (on the VPS):

```powershell
curl.exe -i -X GET "http://localhost:8000/health"
curl.exe -i -X POST "http://localhost:8000/order" -H "Content-Type: application/json" -H "x-api-key: a-strong-secret-value" -d '{"symbol":"EURUSD","side":"buy","volume":0.01}'
```

Security & Production
- Use a firewall or restrict access to the bridge port to your Next.js server IP.
- Consider binding to localhost and using an SSH tunnel between your Next.js host and the VPS.
- Configure the bridge as a Windows service using NSSM or Task Scheduler for auto-start and monitoring.

Next.js integration
- Add `app/lib/mt5Bridge.js` to call the bridge (example provided in repo).
- Add server-side API routes `/api/mt5/order`, `/api/mt5/positions`, `/api/mt5/history` that call the bridge and persist results.

Notes
- The MetaTrader5 Python package communicates with the locally running MetaTrader 5 terminal installed on the same Windows host. That terminal must be connected to a broker account for trading.
- Test thoroughly on demo accounts before using live accounts.
