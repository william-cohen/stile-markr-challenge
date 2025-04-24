# Use a minimal base image with Node
FROM node:20

WORKDIR /app

# Copy files
COPY package*.json ./
RUN npm install
COPY . .

# Expose port and start app
EXPOSE 3000
CMD ["npm", "run", "start"]
