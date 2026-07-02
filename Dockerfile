# ---- Stage 1: Builder ----
# This stage has everything needed to install deps and compile TypeScript.
# None of this bulk ends up in the final image.
FROM node:20-alpine AS builder

RUN apk add --no-cache openssl

WORKDIR /app

# Copy only the manifest files first. Docker caches layers, so as long as
# these don't change, it won't re-run "npm install" on every build.
COPY package*.json ./
COPY prisma ./prisma

RUN npm install

# Now copy the rest of the source code.
COPY . .

# Generate the Prisma Client (needs schema.prisma, which we copied above)
# and compile TypeScript to JS in /app/dist.
RUN npx prisma generate
RUN npm run build

# ---- Stage 2: Production ----
# Start clean from a fresh, small base image.
FROM node:20-alpine AS production

RUN apk add --no-cache openssl

WORKDIR /app
ENV NODE_ENV=production

# Only copy what we need to run the app: package files, prisma schema,
# and the compiled output. No src/, no TypeScript, no dev tools.
COPY package*.json ./
COPY prisma ./prisma

# Install only production dependencies this time (smaller, faster).
RUN npm install --omit=dev

# Bring over the Prisma Client generated in the builder stage and the
# compiled JS output.
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/views ./dist/views

EXPOSE 4000

CMD ["node", "dist/server.js"]