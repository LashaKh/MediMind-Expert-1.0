export async function convertBlobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export function createAudioConfig(languageCode = 'ka-GE') {
  return {
    encoding: 'LINEAR16' as const,
    sampleRateHertz: 16000,
    languageCode,
  };
}