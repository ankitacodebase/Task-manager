@echo off
echo Starting FastAPI Uvicorn Server on http://127.0.0.1:8000 ...
cd /d "%~dp0"
".venv\Scripts\uvicorn.exe" app.main:app --host 127.0.0.1 --port 8000 --reload
