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

Prepare the Cloudflare **Free** zone before switching, after obtaining the full private Namecheap inventory. Compare every host record, TTL, mail/verification/CAA record and redirect. Cloudflare scanning alone is insufficient. Lower applicable Namecheap TTLs at least a day before the agreed switch. The owner must approve staging and then separately approve nameserver change. No nameservers are changed during preparation.

**Namecheap email forwarding stops after leaving its nameservers.** Recreate every recorded alias and destination (including catch-all if present) in free Cloudflare Email Routing; verify destinations privately, use the routing product's required MX/SPF records, and preserve unrelated TXT verification records. Do not blindly retain Namecheap forwarding MX/SPF as the final mail setup, or publish multiple SPF policies. Check each forwarding alias with a real authorised test after activation. No paid mailbox is required.

Recreate actual registrar URL redirects with free Cloudflare redirect rules and preserve their targets/status/query handling. Current read-only checks: apex HTTP redirects to HTTPS (302), apex HTTPS returns 200; `www.taksh.store` currently returns DNS ENOTFOUND. Therefore there is no working existing www redirect to claim preserved: prepare www → canonical HTTPS apex, as the owner explicitly requires both hosts to work. Keep application routes/copy unchanged.

Prepare the storefront Worker/custom-domain/TLS association and verify Cloudflare's handling of the existing Sites custom hostname before the switch. If releasing the old hostname is required, it is a cutover action under the second go/no-go, with the original generated Sites URL retained. Do not detach Sites now. Keep mail hostnames DNS-only where required. Domain renewal/registration transfer is outside this migration.

Rollback: restore the recorded old website target/authoritative settings as appropriate; Sites stays unchanged for14days after actual cutover. DNS propagation means rollback is not instantaneous. Save authoritative-zone changes privately with exact before/after values; do not assume the public A addresses reveal Sites' original CNAME.
