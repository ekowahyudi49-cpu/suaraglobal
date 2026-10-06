import { Mp3Encoder } from '@breezystack/lamejs';

/**
 * Converts a 16-bit PCM WAV ArrayBuffer/Uint8Array to an MP3 Blob using lamejs.
 */
export function wavToMp3Blob(wavBytes: Uint8Array): Blob {
  // Parse standard RIFF WAV header
  const view = new DataView(wavBytes.buffer, wavBytes.byteOffset, wavBytes.byteLength);

  let offset = 12;
  let channels = 1;
  let sampleRate = 24000;
  let bitsPerSample = 16;
  let dataOffset = 44;
  let dataLength = wavBytes.byteLength - 44;

  // Search for 'fmt ' and 'data' chunks safely
  while (offset < wavBytes.byteLength - 8) {
    const chunkId = String.fromCharCode(
      view.getUint8(offset),
      view.getUint8(offset + 1),
      view.getUint8(offset + 2),
      view.getUint8(offset + 3)
    );
    const chunkSize = view.getUint32(offset + 4, true);

    if (chunkId === 'fmt ') {
      channels = view.getUint16(offset + 10, true);
      sampleRate = view.getUint32(offset + 12, true);
      bitsPerSample = view.getUint16(offset + 22, true);
    } else if (chunkId === 'data') {
      dataOffset = offset + 8;
      dataLength = Math.min(chunkSize, wavBytes.byteLength - dataOffset);
      break;
    }
    offset += 8 + chunkSize;
  }

  // Extract Int16 samples
  const bytesPerSample = bitsPerSample / 8;
  const numSamples = Math.floor(dataLength / bytesPerSample / channels);
  const mp3Encoder = new Mp3Encoder(channels, sampleRate, 128);
  const mp3Data: Uint8Array[] = [];

  if (channels === 1) {
    const samples = new Int16Array(numSamples);
    for (let i = 0; i < numSamples; i++) {
      const pos = dataOffset + i * 2;
      if (pos + 1 < wavBytes.byteLength) {
        samples[i] = view.getInt16(pos, true);
      }
    }
    const mp3buf = mp3Encoder.encodeBuffer(samples);
    if (mp3buf.length > 0) {
      mp3Data.push(new Uint8Array(mp3buf));
    }
  } else {
    const left = new Int16Array(numSamples);
    const right = new Int16Array(numSamples);
    for (let i = 0; i < numSamples; i++) {
      const pos = dataOffset + i * 4;
      if (pos + 3 < wavBytes.byteLength) {
        left[i] = view.getInt16(pos, true);
        right[i] = view.getInt16(pos + 2, true);
      }
    }
    const mp3buf = mp3Encoder.encodeBuffer(left, right);
    if (mp3buf.length > 0) {
      mp3Data.push(new Uint8Array(mp3buf));
    }
  }

  const endBuf = mp3Encoder.flush();
  if (endBuf.length > 0) {
    mp3Data.push(new Uint8Array(endBuf));
  }

  return new Blob(mp3Data as unknown as BlobPart[], { type: 'audio/mp3' });
}

/**
 * Creates a WAV Blob from a base64 string
 */
export function createWavBlobFromBase64(base64: string): Blob {
  const bytes = base64ToUint8Array(base64);
  return new Blob([bytes as unknown as BlobPart], { type: 'audio/wav' });
}

/**
 * Creates an MP3 Blob from base64 string or converts from WAV
 */
export function createMp3BlobFromVoice(wavBase64: string, mp3Base64?: string): Blob {
  if (mp3Base64) {
    const bytes = base64ToUint8Array(mp3Base64);
    return new Blob([bytes as unknown as BlobPart], { type: 'audio/mp3' });
  }
  const wavBytes = base64ToUint8Array(wavBase64);
  return wavToMp3Blob(wavBytes);
}

/**
 * Triggers a browser download for a Blob
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 2000);
}

/**
 * Decodes a base64 string to Uint8Array
 */
export function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Encodes Uint8Array to base64
 */
export function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}
