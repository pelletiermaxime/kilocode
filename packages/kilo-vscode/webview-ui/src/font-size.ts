const DEFAULT_SIZE = 13
const SIZES = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24]
interface DisplaySettings {
  chatReadableWidth: number
  diffFontSize: number
  diffPalette: string
  diffSyntaxTheme: string
}

const DIFF_THEME_VARS = [
  "--kilo-diff-bg-context",
  "--kilo-diff-bg-hover",
  "--kilo-diff-bg-separator",
  "--kilo-diff-bg-addition",
  "--kilo-diff-bg-addition-number",
  "--kilo-diff-bg-addition-hover",
  "--kilo-diff-bg-addition-emphasis",
  "--kilo-diff-bg-deletion",
  "--kilo-diff-bg-deletion-number",
  "--kilo-diff-bg-deletion-hover",
  "--kilo-diff-bg-deletion-emphasis",
  "--kilo-diff-fg-number",
  "--kilo-diff-fg-addition",
  "--kilo-diff-fg-deletion",
  "--syntax-diff-add",
  "--syntax-diff-delete",
  "--icon-diff-add-base",
  "--icon-diff-delete-base",
  "--text-diff-add-base",
  "--text-diff-delete-base",
  "--surface-diff-add-base",
  "--surface-diff-add-strong",
  "--surface-diff-delete-base",
  "--surface-diff-delete-strong",
] as const

export function clampFontSize(size: number) {
  if (!Number.isFinite(size)) return DEFAULT_SIZE
  return Math.min(24, Math.max(10, Math.round(size)))
}

export function readFontSize() {
  if (typeof window === "undefined") return DEFAULT_SIZE
  const raw = getComputedStyle(document.documentElement).getPropertyValue("--kilo-font-size-13")
  const size = Number.parseFloat(raw)
  return clampFontSize(size)
}

export function applyFontSize(size: number) {
  const base = clampFontSize(size)
  const root = document.documentElement
  for (const token of SIZES) {
    root.style.setProperty(`--kilo-font-size-${token}`, `${(base * token) / DEFAULT_SIZE}px`)
  }
  root.style.setProperty("--kilo-font-scale", String(base / DEFAULT_SIZE))
  root.style.setProperty("--font-size-x-small", "var(--kilo-font-size-10)")
  root.style.setProperty("--font-size-small", "var(--kilo-font-size-11)")
  root.style.setProperty("--font-size-base", "var(--kilo-font-size-13)")
  root.style.setProperty("--font-size-large", "var(--kilo-font-size-16)")
}

function clampWidth(width: number) {
  if (!Number.isFinite(width)) return 132
  return Math.min(220, Math.max(80, Math.round(width)))
}

function shikiTheme(theme: string): string {
  return theme === "kilo" ? "Kilo" : theme
}

function diffPaletteVars(palette: string): Partial<Record<(typeof DIFF_THEME_VARS)[number], string>> {
  if (palette === "vscode") {
    return {
      "--kilo-diff-bg-context": "var(--vscode-editor-background)",
      "--kilo-diff-bg-hover": "var(--vscode-list-hoverBackground, var(--vscode-editor-lineHighlightBackground))",
      "--kilo-diff-bg-separator": "var(--vscode-diffEditor-unchangedRegionBackground, var(--vscode-editor-lineHighlightBackground))",
      "--kilo-diff-bg-addition": "var(--vscode-diffEditor-insertedLineBackground, var(--vscode-diffEditor-insertedTextBackground))",
      "--kilo-diff-bg-addition-number": "var(--vscode-diffEditorGutter-insertedLineBackground, var(--vscode-diffEditor-insertedLineBackground, var(--vscode-editorGutter-background)))",
      "--kilo-diff-bg-addition-hover": "var(--vscode-diffEditor-insertedTextBackground, var(--vscode-diffEditor-insertedLineBackground))",
      "--kilo-diff-bg-addition-emphasis": "var(--vscode-diffEditor-insertedTextBackground)",
      "--kilo-diff-bg-deletion": "var(--vscode-diffEditor-removedLineBackground, var(--vscode-diffEditor-removedTextBackground))",
      "--kilo-diff-bg-deletion-number": "var(--vscode-diffEditorGutter-removedLineBackground, var(--vscode-diffEditor-removedLineBackground, var(--vscode-editorGutter-background)))",
      "--kilo-diff-bg-deletion-hover": "var(--vscode-diffEditor-removedTextBackground, var(--vscode-diffEditor-removedLineBackground))",
      "--kilo-diff-bg-deletion-emphasis": "var(--vscode-diffEditor-removedTextBackground)",
      "--kilo-diff-fg-number": "var(--vscode-editorLineNumber-foreground)",
      "--icon-diff-add-base": "var(--vscode-gitDecoration-addedResourceForeground)",
      "--icon-diff-delete-base": "var(--vscode-gitDecoration-deletedResourceForeground)",
      "--text-diff-add-base": "var(--vscode-editor-foreground)",
      "--text-diff-delete-base": "var(--vscode-editor-foreground)",
      "--surface-diff-add-base": "var(--kilo-diff-bg-addition)",
      "--surface-diff-add-strong": "var(--kilo-diff-bg-addition-hover)",
      "--surface-diff-delete-base": "var(--kilo-diff-bg-deletion)",
      "--surface-diff-delete-strong": "var(--kilo-diff-bg-deletion-hover)",
    }
  }

  if (palette === "highContrast") {
    return {
      "--kilo-diff-bg-context": "light-dark(#ffffff, #0d1117)",
      "--kilo-diff-bg-hover": "light-dark(#eef2ff, #1f2937)",
      "--kilo-diff-bg-separator": "light-dark(#dbeafe, #243b55)",
      "--kilo-diff-bg-addition": "light-dark(#d1fae5, #053b1d)",
      "--kilo-diff-bg-addition-number": "light-dark(#a7f3d0, #075c2d)",
      "--kilo-diff-bg-addition-hover": "light-dark(#86efac, #0f7a3b)",
      "--kilo-diff-bg-addition-emphasis": "light-dark(rgb(34 197 94 / 0.22), rgb(34 197 94 / 0.28))",
      "--kilo-diff-bg-deletion": "light-dark(#ffe4e6, #4a1018)",
      "--kilo-diff-bg-deletion-number": "light-dark(#fecdd3, #751723)",
      "--kilo-diff-bg-deletion-hover": "light-dark(#fda4af, #9f1d2f)",
      "--kilo-diff-bg-deletion-emphasis": "light-dark(rgb(244 63 94 / 0.28), rgb(244 63 94 / 0.34))",
      "--kilo-diff-fg-number": "light-dark(#475569, #cbd5e1)",
      "--kilo-diff-fg-addition": "light-dark(#065f46, #bbf7d0)",
      "--kilo-diff-fg-deletion": "light-dark(#9f1239, #fecdd3)",
      "--syntax-diff-add": "light-dark(#047857, #4ade80)",
      "--syntax-diff-delete": "light-dark(#be123c, #fb7185)",
      "--icon-diff-add-base": "var(--syntax-diff-add)",
      "--icon-diff-delete-base": "var(--syntax-diff-delete)",
      "--text-diff-add-base": "var(--syntax-diff-add)",
      "--text-diff-delete-base": "var(--syntax-diff-delete)",
      "--surface-diff-add-base": "var(--kilo-diff-bg-addition)",
      "--surface-diff-add-strong": "var(--kilo-diff-bg-addition-hover)",
      "--surface-diff-delete-base": "var(--kilo-diff-bg-deletion)",
      "--surface-diff-delete-strong": "var(--kilo-diff-bg-deletion-hover)",
    }
  }

  if (palette === "kilo") return {}

  return {
    "--kilo-diff-bg-context": "light-dark(#fbfcfe, #15191f)",
    "--kilo-diff-bg-hover": "light-dark(#f1f5f9, #1d2430)",
    "--kilo-diff-bg-separator": "light-dark(#eef6ff, #1b2a3a)",
    "--kilo-diff-bg-addition": "light-dark(#e4f7eb, #172d20)",
    "--kilo-diff-bg-addition-number": "light-dark(#c9efd8, #214b31)",
    "--kilo-diff-bg-addition-hover": "light-dark(#abe4c2, #28613d)",
    "--kilo-diff-bg-addition-emphasis": "light-dark(rgb(22 163 74 / 0.2), rgb(74 222 128 / 0.24))",
    "--kilo-diff-bg-deletion": "light-dark(#ffebee, #351a20)",
    "--kilo-diff-bg-deletion-number": "light-dark(#ffd5dc, #5a2530)",
    "--kilo-diff-bg-deletion-hover": "light-dark(#fdbbc7, #74303c)",
    "--kilo-diff-bg-deletion-emphasis": "light-dark(rgb(225 29 72 / 0.22), rgb(251 113 133 / 0.28))",
    "--kilo-diff-fg-number": "light-dark(#64748b, #94a3b8)",
    "--kilo-diff-fg-addition": "light-dark(#166534, #bbf7d0)",
    "--kilo-diff-fg-deletion": "light-dark(#9f1239, #fecdd3)",
    "--syntax-diff-add": "light-dark(#15803d, #86efac)",
    "--syntax-diff-delete": "light-dark(#be123c, #fda4af)",
    "--icon-diff-add-base": "var(--syntax-diff-add)",
    "--icon-diff-delete-base": "var(--syntax-diff-delete)",
    "--text-diff-add-base": "var(--syntax-diff-add)",
    "--text-diff-delete-base": "var(--syntax-diff-delete)",
    "--surface-diff-add-base": "var(--kilo-diff-bg-addition)",
    "--surface-diff-add-strong": "var(--kilo-diff-bg-addition-hover)",
    "--surface-diff-delete-base": "var(--kilo-diff-bg-deletion)",
    "--surface-diff-delete-strong": "var(--kilo-diff-bg-deletion-hover)",
  }
}

export function applyDisplaySettings(settings: DisplaySettings) {
  const diffFontSize = clampFontSize(settings.diffFontSize)
  const root = document.documentElement
  root.style.setProperty("--kilo-chat-readable-width", `${clampWidth(settings.chatReadableWidth)}ch`)
  root.style.setProperty("--kilo-diff-font-size", `${diffFontSize}px`)
  root.style.setProperty("--kilo-diff-line-height", `${Math.round(diffFontSize * 1.65)}px`)
  root.style.setProperty("--kilo-diff-shiki-theme", shikiTheme(settings.diffSyntaxTheme))

  const vars = diffPaletteVars(settings.diffPalette)
  for (const key of DIFF_THEME_VARS) {
    const value = vars[key]
    if (value === undefined) root.style.removeProperty(key)
    else root.style.setProperty(key, value)
  }

  window.dispatchEvent(new CustomEvent("kilo-display-settings-changed", { detail: settings }))
}
