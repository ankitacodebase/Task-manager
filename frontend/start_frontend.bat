@echo off
echo Starting React Vite Dev Server on http://127.0.0.1:5173 ...
cd /d "%~dp0"
npx vite --host 127.0.0.1 --port 5173
