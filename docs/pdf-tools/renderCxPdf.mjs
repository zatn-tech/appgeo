import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { marked } from 'marked'
import { chromium } from 'playwright'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const repoRoot = path.resolve(__dirname, '..', '..')
const inputMd = path.join(repoRoot, 'docs', 'CX-Help-Doc.md')
const outputPdf = path.join(repoRoot, 'docs', 'CX-Help-Doc.pdf')

const md = fs.readFileSync(inputMd, 'utf8')
const htmlBody = marked.parse(md)

// Brochure-like layout: tri-fold approximation by rendering content into 3 CSS columns.
// Title and section headers span all columns.
const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      @page { size: A4; margin: 10mm; }
      html, body { margin: 0; padding: 0; }
      body {
        font-family: Arial, Helvetica, sans-serif;
        font-size: 10.6pt;
        color: #111;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .paper {
        column-count: 3;
        column-gap: 7mm;
        column-rule: 0.25mm solid #d0d0d0;
      }
      h1, h2, h3 { break-inside: avoid; column-span: all; }
      h1 { font-size: 16pt; margin: 0 0 6mm 0; }
      h2 { font-size: 12.5pt; margin: 5mm 0 2.5mm 0; }
      h3 { font-size: 11.5pt; margin: 4mm 0 1.8mm 0; }
      p, li { break-inside: avoid; }
      ul { margin: 0 0 3mm 16px; padding: 0; }
      li { margin: 0.7mm 0; }
      code {
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
        font-size: 9.2pt;
      }
      .top-note {
        font-size: 9.6pt;
        margin: 0 0 4mm 0;
        padding-bottom: 2mm;
        border-bottom: 1px solid #bbb;
        column-span: all;
      }
      .pagebreak { break-before: page; column-span: all; }
      .muted { color: #444; }
    </style>
  </head>
  <body>
    <div class="paper">
      ${htmlBody}
    </div>
  </body>
</html>`

// Playwright may download different architectures depending on sandbox/runtime.
// This repo’s environment currently has `mac-x64` headless shell available.
// We explicitly point to it so the renderer can run on `arm64` machines.
const headlessShellX64 = '/var/folders/4n/b9q790q56d3975w84tbz6m240000gn/T/cursor-sandbox-cache/3e9399f606c764271e39620533c959d5/playwright/chromium_headless_shell-1208/chrome-headless-shell-mac-x64/chrome-headless-shell'
const headlessShellArm64 =
  '/var/folders/4n/b9q790q56d3975w84tbz6m240000gn/T/cursor-sandbox-cache/3e9399f606c764271e39620533c959d5/playwright/chromium_headless_shell-1208/chrome-headless-shell-mac-arm64/chrome-headless-shell'
const executablePath = fs.existsSync(headlessShellArm64) ? headlessShellArm64 : headlessShellX64

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

