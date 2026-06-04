import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"

/**
 * Quartz 4 Configuration
 * Customizado para o Concurso TJCE 2026
 */
const config: QuartzConfig = {
  configuration: {
    pageTitle: "Concurso TJCE 2026",
    pageTitleSuffix: " | TJCE",
    enableSPA: true,
    enablePopovers: true,
    analytics: null,
    locale: "pt-BR",
    baseUrl: "gilsonnogueira.github.io/Concurso-TJCE-2026",
    ignorePatterns: ["private", "templates", ".obsidian"],
    defaultDateType: "modified",
    theme: {
      fontOrigin: "googleFonts",
      cdnCaching: true,
      typography: {
        header: "Inter",
        body: "Inter",
        code: "IBM Plex Mono",
      },
      colors: {
        lightMode: {
          light: "#faf8f8",
          lightgray: "#e5e5e5",
          gray: "#b8b8b8",
          darkgray: "#4e4e4e",
          dark: "#2b2b2b",
          secondary: "#284b63",
          tertiary: "#84a59d",
          highlight: "rgba(143, 159, 169, 0.15)",
          textHighlight: "#fff23688",
        },
        darkMode: {
          light: "#161618",
          lightgray: "#393639",
          gray: "#646464",
          darkgray: "#d4d4d4",
          dark: "#ebebec",
          secondary: "#7b97aa",
          tertiary: "#84a59d",
          highlight: "rgba(143, 159, 169, 0.15)",
          textHighlight: "#b3aa0288",
        },
      },
    },
    additionalHead: [
      // Injeta Markmap para notas com frontmatter "markmap:"
      (fileData) => {
        const hasMarkmap = fileData.frontmatter?.markmap !== undefined
        if (!hasMarkmap) return null
        return (
          <>
            <script src="https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js" defer={false}></script>
            <script src="https://cdn.jsdelivr.net/npm/markmap-view@0.17/dist/browser/index.js" defer={false}></script>
            <script src="https://cdn.jsdelivr.net/npm/markmap-lib@0.17/dist/browser/index.js" defer={false}></script>
            <script src="https://cdn.jsdelivr.net/npm/markmap-common@0.17/dist/browser/index.js" defer={false}></script>
            <script dangerouslySetInnerHTML={{ __html: `
              window.__MARKMAP_CONFIG__ = ${JSON.stringify(fileData.frontmatter?.markmap ?? {})};
            `}}></script>
          </>
        )
      }
    ],
  },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.CreatedModifiedDate({
        priority: ["frontmatter", "git", "filesystem"],
      }),
      Plugin.SyntaxHighlighting({
        theme: {
          light: "github-light",
          dark: "github-dark",
        },
        keepBackground: false,
      }),
      Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false }),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.TableOfContents(),
      Plugin.CrawlLinks({ markdownLinkResolution: "shortest" }),
      Plugin.Description(),
      Plugin.Latex({ renderEngine: "katex" }),
    ],
    filters: [Plugin.RemoveDrafts()],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources(),
      Plugin.ContentPage(),
      Plugin.FolderPage(),
      Plugin.TagPage(),
      Plugin.ContentIndex({
        enableSiteMap: true,
        enableRSS: true,
      }),
      Plugin.Assets(),
      Plugin.Static(),
      Plugin.Favicon(),
      Plugin.NotFoundPage(),
      Plugin.CustomOgImages(),
    ],
  },
}

export default config
