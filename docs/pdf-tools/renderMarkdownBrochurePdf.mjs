import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { marked } from 'marked'
import { chromium } from 'playwright'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..', '..')

function getArg(name) {
  const idx = process.argv.indexOf(name)
  if (idx === -1) return null
  const val = process.argv[idx + 1]
  return val && !val.startsWith('--') ? val : null
}

const inputMd = getArg('--input') ? path.resolve(repoRoot, getArg('--input')) : null
const outputPdf = getArg('--output') ? path.resolve(repoRoot, getArg('--output')) : null
const brand = getArg('--brand') || '#06b6d4' // cyan-500
const brand2 = getArg('--brand2') || '#3b82f6' // blue-500

if (!inputMd || !outputPdf) {
  console.error('Usage: node renderMarkdownBrochurePdf.mjs --input <path> --output <path> [--brand <hex>] [--brand2 <hex>]')
  process.exit(1)
}

const md = fs.readFileSync(inputMd, 'utf8')
const htmlBody = marked.parse(md)

// Explicit executable path avoids Playwright arch mismatch/crashes in this environment.
const headlessShellX64 =
  '/var/folders/4n/b9q790q56d3975w84tbz6m240000gn/T/cursor-sandbox-cache/3e9399f606c764271e39620533c959d5/playwright/chromium_headless_shell-1208/chrome-headless-shell-mac-x64/chrome-headless-shell'
const headlessShellArm64 =
  '/var/folders/4n/b9q790q56d3975w84tbz6m240000gn/T/cursor-sandbox-cache/3e9399f606c764271e39620533c959d5/playwright/chromium_headless_shell-1208/chrome-headless-shell-mac-arm64/chrome-headless-shell'
const executablePath = fs.existsSync(headlessShellArm64) ? headlessShellArm64 : headlessShellX64

const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      @page { size: A4; margin: 10mm; }
      html, body { margin: 0; padding: 0; }
      body {
        font-family: Arial, Helvetica, sans-serif;
        font-size: 10.4pt;
        color: #0f172a;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .paper {
        column-count: 3;
        column-gap: 7mm;
        column-rule: 0.25mm solid #d7e4f3;
      }
      .brand-header {
        column-span: all;
        margin: 0 0 6mm 0;
        padding: 3.6mm 4.2mm 3.2mm 4.2mm;
        border-radius: 10px;
        background: linear-gradient(135deg, ${brand} 0%, ${brand2} 100%);
        color: white;
      }
      .brand-header .title {
        font-size: 18pt;
        font-weight: 800;
        line-height: 1.15;
      }
      .brand-header .subtitle {
        margin-top: 2mm;
        font-size: 10.8pt;
        opacity: 0.95;
      }
      h1, h2, h3 { break-inside: avoid; column-span: all; }
      h1 {
        margin: 0 0 4mm 0;
        font-size: 16.5pt;
      }
      h2 {
        margin: 4.5mm 0 2mm 0;
        font-size: 12.8pt;
        padding-left: 3mm;
        border-left: 3.2mm solid ${brand};
        page-break-after: avoid;
      }
      h3 {
        margin: 3.5mm 0 1.6mm 0;
        font-size: 11.6pt;
      }
      p, li { break-inside: avoid; }
      ul { margin: 0 0 3.2mm 16px; padding: 0; }
      li { margin: 0.7mm 0; }
      code {
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
        font-size: 9.6pt;
        background: #f1f5f9;
        padding: 0.6mm 1mm;
        border-radius: 4px;
      }
      a { color: #0ea5e9; text-decoration: underline; }
      .muted { color: #475569; }
      .divider {
        column-span: all;
        height: 1px;
        background: #cbd5e1;
        margin: 4mm 0;
      }
    </style>
  </head>
  <body>
    <div class="brand-header">
      <div class="title">Admin Dashboard Guide</div>
      <div class="subtitle">How to use the dashboard safely and effectively</div>
    </div>
    <div class="divider"></div>
    <div class="paper">
      ${htmlBody}
    </div>
  </body>
</html>`

const browser = await chromium.launch({ headless: true, executablePath })
const page = await browser.newPage({ viewport: { width: 1240, height: 1754 } })
await page.setContent(html, { waitUntil: 'load' })

await page.pdf({
  path: outputPdf,
  format: 'A4',
  printBackground: true,
  margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' },
})

await browser.close()
console.log(`Wrote: ${outputPdf}`)

