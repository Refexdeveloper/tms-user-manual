import { Storage } from '@google-cloud/storage'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { config } from '../config.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function localRoot() {
  const dir = path.isAbsolute(config.localUploadDir)
    ? config.localUploadDir
    : path.resolve(__dirname, '../..', config.localUploadDir)
  fs.mkdirSync(dir, { recursive: true })
  return dir
}

let gcs

function getGcs() {
  if (!gcs) {
    gcs = new Storage(
      config.gcsProjectId ? { projectId: config.gcsProjectId } : undefined
    )
  }
  return gcs
}

/**
 * Storage abstraction: local disk (dev) or GCS (GCP).
 * Same API so switching is env-only.
 */
export const storage = {
  async put({ key, buffer, mimeType }) {
    if (config.storageDriver === 'gcs') {
      if (!config.gcsBucket) throw new Error('GCS_BUCKET is required')
      const file = getGcs().bucket(config.gcsBucket).file(key)
      await file.save(buffer, {
        contentType: mimeType || 'application/octet-stream',
        resumable: false,
      })
      return { storageKey: key, driver: 'gcs' }
    }

    const full = path.join(localRoot(), key)
    fs.mkdirSync(path.dirname(full), { recursive: true })
    fs.writeFileSync(full, buffer)
    return { storageKey: key, driver: 'local' }
  },

  async getReadStream(key) {
    if (config.storageDriver === 'gcs') {
      return getGcs().bucket(config.gcsBucket).file(key).createReadStream()
    }
    const full = path.join(localRoot(), key)
    return fs.createReadStream(full)
  },

  async exists(key) {
    if (config.storageDriver === 'gcs') {
      const [exists] = await getGcs().bucket(config.gcsBucket).file(key).exists()
      return exists
    }
    return fs.existsSync(path.join(localRoot(), key))
  },
}
