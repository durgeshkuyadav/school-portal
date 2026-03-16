@echo off
echo ============================================
echo    SCHOOL PORTAL - AUTO FIX AND START
echo ============================================
echo.

echo [1/3] Fixing Frontend Dockerfile...
(
echo FROM node:20-alpine AS build
echo WORKDIR /app
echo COPY package.json ./
echo RUN npm install --legacy-peer-deps
echo COPY . .
echo RUN npm run build
echo.
echo FROM nginx:1.25-alpine
echo COPY --from=build /app/build /usr/share/nginx/html
echo COPY nginx.conf /etc/nginx/conf.d/default.conf
echo EXPOSE 80
echo CMD ["nginx", "-g", "daemon off;"]
) > frontend\Dockerfile
echo    Done!

echo [2/3] Creating .env file...
copy .env.example .env >nul 2>&1
echo    Done!

echo [3/3] Stopping old containers...
docker compose down >nul 2>&1
echo    Done!

echo.
echo ============================================
echo  Now starting all services...
echo  This will take 20-30 minutes first time!
echo  Just wait - do NOT close this window!
echo ============================================
echo.

docker compose up -d --build

echo.
echo ============================================
echo  DONE! Open browser and go to:
echo  http://localhost:3000
echo ============================================
pause
