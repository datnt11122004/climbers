# Base Image for the Frontend Next.js Application Docker image
FROM node:18-alpine AS build

# Build arguments for NEXT_PUBLIC env vars (baked in at build time)
ARG NEXT_PUBLIC_TELEGRAM_BOT_NAME=${NEXT_PUBLIC_TELEGRAM_BOT_NAME}
ARG NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Set the working directory for the Next.js application
WORKDIR /app

# Copy the package.json and package-lock.json files to the container
COPY package.json ./

# Generate .env.production from build args
RUN echo "NEXT_PUBLIC_TELEGRAM_BOT_NAME=${NEXT_PUBLIC_TELEGRAM_BOT_NAME}" > .env.production && \
    echo "NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}" >> .env.production

# Copy the tsconfig.json file to the container
COPY tsconfig.json ./
# Install ALL dependencies (including devDependencies)
RUN npm install
RUN npm install --save-dev ignore-loader
# Copy all the application files to the working directory
COPY . .

# Run the translation script
# RUN npm run trans || true

# Build the Next.js application
RUN npm run build

# Use a minimal Node.js image to serve the application
FROM node:18-alpine

# Set the working directory for the Next.js application container
WORKDIR /app

# Copy the package.json and package-lock.json files to the container
COPY package.json ./

# Copy the .env file to the container
# COPY .env ./

# Copy the tsconfig.json file to the container
COPY tsconfig.json ./

# Install only production dependencies
RUN npm install --production

# Copy the build output and static files from the previous stage
COPY --from=build /app/.next /app/.next
COPY --from=build /app/public /app/public

# Expose the port that the Next.js application will run on
EXPOSE 3000

# Command to start the Next.js application Docker container
CMD ["npm", "start"]
