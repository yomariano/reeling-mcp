FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

ENV PORT=3005
ENV MCP_TRANSPORT=sse

EXPOSE 3005

CMD ["node", "bin/cli.js", "--sse", "--port", "3005"]
