FROM docker.io/denoland/deno:distroless

WORKDIR /app

COPY deno.json deno.lock ./
COPY src ./src

RUN ["deno", "cache", "src/index.ts"]

CMD ["task", "start"]
