# Use a specific Node version that satisfies your dependencies
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package files first (to leverage Docker layer caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the project
COPY . .

# Build the project
RUN npm run build

# Use a lightweight server to serve the static files
RUN npm install -g serve
CMD ["serve", "-s", "dist", "-l", "80"]