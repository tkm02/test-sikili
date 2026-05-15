import xmlrpc from 'xmlrpc'
import { OdooAuthError, OdooRpcError } from './errors'

const ODOO_URL = process.env.ODOO_URL!
const ODOO_DB = process.env.ODOO_DB!
const ODOO_USER = process.env.ODOO_USER!
const ODOO_PASSWORD = process.env.ODOO_PASSWORD!

function parseUrl(url: string) {
  const parsed = new URL(url)
  return {
    host: parsed.hostname,
    port: parsed.port ? parseInt(parsed.port) : parsed.protocol === 'https:' ? 443 : 80,
    secure: parsed.protocol === 'https:',
  }
}

function callXmlRpc(
  path: string,
  method: string,
  params: unknown[],
): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const { host, port, secure } = parseUrl(ODOO_URL)
    const createClient = secure ? xmlrpc.createSecureClient : xmlrpc.createClient
    const client = createClient({ host, port, path })

    client.methodCall(method, params, (err: any, value: unknown) => {
      if (err) {
        const msg: string = err.message ?? ''
        if (msg.includes('TITLE') || msg.includes('Unknown XML-RPC tag')) {
          return reject(new OdooRpcError('Odoo non initialisé — base de données non prête pour XML-RPC'))
        }
        return reject(new OdooRpcError(msg))
      }
      resolve(value)
    })
  })
}

let cachedUid: number | null = null

async function authenticate(): Promise<number> {
  if (cachedUid !== null) return cachedUid

  let uid: unknown
  try {
    uid = await callXmlRpc('/xmlrpc/2/common', 'authenticate', [
      ODOO_DB,
      ODOO_USER,
      ODOO_PASSWORD,
      {},
    ])
  } catch (err) {
    cachedUid = null
    throw err
  }

  if (!uid || typeof uid !== 'number') {
    throw new OdooAuthError(
      'Authentification Odoo échouée — vérifiez ODOO_DB, ODOO_USER, ODOO_PASSWORD',
    )
  }

  cachedUid = uid
  return uid
}

export async function odooExecute<T = unknown>(
  model: string,
  method: string,
  args: unknown[],
  kwargs: Record<string, unknown> = {},
): Promise<T> {
  const uid = await authenticate()

  const result = await callXmlRpc('/xmlrpc/2/object', 'execute_kw', [
    ODOO_DB,
    uid,
    ODOO_PASSWORD,
    model,
    method,
    args,
    kwargs,
  ])

  return result as T
}

// Réinitialise le cache UID (utile si les credentials changent ou en cas d'erreur auth)
export function resetOdooAuth() {
  cachedUid = null
}
