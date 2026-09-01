FROM node:22-alpine

WORKDIR /app
COPY package.json server.js ./
COPY public ./public
COPY docs ./docs
COPY contracts ./contracts
COPY diagrams ./diagrams
COPY CRM-Architecture-Vision-MVP.docx ./CRM-Architecture-Vision-MVP.docx
RUN mkdir -p /app/data

ENV PORT=4173
EXPOSE 4173
VOLUME ["/app/data"]

CMD ["node", "server.js"]
