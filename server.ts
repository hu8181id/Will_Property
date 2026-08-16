import "dotenv/config";
import { createServer } from "node:http";
import fs from "node:fs";
import path from "node:path";
import express from "express";
import { createApp } from "./server/_core/app";
import { injectSeoMetadata } from "./server/seo";

const app = createApp();
const distPath = path.resolve(process.cwd(), "dist", "public");

if (!fs.existsSync(distPath)) {
  console.error(`[Vercel server] Build directory not found: ${distPath}`);
}

app.use(express.static(distPath));
app.use("*", async (req, res, next) => {
  try {
    const templatePath = path.join(distPath, "index.html");
    const template = await fs.promises.readFile(templatePath, "utf-8");
    const decoratedTemplate = await injectSeoMetadata(
      template,
      req.originalUrl,
      `${req.protocol}://${req.get("host")}`
    );
    res
      .status(200)
      .set({ "Content-Type": "text/html", "Cache-Control": "no-cache" })
      .send(decoratedTemplate);
  } catch (error) {
    next(error);
  }
});

const server = createServer(app);
const port = Number.parseInt(process.env.PORT ?? "3000", 10);

server.listen(port, () => {
  console.log(`[Primedeal server] Listening on port ${port}`);
});

export { app };
export default app;
