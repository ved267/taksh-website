# DNS inventory — no cutover authorised

Read-only public lookup 4 November2026. taksh.store is **not** currently listed in the owner's Cloudflare account zones. No DNS, nameserver or email routing changes have been made.

| Record | Observed public answer |
| --- | --- |
| taksh.store A | 172.66.3.26; 162.159.143.30 |
| taksh.store AAAA | No answer |
| taksh.store CNAME | No answer (flattened/proxied hosting can hide its origin) |
| NS | dns1.registrar-servers.com; dns2.registrar-servers.com |
| MX | 10 eforward1.registrar-servers.com; 10 eforward2.registrar-servers.com; 10 eforward3.registrar-servers.com; 15 eforward4.registrar-servers.com; 20 eforward5.registrar-servers.com |
| TXT | v=spf1 include:spf.efwd.registrar-servers.com ~all |
| CAA | No answer |

This is an apex public snapshot, **not a complete registrar-zone export**. It does not discover unknown subdomains, hidden origin targets, mail verification records or registrar forwarding rules. Obtain the current full zone/forwarding inventory privately from the registrar before changing authoritative DNS. Record original targets and TTLs. Cloudflare scanning alone is not proof that all records were copied.

After staging approval only: add/verify the Cloudflare Free zone, compare every existing record including mail/verification/CAA, preserve registrar forwarding, then prepare the minimal apex/www Worker custom-domain change. Keep mail hostnames DNS-only where the mail provider requires it. Verify website, www handling, TLS, MX and forwarding after activation. Never remove unrelated records. Domain renewal/registration transfer is not part of this migration.

Rollback: restore the recorded old website target/authoritative settings as appropriate; Sites stays unchanged for14days after actual cutover. DNS propagation means rollback is not instantaneous. Save authoritative-zone changes privately with exact before/after values; do not assume the public A addresses reveal Sites' original CNAME.
