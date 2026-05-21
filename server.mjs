import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { dirname, extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 4175);

const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8"
};

function getPath(url) {
  const pathname = new URL(url, `http://localhost:${port}`).pathname;
  const safePath = normalize(decodeURIComponent(pathname)).replace(/^(\.\.[/\\])+/, "");
  if (safePath === "/" || !extname(safePath)) {
    return join(root, "index.html");
  }
  return join(root, safePath);
}

createServer(async (request, response) => {
  try {
    const filePath = getPath(request.url || "/");
    const body = await readFile(filePath);
    response.writeHead(200, {
      "content-type": types[extname(filePath)] || "application/octet-stream"
    });
    response.end(body);
  } catch {
    const body = await readFile(join(root, "index.html"));
    response.writeHead(200, { "content-type": types[".html"] });
    response.end(body);
  }
}).listen(port, () => {
  console.log(`built.at prototype running at http://127.0.0.1:${port}`);
});
