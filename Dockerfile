# Use a minimal base image with Node
FROM node:20

WORKDIR /app

# Copy files
COPY app/ .
# Install dependencies
RUN npm install

# Expose port and start app
EXPOSE 4567
CMD ["npm", "run", "start"]
