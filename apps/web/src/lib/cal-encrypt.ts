import crypto from 'crypto'

// CAL_ENCRYPTION_KEY must be 64 hex chars (32 bytes).
// Generate once: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
// Then set CAL_ENCRYPTION_KEY=<output> in .env.local

function key(): Buffer {
  const k = process.env.CAL_ENCRYPTION_KEY
  if (!k || k.length !== 64) throw new Error('CAL_ENCRYPTION_KEY must be 64 hex chars')
  return Buffer.from(k, 'hex')
}

export function encryptToken(plain: string): string {
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', key(), iv)
  const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return [iv.toString('hex'), enc.toString('hex'), tag.toString('hex')].join('.')
}

export function decryptToken(encoded: string): string {
  const [ivHex, encHex, tagHex] = encoded.split('.')
  const decipher = crypto.createDecipheriv('aes-256-gcm', key(), Buffer.from(ivHex, 'hex'))
  decipher.setAuthTag(Buffer.from(tagHex, 'hex'))
  return Buffer.concat([decipher.update(Buffer.from(encHex, 'hex')), decipher.final()]).toString('utf8')
}
