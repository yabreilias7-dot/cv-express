// Créateur de CV Express - serveur sans dépendance (Node 18+)
// Variables Render : ADMIN_PASSWORD, CHARIOW_URL (lien de ton produit Chariow)
const http = require('http');
const crypto = require('crypto');

const PW = process.env.ADMIN_PASSWORD || '';
const BUY = process.env.CHARIOW_URL || '#';

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const eq = (a, b) => { const A = Buffer.from(String(a)), B = Buffer.from(String(b)); return A.length === B.length && crypto.timingSafeEqual(A, B); };
const keyFor = n => String(n).padStart(4, '0') + '-' + crypto.createHmac('sha256', PW + '|key').update(String(n)).digest('hex').slice(0, 8).toUpperCase();
const keyOk = k => { k = String(k || '').trim().toUpperCase(); const m = /^(\d{1,6})-[0-9A-F]{8}$/.exec(k); return !!m && eq(keyFor(parseInt(m[1], 10)), k); };

// ---------- Modèle de CV (le texte réel n'est jamais envoyé avant le code) ----------
function cv(d, masked) {
  const cut = (k, n) => String(d && d[k] || '').slice(0, n);
  const f = (k, n) => { const v = esc(cut(k, n)); return masked ? v.replace(/[^\s,.\n]/g, 'x') : v; };
  const lines = (k) => f(k, 1500).split('\n').filter(x => x.trim()).map(x => '<li>' + x + '</li>').join('');
  const chips = f('comp', 600).split(',').filter(x => x.trim()).map(x => '<span>' + x.trim() + '</span>').join('');
  const contact = [f('tel', 40), f('email', 80), f('ville', 80)].filter(Boolean).join(' &nbsp;|&nbsp; ');
  const sec = (t, body) => body ? '<h3>' + t + '</h3>' + body : '';
  return '<div class="box' + (masked ? ' mk' : '') + '"><div class="cv"><header><h2>' + (f('nom', 100) || 'Nom et prénom') + '</h2>' +
    '<div class="t">' + f('titre', 100) + '</div><div class="c">' + contact + '</div></header>' +
    sec('Profil', f('profil', 800) && '<p>' + f('profil', 800) + '</p>') +
    sec('Expériences', lines('exp') && '<ul>' + lines('exp') + '</ul>') +
    sec('Formation', lines('form') && '<ul>' + lines('form') + '</ul>') +
    sec('Compétences', chips && '<div class="chips">' + chips + '</div>') +
    '</div><div class="wm">APERÇU – NON PAYÉ</div></div>';
}

// ---------- Pages ----------
const CSS = `:root{--ink:#14213d;--bg:#f3f5fa;--mut:#5b6679;--bd:#d5dbe8;--y:#ffcc00}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.5 system-ui,sans-serif}
.wrap{max-width:820px;margin:0 auto;padding:16px}h1{font:700 26px/1.2 Georgia,serif;margin:8px 0 4px}
.sub{color:var(--mut);margin:0 0 16px}.card{background:#fff;border:1px solid var(--bd);border-radius:12px;padding:16px;margin-bottom:16px}
label{display:block;font-weight:600;font-size:14px;margin:14px 0 4px}label small{font-weight:400;color:var(--mut)}
input,textarea{width:100%;font:inherit;padding:10px;border:1px solid var(--bd);border-radius:8px;background:#fff;color:var(--ink)}
textarea{min-height:84px;resize:vertical}:focus-visible{outline:3px solid var(--y);outline-offset:1px}
button,.btn{display:inline-block;background:var(--y);color:var(--ink);font:700 16px system-ui;border:0;border-radius:8px;padding:12px 18px;text-decoration:none;cursor:pointer;margin-top:10px}
.hint{color:var(--mut);font-size:14px;margin:6px 0 0}.err{color:#b00020;font-weight:600}
.box{position:relative}.cv{background:#fff;color:#1c2333;max-width:794px;margin:0 auto;border:1px solid var(--bd);font:14px/1.45 Georgia,serif}
.cv header{background:var(--ink);color:#fff;padding:26px 28px}.cv h2{margin:0;font-size:28px;line-height:1.15}
.cv .t{font-size:17px;opacity:.92;margin-top:2px}.cv .c{margin-top:10px;font-size:13px;opacity:.9}
.cv h3{color:var(--ink);font-size:15px;border-bottom:2px solid var(--ink);padding-bottom:2px;margin:18px 28px 6px}
.cv ul{margin:0;padding:0 28px 0 46px}.cv li{margin:3px 0}.cv p{margin:0;padding:0 28px;white-space:pre-line}
.cv .chips{padding:0 28px 22px}.cv .chips span{display:inline-block;border:1px solid var(--ink);border-radius:14px;padding:1px 10px;margin:2px 4px 2px 0}
.wm{display:none}.mk .cv{filter:blur(2.5px);user-select:none;pointer-events:none}
.mk .wm{display:flex;position:absolute;inset:0;align-items:center;justify-content:center;font:700 24px system-ui;color:#b00020;transform:rotate(-18deg);text-align:center}
@media(max-width:520px){.cv header{padding:20px}.cv h3{margin:16px 20px 6px}.cv ul{padding:0 20px 0 38px}.cv p,.cv .chips{padding:0 20px}}
@media print{body *{visibility:hidden}#pv,#pv *{visibility:visible}#pv{position:absolute;left:0;top:0;width:100%}.cv{border:0}@page{size:A4;margin:0}body{background:#fff}}`;

const HOME = `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Créateur de CV Express</title><style>${CSS}</style></head><body><div class="wrap">
<h1>Crée ton CV en 5 minutes</h1><p class="sub">Remplis les cases. L’aperçu se construit en dessous.</p>
<div class="card">
<label for="nom">Nom et prénom</label><input id="nom" placeholder="Ex. : Awa Ouédraogo" autocomplete="name">
<label for="titre">Métier ou poste visé</label><input id="titre" placeholder="Ex. : Secrétaire comptable">
<label for="tel">Téléphone</label><input id="tel" type="tel" placeholder="Ex. : 70 00 00 00">
<label for="email">Email</label><input id="email" type="email" placeholder="Ex. : awa@email.com">
<label for="ville">Ville</label><input id="ville" placeholder="Ex. : Ouagadougou, Burkina Faso">
<label for="profil">Présentation <small>(2 ou 3 phrases sur toi)</small></label><textarea id="profil" placeholder="Ex. : Jeune diplômée sérieuse et organisée, à la recherche d’un poste en comptabilité."></textarea>
<label for="exp">Expériences <small>(une par ligne)</small></label><textarea id="exp" placeholder="Stagiaire comptable – Société Faso, 2024 (3 mois)"></textarea>
<label for="form">Formation <small>(une par ligne)</small></label><textarea id="form" placeholder="Licence en gestion – Université de Ouagadougou, 2024"></textarea>
<label for="comp">Compétences <small>(sépare par des virgules)</small></label><textarea id="comp" placeholder="Excel, Word, Comptabilité, Travail en équipe"></textarea>
</div>
<div id="pv">__PREVIEW__</div>
<div class="card" id="pay"><h1 style="font-size:20px">Obtenir mon CV</h1>
<p>1. Touche le bouton et paie sur la page Chariow. Tu reçois ton code tout de suite.</p>
<a class="btn" href="__BUY__" target="_blank" rel="noopener">Acheter mon code</a>
<p>2. Reviens ici et colle ton code.</p>
<label for="code">Code reçu</label><input id="code" placeholder="Ex. : 0012-A1B2C3D4" autocapitalize="characters">
<button onclick="unlock()">Débloquer mon CV</button><p class="err" id="msg" role="alert"></p></div>
<div class="card" id="paid" hidden><p>Ton CV est prêt. Tu peux encore corriger les cases ci-dessus.</p><button onclick="window.print()">Télécharger en PDF</button>
<p class="hint">Dans la fenêtre qui s’ouvre, choisis « Enregistrer au format PDF ».</p></div>
</div><script>
var $=function(i){return document.getElementById(i)},F=['nom','titre','tel','email','ville','profil','exp','form','comp'],ok='',t;
function data(){var d={};F.forEach(function(k){d[k]=$(k).value});return d}
function post(u,b){return fetch(u,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b)}).then(function(r){return r.json()})}
function prev(){clearTimeout(t);t=setTimeout(function(){
 (ok?post('/cv',{code:ok,data:data()}):post('/preview',data())).then(function(j){if(j.html)$('pv').innerHTML=j.html}).catch(function(){})},400)}
function unlock(){var c=$('code').value.trim().toUpperCase();$('msg').textContent='';
 post('/cv',{code:c,data:data()}).then(function(j){if(j.html){ok=c;$('pv').innerHTML=j.html;$('pay').hidden=true;$('paid').hidden=false}else $('msg').textContent='Code incorrect. Vérifie-le et réessaie.'})
 .catch(function(){$('msg').textContent='Connexion impossible. Réessaie.'})}
F.forEach(function(k){$(k).addEventListener('input',prev)});
</script></body></html>`;

const ADMIN = `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Admin</title><style>${CSS}</style></head><body><div class="wrap"><h1>Générer des codes</h1>
<p class="sub">Copie les codes, puis colle-les dans le stock de clés de ton produit Chariow.</p><div class="card">
<label for="pw">Mot de passe</label><input id="pw" type="password">
<label for="from">Premier numéro</label><input id="from" type="number" value="1" min="1">
<label for="n">Nombre de codes <small>(200 maximum)</small></label><input id="n" type="number" value="50" min="1" max="200">
<button onclick="go()">Générer</button><p class="err" id="e" role="alert"></p>
<textarea id="out" rows="10" readonly style="margin-top:12px"></textarea></div></div>
<script>function go(){var $=function(i){return document.getElementById(i)};$('e').textContent='';fetch('/admin/keys',{method:'POST',headers:{'Content-Type':'application/json'},
body:JSON.stringify({pw:$('pw').value,from:+$('from').value,n:+$('n').value})}).then(function(r){return r.json()})
.then(function(j){if(j.keys){$('out').value=j.keys.join('\n');$('from').value=(+$('from').value)+j.keys.length}else{$('out').value='';$('e').textContent=j.error||'Erreur'}})}</script></body></html>`;

// ---------- Serveur ----------
const fails = {};
const body = req => new Promise(r => { let s = ''; req.on('data', c => { s += c; if (s.length > 20000) req.destroy(); }); req.on('end', () => { try { r(JSON.parse(s)); } catch (e) { r({}); } }); });
const send = (res, code, type, data) => { res.writeHead(code, { 'Content-Type': type + '; charset=utf-8', 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'no-store' }); res.end(data); };
const json = (res, code, o) => send(res, code, 'application/json', JSON.stringify(o));

http.createServer(async (req, res) => {
  try {
    const url = req.url.split('?')[0];
    if (req.method === 'GET' && url === '/') return send(res, 200, 'text/html', HOME.replace(/__PREVIEW__/g, cv({}, true)).replace(/__BUY__/g, esc(BUY)));
    if (req.method === 'GET' && url === '/admin') return send(res, 200, 'text/html', ADMIN);
    if (req.method === 'POST' && url === '/preview') return json(res, 200, { html: cv(await body(req), true) });
    if (req.method === 'POST' && url === '/cv') {
      const b = await body(req);
      if (!PW || !keyOk(b.code)) return json(res, 403, { error: 'code' });
      return json(res, 200, { html: cv(b.data || {}, false) });
    }
    if (req.method === 'POST' && url === '/admin/keys') {
      const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
      const f = fails[ip] || { n: 0, t: Date.now() };
      if (Date.now() - f.t > 3600000) { f.n = 0; f.t = Date.now(); }
      if (f.n >= 8) return json(res, 429, { error: 'Trop d’essais. Réessaie plus tard.' });
      const b = await body(req);
      if (!PW || !eq(b.pw || '', PW)) { f.n++; fails[ip] = f; return json(res, 403, { error: 'Mot de passe incorrect.' }); }
      const from = Math.max(1, parseInt(b.from, 10) || 1), n = Math.min(200, Math.max(1, parseInt(b.n, 10) || 1));
      return json(res, 200, { keys: Array.from({ length: n }, (_, i) => keyFor(from + i)) });
    }
    send(res, 404, 'text/plain', 'Introuvable');
  } catch (e) { send(res, 500, 'text/plain', 'Erreur serveur'); }
}).listen(process.env.PORT || 3000);
