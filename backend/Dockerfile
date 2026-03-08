FROM node:20-slim

# Install dependencies
RUN corepack enable
RUN apt update && apt install -y git

# Set the working directory
WORKDIR /app

# Install typescript
RUN npm install -g typescript

# Copy package.json to the working directory
COPY package.json ./

# Install dependencies using pnpm
RUN pnpm install

# Copy the rest of the application files
COPY . .

# Generate Prisma client (dummy DATABASE_URL for build-time only)
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
RUN pnpm prisma:generate

# Build the application
RUN pnpm build

# Expose the application port
EXPOSE 3000

# Start the application with the command
CMD ["/bin/sh", "-c", "pnpm prisma:deploy && pnpm start:prod"]
