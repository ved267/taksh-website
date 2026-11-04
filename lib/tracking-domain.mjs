export function excludedFromTracking(hostname,userAgent='',internal=false,automated=false){return hostname!=='taksh.store'||internal||automated||/bot\b|crawler|spider|headless|preview/i.test(userAgent)}
// Public catalogue facts only. Never forward form fields or arbitrary event data.
export function eventPayload(name, data = {}, products = []) {
  const names = {ViewContent:'view_item', AddToCart:'add_to_cart', InitiateCheckout:'begin_checkout', Lead:'generate_lead', ViewCart:'view_cart', RemoveFromCart:'remove_from_cart',RequestFailure:'availability_request_error'};
  if (!names[name]) return null;
  const selections = Array.isArray(data.items) ? data.items : (data.content_ids || []).map(id => ({setNumber:id, quantity:name === 'AddToCart' ? data.num_items : 1}));
  const items = selections.flatMap(selection => {
    const p = products.find(p => p.slug === selection.slug || p.setNumber === selection.setNumber);
    if (!p) return [];
    const quantity = Math.min(3, Math.max(1, Number.isInteger(selection.quantity) ? selection.quantity : 1));
    const price=name==='Lead'&&data.saved===true&&Number.isFinite(selection.price)&&selection.price>=0?selection.price:p.price;
    return [{item_id:p.setNumber, item_name:p.name, item_brand:'Taksh', item_category:p.level, price, quantity}];
  });
  if (!items.length) return null;
  if(name==='RequestFailure')return {name:names[name],data:{failure_category:['validation','network','save','conflict','server'].includes(data.category)?data.category:'save',items}};
  const value = items.reduce((total, i) => total + i.price * i.quantity, 0);
  return {name:name==='Lead'&&data.contactable===false?'selection_saved':names[name], data:{currency:'INR', items, ...(name === 'Lead' ? {lead_type:'stock_update', selection_value:value} : {value})}};
}
export function safePage(value, products = []) {
  try {
    const u = new URL(value);
    const paths = ['/', '/sets', '/quality', '/help', '/help/contact', '/help/missing-piece', '/bag', '/checkout', '/returns', '/privacy',
      ...['chandrayaan-3','ram-mandir','map-of-india','yellow-taxi','nonsense',...products.map(p => p.slug)].map(s => `/sets/${s}`)];
    return `${u.origin}${paths.includes(u.pathname) ? u.pathname : '/'}`;
  } catch { return 'https://taksh.store/'; }
}
export function createTracker({products, send, load}) {
  let allowed = false, loaded = false, page = null, sentPage = null, view = null, sentView = null;
  const leads = new Set();
  function flush() {
    if (!allowed) return;
    if (page && page.url !== sentPage) {send('page_view', {page_location:page.url, page_title:page.title});sentPage = page.url;}
    if (view && view.data.items[0].item_id !== sentView) {send(view.name, view.data);sentView = view.data.items[0].item_id;}
  }
  return {
    consent(value) {allowed = value === true;if (allowed && !loaded) {loaded = true;load();}flush();},
    page(url, title) {
      const next = safePage(url, products);
      if (page?.url !== next) {view = null;sentView = null;}
      page = {url:next, title};flush();
    },
    event(name, data = {}) {
      const payload = eventPayload(name, data, products);
      if (!payload) return;
      if (name === 'ViewContent') {view = payload;flush();return;}
      if (!allowed) return;
      if (name === 'Lead') {if (data.reference && leads.has(data.reference)) return;if (data.reference) leads.add(data.reference);}
      send(payload.name, payload.data);
    }
  };
}
