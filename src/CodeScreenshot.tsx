import { useState, useRef, useCallback } from 'react'
import { Sun, Moon, Languages, Download, Camera } from 'lucide-react'

const translations = {
  en: {
    title: 'Code Screenshot',
    subtitle: 'Generate beautiful code screenshots. Choose theme, language, padding and export as PNG.',
    codePlaceholder: 'Paste your code here...',
    language: 'Language',
    theme: 'Theme',
    padding: 'Padding',
    borderRadius: 'Border radius',
    export: 'Export PNG',
    preview: 'Preview',
    fileName: 'code-screenshot',
    builtBy: 'Built by',
  },
  pt: {
    title: 'Screenshot de Codigo',
    subtitle: 'Gere capturas de codigo bonitas. Escolha tema, linguagem, padding e exporte como PNG.',
    codePlaceholder: 'Cole seu codigo aqui...',
    language: 'Linguagem',
    theme: 'Tema',
    padding: 'Padding',
    borderRadius: 'Borda arredondada',
    export: 'Exportar PNG',
    preview: 'Previsualizar',
    fileName: 'code-screenshot',
    builtBy: 'Criado por',
  }
} as const

type Lang = keyof typeof translations

interface Theme {
  name: string
  bg: string
  headerBg: string
  text: string
  comment: string
  keyword: string
  string: string
  number: string
  function: string
}

const THEMES: Record<string, Theme> = {
  dark: { name: 'Dark', bg: '#1e1e2e', headerBg: '#181825', text: '#cdd6f4', comment: '#6c7086', keyword: '#cba6f7', string: '#a6e3a1', number: '#fab387', function: '#89b4fa' },
  monokai: { name: 'Monokai', bg: '#272822', headerBg: '#1e1f1c', text: '#f8f8f2', comment: '#75715e', keyword: '#f92672', string: '#a6e22e', number: '#ae81ff', function: '#66d9ef' },
  github: { name: 'GitHub Light', bg: '#ffffff', headerBg: '#f6f8fa', text: '#24292f', comment: '#6e7781', keyword: '#cf222e', string: '#0a3069', number: '#0550ae', function: '#8250df' },
  nord: { name: 'Nord', bg: '#2e3440', headerBg: '#242933', text: '#d8dee9', comment: '#4c566a', keyword: '#81a1c1', string: '#a3be8c', number: '#b48ead', function: '#88c0d0' },
  dracula: { name: 'Dracula', bg: '#282a36', headerBg: '#21222c', text: '#f8f8f2', comment: '#6272a4', keyword: '#ff79c6', string: '#f1fa8c', number: '#bd93f9', function: '#50fa7b' },
}

const LANGUAGES = ['JavaScript', 'TypeScript', 'Python', 'Go', 'Rust', 'Java', 'C++', 'Shell', 'SQL', 'HTML', 'CSS', 'JSON', 'YAML', 'Other']

function highlight(code: string, theme: Theme): string {
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const lines = code.split('\n')
  const keywords = ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'class', 'import', 'export', 'from', 'default', 'async', 'await', 'new', 'this', 'typeof', 'instanceof', 'true', 'false', 'null', 'undefined', 'def', 'print', 'pass', 'elif', 'in', 'not', 'and', 'or', 'lambda', 'yield', 'func', 'go', 'chan', 'select', 'defer', 'range', 'map', 'interface', 'struct', 'type', 'package', 'pub', 'fn', 'mut', 'impl', 'use', 'mod', 'match', 'enum', 'trait', 'static', 'super', 'self']
  const kwRe = new RegExp(`\\b(${keywords.join('|')})\\b`, 'g')
  return lines.map(line => {
    const s = esc(line)
    let html = s
      .replace(/(\/\/[^\n]*$)/gm, `<span style="color:${theme.comment};font-style:italic">$1</span>`)
      .replace(/(#[^\n]*$)/gm, `<span style="color:${theme.comment};font-style:italic">$1</span>`)
      .replace(/(&quot;[^&]*?&quot;|&#x27;[^&#]*?&#x27;|`[^`]*?`)/g, `<span style="color:${theme.string}">$1</span>`)
      .replace(/\b(\d+\.?\d*)\b/g, `<span style="color:${theme.number}">$1</span>`)
    html = html.replace(kwRe, `<span style="color:${theme.keyword};font-weight:bold">$1</span>`)
    return html
  }).join('\n')
}

export default function CodeScreenshot() {
  const [lang, setLang] = useState<Lang>(() => navigator.language.startsWith('pt') ? 'pt' : 'en')
  const [dark, setDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches)
  const [code, setCode] = useState(`function greet(name: string): string {\n  return \`Hello, \${name}!\`\n}\n\nconsole.log(greet("World"))`)
  const [themeName, setThemeName] = useState('dark')
  const [language, setLanguage] = useState('TypeScript')
  const [padding, setPadding] = useState(32)
  const [borderRadius, setBorderRadius] = useState(12)
  const previewRef = useRef<HTMLDivElement>(null)

  const t = translations[lang]
  const theme = THEMES[themeName]

  if (typeof document !== 'undefined') {
    document.documentElement.classList.toggle('dark', dark)
  }

  const handleExport = useCallback(() => {
    const el = previewRef.current
    if (!el) return
    const canvas = document.createElement('canvas')
    const scale = 2
    canvas.width = el.offsetWidth * scale
    canvas.height = el.offsetHeight * scale
    const ctx = canvas.getContext('2d')!
    ctx.scale(scale, scale)
    ctx.fillStyle = theme.bg
    if (typeof ctx.roundRect === 'function') {
      ctx.beginPath()
      ctx.roundRect(0, 0, el.offsetWidth, el.offsetHeight, borderRadius)
      ctx.fill()
    } else {
      ctx.fillRect(0, 0, el.offsetWidth, el.offsetHeight)
    }
    ctx.fillStyle = theme.headerBg
    ctx.fillRect(0, 0, el.offsetWidth, 44)
    const dots = ['#ff5f57', '#febc2e', '#28c840']
    dots.forEach((c, i) => {
      ctx.fillStyle = c
      ctx.beginPath()
      ctx.arc(16 + i * 20, 22, 6, 0, Math.PI * 2)
      ctx.fill()
    })
    ctx.font = '11px Inter, monospace'
    ctx.fillStyle = theme.comment
    ctx.textAlign = 'center'
    ctx.fillText(language, el.offsetWidth / 2, 27)
    ctx.textAlign = 'left'
    ctx.font = '13px "Courier New", monospace'
    ctx.fillStyle = theme.text
    const codeLines = code.split('\n')
    codeLines.forEach((line, i) => {
      ctx.fillText(line, padding, 44 + padding + i * 20)
    })
    const a = document.createElement('a')
    a.href = canvas.toDataURL('image/png')
    a.download = `${t.fileName}.png`
    a.click()
  }, [code, theme, language, padding, borderRadius, t.fileName])

  const highlighted = highlight(code, theme)

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-colors">
      <header className="border-b border-zinc-200 dark:border-zinc-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-zinc-500 rounded-lg flex items-center justify-center">
              <Camera size={18} className="text-white" />
            </div>
            <span className="font-semibold">Code Screenshot</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setLang(l => l === 'en' ? 'pt' : 'en')} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <Languages size={14} />{lang.toUpperCase()}
            </button>
            <button onClick={() => setDark(d => !d)} className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <a href="https://github.com/gmowses/code-screenshot" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1 px-6 py-10">
        <div className="max-w-6xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{t.title}</h1>
            <p className="mt-2 text-zinc-500 dark:text-zinc-400">{t.subtitle}</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
            {/* Preview */}
            <div className="space-y-3">
              <h2 className="font-semibold text-sm">{t.preview}</h2>
              <div className="bg-zinc-100 dark:bg-zinc-900 rounded-xl p-8 flex items-center justify-center">
                <div
                  ref={previewRef}
                  style={{ borderRadius, overflow: 'hidden', minWidth: 400, maxWidth: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}
                >
                  {/* Header bar */}
                  <div style={{ backgroundColor: theme.headerBg, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#ff5f57' }}></div>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#febc2e' }}></div>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#28c840' }}></div>
                    <span style={{ marginLeft: 'auto', marginRight: 'auto', fontSize: 11, color: theme.comment, fontFamily: 'monospace' }}>{language}</span>
                  </div>
                  {/* Code */}
                  <div style={{ backgroundColor: theme.bg, padding: `${padding}px`, paddingTop: `${Math.round(padding * 0.75)}px` }}>
                    <pre style={{ margin: 0, fontFamily: '"Fira Code", "Courier New", monospace', fontSize: 13, lineHeight: 1.6, color: theme.text, tabSize: 2 }}
                      dangerouslySetInnerHTML={{ __html: highlighted }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium">Code</label>
                <textarea value={code} onChange={e => setCode(e.target.value)} rows={8} spellCheck={false}
                  placeholder={t.codePlaceholder}
                  className="w-full font-mono text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-zinc-500" />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">{t.language}</label>
                <select value={language} onChange={e => setLanguage(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500">
                  {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">{t.theme}</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(THEMES).map(([key, th]) => (
                    <button key={key} onClick={() => setThemeName(key)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors text-left flex items-center gap-2 ${themeName === key ? 'ring-2 ring-zinc-500' : ''}`}
                      style={{ backgroundColor: th.bg, color: th.text, borderColor: themeName === key ? th.keyword : 'transparent' }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: th.keyword, display: 'inline-block', flexShrink: 0 }}></span>
                      {th.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <label className="text-sm font-medium">{t.padding}</label>
                  <span className="text-sm text-zinc-400 tabular-nums">{padding}px</span>
                </div>
                <input type="range" min={8} max={80} value={padding} onChange={e => setPadding(Number(e.target.value))} className="w-full accent-zinc-500" />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <label className="text-sm font-medium">{t.borderRadius}</label>
                  <span className="text-sm text-zinc-400 tabular-nums">{borderRadius}px</span>
                </div>
                <input type="range" min={0} max={24} value={borderRadius} onChange={e => setBorderRadius(Number(e.target.value))} className="w-full accent-zinc-500" />
              </div>

              <button onClick={handleExport} className="w-full flex items-center justify-center gap-2 rounded-lg bg-zinc-800 dark:bg-zinc-100 px-4 py-2.5 text-sm font-medium text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors">
                <Download size={15} />{t.export}
              </button>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-zinc-200 dark:border-zinc-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-xs text-zinc-400">
          <span>{t.builtBy} <a href="https://github.com/gmowses" className="text-zinc-600 dark:text-zinc-300 hover:text-zinc-500 transition-colors">Gabriel Mowses</a></span>
          <span>MIT License</span>
        </div>
      </footer>
    </div>
  )
}
