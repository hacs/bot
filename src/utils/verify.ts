const verifyAlgo = { name: 'HMAC', hash: 'SHA-256' }
function array2hex(arrBuf: ArrayBuffer) {
  return [...new Uint8Array(arrBuf)]
    .map((x) => x.toString(16).padStart(2, '0'))
    .join('')
}

export const verifyWebhookSignature = async (
  content: string,
  secret: string,
  signature: string,
) => {
  if (!signature.startsWith('sha256=')) {
    throw new Error('Invalid signature')
  }
  const textEncoder = new TextEncoder()
  const signedContent = await crypto.subtle.sign(
    verifyAlgo.name,
    await crypto.subtle.importKey(
      'raw',
      textEncoder.encode(secret),
      verifyAlgo,
      false,
      ['sign'],
    ),
    textEncoder.encode(content),
  )
  const expectedSignature = 'sha256=' + array2hex(signedContent)
  if (
    !crypto.subtle.timingSafeEqual(
      textEncoder.encode(expectedSignature),
      textEncoder.encode(signature),
    )
  ) {
    throw new Error(
      `Expected signature ${expectedSignature} does not match provided signature ${signature}`,
    )
  }
  console.log(`Signature '${signature}' verified`)
}
