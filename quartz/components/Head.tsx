import { i18n } from "../i18n"
import { FullSlug, getFileExtension, joinSegments, pathToRoot } from "../util/path"
import { CSSResourceToStyleElement, JSResourceToScriptElement } from "../util/resources"
import { googleFontHref, googleFontSubsetHref } from "../util/theme"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { unescapeHTML } from "../util/escape"
import { CustomOgImagesEmitterName } from "../../.quartz/plugins"
export default (() => {
  const Head: QuartzComponent = ({
    cfg,
    fileData,
    externalResources,
    ctx,
  }: QuartzComponentProps) => {
    const titleSuffix = cfg.pageTitleSuffix ?? ""
    const title =
      (fileData.frontmatter?.title ?? i18n(cfg.locale).propertyDefaults.title) + titleSuffix
    const description =
      fileData.frontmatter?.socialDescription ??
      fileData.frontmatter?.description ??
      unescapeHTML(fileData.description?.trim() ?? i18n(cfg.locale).propertyDefaults.description)

    const { css, js, additionalHead } = externalResources

    const url = new URL(`https://${cfg.baseUrl ?? "example.com"}`)
    const path = url.pathname as FullSlug
    const baseDir = fileData.slug === "404" ? path : pathToRoot(fileData.slug!)
    const iconPath = joinSegments(baseDir, "static/icon.png")

    // Url of current page
    const socialUrl =
      fileData.slug === "404" ? url.toString() : joinSegments(url.toString(), fileData.slug!)

    const usesCustomOgImage = ctx.cfg.plugins.emitters.some(
      (e) => e.name === CustomOgImagesEmitterName,
    )
    const ogImageDefaultPath = `https://${cfg.baseUrl}/static/og-image.png`

    const coreStylesheet = css[0]?.content
    const coreScript = js.find(
      (r) => r.loadTime === "beforeDOMReady" && r.contentType === "external",
    )

    return (
      <head>
        <title>{title}</title>
        <meta charSet="utf-8" />
        {coreStylesheet && <link rel="preload" href={coreStylesheet} as="style" />}
        {coreScript && coreScript.contentType === "external" && (
          <link rel="preload" href={coreScript.src} as="script" />
        )}
        {cfg.theme.cdnCaching && cfg.theme.fontOrigin === "googleFonts" && (
          <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" />
            <link rel="stylesheet" href={googleFontHref(cfg.theme)} />
            {cfg.theme.typography.title && (
              <link rel="stylesheet" href={googleFontSubsetHref(cfg.theme, cfg.pageTitle)} />
            )}
          </>
        )}
        <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossOrigin="anonymous" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        <meta name="og:site_name" content={cfg.pageTitle}></meta>
        <meta property="og:title" content={title} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta property="og:description" content={description} />
        <meta property="og:image:alt" content={description} />

        {!usesCustomOgImage && (
          <>
            <meta property="og:image" content={ogImageDefaultPath} />
            <meta property="og:image:url" content={ogImageDefaultPath} />
            <meta name="twitter:image" content={ogImageDefaultPath} />
            <meta
              property="og:image:type"
              content={`image/${getFileExtension(ogImageDefaultPath) ?? "png"}`}
            />
          </>
        )}

        {cfg.baseUrl && (
          <>
            <meta property="twitter:domain" content={cfg.baseUrl}></meta>
            <meta property="og:url" content={socialUrl}></meta>
            <meta property="twitter:url" content={socialUrl}></meta>
          </>
        )}

        <link rel="icon" href={iconPath} />
        <meta name="description" content={description} />
        <meta name="generator" content="Quartz" />

        {css.map((resource) => CSSResourceToStyleElement(resource, true))}
        {js
          .filter((resource) => resource.loadTime === "beforeDOMReady")
          .map((res) => JSResourceToScriptElement(res, true))}
        {additionalHead.map((resource) => {
          if (typeof resource === "function") {
            return resource(fileData)
          } else {
            return resource
          }
        })}

        <style dangerouslySetInnerHTML={{ __html: `
        /* Markmap - Ajustes de Contraste para Modo Noturno */
        body.theme-dark .markmap text, body.theme-dark .markmap-svg text, .theme-dark .markmap text { fill: #e2e8f0 !important; color: #e2e8f0 !important; }
        body.theme-dark .markmap foreignObject *, .theme-dark .markmap foreignObject * { color: #e2e8f0 !important; }
        body.theme-dark .markmap foreignObject strong, body.theme-dark .markmap foreignObject strong *, body.theme-dark .markmap foreignObject b, body.theme-dark .markmap foreignObject b *, .theme-dark .markmap foreignObject strong, .theme-dark .markmap foreignObject strong *, .theme-dark .markmap foreignObject b, .theme-dark .markmap foreignObject b * { color: #58a6ff !important; font-weight: bold; }
        body.theme-dark .markmap foreignObject em, body.theme-dark .markmap foreignObject i, .theme-dark .markmap foreignObject em, .theme-dark .markmap foreignObject i { font-style: italic; }
        body.theme-dark .markmap foreignObject mark, body.theme-dark .markmap foreignObject mark *, .theme-dark .markmap foreignObject mark, .theme-dark .markmap foreignObject mark * { background-color: #ffd859 !important; color: #111111 !important; -webkit-text-fill-color: #111111 !important; padding: 0 !important; margin: 0 !important; }
        body.theme-dark .markmap foreignObject a, body.theme-dark .markmap foreignObject a *, .theme-dark .markmap foreignObject a, .theme-dark .markmap foreignObject a * { color: #79c0ff !important; }
        body.theme-dark .markmap-node circle[fill="#fff" i], body.theme-dark .markmap-node circle[fill="#ffffff" i], body.theme-dark .markmap-node circle[fill="white" i], body.theme-dark .markmap-node circle[fill="rgb(255, 255, 255)" i], body.theme-dark .markmap-node circle[fill="rgb(255,255,255)" i], body.theme-dark .markmap-node circle[style*="fff" i], body.theme-dark .markmap-node circle[style*="white" i], body.theme-dark .markmap-node circle[style*="255, 255, 255" i], body.theme-dark .markmap-node circle[style*="255,255,255" i], .theme-dark .markmap-node circle[fill="#fff" i], .theme-dark .markmap-node circle[style*="fff" i] { fill: transparent !important; }
        
        /* Layout adjustments - sempre oculta sidebar direita */
        .right.sidebar { display: none !important; }
        .center.center { max-width: 90vw !important; width: 100% !important; margin: 0 auto; }

        /* Quando for mapa mental, oculta sidebar esquerda e expande */
        body.is-markmap .left.sidebar { display: none !important; }
        body.is-markmap .center.center { max-width: 100vw !important; width: 100vw !important; margin: 0 !important; padding: 0 !important; }
        body.is-markmap article { padding: 0 !important; }
        body.is-markmap .page-header { padding: 0.5rem 1rem !important; }

        /* SVG ocupa toda a area restante apos o cabecalho */
        body.is-markmap .markmap-svg {
          display: block;
          width: 100% !important;
          cursor: grab;
        }
        body.is-markmap .markmap-svg:active { cursor: grabbing; }

        /* foreignObject pointer-events:none -> pan funciona em TODA a area do mapa */
        /* Links sao tratados via JS com document.elementsFromPoint */
        .markmap-node foreignObject { pointer-events: none; }
        .markmap-node circle { cursor: pointer; }

        /* Botoes flutuantes de controle do mapa mental */
        .markmap-controls {
          position: fixed;
          bottom: 24px;
          right: 24px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          z-index: 9999;
        }
        .markmap-controls button {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.2);
          background: rgba(30,30,40,0.85);
          color: #e2e8f0;
          font-size: 18px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.4);
          transition: background 0.2s;
          backdrop-filter: blur(6px);
        }
        .markmap-controls button:hover { background: rgba(60,60,80,0.95); }
        .theme-light .markmap-controls button {
          background: rgba(240,240,245,0.9);
          color: #1a1a2e;
          border: 1px solid rgba(0,0,0,0.15);
        }
        ` }} />

        <script dangerouslySetInnerHTML={{ __html: `
        document.addEventListener("nav", async (e) => {
          const isMarkmap = window.location.href.toLowerCase().includes('mapa-mental') || 
                            document.title.toLowerCase().includes('mapa mental');
          
          // Aplica/remove classe no body para controlar layout via CSS
          if (isMarkmap) {
            document.body.classList.add('is-markmap');
          } else {
            document.body.classList.remove('is-markmap');
            return;
          }
        
          const container = document.querySelector('.markdown-preview-view') || document.querySelector('article');
          if (!container) return;
        
          // Usa o H1 do conteudo como no central (igual ao Obsidian)
          const h1El = container.querySelector('h1');
          let titleStr;
          if (h1El) {
            const temp = document.createElement('div');
            temp.innerHTML = h1El.innerHTML;
            temp.querySelectorAll('a.internal-link[role="anchor"]').forEach(a => a.remove());
            titleStr = temp.innerHTML.trim();
          } else {
            titleStr = \`${title}\`.replace(/"/g, '&quot;');
          }
        
          const loadScript = (src) => new Promise((resolve, reject) => {
            if (document.querySelector(\`script[src="\${src}"]\`)) { resolve(); return; }
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
        
          if (!window.markmapLoadingStarted) {
            window.markmapLoadingStarted = true;
            try {
              await loadScript("https://cdn.jsdelivr.net/npm/d3@7");
              await loadScript("https://cdn.jsdelivr.net/npm/markmap-view@0.17.0/dist/browser/index.js");
              window.markmapLoaded = true;
            } catch (err) {
              console.error("Failed to load markmap scripts", err);
              return;
            }
          } else {
            // Wait if it's already loading from a previous navigation
            for(let i=0; i<100; i++) {
              if (window.markmapLoaded) break;
              await new Promise(r => setTimeout(r, 50));
            }
          }
          
          if (!window.markmap || !window.markmap.Markmap) {
             console.error("Markmap is not fully initialized!");
             return;
          }
          
          const parseDOMToINode = (containerEl, rootTitle) => {
            const rootNode = { type: 'heading', depth: 0, payload: { lines: [0, 1] }, content: rootTitle, children: [] };
            const stack = [ { depth: 0, node: rootNode } ];
        
            const children = Array.from(containerEl.children);
        
            const parseUl = (ul, depth) => {
              const nodes = [];
              Array.from(ul.children).forEach(li => {
                if (li.tagName === "LI") {
                  const temp = document.createElement('div');
                  temp.innerHTML = li.innerHTML;
                  temp.querySelectorAll(':scope > ul, :scope > ol').forEach(e => e.remove());
                  temp.querySelectorAll('a.internal-link[role="anchor"]').forEach(a => a.remove());
                  
                  const html = temp.innerHTML.trim();
                  const node = { type: 'heading', depth: depth, payload: { lines: [0, 1] }, content: html, children: [] };
                  const childUl = Array.from(li.children).find(c => c.tagName === "UL" || c.tagName === "OL");
                  if (childUl) {
                    node.children = parseUl(childUl, depth + 1);
                  }
                  nodes.push(node);
                }
              });
              return nodes;
            };
        
            children.forEach(el => {
              const tag = el.tagName;
              let depth = -1;
              let content = "";
              let isList = false;
        
              // H1 vira o no raiz (ja tratado acima), ignoramos aqui
              if (tag === 'H1') { return; }
              else if (tag === 'H2') { depth = 1; content = el.innerHTML; }
              else if (tag === 'H3') { depth = 2; content = el.innerHTML; }
              else if (tag === 'H4') { depth = 3; content = el.innerHTML; }
              else if (tag === 'H5') { depth = 4; content = el.innerHTML; }
              else if (tag === 'H6') { depth = 5; content = el.innerHTML; }
              else if (tag === 'UL' || tag === 'OL') { isList = true; }
        
              if (depth !== -1) {
                const temp = document.createElement('div');
                temp.innerHTML = content;
                temp.querySelectorAll('a.internal-link[role="anchor"]').forEach(a => a.remove());
                content = temp.innerHTML.trim();
        
                const node = { type: 'heading', depth: depth, payload: { lines: [0, 1] }, content: content, children: [] };
                
                while (stack.length > 1 && stack[stack.length - 1].depth >= depth) {
                  stack.pop();
                }
                stack[stack.length - 1].node.children.push(node);
                stack.push({ depth: depth, node: node });
              } else if (isList) {
                const currentTop = stack[stack.length - 1];
                const nodes = parseUl(el, currentTop.depth + 1);
                currentTop.node.children.push(...nodes);
              }
            });
        
            return rootNode;
          };
        
          const rootNode = parseDOMToINode(container, titleStr);
          
          if (rootNode.children.length === 0) return;
        
          // Calcula altura disponivel para o SVG (tela - cabecalho)
          const headerEl = document.querySelector('.page-header') || document.querySelector('header');
          const headerH = headerEl ? headerEl.getBoundingClientRect().bottom : 80;
          const svgH = Math.max(window.innerHeight - headerH - 8, 400);

          const oldSvg = container.querySelector('.markmap-svg');
          if (oldSvg) oldSvg.remove();

          const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
          svg.style.width = "100%";
          svg.style.height = svgH + "px";
          svg.className = "markmap-svg";
          
          container.insertBefore(svg, container.firstChild);

          // Impede scroll da pagina quando o mouse esta sobre o mapa
          svg.addEventListener('wheel', (e) => { e.preventDefault(); }, { passive: false });
          svg.addEventListener('touchmove', (e) => { e.preventDefault(); }, { passive: false });

          // Detecta clique vs drag para navegacao de links
          // document.elementsFromPoint encontra elementos HTML mesmo com pointer-events:none
          let _dragDist = 0, _mx = 0, _my = 0;
          svg.addEventListener('mousedown', (e) => {
            _mx = e.clientX; _my = e.clientY; _dragDist = 0;
          });
          svg.addEventListener('mousemove', (e) => {
            _dragDist += Math.abs(e.clientX - _mx) + Math.abs(e.clientY - _my);
            _mx = e.clientX; _my = e.clientY;
          });
          svg.addEventListener('click', (e) => {
            if (_dragDist > 8) return; // foi drag, nao clique
            const els = document.elementsFromPoint(e.clientX, e.clientY);
            for (const el of els) {
              const a = el.tagName === 'A' ? el : el.closest?.('a');
              if (a?.href) {
                e.preventDefault();
                e.stopPropagation();
                // Usa o router SPA se disponivel, senao navega diretamente
                if (window.spaNavigate) window.spaNavigate(new URL(a.href));
                else window.location.href = a.href;
                return;
              }
            }
          });
          // Oculta todo conteudo original - o H1 virou o no raiz do mapa
          Array.from(container.children).forEach(child => {
            if (child !== svg) {
              child.style.display = 'none';
            }
          });
        
          const branchColors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#bcbd22', '#17becf', '#e6550d'];

          // Atribui indice de ramo a todos os nos (mesma cor para todo o ramo)
          const assignBranch = (node, branchIdx) => {
            node._branchIdx = branchIdx;
            node.children?.forEach(child => assignBranch(child, branchIdx));
          };
          rootNode._branchIdx = -1;
          rootNode.children?.forEach((child, i) => assignBranch(child, i));

          const { Markmap } = window.markmap;
          let mm;
          try {
            mm = Markmap.create(svg, {
              maxWidth: 280,
              spacingVertical: 8,
              spacingHorizontal: 60,
              autoFit: true,
              initialExpandLevel: 2,
              color: (node) => {
                if (node._branchIdx === undefined || node._branchIdx < 0) return '#888888';
                return branchColors[node._branchIdx % branchColors.length];
              },
            }, rootNode);
          } catch(e) {
            console.error("Markmap create error:", e);
            return;
          }

          // MutationObserver: reordena circulos automaticamente sempre que o Markmap atualiza o DOM
          // Isso garante que os circulos ficam SEMPRE na frente do foreignObject, inclusive apos:
          // - Render inicial (com transicoes D3 de ~300ms)
          // - Clique para expandir/recolher ramos
          // - Botoes de expandir/recolher tudo
          const reorderCircles = () => {
            svg.querySelectorAll('.markmap-node').forEach(nodeEl => {
              const circle = nodeEl.querySelector('circle');
              if (circle && circle !== nodeEl.lastElementChild) {
                nodeEl.appendChild(circle);
              }
            });
          };

          let observerTimer = null;
          const circleObserver = new MutationObserver(() => {
            // Debounce: espera 350ms de inatividade antes de reordenar
            // (equivale ao fim das transicoes D3)
            clearTimeout(observerTimer);
            observerTimer = setTimeout(reorderCircles, 350);
          });
          circleObserver.observe(svg, { childList: true, subtree: true, attributes: true, attributeFilter: ['transform'] });

          // Remove controles antigos se houver (navegação SPA)
          document.querySelector('.markmap-controls')?.remove();

          // Cria botões de controle flutuantes
          const controls = document.createElement('div');
          controls.className = 'markmap-controls';

          // Helper: pega o dado interno do markmap (compativel com versoes diferentes)
          const getMMData = () => mm.state?.data ?? mm._data ?? rootNode;

          // Helper: forca re-render (compativel com versoes diferentes)
          const doRender = () => {
            if (typeof mm.renderData === 'function') mm.renderData();
            else if (typeof mm.refresh === 'function') mm.refresh();
            else mm.setData(getMMData());
          };

          // Botao: Expandir tudo  (<> = abre)
          const btnExpand = document.createElement('button');
          btnExpand.title = 'Expandir tudo';
          btnExpand.innerHTML = '&lt;&gt;';
          btnExpand.style.fontSize = '13px';
          btnExpand.style.fontWeight = 'bold';
          btnExpand.onclick = () => {
            const traverse = (node) => {
              node.payload = { ...node.payload, fold: 0 };
              node.children?.forEach(traverse);
            };
            traverse(getMMData());
            doRender();
            setTimeout(() => mm.fit(), 400);
          };

          // Botao: Recolher tudo  (>< = fecha)
          const btnCollapse = document.createElement('button');
          btnCollapse.title = 'Recolher tudo';
          btnCollapse.innerHTML = '&gt;&lt;';
          btnCollapse.style.fontSize = '13px';
          btnCollapse.style.fontWeight = 'bold';
          btnCollapse.onclick = () => {
            const traverse = (node, isRoot) => {
              if (!isRoot) node.payload = { ...node.payload, fold: 1 };
              node.children?.forEach(c => traverse(c, false));
            };
            traverse(getMMData(), true);
            doRender();
            setTimeout(() => mm.fit(), 400);
          };

          // Botão: Resetar / Ajustar à tela
          const btnFit = document.createElement('button');
          btnFit.title = 'Ajustar à tela';
          btnFit.innerHTML = '⊡';
          btnFit.onclick = () => mm.fit();

          // Botão: Zoom +
          const btnZoomIn = document.createElement('button');
          btnZoomIn.title = 'Zoom +';
          btnZoomIn.innerHTML = '+';
          btnZoomIn.style.fontWeight = 'bold';
          btnZoomIn.onclick = () => mm.rescale(1.3);

          // Botão: Zoom -
          const btnZoomOut = document.createElement('button');
          btnZoomOut.title = 'Zoom -';
          btnZoomOut.innerHTML = '−';
          btnZoomOut.style.fontWeight = 'bold';
          btnZoomOut.onclick = () => mm.rescale(0.77);

          controls.append(btnExpand, btnCollapse, btnFit, btnZoomIn, btnZoomOut);
          document.body.appendChild(controls);

          // Remove controles ao sair da pagina de mapa mental
          document.addEventListener('nav', () => {
            controls.remove();
          }, { once: true });
        });
        ` }} />
      </head>
    )
  }

  return Head
}) satisfies QuartzComponentConstructor
