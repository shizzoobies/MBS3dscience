// Meshy image-to-3D runner.
// Usage:
//   npx tsx scripts/gen-asset-from-image.ts "<image-path>" "<asset-name>" [realistic|sculpture]
//
// Examples:
//   npx tsx scripts/gen-asset-from-image.ts "D:/Skills/refs/trt-vial.jpg" "trt-vial"
//   npx tsx scripts/gen-asset-from-image.ts "../../refs/syringe.png" "syringe-pen" realistic
//
// Reads MESHY_API_KEY from .env.local in the project root. Outputs raw GLB
// to public/models/<name>.raw.glb then runs gltf-pipeline to produce
// public/models/<name>.glb (Draco-compressed).

import { writeFile, mkdir, readFile, copyFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { resolve, dirname, extname, isAbsolute } from 'node:path'
import { execSync } from 'node:child_process'

const BASE_V1 = 'https://api.meshy.ai/openapi/v1/image-to-3d'

async function loadEnvLocal() {
  const envPath = resolve(process.cwd(), '.env.local')
  if (!existsSync(envPath)) return
  const text = await readFile(envPath, 'utf-8')
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const idx = trimmed.indexOf('=')
    if (idx === -1) continue
    const name = trimmed.slice(0, idx).trim()
    const value = trimmed.slice(idx + 1).trim()
    if (!process.env[name]) process.env[name] = value
  }
}

function key(): string {
  const k = process.env.MESHY_API_KEY
  if (!k) throw new Error('MESHY_API_KEY not set in env or .env.local')
  return k
}

async function meshy(path: string, init: RequestInit = {}): Promise<any> {
  const res = await fetch(`${BASE_V1}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${key()}`,
      'Content-Type': 'application/json',
      ...init.headers,
    },
  })
  if (!res.ok) throw new Error(`Meshy ${res.status}: ${await res.text()}`)
  return res.json()
}

function mimeFor(filePath: string): string {
  const ext = extname(filePath).toLowerCase()
  switch (ext) {
    case '.png':
      return 'image/png'
    case '.webp':
      return 'image/webp'
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg'
    default:
      throw new Error(`Unsupported image extension: ${ext}. Use .jpg, .png, or .webp.`)
  }
}

async function buildDataUrl(filePath: string): Promise<string> {
  const buf = await readFile(filePath)
  const mime = mimeFor(filePath)
  const b64 = buf.toString('base64')
  return `data:${mime};base64,${b64}`
}

async function startPreview(imageDataUrl: string, _artStyle: string): Promise<string> {
  const body = {
    image_url: imageDataUrl,
    ai_model: 'meshy-6',
    topology: 'triangle',
    target_polycount: 30000,
    symmetry_mode: 'auto',
    should_remesh: true,
  }
  const data = await meshy('', { method: 'POST', body: JSON.stringify(body) })
  return data.result
}

async function startRefine(previewId: string): Promise<string> {
  const data = await meshy('', {
    method: 'POST',
    body: JSON.stringify({ mode: 'refine', input_task_id: previewId }),
  })
  return data.result
}

async function waitFor(id: string, label: string, intervalMs = 5000): Promise<any> {
  const start = Date.now()
  while (true) {
    const status = await meshy(`/${id}`)
    process.stdout.write(`\r[${label}] ${status.status} ${status.progress ?? 0}% (${Math.round((Date.now() - start) / 1000)}s)`)
    if (status.status === 'SUCCEEDED') {
      process.stdout.write('\n')
      return status
    }
    if (status.status === 'FAILED' || status.status === 'EXPIRED') {
      process.stdout.write('\n')
      throw new Error(`${label} ${status.status}: ${status.task_error?.message ?? 'no message'}`)
    }
    await new Promise((r) => setTimeout(r, intervalMs))
  }
}

async function download(url: string, outPath: string): Promise<void> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`download failed ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  await mkdir(dirname(outPath), { recursive: true })
  await writeFile(outPath, buf)
}

async function main() {
  await loadEnvLocal()
  const imageArg = process.argv[2]
  const name = process.argv[3]
  const artStyle = (process.argv[4] ?? 'realistic') as 'realistic' | 'sculpture'

  if (!imageArg || !name) {
    console.error('Usage: npx tsx scripts/gen-asset-from-image.ts "<image-path>" "<name>" [realistic|sculpture]')
    process.exit(1)
  }

  const imagePath = isAbsolute(imageArg) ? imageArg : resolve(process.cwd(), imageArg)
  if (!existsSync(imagePath)) {
    throw new Error(`Image not found: ${imagePath}`)
  }

  const modelsDir = resolve(process.cwd(), 'public', 'models')
  const rawPath = resolve(modelsDir, `${name}.raw.glb`)
  const finalPath = resolve(modelsDir, `${name}.glb`)

  console.log(`[meshy] image: ${imagePath}`)
  console.log(`[meshy] style: ${artStyle}`)
  console.log(`[meshy] target: ${finalPath}`)

  console.log(`[meshy] encoding image`)
  const dataUrl = await buildDataUrl(imagePath)

  const previewId = await startPreview(dataUrl, artStyle)
  console.log(`[meshy] preview task: ${previewId}`)
  const previewResult = await waitFor(previewId, 'preview', 5000)

  // meshy-6 image-to-3D is single-shot — the preview output is the final
  // model, no refine pass available on this endpoint. Try refine anyway
  // for forward compatibility; fall back to preview if refine isn't
  // supported.
  let modelResult = previewResult
  try {
    console.log(`[meshy] attempting refine pass`)
    const refineId = await startRefine(previewId)
    console.log(`[meshy] refine task: ${refineId}`)
    modelResult = await waitFor(refineId, 'refine', 10000)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.log(`\n[meshy] refine not available, using preview result (${msg.split('\n')[0]})`)
  }

  // v1 image-to-3D returns model_url (singular). v2 text-to-3D returns
  // model_urls.glb (object). Support both shapes.
  const glbUrl: string | undefined = modelResult.model_url ?? modelResult.model_urls?.glb
  if (!glbUrl) throw new Error('no GLB in result')

  console.log(`[meshy] downloading GLB`)
  await download(glbUrl, rawPath)
  console.log(`[meshy] saved raw: ${rawPath}`)

  console.log(`[compress] running gltf-pipeline`)
  try {
    execSync(`gltf-pipeline -i "${rawPath}" -o "${finalPath}" -d`, { stdio: 'inherit' })
    console.log(`[compress] saved: ${finalPath}`)
  } catch {
    console.warn(`[compress] gltf-pipeline failed; copying raw GLB instead`)
    await copyFile(rawPath, finalPath)
  }

  console.log(`\nDone. Use as /models/${name}.glb in R3F via useGLTF`)
}

main().catch((err) => {
  console.error('\nFAILED:', err)
  process.exit(1)
})
