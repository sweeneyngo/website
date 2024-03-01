# syntax = docker/dockerfile:1.4

# Adjust NODE_VERSION as desired
ARG NODE_VERSION=20.3.1
FROM node:${NODE_VERSION}-alpine AS base

WORKDIR /usr/src/app
ENV NODE_ENV=production


# Throw-away build stage to reduce size of final image
FROM base as build

# Install packages needed to build node modules
RUN apk update && \
    apk add --no-cache \
    python3 \
    pkgconf \
    build-base

# Install node modules
COPY --link package.json .
RUN pnpm install

# Copy source code
COPY --link . .

# Build application
RUN npm run build

# Remove development dependencies
RUN npm prune --production

# Final stage for app image
FROM base

# Copy built application
COPY --from=build /usr/src/app/dist /usr/src/app/dist

EXPOSE 3000
CMD [ "npm", "run", "preview" ]
