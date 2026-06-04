
(function () {
  'use strict';

  var LIBS = [
    'https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js',
    'https://cdn.jsdelivr.net/npm/markmap-common@0.17/dist/browser/index.js',
    'https://cdn.jsdelivr.net/npm/markmap-view@0.17/dist/browser/index.js',
    'https://cdn.jsdelivr.net/npm/markmap-lib@0.17/dist/browser/index.js'
  ];
  var libsLoaded = false;
  var libQueue = [];

  function ensureLibs(cb) {
    if (libsLoaded) { cb(); return; }
    libQueue.push(cb);
    if (libQueue.length > 1) return; // Already loading
    var i = 0;
    function next() {
      if (i >= LIBS.length) {
        libsLoaded = true;
        libQueue.forEach(function(f) { f(); });
        libQueue = [];
        return;
      }
      if (document.querySelector('script[src="' + LIBS[i] + '"]')) { i++; next(); return; }
      var s = document.createElement('script');
      s.src = LIBS[i];
      s.onload = function() { i++; next(); };
      s.onerror = function() { i++; next(); };
      document.head.appendChild(s);
    }
    next();
  }

  function isMarkmapPage() {
    // Detecta pelo titulo da pagina (h1 fora do article) ou pela URL
    var pageTitle = document.querySelector('.article-title, h1.page-title');
    if (!pageTitle) {
      // Fallback: primeiro h1 da pagina
      var all = document.querySelectorAll('h1');
      pageTitle = all[0] || null;
    }
    var titleText = pageTitle ? pageTitle.textContent.toLowerCase() : '';
    var urlPath = window.location.pathname.toLowerCase();
    return titleText.indexOf('mapa mental') !== -1
        || urlPath.indexOf('mapa-mental') !== -1
        || urlPath.indexOf('mapa_mental') !== -1;
  }

  function renderMarkmap() {
    if (!isMarkmapPage()) return;
    if (document.getElementById('markmap-svg')) return; // ja renderizado

    var article = document.querySelector('article');
    if (!article) return;
    var rawText = article.innerText || article.textContent || '';
    if (!rawText.trim()) return;

    // Cria SVG antes de esconder o artigo
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.id = 'markmap-svg';
    svg.style.cssText = [
      'display:block',
      'width:100%',
      'height:85vh',
      'border-radius:8px',
      'background:var(--light,#1a1a2e)',
      'border:1px solid var(--lightgray,#393639)',
      'margin-bottom:1rem'
    ].join(';');

    article.style.display = 'none';
    article.parentNode.insertBefore(svg, article);

    ensureLibs(function() {
      var lib = window.markmap;
      if (!lib || !lib.Transformer || !lib.Markmap) {
        console.error('[Markmap] bibliotecas nao encontradas em window.markmap:', Object.keys(window));
        svg.remove();
        article.style.display = '';
        return;
      }
      try {
        var transformer = new lib.Transformer();
        var result = transformer.transform(rawText);
        var mm = lib.Markmap.create(svg, {
          initialExpandLevel: 2,
          maxWidth: 350,
          spacingHorizontal: 80,
          spacingVertical: 8,
          duration: 300,
          colorFreezeLevel: 2,
          zoom: true,
          pan: true,
        }, result.root);
        setTimeout(function() { try { mm.fit(); } catch(e) {} }, 200);
      } catch (err) {
        console.error('[Markmap] erro ao renderizar:', err);
        svg.remove();
        article.style.display = '';
      }
    });
  }

  // Estrategia dupla:
  // 1. Evento 'nav' do Quartz (SPA - disparado apos o Quartz terminar de hidratar)
  document.addEventListener('nav', renderMarkmap);

  // 2. Fallback: DOMContentLoaded + delay para caso o 'nav' ja tenha disparado
  //    antes do nosso listener ser registrado
  document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
      if (!document.getElementById('markmap-svg')) {
        renderMarkmap();
      }
    }, 600);
  });
})();
