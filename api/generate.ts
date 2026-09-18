const MAX_REFERENCES = 5;
const MAX_REFERENCE_BYTES = 20 * 1024 * 1024;

type Provider = 'chatgpt' | 'gemini';
type ReferenceImage = { name?: string; type?: string; dataUrl?: string };

function sendJson(response: any, body: unknown, status = 200) {
  response.status(status);
  response.setHeader('content-type', 'application/json; charset=utf-8');
  response.setHeader('cache-control', 'no-store');
  response.json(body);
}

function decodeDataUrl(dataUrl: string): { bytes: Uint8Array; type: string } {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) throw new Error('參考圖片格式錯誤');
  const binary = atob(match[2]);
  if (binary.length > MAX_REFERENCE_BYTES) throw new Error('單張參考照片不可超過 20 MB');
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return { bytes, type: match[1] };
}

async function generateOpenAI(prompt: string, references: ReferenceImage[]) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error('尚未設定 OPENAI_API_KEY');

  const model = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-2.5-flare';
  let response: Response;

  if (references.length) {
    const form = new FormData();
    form.set('model', model);
    form.set('prompt', prompt);
    form.set('size', '1024x1024');
    form.set('background', 'transparent');
    form.set('output_format', 'png');

    references.forEach((reference, index) => {
      if (!reference.dataUrl) return;
      const decoded = decodeDataUrl(reference.dataUrl);
      form.append('image[]', new Blob([decoded.bytes], { type: decoded.type }), reference.name || `reference-${index + 1}.png`);
    });

    response = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: { authorization: `Bearer ${key}` },
      body: form,
    });
  } else {
    response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${key}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model,
        prompt,
        size: '1024x1024',
        background: 'transparent',
        output_format: 'png',
        n: 1,
      }),
    });
  }

  const payload = await response.json() as { data?: Array<{ b64_json?: string; url?: string }>; error?: { message?: string } };
  if (!response.ok) throw new Error(payload.error?.message || 'OpenAI 圖片生成失敗');

  const image = payload.data?.[0];
  if (image?.b64_json) return { dataUrl: `data:image/png;base64,${image.b64_json}`, model };
  if (image?.url) {
    const download = await fetch(image.url);
    if (!download.ok) throw new Error('無法下載 OpenAI 產生的圖片');
    const buffer = new Uint8Array(await download.arrayBuffer());
    return { dataUrl: `data:image/png;base64,${Buffer.from(buffer).toString('base64')}`, model };
  }
  throw new Error('OpenAI 沒有回傳圖片');
}

async function generateGemini(prompt: string, references: ReferenceImage[]) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('尚未設定 GEMINI_API_KEY');

  const model = process.env.GEMINI_IMAGE_MODEL || 'gemini-3.1-flash-image';
  const input: unknown = references.length ? [
    { type: 'text', text: prompt },
    ...references.map((reference) => {
      if (!reference.dataUrl) return null;
      const decoded = decodeDataUrl(reference.dataUrl);
      return {
        type: 'image',
        data: Buffer.from(decoded.bytes).toString('base64'),
        mime_type: decoded.type,
      };
    }).filter(Boolean),
  ] : prompt;

  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
    method: 'POST',
    headers: {
      'x-goog-api-key': key,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model,
      input,
      response_format: { type: 'image', mime_type: 'image/png', aspect_ratio: '1:1', image_size: '1K' },
    }),
  });

  const payload = await response.json() as {
    output_image?: { data?: string; mime_type?: string };
    error?: { message?: string };
  };
  if (!response.ok) throw new Error(payload.error?.message || 'Gemini 圖片生成失敗');
  if (!payload.output_image?.data) throw new Error('Gemini 沒有回傳圖片');

  const mime = payload.output_image.mime_type || 'image/png';
  return { dataUrl: `data:${mime};base64,${payload.output_image.data}`, model };
}

export default async function handler(request: any, response: any) {
  if (request.method !== 'POST') return sendJson(response, { error: 'Method not allowed' }, 405);

  try {
    const body = (typeof request.body === 'string' ? JSON.parse(request.body) : request.body || {}) as { provider?: Provider; prompt?: string; references?: ReferenceImage[] };
    const provider = body.provider;
    const prompt = String(body.prompt || '').trim();
    const references = Array.isArray(body.references) ? body.references.slice(0, MAX_REFERENCES) : [];

    if (provider !== 'chatgpt' && provider !== 'gemini') return sendJson(response, { error: '不支援的產圖平台' }, 400);
    if (!prompt) return sendJson(response, { error: '缺少產圖提示詞' }, 400);
    if (body.references && body.references.length > MAX_REFERENCES) return sendJson(response, { error: '參考照片最多 5 張' }, 400);

    const result = provider === 'chatgpt'
      ? await generateOpenAI(prompt, references)
      : await generateGemini(prompt, references);

    return sendJson(response, { ...result, provider });
  } catch (error) {
    return sendJson(response, { error: error instanceof Error ? error.message : 'AI 產圖失敗' }, 500);
  }
}
