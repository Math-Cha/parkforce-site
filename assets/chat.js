/* ParkForce — widget assistant IA. Activé seulement si CHAT_ENDPOINT est renseigné. */
(function () {
  var CHAT_ENDPOINT = window.PF_CHAT_ENDPOINT || "";
  if (!CHAT_ENDPOINT) return;
  var EN = document.documentElement.lang === "en";
  var T = EN ? {
    title: "ParkForce assistant", sub: "Car park expert · answers in seconds",
    hello: "Hello! I'm the ParkForce assistant. Ask me anything about car park plans, equipment installation or maintenance — or book a 30-min call.",
    ph: "Your question…", send: "Send", rdv: "Book a call", err: "Connection issue. Write to contact@parkforce.pro.", open: "Ask a question"
  } : {
    title: "Assistant ParkForce", sub: "Expert parking · réponse en quelques secondes",
    hello: "Bonjour ! Je suis l'assistant ParkForce. Posez-moi vos questions sur les plans de parking, l'installation ou la maintenance des équipements — ou prenez rendez-vous.",
    ph: "Votre question…", send: "Envoyer", rdv: "Prendre rendez-vous", err: "Souci de connexion. Écrivez-nous à contact@parkforce.pro.", open: "Poser une question"
  };
  var css = "\
#pfc-btn{position:fixed;right:22px;bottom:22px;z-index:900;background:#FECF08;color:#0F1015;border:0;border-radius:999px;padding:14px 20px;font:700 14px Montserrat,Arial,sans-serif;box-shadow:0 10px 30px -10px rgba(0,0,0,.5);cursor:pointer;display:flex;gap:10px;align-items:center}\
#pfc-btn:hover{background:#FFD32D}\
#pfc{position:fixed;right:22px;bottom:84px;z-index:901;width:360px;max-width:calc(100vw - 32px);height:540px;max-height:calc(100vh - 110px);background:#fff;border-radius:16px;box-shadow:0 30px 60px -20px rgba(0,0,0,.45);display:none;flex-direction:column;overflow:hidden;font-family:Inter,Arial,sans-serif;border:1px solid #D9D9D6}\
#pfc.open{display:flex}\
#pfc .hd{background:#0F1015;color:#fff;padding:14px 16px;display:flex;align-items:center;gap:12px;border-bottom:3px solid #FECF08}\
#pfc .hd b{font:800 15px Montserrat,Arial,sans-serif;display:block}#pfc .hd span{font-size:12px;color:#b9bab7}\
#pfc .hd button{margin-left:auto;background:none;border:0;color:#fff;font-size:20px;cursor:pointer}\
#pfc .log{flex:1;overflow:auto;padding:14px;background:#F3F3F1;display:flex;flex-direction:column;gap:10px}\
#pfc .m{max-width:85%;padding:10px 13px;border-radius:12px;font-size:14px;line-height:1.45;white-space:pre-wrap}\
#pfc .m.a{background:#fff;border:1px solid #D9D9D6;align-self:flex-start;border-bottom-left-radius:4px}\
#pfc .m.u{background:#0F1015;color:#fff;align-self:flex-end;border-bottom-right-radius:4px}\
#pfc .m a{color:#0F1015;font-weight:600}\
#pfc .rdv{align-self:flex-start;background:#FECF08;color:#0F1015;font:700 13px Montserrat,Arial,sans-serif;padding:9px 14px;border-radius:8px;text-decoration:none}\
#pfc form{display:flex;gap:8px;padding:10px;border-top:1px solid #D9D9D6;background:#fff}\
#pfc input{flex:1;font:14px Inter,Arial,sans-serif;padding:11px 12px;border:1px solid #D9D9D6;border-radius:8px}\
#pfc input:focus{outline:2px solid #FECF08;border-color:#FECF08}\
#pfc form button{background:#0F1015;color:#fff;border:0;border-radius:8px;padding:0 16px;font:700 13px Montserrat,Arial,sans-serif;cursor:pointer}\
#pfc .typing{font-size:12px;color:#6B6D72;padding:0 14px 8px;background:#F3F3F1}\
@media(max-width:480px){#pfc{right:8px;bottom:76px;height:70vh}}";
  var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  var btn = document.createElement("button"); btn.id = "pfc-btn";
  btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 01-8 8H8l-5 3 1.5-4.5A8 8 0 1121 12z"/></svg>' + T.open;
  var box = document.createElement("div"); box.id = "pfc";
  box.innerHTML = '<div class="hd"><div><b>' + T.title + '</b><span>' + T.sub + '</span></div><button aria-label="Fermer">×</button></div><div class="log"></div><div class="typing" style="display:none">…</div><form><input autocomplete="off" placeholder="' + T.ph + '" maxlength="600"><button type="submit">' + T.send + '</button></form>';
  document.body.appendChild(btn); document.body.appendChild(box);

  var log = box.querySelector(".log"), typing = box.querySelector(".typing"), form = box.querySelector("form"), input = box.querySelector("input");
  var history = [], calendly = "";
  function add(role, text) {
    var d = document.createElement("div"); d.className = "m " + (role === "user" ? "u" : "a");
    d.textContent = text; log.appendChild(d); log.scrollTop = log.scrollHeight;
    if (role === "assistant" && calendly && /rendez-vous|rdv|call|appointment|meeting|calendly/i.test(text) && !log.querySelector(".rdv")) {
      var a = document.createElement("a"); a.className = "rdv"; a.href = calendly; a.target = "_blank"; a.rel = "noopener"; a.textContent = T.rdv + " →"; log.appendChild(a);
    }
    log.scrollTop = log.scrollHeight;
  }
  btn.onclick = function () { box.classList.toggle("open"); if (box.classList.contains("open")) { if (!history.length) add("assistant", T.hello); input.focus(); } };
  box.querySelector(".hd button").onclick = function () { box.classList.remove("open"); };
  form.onsubmit = function (e) {
    e.preventDefault(); var q = input.value.trim(); if (!q) return;
    input.value = ""; add("user", q); history.push({ role: "user", content: q }); typing.style.display = "block";
    fetch(CHAT_ENDPOINT, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ messages: history, page: location.pathname }) })
      .then(function (r) { return r.json(); })
      .then(function (d) { typing.style.display = "none"; if (d.calendly) calendly = d.calendly; var t = d.reply || T.err; add("assistant", t); history.push({ role: "assistant", content: t }); })
      .catch(function () { typing.style.display = "none"; add("assistant", T.err); });
  };
})();
