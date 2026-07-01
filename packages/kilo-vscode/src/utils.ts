import * as crypto from "crypto"
import * as vscode from "vscode"
import { buildCspString } from "./webview-html-utils"

function getNonce(): string {
  return crypto.randomBytes(16).toString("hex")
}

const SIZES = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24]
const DIFF_PALETTES = ["kilo", "muted", "highContrast", "vscode"] as const
const SHIKI_DIFF_THEMES = [
  "andromeeda",
  "aurora-x",
  "ayu-dark",
  "catppuccin-frappe",
  "catppuccin-latte",
  "catppuccin-macchiato",
  "catppuccin-mocha",
  "dark-plus",
  "dracula",
  "dracula-soft",
  "everforest-dark",
  "everforest-light",
  "github-dark",
  "github-dark-default",
  "github-dark-dimmed",
  "github-dark-high-contrast",
  "github-light",
  "github-light-default",
  "github-light-high-contrast",
  "gruvbox-dark-hard",
  "gruvbox-dark-medium",
  "gruvbox-dark-soft",
  "gruvbox-light-hard",
  "gruvbox-light-medium",
  "gruvbox-light-soft",
  "houston",
  "kanagawa-dragon",
  "kanagawa-lotus",
  "kanagawa-wave",
  "laserwave",
  "light-plus",
  "material-theme",
  "material-theme-darker",
  "material-theme-lighter",
  "material-theme-ocean",
  "material-theme-palenight",
  "min-dark",
  "min-light",
  "monokai",
  "night-owl",
  "nord",
  "one-dark-pro",
  "one-light",
  "plastic",
  "poimandres",
  "red",
  "rose-pine",
  "rose-pine-dawn",
  "rose-pine-moon",
  "slack-dark",
  "slack-ochin",
  "snazzy-light",
  "solarized-dark",
  "solarized-light",
  "synthwave-84",
  "tokyo-night",
  "vesper",
  "vitesse-black",
  "vitesse-dark",
  "vitesse-light",
] as const
const DIFF_SYNTAX_THEMES = ["kilo", ...SHIKI_DIFF_THEMES] as const

export type DiffPalette = (typeof DIFF_PALETTES)[number]
export type DiffSyntaxTheme = (typeof DIFF_SYNTAX_THEMES)[number]

export interface WebviewDisplaySettings {
  chatReadableWidth: number
  diffFontSize: number
  diffPalette: DiffPalette
  diffSyntaxTheme: DiffSyntaxTheme
}

function clamp(size: number) {
  if (!Number.isFinite(size)) return 13
  return Math.min(24, Math.max(10, Math.round(size)))
}

export function getWebviewFontSize(): number {
  const raw = vscode.workspace.getConfiguration("kilo-code.new").get<number>("fontSize", 13)
  return clamp(raw)
}

function clampWidth(width: number) {
  if (!Number.isFinite(width)) return 132
  return Math.min(220, Math.max(80, Math.round(width)))
}

function getDiffPalette(): DiffPalette {
  const config = vscode.workspace.getConfiguration("kilo-code.new")
  const raw = config.get<string>("diffPalette", config.get<string>("diffTheme", "muted"))
  return DIFF_PALETTES.includes(raw as DiffPalette) ? (raw as DiffPalette) : "muted"
}

function getDiffSyntaxTheme(): DiffSyntaxTheme {
  const raw = vscode.workspace.getConfiguration("kilo-code.new").get<string>("diffSyntaxTheme", "kilo")
  return DIFF_SYNTAX_THEMES.includes(raw as DiffSyntaxTheme) ? (raw as DiffSyntaxTheme) : "kilo"
}

function shikiTheme(theme: DiffSyntaxTheme): string {
  return theme === "kilo" ? "Kilo" : theme
}

export function getWebviewDisplaySettings(): WebviewDisplaySettings {
  const config = vscode.workspace.getConfiguration("kilo-code.new")

  return {
    chatReadableWidth: clampWidth(config.get<number>("chatReadableWidth", 132)),
    diffFontSize: clamp(config.get<number>("diffFontSize", 13)),
    diffPalette: getDiffPalette(),
    diffSyntaxTheme: getDiffSyntaxTheme(),
  }
}

function diffPaletteVars(palette: DiffPalette): string {
  if (palette === "vscode") {
    return `
      --kilo-diff-bg-context: var(--vscode-editor-background);
      --kilo-diff-bg-hover: var(--vscode-list-hoverBackground, var(--vscode-editor-lineHighlightBackground));
      --kilo-diff-bg-separator: var(--vscode-diffEditor-unchangedRegionBackground, var(--vscode-editor-lineHighlightBackground));
      --kilo-diff-bg-addition: var(--vscode-diffEditor-insertedLineBackground, var(--vscode-diffEditor-insertedTextBackground));
      --kilo-diff-bg-addition-number: var(--vscode-diffEditorGutter-insertedLineBackground, var(--vscode-diffEditor-insertedLineBackground, var(--vscode-editorGutter-background)));
      --kilo-diff-bg-addition-hover: var(--vscode-diffEditor-insertedTextBackground, var(--vscode-diffEditor-insertedLineBackground));
      --kilo-diff-bg-addition-emphasis: var(--vscode-diffEditor-insertedTextBackground);
      --kilo-diff-bg-deletion: var(--vscode-diffEditor-removedLineBackground, var(--vscode-diffEditor-removedTextBackground));
      --kilo-diff-bg-deletion-number: var(--vscode-diffEditorGutter-removedLineBackground, var(--vscode-diffEditor-removedLineBackground, var(--vscode-editorGutter-background)));
      --kilo-diff-bg-deletion-hover: var(--vscode-diffEditor-removedTextBackground, var(--vscode-diffEditor-removedLineBackground));
      --kilo-diff-bg-deletion-emphasis: var(--vscode-diffEditor-removedTextBackground);
      --kilo-diff-fg-number: var(--vscode-editorLineNumber-foreground);
      --icon-diff-add-base: var(--vscode-gitDecoration-addedResourceForeground);
      --icon-diff-delete-base: var(--vscode-gitDecoration-deletedResourceForeground);
      --text-diff-add-base: var(--vscode-editor-foreground);
      --text-diff-delete-base: var(--vscode-editor-foreground);
      --surface-diff-add-base: var(--kilo-diff-bg-addition);
      --surface-diff-add-strong: var(--kilo-diff-bg-addition-hover);
      --surface-diff-delete-base: var(--kilo-diff-bg-deletion);
      --surface-diff-delete-strong: var(--kilo-diff-bg-deletion-hover);`
  }

  if (palette === "highContrast") {
    return `
      --kilo-diff-bg-context: light-dark(#ffffff, #0d1117);
      --kilo-diff-bg-hover: light-dark(#eef2ff, #1f2937);
      --kilo-diff-bg-separator: light-dark(#dbeafe, #243b55);
      --kilo-diff-bg-addition: light-dark(#d1fae5, #053b1d);
      --kilo-diff-bg-addition-number: light-dark(#a7f3d0, #075c2d);
      --kilo-diff-bg-addition-hover: light-dark(#86efac, #0f7a3b);
      --kilo-diff-bg-addition-emphasis: light-dark(rgb(34 197 94 / 0.22), rgb(34 197 94 / 0.28));
      --kilo-diff-bg-deletion: light-dark(#ffe4e6, #4a1018);
      --kilo-diff-bg-deletion-number: light-dark(#fecdd3, #751723);
      --kilo-diff-bg-deletion-hover: light-dark(#fda4af, #9f1d2f);
      --kilo-diff-bg-deletion-emphasis: light-dark(rgb(244 63 94 / 0.28), rgb(244 63 94 / 0.34));
      --kilo-diff-fg-number: light-dark(#475569, #cbd5e1);
      --kilo-diff-fg-addition: light-dark(#065f46, #bbf7d0);
      --kilo-diff-fg-deletion: light-dark(#9f1239, #fecdd3);
      --syntax-diff-add: light-dark(#047857, #4ade80);
      --syntax-diff-delete: light-dark(#be123c, #fb7185);`
  }

  if (palette === "kilo") return ""

  return `
      --kilo-diff-bg-context: light-dark(#fbfcfe, #15191f);
      --kilo-diff-bg-hover: light-dark(#f1f5f9, #1d2430);
      --kilo-diff-bg-separator: light-dark(#eef6ff, #1b2a3a);
      --kilo-diff-bg-addition: light-dark(#e4f7eb, #172d20);
      --kilo-diff-bg-addition-number: light-dark(#c9efd8, #214b31);
      --kilo-diff-bg-addition-hover: light-dark(#abe4c2, #28613d);
      --kilo-diff-bg-addition-emphasis: light-dark(rgb(22 163 74 / 0.2), rgb(74 222 128 / 0.24));
      --kilo-diff-bg-deletion: light-dark(#ffebee, #351a20);
      --kilo-diff-bg-deletion-number: light-dark(#ffd5dc, #5a2530);
      --kilo-diff-bg-deletion-hover: light-dark(#fdbbc7, #74303c);
      --kilo-diff-bg-deletion-emphasis: light-dark(rgb(225 29 72 / 0.22), rgb(251 113 133 / 0.28));
      --kilo-diff-fg-number: light-dark(#64748b, #94a3b8);
      --kilo-diff-fg-addition: light-dark(#166534, #bbf7d0);
      --kilo-diff-fg-deletion: light-dark(#9f1239, #fecdd3);
      --syntax-diff-add: light-dark(#15803d, #86efac);
      --syntax-diff-delete: light-dark(#be123c, #fda4af);
      --icon-diff-add-base: var(--syntax-diff-add);
      --icon-diff-delete-base: var(--syntax-diff-delete);
      --text-diff-add-base: var(--syntax-diff-add);
      --text-diff-delete-base: var(--syntax-diff-delete);
      --surface-diff-add-base: var(--kilo-diff-bg-addition);
      --surface-diff-add-strong: var(--kilo-diff-bg-addition-hover);
      --surface-diff-delete-base: var(--kilo-diff-bg-deletion);
      --surface-diff-delete-strong: var(--kilo-diff-bg-deletion-hover);`
}

function displayStyle(): string {
  const settings = getWebviewDisplaySettings()
  return `
      --kilo-chat-readable-width: ${settings.chatReadableWidth}ch;
      --kilo-diff-font-size: ${settings.diffFontSize}px;
      --kilo-diff-line-height: ${Math.round(settings.diffFontSize * 1.65)}px;
      --kilo-diff-shiki-theme: ${shikiTheme(settings.diffSyntaxTheme)};${diffPaletteVars(settings.diffPalette)}`
}

function fontStyle(): string {
  const base = getWebviewFontSize()
  const vars = SIZES.map((size) => `--kilo-font-size-${size}: ${(base * size) / 13}px;`).join("\n      ")
  return `:root {
      ${vars}
      --kilo-font-scale: ${base / 13};
      --font-size-x-small: var(--kilo-font-size-10);
      --font-size-small: var(--kilo-font-size-11);
      --font-size-base: var(--kilo-font-size-13);
      --font-size-large: var(--kilo-font-size-16);
      ${displayStyle()}
    }`
}

export function buildWebviewHtml(
  webview: vscode.Webview,
  opts: {
    scriptUri: vscode.Uri
    styleUri: vscode.Uri
    iconsBaseUri: vscode.Uri
    workerUri: vscode.Uri
    title: string
    port?: number
    extraStyles?: string
  },
): string {
  const nonce = getNonce()
  const csp = buildCspString(webview.cspSource, nonce, opts.port)
  const markdownWorkerUri = opts.workerUri.toString().replace(/shiki-worker\.js$/, "markdown-shiki-worker.js")

  return `<!DOCTYPE html>
<html lang="en" data-theme="kilo-vscode">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="${csp}">
  <link rel="stylesheet" href="${opts.styleUri}">
  <title>${opts.title}</title>
  <style>
    ${fontStyle()}
    html {
      scrollbar-color: auto;

      ::-webkit-scrollbar-thumb {
        border: 3px solid transparent !important;
        background-clip: padding-box !important;
      }
    }
    html, body {
      margin: 0;
      padding: 0;
      height: 100%;
      overflow: hidden;
    }
    body {
      background-color: var(--vscode-sideBar-background, var(--vscode-editor-background));
      color: var(--vscode-foreground);
      font-family: var(--vscode-font-family);
    }
    #root {
      height: 100%;
    }${opts.extraStyles ? `\n    ${opts.extraStyles}` : ""}
  </style>
</head>
<body>
  <div id="root"></div>
  <script nonce="${nonce}">window.ICONS_BASE_URI = "${opts.iconsBaseUri}"; window.KILO_SHIKI_WORKER_URI = "${opts.workerUri}"; window.KILO_MARKDOWN_SHIKI_WORKER_URI = "${markdownWorkerUri}";</script>
  <script nonce="${nonce}" src="${opts.scriptUri}"></script>
</body>
</html>`
}
