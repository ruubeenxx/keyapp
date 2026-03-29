// Cloudflare Worker — Proxy para la API de Anthropic
// Despliégalo en https://workers.cloudflare.com (gratis)

export default {
  async fetch(request) {
    // Maneja el preflight de CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': 'https://ruubeenxx.github.io',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, x-api-key, anthropic-version',
        }
      })
    }

    // Solo acepta POST
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 })
    }

    try {
      const body = await request.json()

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY, // Variable de entorno en Cloudflare
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify(body)
      })

      const data = await response.json()

      return new Response(JSON.stringify(data), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'https://ruubeenxx.github.io',
        }
      })
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'https://ruubeenxx.github.io',
        }
      })
    }
  }
}
