import { i18n } from "../i18n"
import { FullSlug, getFileExtension, joinSegments, pathToRoot } from "../util/path"
import { CSSResourceToStyleElement, JSResourceToScriptElement } from "../util/resources"
import { googleFontHref, googleFontSubsetHref } from "../util/theme"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { unescapeHTML } from "../util/escape"
import { CustomOgImagesEmitterName } from "../plugins/emitters/ogImage"
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

    return (
      <head>
        <title>{title}</title>
        <meta charSet="utf-8" />
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
          <script dangerouslySetInnerHTML={{__html: "(function(){\n  'use strict';\n  var LIBS=['https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js','https://cdn.jsdelivr.net/npm/markmap-common@0.17/dist/browser/index.js','https://cdn.jsdelivr.net/npm/markmap-view@0.17/dist/browser/index.js','https://cdn.jsdelivr.net/npm/markmap-lib@0.17/dist/browser/index.js'];\n  var loaded=false,loading=false,queue=[];\n  function ensureLibs(cb){\n    if(loaded){cb();return;}\n    queue.push(cb);\n    if(loading)return;\n    loading=true;\n    var i=0;\n    function next(){\n      if(i>=LIBS.length){loaded=true;loading=false;queue.forEach(function(f){f();});queue=[];return;}\n      if(document.querySelector('script[src=\"'+LIBS[i]+'\"]')){i++;next();return;}\n      var s=document.createElement('script');s.src=LIBS[i];\n      s.onload=function(){i++;next();};s.onerror=function(){i++;next();};\n      document.head.appendChild(s);\n    }\n    next();\n  }\n  function isMarkmap(){\n    var h=document.querySelector('h1');\n    var t=(h?h.textContent:'').toLowerCase();\n    var u=location.pathname.toLowerCase();\n    return t.indexOf('mapa mental')!==-1||u.indexOf('mapa-mental')!==-1;\n  }\n  function render(){\n    if(!isMarkmap())return;\n    if(document.getElementById('markmap-svg'))return;\n    var art=document.querySelector('article');\n    if(!art)return;\n    var text=art.innerText||art.textContent||'';\n    if(!text.trim())return;\n    var svg=document.createElementNS('http://www.w3.org/2000/svg','svg');\n    svg.id='markmap-svg';\n    svg.style.cssText='display:block;width:100%;height:86vh;border-radius:8px;background:var(--light,#161618);border:1px solid var(--lightgray,#393639);margin-bottom:1rem;';\n    art.style.display='none';\n    art.parentNode.insertBefore(svg,art);\n    ensureLibs(function(){\n      var lib=window.markmap;\n      if(!lib||!lib.Transformer||!lib.Markmap){\n        console.error('[Markmap] lib nao encontrada');svg.remove();art.style.display='';return;\n      }\n      try{\n        var result=new lib.Transformer().transform(text);\n        var mm=lib.Markmap.create(svg,{initialExpandLevel:2,maxWidth:350,spacingHorizontal:80,spacingVertical:8,duration:300,colorFreezeLevel:2,zoom:true,pan:true},result.root);\n        setTimeout(function(){try{mm.fit();}catch(e){}},200);\n      }catch(e){console.error('[Markmap]',e);svg.remove();art.style.display='';}\n    });\n  }\n  // Registra listener ANTES de postscript.js disparar 'nav'\n  // Possivel pois este script eh inline e nao-deferred no <head>\n  document.addEventListener('nav',render);\n  // Fallback: window.load dispara apos todos os scripts (incluindo postscript.js)\n  // captura o caso onde 'nav' ja disparou antes deste script ser executado\n  window.addEventListener('load',function(){\n    setTimeout(function(){if(!document.getElementById('markmap-svg'))render();},50);\n  });\n})();"}}></script>
        <script dangerouslySetInnerHTML={{__html: "(function(){\n'use strict';\nvar _key=0;\nfunction node(content,children){return{content:content,children:children||[],state:{key:++_key}};}\n\nfunction domToTree(root){\n  // Pega titulo da pagina (h1 fora do article, gerado pelo Quartz)\n  var pageH1=document.querySelector('.article-title');\n  var title=pageH1?pageH1.textContent.trim():'Mapa Mental';\n\n  function getDirectText(el){\n    var t='';\n    for(var i=0;i<el.childNodes.length;i++){\n      var n=el.childNodes[i];\n      if(n.nodeType===3)t+=n.textContent;\n      else if(n.nodeType===1){\n        var tag=n.tagName.toLowerCase();\n        if(tag!=='ul'&&tag!=='ol'&&tag!=='details'&&tag!=='summary'){\n          t+=n.textContent;\n        }\n      }\n    }\n    return t.trim();\n  }\n\n  function processLi(li){\n    var text=getDirectText(li);\n    var children=[];\n    for(var i=0;i<li.children.length;i++){\n      var c=li.children[i];\n      var tag=c.tagName.toLowerCase();\n      if(tag==='ul'||tag==='ol'){\n        for(var j=0;j<c.children.length;j++){\n          var sub=processLi(c.children[j]);\n          if(sub)children.push(sub);\n        }\n      }\n    }\n    return text?node(text,children):null;\n  }\n\n  function processEl(el){\n    if(!el||el.nodeType!==1)return null;\n    var tag=el.tagName.toLowerCase();\n    if(tag==='script'||tag==='style'||tag==='noscript')return null;\n\n    if(/^h[1-6]$/.test(tag)){\n      var t=el.textContent.trim();\n      return t?node(t,[]):null;\n    }\n    if(tag==='li'){return processLi(el);}\n    if(tag==='ul'||tag==='ol'){\n      return Array.from(el.children).map(processLi).filter(Boolean);\n    }\n    if(tag==='p'){\n      var t=el.textContent.trim();\n      return t?node(t,[]):null;\n    }\n    // Para outros elementos, processa filhos\n    var results=[];\n    for(var i=0;i<el.children.length;i++){\n      var r=processEl(el.children[i]);\n      if(Array.isArray(r))results=results.concat(r);\n      else if(r)results.push(r);\n    }\n    return results.length?results:null;\n  }\n\n  var children=[];\n  for(var i=0;i<root.children.length;i++){\n    var r=processEl(root.children[i]);\n    if(Array.isArray(r))children=children.concat(r);\n    else if(r)children.push(r);\n  }\n  return node(title,children);\n}\n\nfunction isMarkmap(){\n  var h1=document.querySelector('h1');\n  var t=(h1?h1.textContent:'').toLowerCase();\n  var u=location.pathname.toLowerCase();\n  return t.indexOf('mapa mental')!==-1||u.indexOf('mapa-mental')!==-1;\n}\n\nvar libsLoaded=false,libsLoading=false,libQueue=[];\nvar LIBS=[\n  'https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js',\n  'https://cdn.jsdelivr.net/npm/markmap-common@0.17/dist/browser/index.js',\n  'https://cdn.jsdelivr.net/npm/markmap-view@0.17/dist/browser/index.js'\n];\nfunction ensureLibs(cb){\n  if(libsLoaded){cb();return;}\n  libQueue.push(cb);\n  if(libsLoading)return;\n  libsLoading=true;\n  var i=0;\n  function next(){\n    if(i>=LIBS.length){libsLoaded=true;libsLoading=false;libQueue.forEach(function(f){f();});libQueue=[];return;}\n    if(document.querySelector('script[src=\"'+LIBS[i]+'\"]')){i++;next();return;}\n    var s=document.createElement('script');s.src=LIBS[i];\n    s.onload=function(){i++;next();};s.onerror=function(){console.error('[MM] falha ao carregar '+LIBS[i]);i++;next();};\n    document.head.appendChild(s);\n  }\n  next();\n}\n\nfunction render(){\n  if(!isMarkmap())return;\n  if(document.getElementById('markmap-svg'))return;\n  var art=document.querySelector('article');\n  if(!art||!art.children.length)return;\n\n  var svg=document.createElementNS('http://www.w3.org/2000/svg','svg');\n  svg.id='markmap-svg';\n  svg.style.cssText='display:block;width:100%;height:86vh;border-radius:8px;background:var(--light,#161618);border:1px solid var(--lightgray,#393639);margin-bottom:1rem;';\n  art.style.display='none';\n  art.parentNode.insertBefore(svg,art);\n\n  ensureLibs(function(){\n    try{\n      var lib=window.markmap;\n      if(!lib||!lib.Markmap){\n        console.error('[MM] window.markmap.Markmap nao encontrado. Disponivel:',Object.keys(window).filter(function(k){return k.toLowerCase().indexOf('mark')!==-1;}));\n        svg.remove();art.style.display='';return;\n      }\n      var root=domToTree(art);\n      var mm=lib.Markmap.create(svg,{\n        initialExpandLevel:2,\n        maxWidth:350,\n        spacingHorizontal:80,\n        spacingVertical:8,\n        duration:300,\n        colorFreezeLevel:2,\n        zoom:true,\n        pan:true\n      },root);\n      window.addEventListener('resize',function(){try{mm.fit();}catch(e){}});\n      setTimeout(function(){try{mm.fit();}catch(e){}},300);\n    }catch(e){\n      console.error('[MM] erro:',e);\n      svg.remove();art.style.display='';\n    }\n  });\n}\n\n// Listener registrado ANTES de postscript.js disparar 'nav'\n// pois este script eh inline (nao-deferred) no <head>\ndocument.addEventListener('nav',render);\nwindow.addEventListener('load',function(){\n  setTimeout(function(){if(!document.getElementById('markmap-svg'))render();},100);\n});\n})();"}}></script>
      </head>
    )
  }

  return Head
}) satisfies QuartzComponentConstructor
