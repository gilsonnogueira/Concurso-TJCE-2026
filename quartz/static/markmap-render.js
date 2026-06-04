
(function () {
  function renderMarkmap() {
    if (typeof window.__MARKMAP_CONFIG__ === 'undefined') return;

    var config = window.__MARKMAP_CONFIG__;
    var article = document.querySelector('article') || document.querySelector('.center');
    if (!article) return;

    // Hide original content
    article.style.visibility = 'hidden';
    article.style.position = 'absolute';

    // Build container
    var wrapper = document.createElement('div');
    wrapper.style.cssText = 'width:100%;height:90vh;position:relative;';
    article.parentNode.insertBefore(wrapper, article);

    var toolbar = document.createElement('div');
    toolbar.style.cssText = 'padding:8px 0;display:flex;gap:8px;';
    var btnFit = document.createElement('button');
    btnFit.textContent = '⊕ Ajustar';
    btnFit.style.cssText = 'padding:4px 12px;border-radius:6px;border:1px solid #555;background:#333;color:#eee;cursor:pointer;font-size:0.85em;';
    toolbar.appendChild(btnFit);
    wrapper.appendChild(toolbar);

    var svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgEl.style.cssText = 'width:100%;height:calc(90vh - 40px);border-radius:8px;background:var(--light);';
    wrapper.appendChild(svgEl);

    // Wait for markmap libs to load
    var attempts = 0;
    var interval = setInterval(function () {
      attempts++;
      if (attempts > 30) { clearInterval(interval); article.style.visibility = ''; article.style.position = ''; return; }

      if (!window.markmap || !window.markmap.Transformer || !window.markmap.Markmap) return;
      clearInterval(interval);

      try {
        var Transformer = window.markmap.Transformer;
        var Markmap = window.markmap.Markmap;

        var transformer = new Transformer();
        var md = article.innerText || article.textContent;
        var result = transformer.transform(md);

        var mm = Markmap.create(svgEl, Object.assign({
          initialExpandLevel: 2,
          maxWidth: 300,
          spacingHorizontal: 80,
          spacingVertical: 10,
          duration: 400,
          colorFreezeLevel: 2,
        }, config), result.root);

        btnFit.onclick = function () { mm.fit(); };
        mm.fit();
      } catch (e) {
        console.error('Markmap error:', e);
        article.style.visibility = '';
        article.style.position = '';
        wrapper.remove();
      }
    }, 200);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderMarkmap);
  } else {
    renderMarkmap();
  }

  // SPA support
  document.addEventListener('nav', renderMarkmap);
})();
