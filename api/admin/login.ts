import { createAdminSession, getAdminCookieOptions, verifyAdminCredentials, ADMIN_SESSION_COOKIE } from "../../server/adminAuth";



function jsonResponse(body: unknown, status = 200, headers: HeadersInit = {}) {
  
  return new Response(JSON.stringify(body), {
    
    status,
    
    headers: {
      
      "content-type": "application/json; charset=utf-8",
      
      ...headers,
      
    },
    
  });
  
}



export default async function handler(request: Request): Promise<Response> {
  
  if (request.method !== "POST") {
    
    return jsonResponse({ error: "Method Not Allowed" }, 405, { Allow: "POST" });
    
  }
  

  
  let input: { username?: unknown; password?: unknown };
  
  try {
    
    input = (await request.json()) as { username?: unknown; password?: unknown };
    
  } catch {
    
    return jsonResponse({ error: "Format permintaan tidak valid." }, 400);
    
  }
  

  
  const username = typeof input.username === "string" ? input.username : "";
  
  const password = typeof input.password === "string" ? input.password : "";
  

  
  if (!verifyAdminCredentials(username, password)) {
    
    return jsonResponse({ error: "Username atau password admin salah." }, 401);
    
  }
  

  
  const session = createAdminSession(username.trim());
  
  const requestUrl = new URL(request.url);
  
  const cookieOptions = getAdminCookieOptions({
    
    protocol: requestUrl.protocol.replace(":", ""),
    
    headers: {
      
      "x-forwarded-proto": request.headers.get("x-forwarded-proto") ?? requestUrl.protocol.replace(":", ""),
      
    },
    
  });
  
  const cookie = [
    
    `${ADMIN_SESSION_COOKIE}=${encodeURIComponent(session)}`,
    
    `Max-Age=${Math.floor(cookieOptions.maxAge / 1000)}`,
    
    "Path=/",
    
    "HttpOnly",
    
    "SameSite=Lax",
    
    cookieOptions.secure ? "Secure" : "",
    
  ]
  
    .filter(Boolean)
  
    .join("; ");
  

  
  return jsonResponse({ ok: true }, 200, { "set-cookie": cookie });
  
}
















































