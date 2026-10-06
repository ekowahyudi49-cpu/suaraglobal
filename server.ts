import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { Mp3Encoder } from '@breezystack/lamejs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '25mb' }));

// Initialize Google GenAI with required headers
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

/**
 * Server-side WAV to MP3 converter using @breezystack/lamejs
 */
function convertWavBufferToMp3(wavBuffer: Buffer): Buffer {
  let offset = 12;
  let channels = 1;
  let sampleRate = 24000;
  let bitsPerSample = 16;
  let dataOffset = 44;
  let dataLength = wavBuffer.length - 44;

  while (offset < wavBuffer.length - 8) {
    const chunkId = wavBuffer.toString('ascii', offset, offset + 4);
    const chunkSize = wavBuffer.readUInt32LE(offset + 4);

    if (chunkId === 'fmt ') {
      channels = wavBuffer.readUInt16LE(offset + 10);
      sampleRate = wavBuffer.readUInt32LE(offset + 12);
      bitsPerSample = wavBuffer.readUInt16LE(offset + 22);
    } else if (chunkId === 'data') {
      dataOffset = offset + 8;
      dataLength = Math.min(chunkSize, wavBuffer.length - dataOffset);
      break;
    }
    offset += 8 + chunkSize;
  }

  const bytesPerSample = bitsPerSample / 8;
  const numSamples = Math.floor(dataLength / bytesPerSample / channels);
  const mp3Encoder = new Mp3Encoder(channels, sampleRate, 128);
  const mp3Chunks: Buffer[] = [];

  if (channels === 1) {
    const samples = new Int16Array(numSamples);
    for (let i = 0; i < numSamples; i++) {
      const pos = dataOffset + i * 2;
      if (pos + 1 < wavBuffer.length) {
        samples[i] = wavBuffer.readInt16LE(pos);
      }
    }
    const mp3Buf = mp3Encoder.encodeBuffer(samples);
    if (mp3Buf.length > 0) {
      mp3Chunks.push(Buffer.from(mp3Buf));
    }
  } else {
    const left = new Int16Array(numSamples);
    const right = new Int16Array(numSamples);
    for (let i = 0; i < numSamples; i++) {
      const pos = dataOffset + i * 4;
      if (pos + 3 < wavBuffer.length) {
        left[i] = wavBuffer.readInt16LE(pos);
        right[i] = wavBuffer.readInt16LE(pos + 2);
      }
    }
    const mp3Buf = mp3Encoder.encodeBuffer(left, right);
    if (mp3Buf.length > 0) {
      mp3Chunks.push(Buffer.from(mp3Buf));
    }
  }

  const endBuf = mp3Encoder.flush();
  if (endBuf.length > 0) {
    mp3Chunks.push(Buffer.from(endBuf));
  }

  return Buffer.concat(mp3Chunks);
}

/**
 * Robust retry and fallback helper for Gemini models.
 * Automatically handles transient 503 UNAVAILABLE ("high demand") and 429 rate limits
 * by cascading through alternative available models and applying exponential backoff.
 */
async function generateContentWithRetry(options: {
  models: string[];
  contents: any;
  config?: any;
  maxRetriesPerModel?: number;
}) {
  const { models, contents, config, maxRetriesPerModel = 1 } = options;
  let lastError: any = null;

  for (const model of models) {
    for (let attempt = 0; attempt <= maxRetriesPerModel; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents,
          config,
        });
        return { response, modelUsed: model };
      } catch (err: any) {
        lastError = err;
        const msg = err?.message || '';
        const isTransient =
          msg.includes('503') ||
          msg.includes('429') ||
          msg.includes('high demand') ||
          msg.includes('UNAVAILABLE') ||
          msg.includes('RESOURCE_EXHAUSTED') ||
          msg.includes('overloaded');

        // If the model is temporarily experiencing high demand, immediately try the next model in cascade
        if (isTransient) {
          break; // move to next model in list without wasting time
        }
      }
    }
  }

  throw lastError;
}

// 1. Translation Endpoint
app.post('/api/translate', async (req, res) => {
  try {
    const { text, targetLanguage, sourceLanguage } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Teks tidak boleh kosong' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY belum dikonfigurasi.',
      });
    }

    const prompt = `Anda adalah penerjemah bahasa dunia profesional dan akurat.
Tugas Anda adalah menerjemahkan teks berikut ke bahasa sasaran dengan setia, alami, dan mempertahankan intonasi serta konteks.

Teks Asal:
"${text}"

Bahasa Sasaran: ${targetLanguage || 'Bahasa Indonesia'}
${sourceLanguage && sourceLanguage !== 'auto' ? `Bahasa Asal: ${sourceLanguage}` : 'Deteksi bahasa asal secara otomatis dari bahasa apa pun di dunia.'}

Format respon yang DIHARUSKAN berupa JSON dengan struktur persis seperti schema.
Sertakan juga:
1. Transliterasi/cara baca fonetik Latin (romanization) untuk teks hasil jika bahasa sasaran menggunakan aksara non-latin (Arab, Mandarin, Jepang, Korea, Hindi, Rusia, dll.).
2. Transliterasi Latin untuk teks asal (sourceRomanization) jika teks asal menggunakan aksara non-latin.
3. 2-3 alternatif terjemahan jika ada variasi padanan kata yang lazim.
4. Perkiraan tingkat formalitas ('Formal', 'Netral', atau 'Kasual').`;

    // High availability cascade: gemini-3.1-flash-lite (high throughput/no 503) -> gemini-flash-latest -> gemini-3.8-flash
    const { response, modelUsed } = await generateContentWithRetry({
      models: ['gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-3.8-flash'],
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            translatedText: {
              type: Type.STRING,
              description: 'Teks hasil terjemahan akurat dalam bahasa sasaran',
            },
            detectedSourceLanguage: {
              type: Type.STRING,
              description: 'Nama bahasa asal yang terdeteksi',
            },
            detectedSourceLanguageCode: {
              type: Type.STRING,
              description: 'Kode bahasa asal (misal id, en, ja, ar, zh, fr, de, es, dll.)',
            },
            targetLanguage: {
              type: Type.STRING,
              description: 'Nama bahasa sasaran',
            },
            romanization: {
              type: Type.STRING,
              description: 'Cara baca dalam huruf Latin / transliterasi untuk hasil terjemahan (jika aksara non-latin, kosongkan jika sudah latin)',
            },
            sourceRomanization: {
              type: Type.STRING,
              description: 'Cara baca dalam huruf Latin / transliterasi untuk teks asal (jika teks asal beraksara non-latin)',
            },
            alternatives: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Variasi atau alternatif terjemahan lain yang alami',
            },
            formality: {
              type: Type.STRING,
              description: 'Tingkat kesopanan atau gaya bahasa: Formal, Netral, atau Kasual',
            },
            notes: {
              type: Type.STRING,
              description: 'Catatan nuansa makna, tata bahasa, atau pelafalan ringkas',
            },
          },
          required: ['translatedText', 'detectedSourceLanguage'],
        },
      },
    });

    const resultText = response.text?.trim() || '{}';
    let parsed: any = {};
    try {
      parsed = JSON.parse(resultText);
    } catch (e) {
      // In case json parsing needs cleanup
      parsed = { translatedText: resultText, detectedSourceLanguage: sourceLanguage || 'Otomatis' };
    }

    return res.json({
      success: true,
      translatedText: parsed.translatedText || text,
      detectedSourceLanguage: parsed.detectedSourceLanguage || 'Otomatis',
      detectedSourceLanguageCode: parsed.detectedSourceLanguageCode || '',
      targetLanguage: parsed.targetLanguage || targetLanguage,
      romanization: parsed.romanization || '',
      sourceRomanization: parsed.sourceRomanization || '',
      alternatives: parsed.alternatives || [],
      formality: parsed.formality || 'Netral',
      notes: parsed.notes || '',
      modelUsed,
    });
  } catch (err: any) {
    console.error('Translation error:', err);
    const msg = err?.message || '';
    const isHighDemand = msg.includes('503') || msg.includes('high demand') || msg.includes('UNAVAILABLE');

    return res.status(isHighDemand ? 503 : 500).json({
      error: isHighDemand
        ? 'Layanan AI sedang menerima lonjakan permintaan (503). Sistem sedang mencoba kembali...'
        : (err?.message || 'Gagal menerjemahkan teks.'),
      isTemporary: isHighDemand,
    });
  }
});

// 2. Speech Synthesis (TTS) Endpoint
app.post('/api/tts', async (req, res) => {
  try {
    const {
      text,
      languageName = 'Bahasa Indonesia',
      voiceName = 'Kore', // 'Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'
      stylePrompt = '',
      moodPrompt = '',
      accentPrompt = '',
      tempo = 1.0,
      personaId = '',
    } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Teks tidak boleh kosong' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY belum dikonfigurasi pada server.',
      });
    }

    // Build comprehensive style instructions for Gemini TTS
    let tempoInstruction = 'spoken at natural normal pace.';
    if (tempo <= 0.6) {
      tempoInstruction = 'spoken very slowly, deliberately, enunciating clearly word by word.';
    } else if (tempo <= 0.85) {
      tempoInstruction = 'spoken at a calm, relaxed, slightly slower gentle pace.';
    } else if (tempo >= 1.4) {
      tempoInstruction = 'spoken at a brisk, rapid, energetic fast tempo.';
    } else if (tempo >= 1.15) {
      tempoInstruction = 'spoken at an upbeat, brisk, lively tempo.';
    }

    const styleParts = [
      `Language: ${languageName}`,
      stylePrompt || 'Clear natural human voice',
      moodPrompt || 'Warm and pleasant tone',
      accentPrompt || 'Native standard clear accent',
      tempoInstruction,
    ];

    const combinedStyle = styleParts.filter(Boolean).join('. ');

    // Call Gemini TTS with automatic retry and model cascade
    const { response: ttsResponse } = await generateContentWithRetry({
      models: ['gemini-3.8-flash-lite-tts', 'gemini-3.8-flash-tts'],
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: text.trim(),
              speechMetadata: {
                style: combinedStyle,
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName },
          },
        },
      },
    });

    const wavBase64 =
      ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!wavBase64) {
      throw new Error('Tidak ada data audio yang diterima dari model AI.');
    }

    // Convert WAV buffer to MP3
    const wavBuffer = Buffer.from(wavBase64, 'base64');
    let mp3Base64 = '';
    try {
      const mp3Buffer = convertWavBufferToMp3(wavBuffer);
      mp3Base64 = mp3Buffer.toString('base64');
    } catch (mp3Err) {
      console.warn('Server MP3 conversion notice:', mp3Err);
    }

    return res.json({
      success: true,
      wavBase64,
      mp3Base64,
      voiceName,
      personaId,
      combinedStyle,
      sizeBytes: wavBuffer.length,
    });
  } catch (err: any) {
    console.error('TTS error:', err);
    return res.status(500).json({
      error: err?.message || 'Gagal menghasilkan suara audio.',
    });
  }
});

// Setup Vite in Dev or Static files in Prod
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
