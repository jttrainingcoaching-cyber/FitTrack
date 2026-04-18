FROM node:24-alpine

WORKDIR /app

# Install frontend dependencies
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install

# Install backend dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm install

# Copy all source files
COPY . .

# Build the React frontend
RUN cd frontend && npm run build

# Start the server
CMD ["node", "backend/server.js"]
