import express from 'express'
import cors from 'cors'
import fs from 'fs'
import path from 'path'
import { config } from './config.js'
import { getDb } from './db/index.js'
import { seed } from './db/seed.js'
import { apiRouter, authRouter } from './routes.js'

getDb()
seed()

const app = express()
app.use(
  cors({
    origin: config.nodeEnv === 'production' ? true : config.corsOrigin,
    credentials: true,
  })
)
app.use(express.json({ limit: '2mb' }))

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'refex-tms',
    storage: config.storageDriver,
    flightApi: config.flightApiBase,
    kissflow: {
      enabled: config.kissflow.enabled,
      processId: config.kissflow.processId,
      domain: config.kissflow.domain,
    },
  })
})

app.use('/api/auth', authRouter)
app.use('/api', apiRouter)

/** Single-URL mode: serve React build when present (Cloud Run / npm start) */
if (fs.existsSync(config.webDistPath)) {
  app.use(express.static(config.webDistPath))
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next()
    res.sendFile(path.join(config.webDistPath, 'index.html'))
  })
}

app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({ error: err.message || 'Server error' })
})

app.listen(config.port, () => {
  console.log(`Refex TMS API listening on :${config.port}`)
  console.log(`Storage driver: ${config.storageDriver}`)
  console.log(`Flight API: ${config.flightApiBase}`)
  console.log(
    `Kissflow: ${config.kissflow.enabled ? `ON → ${config.kissflow.processId}` : 'OFF (set access key env vars)'}`
  )
  if (fs.existsSync(config.webDistPath)) {
    console.log(`Serving web from ${config.webDistPath}`)
  }
})
