import crypto from 'crypto';
import service from "../service-account.enc";

/* AES-CBC decryption on the encrypted service account info in `service-account.js` */
export default function decrypt (encrypted) {
  const algorithm = 'aes-128-cbc';
  const decipher = crypto.createDecipheriv(
    algorithm,
    process.env.SERVICE_ENCRYPTION_KEY,
    process.env.SERVICE_ENCRYPTION_IV
  );
  let decrypted = decipher.update(encrypted, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted
}

export const service_info = JSON.parse(decrypt(service.encrypted))
