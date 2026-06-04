
(function () {
  'use strict';

  function isMarkmapPage() {
    // Detecta paginas de mapa mental pelo titulo h1 ou pela URL
    var h1 = document.querySelector('h1');
    var title = (h1 ? h1.textContent : '') + ' ' + window.location.href;
    var lower = title.toLowerCase();
    return lower.indexOf('mapa mental') !== -1 || lower.indexOf('mapa-mental') !== -1;
  }

  function renderMarkmap() {
    if (!isMarkmapPage()) return;

    // Evita renderizar duas vezes
    if (document.getElementById('markmap-wrapper')) return;

    var article = document.querySelector('article');
    if (!article) return;

    // Captura o texto antes de esconder
    var rawText = article.innerText || article.textContent || '';

    // Cria container
    var wrapper = document.createElement('div');
    wrapper.id = 'markmap-wrapper';
    wrapper.style.cssText = 'width:100%;height:88vh;display:flex;flex-direction:column;margin-bottom:2rem;';

    var toolbar = document.createElement('div');
    toolbar.style.cssText = 'padding:8px 0;display:flex;gap:8px;';

    var btnFit = document.createElement('button');
    btnFit.textContent = 'Centralizar';
    btnFit.style.cssText = 'padding:5px 14px;border-radius:6px;border:1px solid var(--gray, #888);background:var(--lightgray, #333);color:var(--dark, #eee);cursor:pointer;font-size:0.85em;';

    var btnToggle = document.createElement('button');
    btnToggle.textContent = 'Ver Texto';
    btnToggle.style.cssText = 'padding:5px 14px;border-radius:6px;border:1px solid var(--gray, #888);background:var(--lightgray, #333);color:var(--dark, #eee);cursor:pointer;font-size:0.85em;';

    toolbar.appendChild(btnFit);
    toolbar.appendChild(btnToggle);
    wrapper.appendChild(toolbar);

    var svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgEl.style.cssText = 'flex:1;border-radius:8px;background:var(--light, #1a1a2e);border:1px solid var(--lightgray, #393639);';
    wrapper.appendChild(svgEl);

    article.style.display = 'none';
    article.parentNode.insertBefore(wrapper, article);

    var showingMap = true;
    btnToggle.onclick = function () {
      if (showingMap) {
        wrapper.style.display = 'none';
        article.style.display = '';
        btnToggle.textContent = 'Ver Mapa';
      } else {
        wrapper.style.display = 'flex';
        article.style.display = 'none';
        btnToggle.textContent = 'Ver Texto';
      }
      showingMap = !showingMap;
    };

    // Carrega libs sequencialmente
    var libs = [
      'https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js',
      'https://cdn.jsdelivr.net/npm/markmap-common@0.17/dist/browser/index.js',
      'https://cdn.jsdelivr.net/npm/markmap-view@0.17/dist/browser/index.js',
      'https://cdn.jsdelivr.net/npm/markmap-lib@0.17/dist/browser/index.js'
    ];

    function loadNext(i) {
      if (i >= libs.length) { doRender(); return; }
      var s = document.createElement('script');
      s.src = libs[i];
      s.onload = function () { loadNext(i + 1); };
      s.onerror = function () { console.error('Failed: ' + libs[i]); loadNext(i + 1); };
      document.head.appendChild(s);
    }

    function doRender() {
      try {
        var lib = window.markmap;
        if (!lib || !lib.Transformer) throw new Error('markmap not loaded');
        var t = new lib.Transformer();
        var result = t.transform(rawText);
        var mm = lib.Markmap.create(svgEl, {
          initialExpandLevel: 2,
          maxWidth: 350,
          spacingHorizontal: 80,
          spacingVertical: 8,
          duration: 300,
          colorFreezeLevel: 2,
        }, result.root);
        btnFit.onclick = function () { mm.fit(); };
        setTimeout(function () { mm.fit(); }, 150);
      } catch (e) {
        console.error('Markmap error:', e);
        wrapper.remove();
        article.style.display = '';
      }
    }

    loadNext(0);
  }

  // Executa na carga inicial
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderMarkmap);
  } else {
    renderMarkmap();
  }

  // Suporte ao SPA do Quartz
  document.addEventListener('nav', function () {
    var old = document.getElementById('markmap-wrapper');
    if (old) old.remove();
    // Garante que o article voltou a aparecer antes de reprocessar
    var art = document.querySelector('article');
    if (art) art.style.display = '';
    setTimeout(renderMarkmap, 50);
  });
})();
