// Server-side Meta Conversions API. Sends one Lead for a saved stock request. Meta only accepts contact details as
// SHA-256 hashes, so phone, email and address parts are normalised, hashed and sent only when analytics is on.
// The raw values stay in Taksh's own database. The event id is the request reference, the same id the browser
// Pixel uses, so Meta counts the pair once.
const sha256 = async text => [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)))].map(b => b.toString(16).padStart(2, '0')).join('');
const clean = value => String(value || '').trim().toLowerCase();
const letters = value => clean(value).replace(/[^\p{L}\p{N}]/gu, '');
export async function metaContactHashes(details = {}) {
  const out = {};
  const email = clean(details.email);
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) out.em = [await sha256(email)];
  const digits = String(details.mobile || '').replace(/\D/g, '').replace(/^0+/, '');
  const phone = digits.length === 10 ? `91${digits}` : digits.length === 12 && digits.startsWith('91') ? digits : '';
  if (phone) out.ph = [await sha256(phone)];
  const parts = clean(details.fullName).split(/\s+/).filter(Boolean);
  if (parts[0]) out.fn = [await sha256(letters(parts[0]))];
  if (parts.length > 1) out.ln = [await sha256(letters(parts[parts.length - 1]))];
  if (letters(details.city)) out.ct = [await sha256(letters(details.city))];
  if (letters(details.state)) out.st = [await sha256(letters(details.state))];
  const pin = String(details.pincode || '').replace(/\D/g, '');
  if (pin.length === 6) out.zp = [await sha256(pin)];
  out.country = [await sha256('in')];
  return out;
}
const cookieValue = (header, key) => {
  for (const part of String(header || '').split(';')) {
    const [name, ...rest] = part.trim().split('=');
    if (name === key) return decodeURIComponent(rest.join('=')).slice(0, 200);
  }
  return '';
};
export function metaLeadBody({reference, items = /** @type {{setNumber: string, quantity: number}[]} */ ([]), headers, now = Date.now(), testCode = '', contact = {}}) {
  const get = key => headers.get(key) || '';
  const cookies = get('cookie');
  const userData = {...contact, client_user_agent: get('user-agent').slice(0, 400)};
  const ip = get('cf-connecting-ip');
  if (ip) userData.client_ip_address = ip;
  const fbp = cookieValue(cookies, '_fbp'), fbc = cookieValue(cookies, '_fbc');
  if (fbp) userData.fbp = fbp;
  if (fbc) userData.fbc = fbc;
  const body = {data: [{
    event_name: 'Lead',
    event_time: Math.floor(now / 1000),
    event_id: reference,
    action_source: 'website',
    event_source_url: 'https://taksh.store/checkout',
    user_data: userData,
    custom_data: {content_type: 'product', content_ids: items.map(i => i.setNumber), contents: items.map(i => ({id: i.setNumber, quantity: i.quantity})), currency: 'INR'}
  }]};
  if (testCode) body.test_event_code = testCode;
  return body;
}
export async function sendMetaLead({pixelId, token, body, fetchImpl = fetch, timeoutMs = 2000}) {
  if (!pixelId || !token) return 'not_configured';
  try {
    const response = await fetchImpl(`https://graph.facebook.com/v21.0/${pixelId}/events`, {
      method: 'POST', headers: {'Content-Type': 'application/json', Authorization: `Bearer ${token}`},
      body: JSON.stringify(body), signal: AbortSignal.timeout(timeoutMs)
    });
    return response.ok ? 'sent' : `failed_${response.status}`;
  } catch { return 'failed_network'; }
}
