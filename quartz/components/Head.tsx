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
        
        /* Layout adjustments */
        .right.sidebar { display: none !important; }
        .center.center { max-width: 90vw !important; width: 100% !important; margin: 0 auto; }
        ` }} />

        <script dangerouslySetInnerHTML={{ __html: `
        document.addEventListener("nav", async (e) => {
          const isMarkmap = window.location.href.toLowerCase().includes('mapa-mental') || 
                            document.title.toLowerCase().includes('mapa mental');
          
          if (!isMarkmap) return;
        
          const container = document.querySelector('.markdown-preview-view') || document.querySelector('article');
          if (!container) return;
        
          const titleStr = \`${title}\`.replace(/"/g, '&quot;');
        
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
        
              if (tag === 'H2') { depth = 1; content = el.innerHTML; }
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
        
          // Ensure we don't duplicate SVG on multiple navigations
          const oldSvg = container.querySelector('.markmap-svg');
          if (oldSvg) oldSvg.remove();
        
          const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
          svg.style.width = "100%";
          svg.style.height = "80vh";
          svg.style.minHeight = "600px";
          svg.className = "markmap-svg";
          
          container.insertBefore(svg, container.firstChild);
          
          Array.from(container.children).forEach(child => {
            if (child !== svg && child.tagName !== 'H1' && !child.classList.contains('content-meta')) {
              child.style.display = 'none';
            }
          });
        
          const { Markmap } = window.markmap;
          try {
            Markmap.create(svg, {
              color: (node) => {
                  const colors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'];
                  return colors[node.depth % colors.length];
              },
              autoFit: true
            }, rootNode);
          } catch(e) {
            console.error("Markmap create error:", e);
          }
        });
        ` }} />
      </head>
    )
  }

  return Head
}) satisfies QuartzComponentConstructor
