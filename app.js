/* 脾胃有方 · 前端逻辑：hash 路由 + 渲染 + 交互 */
(function () {
  'use strict';

  var CATS = {
    west: { name: '西医视角', en: 'WESTERN MEDICINE', cls: 't-west', color: 'var(--c-west)' },
    tcm:  { name: '中医智慧', en: 'CHINESE MEDICINE', cls: 't-tcm',  color: 'var(--c-tcm)' },
    mix:  { name: '中西结合', en: 'INTEGRATIVE CARE', cls: 't-mix',  color: 'var(--c-mix)' }
  };

  var ARTS = (window.ARTICLES || []).slice().sort(function (a, b) { return a.id - b.id; });
  var app = document.getElementById('app');

  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function issueNo(id) { return 'NO.' + pad2(id); }
  // 月刊：第1期 2023.10 —— 第36期 2026.09
  function issueDate(id) {
    var d = new Date(2023, 9 + (id - 1), 1);
    return d.getFullYear() + '.' + pad2(d.getMonth() + 1);
  }
  function titleParts(t) {
    var i = t.indexOf('丨');
    if (i === -1) return { prefix: '', main: t };
    return { prefix: t.slice(0, i + 1), main: t.slice(i + 1) };
  }
  function esc(s) { return s; } // 内容为本站自有数据，直接输出

  /* ---------- 卡片 ---------- */
  function cardHTML(a, idx) {
    var c = CATS[a.cat], tp = titleParts(a.title);
    return '<a class="card reveal" href="#/p/' + a.id + '" style="transition-delay:' + (idx % 3) * 70 + 'ms"'
      + ' data-search="' + (a.title + a.excerpt).replace(/"/g, '') + '">'
      + '<div class="card-top mono"><span>' + issueNo(a.id) + '</span><span>' + issueDate(a.id) + '</span></div>'
      + '<span class="tag ' + c.cls + '">' + c.name + '</span>'
      + '<h3>' + (tp.prefix ? '<span class="prefix" style="color:' + c.color + '">' + tp.prefix + '</span>' : '') + tp.main + '</h3>'
      + '<p class="excerpt">' + a.excerpt + '</p>'
      + '</a>';
  }

  /* ---------- 首页 ---------- */
  function renderHome(cat) {
    document.body.classList.remove('on-article');
    var list = cat === 'all' ? ARTS : ARTS.filter(function (a) { return a.cat === cat; });
    var latest = ARTS[ARTS.length - 1];
    var tp = titleParts(latest.title);
    var lc = CATS[latest.cat];

    var html = '';
    if (cat === 'all') {
      html += '<section class="featured reveal" onclick="location.hash=\'#/p/' + latest.id + '\'">'
        + '<div class="featured-main">'
        + '<span class="kicker">最新一期 · LATEST ISSUE</span>'
        + '<h2>' + (tp.prefix ? '<span class="prefix">' + tp.prefix + '</span>' : '') + tp.main + '</h2>'
        + '<div class="meta-row mono"><span>' + issueNo(latest.id) + '</span><span>' + issueDate(latest.id) + '</span>'
        + '<span class="tag ' + lc.cls + '" style="border:none;padding:0">' + lc.name + '</span></div>'
        + '</div>'
        + '<div class="featured-side">'
        + '<p class="featured-excerpt">' + latest.excerpt + '</p>'
        + '<span class="read-cue">阅读本期 READ</span>'
        + '</div></section>';
    }

    var headName = cat === 'all' ? '全部文章' : CATS[cat].name;
    html += '<div class="toolbar">'
      + '<span class="count mono">' + headName + ' · 共 ' + list.length + ' 期</span>'
      + '<label class="search"><svg viewBox="0 0 24 24" fill="none" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>'
      + '<input id="q" type="text" placeholder="搜索标题或内容关键词…" autocomplete="off"></label>'
      + '</div>';

    html += '<div class="grid" id="grid">'
      + list.slice().reverse().map(cardHTML).join('')
      + '</div>'
      + '<div class="empty" id="empty">没有找到相关文章，换个关键词试试。</div>';

    app.innerHTML = html;

    var q = document.getElementById('q');
    q.addEventListener('input', function () {
      var kw = q.value.trim();
      var cards = document.querySelectorAll('#grid .card');
      var visible = 0;
      cards.forEach(function (el) {
        var hit = !kw || el.getAttribute('data-search').indexOf(kw) !== -1;
        el.style.display = hit ? '' : 'none';
        if (hit) visible++;
      });
      document.getElementById('empty').style.display = visible ? 'none' : 'block';
    });
    setupReveal();
  }

  /* ---------- 文章页 ---------- */
  function renderArticle(id) {
    var a = ARTS.find(function (x) { return x.id === id; });
    if (!a) { renderHome('all'); return; }
    var c = CATS[a.cat], tp = titleParts(a.title);

    var html = '<article class="reader">'
      + '<div class="reader-top mono">'
      + '<a href="#/c/' + a.cat + '">← 返回目录</a>'
      + '<span>' + issueNo(a.id) + ' · ' + issueDate(a.id) + '</span>'
      + '</div>'
      + '<span class="tag ' + c.cls + '">' + c.name + ' · ' + c.en + '</span>'
      + '<h1>' + (tp.prefix ? '<span class="prefix" style="color:' + c.color + '">' + tp.prefix + '</span>' : '') + tp.main + '</h1>'
      + '<div class="meta-row mono"><span>本期出品 · 蔡淦名老中医专家传承创新工作室</span></div>'
      + '<p class="lede">' + a.excerpt + '</p>';

    a.body.forEach(function (s, i) {
      html += '<section class="reveal">'
        + '<h2><span class="no mono" style="color:' + c.color + '">' + pad2(i + 1) + '</span>' + s.h + '</h2>'
        + s.ps.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('')
        + '</section>';
    });

    html += '<div class="notice"><strong>温馨提示 DISCLAIMER</strong>'
      + '本文仅供健康知识参考，不构成诊断、治疗或用药建议。文中涉及的方药、穴位、检查与治疗手段，均需在专业医师指导下进行。如有身体不适，请及时就医。'
      + '</div>';

    var prev = ARTS.find(function (x) { return x.id === id - 1; });
    var next = ARTS.find(function (x) { return x.id === id + 1; });
    html += '<nav class="prevnext">'
      + (prev
        ? '<a href="#/p/' + prev.id + '"><span class="dir">← 上一期 ' + issueNo(prev.id) + '</span><span class="t">' + titleParts(prev.title).main + '</span></a>'
        : '<span class="placeholder"></span>')
      + (next
        ? '<a class="next" href="#/p/' + next.id + '"><span class="dir">下一期 ' + issueNo(next.id) + ' →</span><span class="t">' + titleParts(next.title).main + '</span></a>'
        : '<span class="placeholder"></span>')
      + '</nav></article>';

    app.innerHTML = html;
    document.body.classList.add('on-article');
    window.scrollTo(0, 0);
    setupReveal();
    updateProgress();
  }

  /* ---------- 阅读进度 ---------- */
  var bar = document.getElementById('progress');
  function updateProgress() {
    if (!document.body.classList.contains('on-article')) return;
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    bar.style.transform = 'scaleX(' + (max > 0 ? h.scrollTop / max : 0) + ')';
  }
  window.addEventListener('scroll', updateProgress, { passive: true });

  /* ---------- 滚动显现 ---------- */
  var io = null;
  function setupReveal() {
    if (io) io.disconnect();
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); });
      return;
    }
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.06 });
    document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
  }

  /* ---------- 路由 ---------- */
  function setTab(cat) {
    document.querySelectorAll('#tabs a').forEach(function (el) {
      el.classList.toggle('active', el.getAttribute('data-cat') === cat);
    });
  }
  function route() {
    var h = location.hash || '#/';
    var m = h.match(/^#\/p\/(\d+)/);
    if (m) { setTab(''); renderArticle(parseInt(m[1], 10)); return; }
    var c = h.match(/^#\/c\/(west|tcm|mix)/);
    if (c) { setTab(c[1]); renderHome(c[1]); window.scrollTo(0, 0); return; }
    setTab('all'); renderHome('all');
  }
  window.addEventListener('hashchange', route);

  document.getElementById('today').textContent = (function () {
    var d = new Date();
    return d.getFullYear() + ' 年 ' + (d.getMonth() + 1) + ' 月 ' + d.getDate() + ' 日';
  })();

  route();
})();
