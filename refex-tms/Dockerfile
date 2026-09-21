# syntax=docker/dockerfile:1

FROM node:22-alpine AS web-build
WORKDIR /app
COPY package.json package-lock.json* ./
COPY apps/web/package.json apps/web/
COPY apps/api/package.json apps/api/
RUN npm install --workspace=apps/web --include-workspace-root
COPY apps/web apps/web
RUN npm run build -w apps/web

# Single Cloud Run service: Express /api + static React
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080
COPY package.json package-lock.json* ./
COPY apps/api/package.json apps/api/
RUN npm install --workspace=apps/api --include-workspace-root --omit=dev
COPY apps/api apps/api
COPY --from=web-build /app/apps/web/dist apps/web/dist
EXPOSE 8080
CMD ["node", "apps/api/src/index.js"]
