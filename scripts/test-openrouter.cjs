const fs = require('fs');
const path = require('path');

function parseDotDevVars(file) {
  const out = {};
  if (!fs.existsSync(file)) return out;
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (m) {
      let v = m[2].trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      out[m[1]] = v;
    }
  }
  return out;
}

const env = parseDotDevVars(path.join(__dirname, '..', '.dev.vars'));
const url = (env.COACH_LLM_API_URL || '').trim();
const key = (env.COACH_LLM_API_KEY || '').trim();
const model = (env.COACH_LLM_MODEL || '').trim() || 'gpt-4o-mini';

if (!url || !key) {
  console.error('Falta COACH_LLM_API_URL o COACH_LLM_API_KEY en .dev.vars (raiz del proyecto)');
  process.exit(1);
}

(async () => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  const started = Date.now();
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: 'Eres un entrenador en espanol, responde breve.' },
          { role: 'user', content: 'Responde solo con la palabra OK.' },
        ],
        max_tokens: 220,
        temperature: 0.6,
      }),
      signal: controller.signal,
    });
    clearTimeout(timer);
    const text = await res.text();
    console.log('URL  :', url);
    console.log('MODEL:', model);
    console.log('TIME :', Date.now() - started, 'ms');
    console.log('STATUS:', res.status, res.statusText);
    console.log('BODY :', text.slice(0, 800));
  } catch (e) {
    clearTimeout(timer);
    console.error('ERROR:', e.name, e.message);
  }
})();