FROM node:24.9.0-alpine AS build

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

ARG VITE_SITE_URL=https://ozastra.com
ENV VITE_SITE_URL=$VITE_SITE_URL

RUN pnpm build

FROM node:24.9.0-alpine AS runtime

ENV HOST=0.0.0.0 \
    NODE_ENV=production \
    PORT=3000

WORKDIR /app

COPY --from=build --chown=node:node /app/.output ./.output

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/health').then((response) => { if (!response.ok) process.exit(1) }).catch(() => process.exit(1))"

CMD ["node", ".output/server/index.mjs"]
