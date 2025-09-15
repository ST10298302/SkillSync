// Use the real implementation instead of the global mock from jest.setup
jest.mock('../../services/googleTranslateAPI', () =>
  jest.requireActual('../../services/googleTranslateAPI')
);

import { GoogleTranslateAPI } from '../../services/googleTranslateAPI';

describe('GoogleTranslateAPI', () => {
  beforeEach(() => {
    // @ts-ignore private state reset via initialize
    (GoogleTranslateAPI as any).apiKey = null;
    jest.resetAllMocks();
    // Ensure fetch is undefined by default to avoid leakage between tests
    // @ts-ignore
    global.fetch = undefined;
  });

  it('throws if not initialized', async () => {
    await expect(GoogleTranslateAPI.translateText('hello', 'es')).rejects.toThrow('not initialized');
  });

  it('returns original text for empty input', async () => {
    GoogleTranslateAPI.initialize('key');
    const res = await GoogleTranslateAPI.translateText('   ', 'es');
    expect(res.translatedText).toBe('   ');
  });

  it('returns original text for single-character input', async () => {
    GoogleTranslateAPI.initialize('key');
    const res = await GoogleTranslateAPI.translateText('A', 'es');
    expect(res.translatedText).toBe('A');
  });

  it('translates successfully when fetch resolves', async () => {
    GoogleTranslateAPI.initialize('key');
    // @ts-ignore
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          translations: [
            { translatedText: 'hola', detectedSourceLanguage: 'en' },
          ],
        },
      }),
    });

    const res = await GoogleTranslateAPI.translateText('hello', 'es');
    expect(res.translatedText).toBe('hola');
    expect(res.detectedSourceLanguage).toBe('en');
  });

  it('throws a friendly error when fetch fails', async () => {
    GoogleTranslateAPI.initialize('key');
    // @ts-ignore
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 500 });
    await expect(GoogleTranslateAPI.translateText('hello', 'es')).rejects.toThrow('Failed to translate text');
  });
});


