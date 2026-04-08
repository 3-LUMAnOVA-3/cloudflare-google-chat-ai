export default {
  async fetch(request, env) {
    // 1. GESTION DU HANDSHAKE GOOGLE (Pour que Google Chat puisse nous parler)
    if (request.method === "POST") {
      const body = await request.json().catch(() => ({}));
      
      // Si Google nous envoie un message, on l'identifie
      const userMessage = body.message?.text || "Status Check";
      const userName = body.user?.displayName || "Ingénieur";

      // 2. APPEL IA (Llama 3)
      try {
        const aiResponse = await env.AI.run('@cf/meta/llama-3-8b-instruct', {
          messages: [
            { 
              role: "system", 
              content: `Identité : AI-Zero-Trust. Expert en sécurité post-quantique et réseaux Proxmox/Tailscale. Tu réponds à l'ingénieur ${userName}.` 
            },
            { role: "user", content: userMessage }
          ]
        });

        // 3. RÉPONSE SÉCURISÉE VERS GOOGLE CHAT
        return new Response(JSON.stringify({
          text: `🛡️ **Quantum Sentinel [SÉCURISÉ]**\n\n${aiResponse.response}`,
          cardsV2: [{
            cardId: "authInfo",
            card: {
              header: { title: "Auth: Cloudflare Access Verified", subtitle: `Audience: ${env.ACCESS_AUDIENCE.substring(0,8)}...` }
            }
          }]
        }), {
          headers: { "Content-Type": "application/json" }
        });

      } catch (err) {
        return new Response(JSON.stringify({ text: "⚠️ Erreur IA : " + err.message }), { status: 500 });
      }
    }

    // 4. RÉPONSE POUR LES NAVIGATEURS (Si tu visites l'URL directement)
    return new Response("🚀 Agent AI-Zero-Trust en ligne. Accès restreint par Cloudflare Access.", {
      headers: { "Content-Type": "text/plain" }
    });
  }
};

