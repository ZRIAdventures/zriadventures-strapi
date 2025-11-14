# Development Dockerfile for Strapi
FROM node:22-alpine

# Install dependencies for sharp and development tools
RUN apk update && apk add --no-cache \
    build-base \
    gcc \
    autoconf \
    automake \
    zlib-dev \
    libpng-dev \
    nasm \
    bash \
    vips-dev \
    git

ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}

WORKDIR /opt/

# Copy package files
COPY package.json yarn.lock ./

# Install node-gyp globally
RUN yarn global add node-gyp

# Install all dependencies (including dev dependencies)
RUN yarn config set network-timeout 600000 -g && yarn install

# Set PATH
ENV PATH=/opt/node_modules/.bin:$PATH

WORKDIR /opt/app

# Copy application files
COPY . .

# Set ownership
RUN chown -R node:node /opt/app

# Switch to non-root user
USER node

# Build admin panel
RUN ["yarn", "build"]

# Expose Strapi port
EXPOSE 1337

# Start Strapi in development mode
CMD ["yarn", "develop"]
