/**
 * Cloudflare Pages Function: POST /api/chat
 *
 * Proxies chat messages to Anthropic's Claude API.
 * Key is read from Cloudflare env var (ANTHROPIC_API_KEY or MBS_CLAUDE_API_KEY).
 * The browser never sees the key.
 */

interface Env {
  ANTHROPIC_API_KEY?: string;
  MBS_CLAUDE_API_KEY?: string;
  CLAUDE_API_KEY?: string;
}

const SYSTEM_PROMPT = [
  'You are the MBS Medical chat assistant. Give short, friendly, conversational answers in lowercase, matching the brand voice. Point patients to the right page.',
  "",
  'EMERGENCY: If anyone describes a medical emergency (chest pain, suicidal thoughts, severe bleeding, etc.) respond ONLY with: "if this is a medical emergency please call 911 or go to your nearest emergency room."',
  "",
  'ABOUT MBS: Veteran-owned cash-pay telehealth based in Florida. Serves Florida residents statewide. Cash pay means no insurance accepted. Same-week appointments available. Primary provider is David Hervig, PA-C (12 years U.S. Army). Team includes Julie Vera Rivas (NP), Dr. Eric Folkens (MD), Dr. Mark Dawson (MD gastroenterology), and Alex Anderson (operations).',
  "",
  'SERVICES (11 total): Primary Care, Medical Weight Loss (including GLP-1 like semaglutide and tirzepatide evaluation), Men\'s Health (including TRT), Women\'s Health (including HRT, PCOS, menopause), Mental Health (anxiety, depression, sleep, ADHD), Longevity & Performance (peptides, hormone optimization), Sexual Health (ED treatment for men and women), Hair & Dermatology (finasteride, minoxidil, skin conditions), Lab Testing, Lifestyle Medicine, Concierge Medicine.',
  "",
  'PAGES: / (home), /services/, /about/, /contact/, /tools/, /primary-care/, /weight-loss/, /mens-health/, /womens-health/, /mental-health/, /longevity/, /sexual-health/, /hair-dermatology/, /labs/, /lifestyle-medicine/, /concierge-medicine/.',
  "",
  "BOOKING: External booking portal at https://mbsmedical.practicebetter.io",
  "",
  'FORMAT: Respond ONLY with valid JSON in this exact shape: {"message":"1-2 sentences, lowercase","links":[{"label":"text","url":"/page/","external":false}]}. External Practice Better link should have external:true.',
  "",
  'RULES: Keep answers to 1-2 sentences. Include 1-3 relevant page links. Never give clinical advice or diagnose. Never make up prices or policies. For unknown topics, link to /contact/. Use lowercase to match brand voice.'
].join('\n');

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const body = await request.json<{ message?: string }>().catch(() => ({}));
    const userMessage = (body.message ?? '').trim();

    if (!userMessage || typeof userMessage !== 'string') {
      return Response.json({ error: 'empty message' }, { status: 400 });
    }
    if (userMessage.length > 500) {
      return Response.json({ error: 'message too long' }, { status: 400 });
    }

    const apiKey = env.ANTHROPIC_API_KEY || env.MBS_CLAUDE_API_KEY || env.CLAUDE_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: 'chat temporarily unavailable', details: 'missing api key in env' },
        { status: 503 }
      );
    }

    const anthropicResp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 400,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userMessage }]
      })
    });

    if (!anthropicResp.ok) {
      return Response.json(
        { error: 'chat unavailable', status: anthropicResp.status },
        { status: 503 }
      );
    }

    const data = await anthropicResp.json<any>();
    const raw = data?.content?.[0]?.text?.trim() ?? '';

    // Strip markdown code fences if the model decided to include them
    const cleaned = raw
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/, '')
      .trim();

    let parsed: { message?: string; links?: Array<{ label: string; url: string; external?: boolean }> } = {};
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      // Fallback: return the raw text as the message
      return Response.json({ message: cleaned, links: [] });
    }

    const safeLinks = (Array.isArray(parsed.links) ? parsed.links : [])
      .filter((l) => l && typeof l.label === 'string' && typeof l.url === 'string')
      .slice(0, 4)
      .map((l) => ({
        label: String(l.label).slice(0, 80),
        url: String(l.url).slice(0, 200),
        external: Boolean(l.external)
      }));

    return Response.json({
      message: String(parsed.message ?? cleaned).slice(0, 1000),
      links: safeLinks
    });
  } catch (err) {
    return Response.json(
      { error: 'chat unavailable', details: String(err) },
      { status: 500 }
    );
  }
};

export const onRequest: PagesFunction<Env> = async ({ request }) => {
  return Response.json({ error: 'method not allowed' }, { status: 405 });
};
