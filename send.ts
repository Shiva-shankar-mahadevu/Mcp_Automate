// send.ts (ESM, TypeScript)
import fs from "fs";
import path from "path";
import { google } from "googleapis";
import readline from "readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { lookup as mimeLookup } from "mime-types";

const SCOPES = ["https://www.googleapis.com/auth/gmail.send"];
const CREDENTIALS_PATH = "C:\\Users\\pp700\\OneDrive\\Desktop\\mcp_jerodha\\credentials.json"; // Desktop app JSON (with "installed")
const TOKEN_PATH = "C:\\Users\\pp700\\OneDrive\\Desktop\\mcp_jerodha\\token.json";
const INTERACTIVE_CONSENT=process.env.GMAIL_INTERACTIVE_CONSENT === "1";
export type Attachment = {
  filename?: string;
  path: string;
  contentType?: string;
};

function b64url(buf: Buffer) {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

// async function loadOAuthClient() {
//   if (!fs.existsSync(CREDENTIALS_PATH)) {
//     throw new Error(`Missing ${CREDENTIALS_PATH}. Create a Desktop OAuth client and download the JSON.`);
//   }
//   const raw = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf8"));
//   const cfg = raw.installed ?? raw.web;
//   if (!cfg) throw new Error("credentials.json must contain 'installed' (Desktop) or 'web'.");

//   const redirectUri = cfg.redirect_uris?.[0];
//   const oAuth2Client = new google.auth.OAuth2(cfg.client_id, cfg.client_secret, redirectUri);

//   if (fs.existsSync(TOKEN_PATH)) {
//     oAuth2Client.setCredentials(JSON.parse(fs.readFileSync(TOKEN_PATH, "utf8")));
//     return oAuth2Client;
//   }

//   // First-time consent
//   const authUrl = oAuth2Client.generateAuthUrl({ access_type: "offline", scope: SCOPES, prompt: "consent" });
//   console.log("\nAuthorize this app by visiting:\n", authUrl);
//   const rl = readline.createInterface({ input, output });
//   const code = (await rl.question("\nPaste the code here: ")).trim();
//   rl.close();
//   const { tokens } = await oAuth2Client.getToken(code);
//   oAuth2Client.setCredentials(tokens);
//   fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
//   console.log(`Saved tokens to ${TOKEN_PATH}`);
//   return oAuth2Client;
// }


//


async function loadOAuthClient() {
  console.error("[gmail] CREDS_PATH:", CREDENTIALS_PATH);
  console.error("[gmail] TOKEN_PATH:", TOKEN_PATH);
  console.error("[gmail] CWD:", process.cwd());

  if (!fs.existsSync(CREDENTIALS_PATH)) {
    throw new Error(`Missing credentials file at ${CREDENTIALS_PATH}. Set GOOGLE_APPLICATION_CREDENTIALS.`);
  }

  const raw = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf8"));
  const cfg = raw.installed ?? raw.web;
  if (!cfg) throw new Error("credentials.json must contain 'installed' or 'web'.");

  const redirectUri = cfg.redirect_uris?.[0];
  const oAuth2Client = new google.auth.OAuth2(cfg.client_id, cfg.client_secret, redirectUri);

  // Persist any new/rotated tokens automatically (incl. refreshed access tokens)
  oAuth2Client.on("tokens", (tokens) => {
    try {
      const current = fs.existsSync(TOKEN_PATH)
        ? JSON.parse(fs.readFileSync(TOKEN_PATH, "utf8"))
        : {};
      // Merge so we never drop an existing refresh_token
      const merged = { ...current, ...tokens };
      fs.mkdirSync(path.dirname(TOKEN_PATH), { recursive: true });
      fs.writeFileSync(TOKEN_PATH, JSON.stringify(merged, null, 2));
      console.error("[gmail] tokens updated; expiry:", merged.expiry_date);
    } catch (e) {
      console.error("[gmail] failed to write refreshed tokens:", e);
    }
  });

  // If we already have tokens, set them and we're done.
  if (fs.existsSync(TOKEN_PATH)) {
    const saved = JSON.parse(fs.readFileSync(TOKEN_PATH, "utf8"));
    oAuth2Client.setCredentials(saved);
    return oAuth2Client; // googleapis will auto-refresh using refresh_token
  }

  // First-time consent: request offline access so we get a refresh_token
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",    // << required for refresh_token
    prompt: "consent",         // << force returning it the first time
    scope: SCOPES,
  });

  if (!INTERACTIVE_CONSENT) {
    throw new Error([
      "No OAuth token found. Run once in a terminal with GMAIL_INTERACTIVE_CONSENT=1 to generate it.",
      "URL:", authUrl
    ].join("\n"));
  }

  console.log("\nAuthorize this app by visiting:\n", authUrl);
  const rl = readline.createInterface({ input, output });
  const code = (await rl.question("\nPaste the code here: ")).trim();
  rl.close();

  const { tokens } = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokens);
  fs.mkdirSync(path.dirname(TOKEN_PATH), { recursive: true });
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
  console.log(`Saved tokens (incl. refresh_token if provided) to ${TOKEN_PATH}`);

  return oAuth2Client;
}


/** Build MIME message (text/html + attachments) */
function buildMimeRaw(opts: {
  from: string;
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: Attachment[];
}) {
  const { from, subject, text, html } = opts;
  const toList = Array.isArray(opts.to) ? opts.to.join(", ") : opts.to;
  const atts = opts.attachments ?? [];

  // Simple single-part
  if (atts.length === 0) {
    const contentType = html ? `text/html; charset="UTF-8"` : `text/plain; charset="UTF-8"`;
    const body = html ?? text ?? "";
    const mimeMsg =
      `From: ${from}\r\n` +
      `To: ${toList}\r\n` +
      `Subject: ${subject}\r\n` +
      `MIME-Version: 1.0\r\n` +
      `Content-Type: ${contentType}\r\n\r\n` +
      body;
    return b64url(Buffer.from(mimeMsg));
  }

  // Multipart/mixed with attachments
  const boundary = "=_Part_" + Date.now().toString(36);
  let mimeMsg =
    `From: ${from}\r\n` +
    `To: ${toList}\r\n` +
    `Subject: ${subject}\r\n` +
    `MIME-Version: 1.0\r\n` +
    `Content-Type: multipart/mixed; boundary="${boundary}"\r\n\r\n`;

  const bodyPart = html ?? text ?? "";
  const bodyType = html ? `text/html; charset="UTF-8"` : `text/plain; charset="UTF-8"`;
  mimeMsg += `--${boundary}\r\nContent-Type: ${bodyType}\r\nContent-Transfer-Encoding: 7bit\r\n\r\n${bodyPart}\r\n`;

  for (const a of atts) {
    const filePath = path.resolve(a.path);
    const data = fs.readFileSync(filePath);
    const filename = a.filename ?? path.basename(filePath);
    const guessed = mimeLookup(filename);
    const ctype = a.contentType ?? (guessed || "application/octet-stream");

    mimeMsg +=
      `--${boundary}\r\n` +
      `Content-Type: ${ctype}\r\n` +
      `Content-Transfer-Encoding: base64\r\n` +
      `Content-Disposition: attachment; filename="${filename}"\r\n\r\n` +
      data.toString("base64") + `\r\n`;
  }

  mimeMsg += `--${boundary}--`;
  return b64url(Buffer.from(mimeMsg));
}

export async function sendEmail(opts: {
  from: string;
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: Attachment[];
}) {
  const auth = await loadOAuthClient();
  const gmail = google.gmail({ version: "v1", auth });
  const raw = buildMimeRaw(opts);
  const res = await gmail.users.messages.send({ userId: "me", requestBody: { raw } });
  return res.data; // { id, threadId, labelIds? }
}
