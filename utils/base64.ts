// Converts base64-encoded string to Uint8Array for file uploads to Supabase Storage
export function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    const cp = binaryString.codePointAt(i) ?? 0;
    bytes[i] = cp & 0xff;
  }
  return bytes;
}
