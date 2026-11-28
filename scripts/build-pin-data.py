# Builds public/pin/ (PIN code and area lookups for checkout) from the All India Pincode Directory.
# Source: India Post, Department of Posts, via data.gov.in (GODL-India licence), republished at
# https://raw.githubusercontent.com/dropdevrahul/pincodes-india/main/pincode.csv
# Run: python3 -I scripts/build-pin-data.py pincode.csv public/pin
# p/<first two digits>.json: {pin: [district, state index, [post office names]]}
# w/<first three letters>.json: [[post office name, pin]] for every word of the name.
import csv,json,re,os,sys,collections
src,out=sys.argv[1],sys.argv[2]
states=['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Andaman and Nicobar Islands','Chandigarh','Dadra and Nagar Haveli and Daman and Diu','Delhi','Jammu and Kashmir','Ladakh','Lakshadweep','Puducherry']
states=sorted(states)
norm=lambda s:re.sub(r'[^a-z]','',s.lower().replace('&','and'))
smap={norm(s):i for i,s in enumerate(states)}
extra={'thedadraandnagarhavelianddamananddiu':'Dadra and Nagar Haveli and Daman and Diu','dadraandnagarhaveli':'Dadra and Nagar Haveli and Daman and Diu','damananddiu':'Dadra and Nagar Haveli and Daman and Diu','pondicherry':'Puducherry','orissa':'Odisha','chattisgarh':'Chhattisgarh','andamanandnicobarislands':'Andaman and Nicobar Islands','andamannicobarislands':'Andaman and Nicobar Islands','newdelhi':'Delhi','nctofdelhi':'Delhi'}
for k,v in extra.items(): smap.setdefault(k,states.index(v))
def title(s):
    s=s.strip().lower()
    s=re.sub(r"\b([a-z])",lambda m:m.group(1).upper(),s)
    return s
suffix=re.compile(r'\s*\b(B\.?\s?O|S\.?\s?O|H\.?\s?O|G\.?\s?P\.?\s?O|P\.?\s?O|E\.?\s?D\.?\s?S\.?\s?O|N\.?\s?S\.?\s?H)\.?\s*$',re.I)
pins=collections.defaultdict(lambda:[None,None,[]])
unknown=collections.Counter()
for r in csv.DictReader(open(src,encoding='utf-8',errors='replace')):
    pin=r['Pincode'].strip()
    if not re.fullmatch(r'[1-9]\d{5}',pin): continue
    st=smap.get(norm(r['StateName']))
    if st is None: unknown[r['StateName']]+=1; continue
    name=title(suffix.sub('',r['OfficeName'].strip()))
    name=re.sub(r'\s+',' ',name).strip()
    if not name: continue
    p=pins[pin]
    if p[0] is None: p[0]=title(r['District']);p[1]=st
    if name not in p[2]: p[2].append(name)
print('pins',len(pins),'offices',sum(len(p[2]) for p in pins.values()),'unknown states',dict(unknown))
os.makedirs(out+'/p',exist_ok=True);os.makedirs(out+'/w',exist_ok=True)
byp=collections.defaultdict(dict)
for pin,(d,s,offs) in pins.items(): byp[pin[:2]][pin]=[d,s,offs]
for k,v in byp.items(): json.dump(v,open(f'{out}/p/{k}.json','w'),separators=(',',':'),ensure_ascii=False)
byw=collections.defaultdict(list)
for pin,(d,s,offs) in pins.items():
    for o in offs:
        keys=set(w[:3] for w in re.findall(r'[a-z]{3,}',o.lower()))
        for k in keys: byw[k].append([o,pin])
for k,v in byw.items(): json.dump(v,open(f'{out}/w/{k}.json','w'),separators=(',',':'),ensure_ascii=False)
json.dump(states,open(f'{out}/states.json','w'))
