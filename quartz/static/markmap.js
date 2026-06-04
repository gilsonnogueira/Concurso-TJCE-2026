
// Custom script injected by Quartz to support Markmap rendering
// Detects notes with markmap frontmatter and renders them as interactive mind maps

document.addEventListener("DOMContentLoaded", function () {
  // Check if this page has markmap frontmatter (the content will have markmap options)
  const articleContent = document.querySelector(".markdown-content") || document.querySelector("article") || document.querySelector(".content");
  if (!articleContent) return;

  // Check if this is a markmap note by looking for markmap in frontmatter
  // The Quartz syncer puts frontmatter data in the page
  const pageHasFrontmatter = document.querySelector("html");
  
  // Try to detect if note was markmap by checking URL or title pattern
  // We'll render markmap for all notes that have "Mapa Mental" in title
  const pageTitle = document.querySelector("h1")?.textContent || "";
  const isMindMap = pageTitle.toLowerCase().includes("mapa mental") || 
                    document.querySelector('[data-markmap]') !== null;
  
  if (!isMindMap) return;
  
  // Load markmap libraries dynamically
  const scripts = [
    "https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js",
    "https://cdn.jsdelivr.net/npm/markmap-view@0.17/dist/browser/index.js",
    "https://cdn.jsdelivr.net/npm/markmap-lib@0.17/dist/browser/index.js"
  ];
  
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }
  
  async function renderMarkmap() {
    try {
      for (const src of scripts) {
        await loadScript(src);
      }
      
      const { Transformer } = window.markmap;
      const { Markmap, loadCSS, loadJS } = window.markmap;
      
      // Get the markdown content as text
      const transformer = new Transformer();
      
      // Extract markdown text from the page content
      let mdContent = "";
      const headings = articleContent.querySelectorAll("h1, h2, h3, h4, h5, h6, li, p");
      
      // Build markdown from the DOM
      function buildMarkdown(el) {
        let md = "";
        for (const node of el.childNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const tag = node.tagName.toLowerCase();
            const text = node.textContent.trim();
            if (!text) continue;
            if (tag === "h1") md += `# ${text}\n`;
            else if (tag === "h2") md += `\n## ${text}\n`;
            else if (tag === "h3") md += `\n### ${text}\n`;
            else if (tag === "h4") md += `\n#### ${text}\n`;
            else if (tag === "ul" || tag === "ol") {
              for (const li of node.querySelectorAll(":scope > li")) {
                md += `- ${li.firstChild?.textContent?.trim() || li.textContent.trim()}\n`;
                const subList = li.querySelector("ul, ol");
                if (subList) {
                  for (const subLi of subList.querySelectorAll(":scope > li")) {
                    md += `  - ${subLi.textContent.trim()}\n`;
                  }
                }
              }
            }
          }
        }
        return md;
      }
      
      // Create markmap container
      const container = document.createElement("div");
      container.style.cssText = "width:100%;height:80vh;border:1px solid #333;border-radius:8px;margin:1rem 0;background:#1a1a2e;";
      
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.style.cssText = "width:100%;height:100%;";
      container.appendChild(svg);
      
      // Hide original content and show markmap
      articleContent.style.display = "none";
      articleContent.parentNode.insertBefore(container, articleContent);
      
      // Get actual content
      articleContent.style.display = "";
      const rawMd = articleContent.innerText;
      articleContent.style.display = "none";
      
      const { root } = transformer.transform(rawMd);
      const mm = Markmap.create(svg, {
        initialExpandLevel: 2,
        maxWidth: 400,
        spacingHorizontal: 80,
        spacingVertical: 20,
        color: (node) => {
          const colors = ["#4CAF50", "#2196F3", "#FF9800", "#E91E63", "#9C27B0", "#00BCD4"];
          return colors[node.depth % colors.length];
        }
      }, root);
      
    } catch (err) {
      console.error("Markmap rendering failed:", err);
      articleContent.style.display = "";
    }
  }
  
  renderMarkmap();
});
