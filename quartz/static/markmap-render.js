
(function () {
  'use strict';

  // Libs carregadas uma unica vez
  var libsLoaded = false;
  var libsLoading = false;
  var pendingCallback = null;

  var LIBS = [
    'https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js',
    'https://cdn.jsdelivr.net/npm/markmap-common@0.17/dist/browser/index.js',
    'https://cdn.jsdelivr.net/npm/markmap-view@0.17/dist/browser/index.js',
    'https://cdn.jsdelivr.net/npm/markmap-lib@0.17/dist/browser/index.js'
  ];

  function loadLibs(cb) {
    if (libsLoaded) { cb(); return; }
    if (libsLoading) { pendingCallback = cb; return; }
    libsLoading = true;
    var i = 0;
    function next() {
      if (i >= LIBS.length) {
        libsLoaded = true;
        libsLoading = false;
        cb();
        if (pendingCallback) { var f = pendingCallback; pendingCallback = null; f(); }
        return;
      }
      // Verifica se a lib ja foi carregada
      if (document.querySelector('script[src="' + LIBS[i] + '"]')) { i++; next(); return; }
      var s = document.createElement('script');
      s.src = LIBS[i];
      s.onload = function() { i++; next(); };
      s.onerror = function() { console.error('Failed: ' + LIBS[i]); i++; next(); };
      document.head.appendChild(s);
    }
    next();
  }

  function isMarkmapPage() {
    var h1 = document.querySelector('article h1, .center h1, h1.page-title');
    if (!h1) h1 = document.querySelector('h1');
    var text = (h1 ? h1.textContent : '').toLowerCase();
    var url = window.location.pathname.toLowerCase();
    return text.indexOf('mapa mental') !== -1 || url.indexOf('mapa-mental') !== -1 || url.indexOf('mapa_mental') !== -1;
  }

  function onNav() {
    // Quartz ja re-renderizou o DOM neste ponto
    // Nao precisa remover wrapper antigo pois o DOM foi substituido
    if (!isMarkmapPage()) return;

    var article = document.querySelector('article');
    if (!article) return;

    // Captura texto ANTES de modificar o DOM
    var rawText = article.innerText || article.textContent || '';
    if (!rawText.trim()) return;

    // Cria interface
    var wrapper = document.createElement('div');
    wrapper.id = 'markmap-wrapper';
    wrapper.style.cssText = [
      'width:100%',
      'height:85vh',
      'display:flex',
      'flex-direction:column',
      'gap:8px',
      'margin-bottom:2rem'
    ].join(';');

    var toolbar = document.createElement('div');
    toolbar.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;';

    function btn(label) {
      var b = document.createElement('button');
      b.textContent = label;
      b.style.cssText = [
        'padding:5px 14px',
        'border-radius:6px',
        'border:1px solid var(--gray,#888)',
        'background:var(--lightgray,#333)',
        'color:var(--dark,#eee)',
        'cursor:pointer',
        'font-size:0.85em',
        'font-family:inherit'
      ].join(';');
      toolbar.appendChild(b);
      return b;
    }

    var btnFit = btn('Centralizar');
    var btnToggle = btn('Ver Texto');
    wrapper.appendChild(toolbar);

    var svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgEl.style.cssText = [
      'flex:1',
      'border-radius:8px',
      'background:var(--light,#1a1a2e)',
      'border:1px solid var(--lightgray,#393639)',
      'min-height:300px'
    ].join(';');
    wrapper.appendChild(svgEl);

    // Esconde artigo e insere mapa antes dele
    article.style.display = 'none';
    article.parentNode.insertBefore(wrapper, article);

    var showingMap = true;
    var mmInstance = null;

    btnToggle.onclick = function () {
      if (showingMap) {
        wrapper.style.display = 'none';
        article.style.display = '';
        btnToggle.textContent = 'Ver Mapa';
      } else {
        wrapper.style.display = 'flex';
        article.style.display = 'none';
        btnToggle.textContent = 'Ver Texto';
        if (mmInstance) setTimeout(function() { mmInstance.fit(); }, 50);
      }
      showingMap = !showingMap;
    };

    loadLibs(function() {
      var lib = window.markmap;
      if (!lib || !lib.Transformer || !lib.Markmap) {
        console.error('Markmap libs not available on window.markmap');
        wrapper.remove();
        article.style.display = '';
        return;
      }
      try {
        var transformer = new lib.Transformer();
        var result = transformer.transform(rawText);
        mmInstance = lib.Markmap.create(svgEl, {
          initialExpandLevel: 2,
          maxWidth: 350,
          spacingHorizontal: 80,
          spacingVertical: 8,
          duration: 300,
          colorFreezeLevel: 2,
        }, result.root);
        btnFit.onclick = function () { mmInstance.fit(); };
        setTimeout(function () { mmInstance.fit(); }, 200);
      } catch (err) {
        console.error('Markmap render error:', err);
        wrapper.remove();
        article.style.display = '';
      }
    });
  }

  // Quartz dispara 'nav' tanto no carregamento inicial quanto nas navegacoes SPA.
  // Este e o unico listener necessario.
  document.addEventListener('nav', onNav);
})();
