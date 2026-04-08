export default {
  async fetch(request, env) {
    // 1. Protection contre les accès non-autorisés (Méthode POST uniquement)
    if (request.method !== "POST") {
      return new Response("Accès restreint - Système AI Zero Trust", { status: 403 });
    }

    try {
      const body = await request.json();
      
      // Extraction du message : gère les messages directs et les mentions dans l'espace
      const userMessage = body.message?.text || "System Status Check";
      const userName = body.user?.displayName || "Ingénieur";

      // 2. Appel à l'IA la plus puissante (Llama 3) avec un "System Prompt" de haut niveau
      const aiResponse = await env.AI.run('@cf/meta/llama-3-8b-instruct', {
        messages: [
          { 
            role: "system", 
            content: `Tu es l'IA de contrôle du réseau Zero Trust (AI-Zero-Trust@serverweb3.xyz). 
            Tu assistes un ingénieur expert. Sois technique, précis, et propose des solutions réseau avancées.
            Utilise le contexte Proxmox et Tailscale si nécessaire.` 
          },
          { role: "user", content: userMessage }
        ]
      });

      const responseText = aiResponse.response;

      // 3. ENVOI AU WEBHOOK GOOGLE (Optionnel si tu veux doubler la réponse)
      // On utilise l'URL que tu as fournie pour assurer la livraison
      const webhookUrl = "https://chat.googleapis.com/v1/spaces/AAQABy_FpQQ/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=eMHsn3WKtgq3q7LGA7CyzOmxTqSEO-yWqsjD1HNrrUY";
      
      // On peut envoyer une notification asynchrone sans bloquer la réponse principale
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: `[LOGS]: IA a répondu à ${userName}` })
      });

      // 4. RÉPONSE DIRECTE AU CHAT (Format Google Chat API)
      return new Response(JSON.stringify({
        text: `🤖 **AI-Zero-Trust [${env.EMAIL_ID}]**\n\n${responseText}`,
        cardsV2: [{
          cardId: "statusCard",
          card: {
            header: { title: "Système de Communication IA", subtitle: "Edge Node: Cloudflare" },
            sections: [{ widgets: [{ textParagraph: { text: "<b>Status:</b> Sécurisé par Zero Trust" } }] }]
          }
        }]
      }), {
        headers: { "Content-Type": "application/json" }
      });

    } catch (err) {
      return new Response(JSON.stringify({ text: "⚠️ Erreur de traitement : " + err.message }), { status: 500 });
    }
  }
};
