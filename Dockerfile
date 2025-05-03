FROM node:22

WORKDIR /app
COPY package*.json ./
COPY . .

RUN npm install -g pnpm

RUN pnpm install
RUN pnpm run postinstall && pnpm run build


EXPOSE 3000

CMD pnpm run start