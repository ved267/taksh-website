/** @OnlyCurrentDoc */
const TAKSH_SYNC = Object.freeze({
  spreadsheetId: '1PP8TvtPv5nD9XAbedCjQ7woxrjMu6G0ygUWRgfol9X0',
  sheetName: 'Customer requests',
  endpoint: 'https://taksh.store/api/integrations/customer-sheet',
  email: 'bengani.devansh2004@gmail.com'
});

function setupTakshSync() {
  syncTakshRequests();
  if (!ScriptApp.getProjectTriggers().some(t => t.getHandlerFunction() === 'syncTakshRequests')) {
    ScriptApp.newTrigger('syncTakshRequests').timeBased().everyMinutes(5).create();
  }
}

function syncTakshRequests() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(1000)) return;
  let sheet;
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss || ss.getId() !== TAKSH_SYNC.spreadsheetId) throw new Error('Open the correct customer spreadsheet.');
    sheet = ss.getSheetByName(TAKSH_SYNC.sheetName);
    if (!sheet) throw new Error('The Customer requests tab is missing.');
    const props = PropertiesService.getScriptProperties();
    const key = props.getProperty('TAKSH_SYNC_KEY');
    if (!key || !/^[a-f0-9]{64}$/.test(key)) throw new Error('Add the private sync key in Script Properties.');
    const initialImport = props.getProperty('INITIAL_IMPORT_DONE') !== 'yes';
    let more = true, syncedCount = 0;
    let state=JSON.parse(props.getProperty('SYNC_STATE')||'null')||{cursor:JSON.parse(props.getProperty('CURSOR')||'null'),pending:Number(props.getProperty('PENDING_ALERT_COUNT')||0),staged:null};
    for (let page = 0; page < 5 && more; page++) {
      const cursor = state.cursor;
      const response = UrlFetchApp.fetch(TAKSH_SYNC.endpoint, {
        method: 'post', contentType: 'application/json',
        headers: {Authorization: 'Bearer ' + key},
        payload: JSON.stringify({cursor}), muteHttpExceptions: true, followRedirects: false
      });
      if (response.getResponseCode() !== 200) throw new Error('Taksh returned HTTP ' + response.getResponseCode() + '. The next sync will retry.');
      const data = JSON.parse(response.getContentText());
      if (!Array.isArray(data.requests) || data.requests.length > 100) throw new Error('Unexpected request data.');
      // Persist the alert plan before any Sheet writes, so a partial write can retry.
      if(!state.staged){const refs=new Set(sheet.getRange(5,13,sheet.getMaxRows()-4,1).getValues().map(r=>String(r[0])));state.staged={after:data.nextCursor,refs:data.requests.map(r=>r.reference),count:initialImport?0:data.requests.filter(r=>!r.isTest&&!refs.has(r.reference)).length};props.setProperty('SYNC_STATE',JSON.stringify(state));}
      if(JSON.stringify(state.staged.after)!==JSON.stringify(data.nextCursor)){const planned=new Set(state.staged.refs);data.requests=data.requests.filter(r=>planned.has(r.reference));data.nextCursor=state.staged.after;data.hasMore=true;}
      applyRequests_(sheet, data.requests);
      syncedCount += data.requests.length;
      SpreadsheetApp.flush();
      state.pending+=state.staged.count;state.cursor=data.nextCursor;state.staged=null;
      props.setProperty('SYNC_STATE',JSON.stringify(state));
      props.setProperties({CURSOR:JSON.stringify(state.cursor),PENDING_ALERT_COUNT:String(state.pending)});
      more = data.hasMore === true;
    }
    if (initialImport && !more) props.setProperty('INITIAL_IMPORT_DONE', 'yes');
    reportTakshState_({action:'ack',count:syncedCount}, key);
    let alertsPending = state.pending > 0;
    const elapsed = Date.now() - Number(props.getProperty('LAST_ALERT_AT') || 0);
    if (alertsPending && elapsed >= 15 * 60 * 1000 && MailApp.getRemainingDailyQuota() > 0) {
      try {
        const count = state.pending;
        MailApp.sendEmail({to: TAKSH_SYNC.email, subject: 'Taksh: ' + count + ' new customer request' + (count === 1 ? '' : 's'),
          body: count + ' new stock-update request' + (count === 1 ? ' is' : 's are') + ' saved in your private customer Sheet. No payment has been collected.\n\n' + ss.getUrl()});
        state.pending=0;props.setProperty('SYNC_STATE',JSON.stringify(state));
        props.setProperties({PENDING_ALERT_COUNT: '0', LAST_ALERT_AT: String(Date.now())});
        alertsPending = false;
      } catch (_) { /* Keep the alert count for a later attempt. */ }
    }
    sheet.getRange('A3').setValue('Last synced: ' + Utilities.formatDate(new Date(), 'Asia/Kolkata', "d MMM yyyy, HH:mm 'IST'") + (alertsPending ? '. Email alert pending.' : ''));
  } catch (error) {
    if (sheet) sheet.getRange('A3').setValue('Sync needs attention: ' + error.message);
    try { reportTakshState_({action:'failure',count:0,category:'sheet'},PropertiesService.getScriptProperties().getProperty('TAKSH_SYNC_KEY')); } catch (_) {}
    throw error;
  } finally { lock.releaseLock(); }
}

function applyRequests_(sheet, requests) {
  const refs = sheet.getRange(5, 13, sheet.getMaxRows() - 4, 1).getValues();
  const existing = new Map();
  let nextRow = 5;
  refs.forEach((cells, i) => {
    if (!cells[0]) return;
    const ref = String(cells[0]);
    if (existing.has(ref)) throw new Error('Duplicate request reference: ' + ref);
    if (i + 5 === sheet.getMaxRows()) throw new Error('Leave the final table row empty so more space can be added.');
    existing.set(ref, i + 5); nextRow = Math.max(nextRow, i + 6);
  });
  const writes = [];let newCustomerCount=0;
  for (const request of requests) {
    if(request.isTest)continue;
    if (!Array.isArray(request.values) || request.values.length !== 15 || request.values[12] !== request.reference) throw new Error('Unexpected customer columns.');
    let row = existing.get(request.reference);
    if (!row) {
      if (nextRow > sheet.getMaxRows() - 5) sheet.insertRowsBefore(sheet.getMaxRows(), 500);
      row = nextRow++; existing.set(request.reference, row);
      sheet.getRange(row, 16).setValue('New');
      if (!request.isTest) newCustomerCount++;
    }
    const values = request.values.slice();
    values[11] = new Date(values[11]);
    if (!Number.isFinite(values[11].getTime())) throw new Error('Invalid submitted date.');
    writes.push({row,values});
  }
  writes.sort((a,b)=>a.row-b.row);
  for(let i=0;i<writes.length;){let end=i+1;while(end<writes.length&&writes[end].row===writes[end-1].row+1)end++;
    const first=writes[i].row,count=end-i;
    sheet.getRange(first,2,count,1).setNumberFormat('@');sheet.getRange(first,9,count,1).setNumberFormat('@');sheet.getRange(first,12,count,1).setNumberFormat('dd mmm yyyy hh:mm');
    sheet.getRange(first,1,count,15).setValues(writes.slice(i,end).map(w=>w.values));i=end;
  }
  return newCustomerCount;
}

function reportTakshState_(payload,key){
 const response=UrlFetchApp.fetch(TAKSH_SYNC.endpoint,{method:'post',contentType:'application/json',headers:{Authorization:'Bearer '+key},payload:JSON.stringify(payload),muteHttpExceptions:true,followRedirects:false});
 if(response.getResponseCode()!==200||JSON.parse(response.getContentText()).recorded!==true)throw new Error('Sync acknowledgement failed. The next sync will retry safely.');
}
