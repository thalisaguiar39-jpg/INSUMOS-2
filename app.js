// Lista inicial: [nome, unidade, quantidade habitual de compra, preço pago nessa quantidade]
const SEED = [
["Adoçante","kg",50,2263],["Morango Inatura","kg",1,15],["Ovos","unid",30,15],["Morango congelado","kg",1,15],
["Óleo","L",1,7],["Fermento em pó","kg",0.25,14.9],["Mix de farinha","kg",200,1700],["Composto Lácteo Ninho","g",380,15.67],
["Flores comestíveis","pacote",1,20],["Framboesa fresca","pacote",1,39],["Morango RETIRAR","pacote",1,10],["Cacau","kg",25,737],
["Chocolate meio amargo","kg",50,3492.5],["Coco fresco","kg",1,25],["Coco em fitas","kg",1,80],["Canela em pó","kg",1,50],
["Gengibre","kg",1,40],["Amêndoa laminada","kg",5,402.3],["Cenoura","kg",1,3.99],["Laranja","unid",1,1.27],
["Mirtilo","unid",1,12],["Maçã","unid",1,1.36],["Pistache","kg",5,872.85],["Cremor de tártaro","kg",1,45],
["Manteiga zero lactose","kg",1,62.5],["Bicarbonato","kg",1,6],["Nibs de cacau","kg",1,230],["Milho em lata","unid",1,4],
["Cookie","kg",1,96],["Banana","unid",1,0.8],["Óleo de coco","L",3.2,103.04],["Creme de leite","unid",1,4.45],
["Whey vegano","kg",1,89.9],["Margarina zero lactose","kg",1,16],["Leite de coco","L",1,25.41],["Prestígio","unid",1,1.29],
["Energyball","unid",1,2.38],["Brigadeiro de pistache","unid",1,1.92],["Trufa de brigadeiro","unid",1,1.49],["Uva passa","kg",1,25.9],
["Amêndoa natural","kg",1,110],["Semente de abóbora","kg",1,50],["Chocolate branco","kg",50,3492.5],["Goma de tapioca","g",500,3.99],
["Queijo parmesão","kg",0.24,39.42],["Gergelim negro","kg",1,24.8],["Gergelim branco","kg",1,13.25],["Sal","kg",1,2.39],
["Castanha do Pará","kg",1,57.41],["Semente de girassol","kg",1,17.5],["Alho em pó","kg",1,15],["Castanha de caju","kg",1,74.9],
["Tofu","g",500,17],["Essência de baunilha","g",30,25.99],["Creme vegano p/ tiramisu","g",680,51.75],["Biscoito (base p/ tiramisu)","g",168,11.25],
["Grão de bico","g",170,5.35],["Aquafaba p/ tiramisu","g",400,22.58],["Café em pó solúvel","g",40,6.9],["Leite condensado caseiro","g",500,25.46],
["Leite líquido zero lactose","L",1,5.69],["Creme de leite vegano","ml",200,6],["Ágar-ágar","g",500,38.98],["Fava de baunilha","unid",1,8],
["Geleia de morango","g",120,13.28],["Tapioca flocada","g",500,9.39],["Coco seco","g",100,8],["Polpa de maracujá","g",100,5.29],
["Massa alfajor 820g","g",820,21.98],["Limão","kg",1,4],["Massa chocolate 820g","g",820,23.28],["Marshmallow","g",100,7.06],
["Farinha de amêndoa","kg",1,61.01],["Massa tartelette 650g","g",650,22.83],["Creme de limão 730g","g",730,23.97],["Ganache 1057g","g",1057,106.74]
];
const KEY = "tats_insumos_v1";

const novoId = () => "i" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const seed = () => ({
  compras: [],
  itens: SEED.map(s => ({ id: novoId(), nome: s[0], cat: "Insumo", un: s[1], atual: null, min: 0, cheio: s[2],
    qtd: s[2], preco: s[3], desejado: +(s[3] / s[2]).toFixed(4), atualizado: null }))
});
let db;
try { db = JSON.parse(localStorage.getItem(KEY)); } catch (e) {}
if (!db || !db.itens) db = seed();
const salvar = () => { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) { alert("Não foi possível salvar neste navegador."); } };

// ===== utilitários =====
const $ = id => document.getElementById(id);
const hoje = () => new Date().toLocaleDateString("en-CA");
const fData = d => d ? d.split("-").reverse().join("/") : "–";
const fN = v => Number(v).toLocaleString("pt-BR", { maximumFractionDigits: 3 });
const fR = v => "R$ " + Number(v).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 4 });
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const num = v => { const n = parseFloat(v); return isNaN(n) || n < 0 ? 0 : n; };
const item = id => db.itens.find(i => i.id === id);
const baixo = i => i.atual !== null && i.min > 0 && i.atual <= i.min;
const usado = i => (i.atual === null || !i.cheio) ? null : Math.min(100, Math.max(0, Math.round((1 - i.atual / i.cheio) * 100)));
const pendentes = () => db.compras.filter(c => !c.recebida);

// ===== abas =====
document.querySelectorAll(".tab").forEach(b => b.onclick = () => {
  document.querySelectorAll(".tab").forEach(t => t.classList.toggle("on", t === b));
  document.querySelectorAll(".pane").forEach(p => p.classList.toggle("on", p.id === b.dataset.tab));
  window.scrollTo(0, 0);
});

// ===== ESTOQUE =====
function renderEstoque() {
  const baixos = db.itens.filter(baixo);
  const semContagem = db.itens.filter(i => i.atual === null).length;
  $("resumo").innerHTML =
    `<div><b>${db.itens.length}</b><span>itens</span></div>` +
    `<div class="${baixos.length ? "r" : ""}"><b>${baixos.length}</b><span>para comprar</span></div>` +
    `<div><b>${pendentes().length}</b><span>entregas pendentes</span></div>` +
    `<div><b>${semContagem}</b><span>sem contagem</span></div>`;

  $("alertas").innerHTML = baixos.length
    ? `<div class="alerta"><h3>Estoque mínimo atingido</h3><ul>${baixos.map(i => {
        const sug = i.cheio > i.atual ? ` · sugestão: comprar ${fN(i.cheio - i.atual)} ${esc(i.un)}` : "";
        return `<li><b>${esc(i.nome)}</b>: restam ${fN(i.atual)} ${esc(i.un)}${sug}</li>`;
      }).join("")}</ul></div>` : "";

  const q = $("busca").value.trim().toLowerCase(), fc = $("fcat").value, ord = $("ordem").value;
  let l = db.itens.filter(i => (!q || i.nome.toLowerCase().includes(q)) && (!fc || i.cat === fc));
  if (ord !== "custom") l.sort(ord === "nome" ? (a, b) => a.nome.localeCompare(b.nome, "pt-BR") : (a, b) => {
    if (baixo(a) !== baixo(b)) return baixo(a) ? -1 : 1;
    const ua = usado(a), ub = usado(b);
    if (ua === null || ub === null) return ua === ub ? a.nome.localeCompare(b.nome, "pt-BR") : (ua === null ? 1 : -1);
    return ub - ua || a.nome.localeCompare(b.nome, "pt-BR");
  });

  $("lista").innerHTML = l.length ? l.map(i => {
    const u = usado(i), pend = pendentes().filter(c => c.item === i.id);
    const minPos = i.cheio && i.min ? Math.max(0, Math.min(100, (1 - i.min / i.cheio) * 100)) : null;
    const cor = baixo(i) ? "h" : (u !== null && u >= 70 ? "m" : "");
    return `<article class="item ${baixo(i) ? "low" : ""}">
      <div class="top"><div><strong>${esc(i.nome)}</strong><span class="cat">${esc(i.cat)}</span></div>
        ${baixo(i) ? '<span class="badge">Comprar</span>' : (i.atual === null ? '<span class="badge nc">Sem contagem</span>' : "")}</div>
      <div class="bar" title="A marca preta indica o estoque mínimo"><i class="${cor}" style="width:${u === null ? 0 : u}%"></i>${minPos !== null ? `<b style="left:${minPos}%"></b>` : ""}</div>
      <div class="meta">
        <span><em>${u === null ? "–" : u + "%"}</em> utilizado${i.atual !== null ? ` · restam <em>${fN(i.atual)} ${esc(i.un)}</em>` : ""}</span>
        <span>mínimo: ${i.min ? fN(i.min) + " " + esc(i.un) : "não definido"}</span>
        ${pend.length ? `<span>entrega prevista: ${pend.map(c => fData(c.prev)).join(", ")}</span>` : ""}
      </div>
      <div class="upd"><label>Estoque atual
        <span><input type="number" min="0" step="any" data-id="${i.id}" value="${i.atual === null ? "" : i.atual}"> ${esc(i.un)}</span></label>
        <small>${i.atualizado ? "atualizado em " + fData(i.atualizado) : ""}</small></div>
    </article>`;
  }).join("") : '<p class="vazio">Nenhum item encontrado.</p>';

  document.querySelectorAll(".upd input").forEach(inp => inp.onchange = () => {
    const i = item(inp.dataset.id);
    i.atual = inp.value === "" ? null : num(inp.value);
    i.atualizado = i.atual === null ? null : hoje();
    salvar(); renderEstoque();
  });
}
["busca", "fcat", "ordem"].forEach(id => $(id).addEventListener("input", renderEstoque));

// ===== COMPRAS =====
function listaItens() { $("dl-itens").innerHTML = db.itens.map(i => `<option value="${esc(i.nome)}">`).join(""); }
const achaItem = nome => db.itens.find(i => i.nome.toLowerCase() === nome.trim().toLowerCase());

function calcUnit() {
  const q = num($("c-qtd").value), v = num($("c-valor").value);
  const i = achaItem($("c-item").value);
  $("c-unit").value = q && v ? fR(v / q) + (i ? " / " + i.un : "") : "";
}
$("c-item").addEventListener("input", () => {
  const i = achaItem($("c-item").value);
  if (i && !$("c-qtd").value) { $("c-qtd").value = i.qtd; $("c-valor").value = i.preco; }
  calcUnit();
});
["c-qtd", "c-valor"].forEach(id => $(id).addEventListener("input", calcUnit));

function msg(t, erro) { $("c-msg").textContent = t; $("c-msg").className = erro ? "err" : ""; }

$("c-add").onclick = () => {
  const i = achaItem($("c-item").value), q = num($("c-qtd").value), v = num($("c-valor").value);
  if (!i) return msg("Escolha um item da lista. Se ele não existe, cadastre em Configurações.", true);
  if (!q || !v) return msg("Informe a quantidade e o valor pago.", true);
  db.compras.push({ id: novoId(), item: i.id, data: $("c-data").value || hoje(), qtd: q, valor: v,
    prev: $("c-prev").value || "", obs: $("c-obs").value.trim(), recebida: false });
  salvar();
  ["c-item", "c-qtd", "c-valor", "c-unit", "c-prev", "c-obs"].forEach(id => $(id).value = "");
  msg("Compra registrada.");
  renderCompras(); renderEstoque();
};

function renderCompras() {
  const f = $("c-filtro").value;
  const l = db.compras.filter(c => f === "todas" || !c.recebida).sort((a, b) => b.data.localeCompare(a.data));
  if (!l.length) { $("c-tab").innerHTML = '<tbody><tr><td class="vazio">Nenhuma compra para mostrar.</td></tr></tbody>'; return; }
  $("c-tab").innerHTML = `<thead><tr><th>Data</th><th>Item</th><th class="n">Quantidade</th><th class="n">Valor pago</th><th class="n">Valor/un.</th><th>Entrega</th><th>Obs.</th><th></th></tr></thead><tbody>` +
    l.map(c => {
      const i = item(c.item) || { nome: "(item removido)", un: "", desejado: 0 };
      const un = c.valor / c.qtd, caro = i.desejado && un > i.desejado * 1.001;
      const atrasada = !c.recebida && c.prev && c.prev < hoje();
      const status = c.recebida ? '<span class="tag ok">Recebida</span>'
        : `<span class="tag ${atrasada ? "late" : "warn"}">${atrasada ? "Atrasada" : "Pendente"}</span> ${fData(c.prev)}`;
      return `<tr><td>${fData(c.data)}</td><td>${esc(i.nome)}</td><td class="n">${fN(c.qtd)} ${esc(i.un)}</td><td class="n">${fR(c.valor)}</td>
        <td class="n">${fR(un)} ${caro ? '<span class="tag warn" title="Acima do preço desejado">acima do desejado</span>' : ""}</td>
        <td>${status}</td><td>${esc(c.obs)}</td>
        <td>${c.recebida ? "" : `<button class="x ok" data-r="${c.id}" style="color:var(--g)">Recebida</button>`}<button class="x" data-d="${c.id}">Excluir</button></td></tr>`;
    }).join("") + "</tbody>";
  document.querySelectorAll("[data-r]").forEach(b => b.onclick = () => {
    const c = db.compras.find(x => x.id === b.dataset.r), i = item(c.item);
    if (!confirm(`Marcar como recebida e somar ${fN(c.qtd)} ${i ? i.un : ""} ao estoque de ${i ? i.nome : "item"}?`)) return;
    c.recebida = true; c.recebidaEm = hoje();
    if (i) { i.atual = (i.atual || 0) + c.qtd; i.atualizado = hoje(); }
    salvar(); renderCompras(); renderEstoque();
  });
  document.querySelectorAll("[data-d]").forEach(b => b.onclick = () => {
    if (!confirm("Excluir esta compra?")) return;
    db.compras = db.compras.filter(x => x.id !== b.dataset.d);
    salvar(); renderCompras(); renderEstoque();
  });
}
$("c-filtro").onchange = renderCompras;

// ===== CONFIGURAÇÕES =====
const CAMPOS = [["min", "Estoque mínimo"], ["cheio", "Estoque cheio (100%)"], ["qtd", "Qtd. habitual de compra"], ["preco", "Preço habitual (R$)"], ["desejado", "Preço desejado/un. (R$)"]];
function mover(id, para) { // para: posição 1-based
  const i = db.itens.findIndex(x => x.id === id);
  const [it] = db.itens.splice(i, 1);
  db.itens.splice(Math.max(0, Math.min(db.itens.length, para - 1)), 0, it);
  salvar(); renderConfig(); renderEstoque();
}
function renderConfig() {
  $("cfg-tab").innerHTML = `<thead><tr><th>Posição / ações</th><th>Item</th><th>Categoria</th><th>Un.</th>${CAMPOS.map(c => `<th>${c[1]}</th>`).join("")}</tr></thead><tbody>` +
    db.itens.map((i, p) => `<tr>
      <td class="acoes"><input type="number" class="pos" min="1" max="${db.itens.length}" data-pos="${i.id}" value="${p + 1}" aria-label="Posição">
        <button class="x" data-up="${i.id}" title="Subir">▲</button><button class="x" data-down="${i.id}" title="Descer">▼</button>
        <button class="x" data-top="${i.id}" title="Levar para o topo">Topo</button>
        <button class="x del" data-x="${i.id}">Excluir</button></td>
      <td><input data-id="${i.id}" data-f="nome" value="${esc(i.nome)}"></td>
      <td><select data-id="${i.id}" data-f="cat">${["Insumo", "Embalagem", "Adesivo"].map(c => `<option ${c === i.cat ? "selected" : ""}>${c}</option>`).join("")}</select></td>
      <td><input data-id="${i.id}" data-f="un" value="${esc(i.un)}"></td>
      ${CAMPOS.map(c => `<td><input type="number" min="0" step="any" data-id="${i.id}" data-f="${c[0]}" value="${i[c[0]] || ""}"></td>`).join("")}
      </tr>`).join("") + "</tbody>";
  const pos = id => db.itens.findIndex(x => x.id === id) + 1;
  document.querySelectorAll("#cfg-tab [data-f]").forEach(el => el.onchange = () => {
    const i = item(el.dataset.id), f = el.dataset.f;
    i[f] = ["nome", "cat", "un"].includes(f) ? (el.value.trim() || i[f]) : num(el.value);
    salvar(); listaItens(); renderEstoque();
  });
  document.querySelectorAll("[data-pos]").forEach(el => el.onchange = () => mover(el.dataset.pos, parseInt(el.value, 10) || pos(el.dataset.pos)));
  document.querySelectorAll("[data-up]").forEach(b => b.onclick = () => mover(b.dataset.up, pos(b.dataset.up) - 1));
  document.querySelectorAll("[data-down]").forEach(b => b.onclick = () => mover(b.dataset.down, pos(b.dataset.down) + 1));
  document.querySelectorAll("[data-top]").forEach(b => b.onclick = () => mover(b.dataset.top, 1));
  document.querySelectorAll("[data-x]").forEach(b => b.onclick = () => {
    const i = item(b.dataset.x);
    if (!confirm(`Excluir "${i.nome}" do controle? As compras registradas dele também deixam de aparecer.`)) return;
    db.itens = db.itens.filter(x => x.id !== i.id);
    db.compras = db.compras.filter(c => c.item !== i.id);
    salvar(); renderConfig(); listaItens(); renderEstoque(); renderCompras();
  });
}
$("n-add").onclick = () => {
  const nome = $("n-nome").value.trim(), m = $("n-msg");
  if (!nome) { m.textContent = "Digite o nome do item."; m.className = "okmsg err"; return; }
  const it = { id: novoId(), nome, cat: $("n-cat").value, un: $("n-un").value.trim() || "unid", atual: null,
    min: num($("n-min").value), cheio: num($("n-cheio").value), qtd: num($("n-qtd").value), preco: num($("n-preco").value),
    desejado: num($("n-des").value), atualizado: null };
  if (!$("n-des").value && it.qtd && it.preco) it.desejado = +(it.preco / it.qtd).toFixed(4);
  if ($("n-pos").value === "topo") db.itens.unshift(it); else db.itens.push(it);
  ["n-nome", "n-un", "n-min", "n-cheio", "n-qtd", "n-preco", "n-des"].forEach(id => $(id).value = "");
  salvar(); renderConfig(); listaItens(); renderEstoque();
  m.textContent = `"${nome}" adicionado. Informe o estoque atual na aba Estoque.`; m.className = "okmsg";
};

// ===== BACKUP =====
$("bk-exp").onclick = () => {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([JSON.stringify(db)], { type: "application/json" }));
  a.download = `backup_tats_insumos_${hoje()}.json`; a.click();
};
$("bk-imp").onchange = e => {
  const f = e.target.files[0]; if (!f) return;
  const r = new FileReader();
  r.onload = () => {
    try {
      const d = JSON.parse(r.result);
      if (!d.itens || !d.compras) throw 0;
      if (!confirm("Isso substitui todos os dados atuais. Continuar?")) return;
      db = d; salvar(); iniciar();
    } catch (x) { alert("Arquivo de backup inválido."); }
  };
  r.readAsText(f);
};

function iniciar() {
  $("c-data").value = hoje();
  listaItens(); renderEstoque(); renderCompras(); renderConfig();
}
iniciar();
