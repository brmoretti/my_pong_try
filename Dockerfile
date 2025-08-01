# Use Node.js 18 LTS as the base image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the ports (1234 for client, 8080 for WebSocket server)
EXPOSE 1234 8080

# Set environment variables for production
ENV NODE_ENV=production
ENV HOST=0.0.0.0

# Command to run both client and server
CMD ["npm", "start"]
