import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../../../.env') })
dotenv.config()

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 8080),
  appBaseUrl: process.env.APP_BASE_URL || 'http://localhost:8080',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  databaseUrl: process.env.DATABASE_URL || 'file:./data/tms.sqlite',
  storageDriver: process.env.STORAGE_DRIVER || 'local',
  localUploadDir: process.env.LOCAL_UPLOAD_DIR || './uploads',
  gcsBucket: process.env.GCS_BUCKET || '',
  gcsProjectId: process.env.GCS_PROJECT_ID || '',
  flightApiBase:
    process.env.FLIGHT_API_BASE ||
    'https://refex-tms-flightsearch-dhwffeu7pq-el.a.run.app',
  webDistPath: path.resolve(__dirname, '../../web/dist'),
  kissflow: {
    enabled: Boolean(
      process.env.KISSFLOW_ACCESS_KEY_ID && process.env.KISSFLOW_ACCESS_KEY_SECRET
    ),
    domain: (process.env.KISSFLOW_DOMAIN || 'https://refexgroup.kissflow.com').replace(
      /\/$/,
      ''
    ),
    accountId: process.env.KISSFLOW_ACCOUNT_ID || 'AcCMptlq60zH',
    appId: process.env.KISSFLOW_APP_ID || 'Expense_and_Travel_Management_A00',
    processId: process.env.KISSFLOW_TRAVEL_PROCESS_ID || 'Travel_Management_A02',
    accessKeyId: process.env.KISSFLOW_ACCESS_KEY_ID || '',
    accessKeySecret: process.env.KISSFLOW_ACCESS_KEY_SECRET || '',
  },
}
