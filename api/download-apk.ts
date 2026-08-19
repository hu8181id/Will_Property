import type { VercelRequest, VercelResponse } from "@vercel/node";
import fs from "fs";
import path from "path";

export default function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const apkPath = path.join(process.cwd(), "client", "public", "downloads", "primedeal-admin.apk");
    if (!fs.existsSync(apkPath)) {
      return res.status(404).send("APK file not found on server.");
    }
    const stat = fs.statSync(apkPath);
    const fileBuffer = fs.readFileSync(apkPath);

    res.setHeader("Content-Type", "application/vnd.android.package-archive");
    res.setHeader("Content-Disposition", 'attachment; filename="primedeal-admin.apk"');
    res.setHeader("Content-Length", stat.size);
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).send(fileBuffer);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
