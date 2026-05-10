FROM node:22-slim

# 1. Enable pnpm (fixed version to avoid breaking changes from pnpm 11)
RUN corepack enable && corepack prepare pnpm@10.28.0 --activate

WORKDIR /app

# 2. Copy configuration files FIRST
# This allows Docker to use cache and not download everything again if you only change the code
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# 3. Install dependencies
ENV CI=true
RUN pnpm install --frozen-lockfile

# 4. Copy the remaining code
COPY . .

# 5. Build
RUN pnpm build

EXPOSE 3000

CMD ["./entrypoint.sh"]