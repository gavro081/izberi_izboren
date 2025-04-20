# Use an official Node.js runtime as the base image
FROM node:22

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# build tailwind css
RUN npm run build:css

# Expose port 3000 for React
EXPOSE 3000

# Start the React development server
CMD ["npm", "run", "start"]