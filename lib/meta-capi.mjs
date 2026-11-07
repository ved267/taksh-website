// Server-side Meta Conversions API. Sends only a Lead for a saved stock request, with no name, phone or email,
// so it matches the promise that contact details never reach analytics. The event id is the request reference,
// the same id the browser Pixel uses, so Meta counts the pair once.
const cookieValue = (header, key) => {
  for (const part of String(header || '').split(';')) {
    const [name, ...rest] = part.trim().split('=');
    if (name === key) return decodeURIComponent(rest.join('=')).slice(0, 200);
  }
  return '';
};
export function metaLeadBody({reference, items = /** @type {{setNumber: string, quantity: number}[]} */ ([]), headers, now = Date.now(), testCode = ''}) {
  const get = key => headers.get(key) || '';
  const cookies = get('cookie');
  const userData = {client_user_agent: get('user-agent').slice(0, 400)};
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
