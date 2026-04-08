interface Env {
  SESSIONS: KVNamespace;
  USAGE: DurableObjectNamespace;
  VESSEL_TEMPLATES: KVNamespace;
}

interface Session {
  id: string;
  vesselConfig: any;
  createdAt: number;
  lastAccessed: number;
  owner: string;
  isActive: boolean;
}

interface LaunchRequest {
  template?: string;
  vesselConfig?: any;
  customVessel?: string;
}

class UsageLimiter implements DurableObject {
  constructor(private state: DurableObjectState, private env: Env) {}

  async fetch(request: Request) {
    const url = new URL(request.url);
    const userId = request.headers.get("CF-Connecting-IP") || "anonymous";

    if (url.pathname === "/increment") {
      const today = new Date().toISOString().split("T")[0];
      const key = `usage:${userId}:${today}`;
      
      let count = (await this.state.storage.get<number>(key)) || 0;
      if (count >= 10) {
        return new Response(JSON.stringify({ error: "Daily limit exceeded" }), {
          status: 429,
          headers: { "Content-Type": "application/json" }
        });
      }
      
      count++;
      await this.state.storage.put(key, count);
      return new Response(JSON.stringify({ count, limit: 10 }));
    }

    return new Response("Not found", { status: 404 });
  }
}
const sh = {"Content-Security-Policy":"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; frame-ancestors 'none'","X-Frame-Options":"DENY"};
export default { async fetch(r: Request) { const u = new URL(r.url); if (u.pathname==='/health') return new Response(JSON.stringify({status:'ok'}),{headers:{'Content-Type':'application/json',...sh}}); return new Response(html,{headers:{'Content-Type':'text/html;charset=UTF-8',...sh}}); }};