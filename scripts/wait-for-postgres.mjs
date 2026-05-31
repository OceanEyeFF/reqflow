import net from "node:net";

const host = process.env.POSTGRES_HOST || "127.0.0.1";
const port = Number.parseInt(process.env.POSTGRES_PORT || "5432", 10);
const timeoutMs = Number.parseInt(process.env.POSTGRES_WAIT_TIMEOUT_MS || "60000", 10);
const intervalMs = Number.parseInt(process.env.POSTGRES_WAIT_INTERVAL_MS || "1000", 10);
const startedAt = Date.now();

if (!Number.isInteger(port) || port <= 0) {
  throw new Error(`Invalid POSTGRES_PORT: ${process.env.POSTGRES_PORT}`);
}

function tryConnect() {
  const socket = net.createConnection({ host, port });
  socket.setTimeout(2000);

  socket.once("connect", () => {
    socket.end();
    console.log(`PostgreSQL TCP endpoint is ready at ${host}:${port}`);
  });

  socket.once("timeout", () => {
    socket.destroy();
    retry();
  });

  socket.once("error", () => {
    retry();
  });
}

function retry() {
  if (Date.now() - startedAt >= timeoutMs) {
    console.error(`Timed out waiting for PostgreSQL TCP endpoint at ${host}:${port}`);
    process.exit(1);
  }
  setTimeout(tryConnect, intervalMs);
}

tryConnect();
