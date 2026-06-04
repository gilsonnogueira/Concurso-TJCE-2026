
(function () {
  'use strict';

  function init() {
    var trigger = document.getElementById('markmap-trigger');
    if (!trigger) return;

    var config = {};
    try { config = JSON.parse(trigger.getAttribute('data-config') || '{}'); } catch(e) {}

    var article = document.querySelector('article');
    if (!article) return;

    var wrapper = document.createElement('div');
    wrapper.id = 'markmap-wrapper';
    wrapper.style.cssText = 'width:100%;height:88vh;display:flex;flex-direction:column;';

    var toolbar = document.createElement('div');
    toolbar.style.cssText = 'padding:6px 0 6px 0;display:flex;gap:8px;align-items:center;';

    var btnFit = document.createElement('button');
    btnFit.textContent = 'Ajustar Tela';
    btnFit.style.cssText = 'padding:5px 14px;border-radius:6px;border:1px solid var(--gray);background:var(--lightgray);color:var(--dark);cursor:pointer;font-size:0.85em;';

    var btnToggle = document.createElement('button');
    btnToggle.textContent = 'Ver Texto';
    btnToggle.style.cssText = 'padding:5px 14px;border-radius:6px;border:1px solid var(--gray);background:var(--lightgray);color:var(--dark);cursor:pointer;font-size:0.85em;';

    toolbar.appendChild(btnFit);
    toolbar.appendChild(btnToggle);
    wrapper.appendChild(toolbar);

    var svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgEl.style.cssText = 'flex:1;border-radius:8px;background:var(--light);border:1px solid var(--lightgray);';
    wrapper.appendChild(svgEl);

    article.style.display = 'none';
    article.parentNode.insertBefore(wrapper, article);

    var showingMap = true;
    btnToggle.onclick = function() {
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

    var libs = [
      'https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js',
      'https://cdn.jsdelivr.net/npm/markmap-common@0.17/dist/browser/index.js',
      'https://cdn.jsdelivr.net/npm/markmap-view@0.17/dist/browser/index.js',
      'https://cdn.jsdelivr.net/npm/markmap-lib@0.17/dist/browser/index.js'
    ];

    function loadScript(src, cb) {
      var s = document.createElement('script');
      s.src = src;
      s.onload = cb;
      s.onerror = function() { console.error('Failed to load: ' + src); cb(); };
      document.head.appendChild(s);
    }

    function loadAll(srcs, done) {
      if (!srcs.length) { done(); return; }
      loadScript(srcs[0], function() { loadAll(srcs.slice(1), done); });
    }

    loadAll(libs, function() {
      try {
        var mm_lib = window.markmap;
        if (!mm_lib || !mm_lib.Transformer || !mm_lib.Markmap) {
          throw new Error('Markmap library not found');
        }
        var transformer = new mm_lib.Transformer();
        var rawText = article.innerText || article.textContent || '';
        var result = transformer.transform(rawText);
        var mm = mm_lib.Markmap.create(svgEl, Object.assign({
          initialExpandLevel: 2,
          maxWidth: 350,
          spacingHorizontal: 80,
          spacingVertical: 8,
          duration: 300,
          colorFreezeLevel: 2,
        }, config), result.root);
        btnFit.onclick = function() { mm.fit(); };
        setTimeout(function() { mm.fit(); }, 100);
      } catch(e) {
        console.error('Markmap render error:', e);
        wrapper.remove();
        article.style.display = '';
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  document.addEventListener('nav', function() {
    var old = document.getElementById('markmap-wrapper');
    if (old) old.remove();
    init();
  });
})();
