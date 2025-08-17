import { encode } from 'base64-arraybuffer';

const API_KEY = 'AIzaSyDGv9wWoMpmzL6wpPmP7va_KJYEe9D8_8s';
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

if (!API_KEY) {
  throw new Error('API key not found');
}

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

interface ImageProcessingOptions {
  maxSize?: number;
  quality?: number;
  detail?: 'low' | 'high' | 'auto';
}

async function makeRequestWithRetry(url: string, options: RequestInit, retries = MAX_RETRIES): Promise<Response> {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorData = await response.json();
      
      // Check if error is due to model overload
      if (
        response.status === 429 || 
        errorData.error?.message?.includes('overloaded') ||
        errorData.error?.message?.includes('capacity')
      ) {
        if (retries > 0) {
          await delay(RETRY_DELAY);
          return makeRequestWithRetry(url, options, retries - 1);
        }
      }
      
      throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
    }
    
    return response;
  } catch (error) {
    if (retries > 0 && error instanceof Error && error.message.includes('overloaded')) {
      await delay(RETRY_DELAY);
      return makeRequestWithRetry(url, options, retries - 1);
    }
    throw error;
  }
}

async function processImage(file: File, options: ImageProcessingOptions = {}): Promise<string> {
  const {
    maxSize = 2048,
    quality = 0.95,
    detail = 'high'
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        if (!reader.result) {
          throw new Error('Failed to read file');
        }
        const base64data = reader.result as string;
        const base64 = base64data.split(',')[1];
        resolve(base64);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function analyzeImage(imageFile: File): Promise<string> {
  try {
    if (!imageFile.type.match(/^image\/(jpeg|png|webp|gif)$/)) {
      throw new Error('Unsupported file type. Please use JPEG, PNG, WEBP, or non-animated GIF.');
    }

    const base64Image = await processImage(imageFile);

    const response = await makeRequestWithRetry(
      'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=' + API_KEY,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                { text: 'Extract and output exactly what you see in this image:' },
                {
                  inlineData: {
                    mimeType: 'image/jpeg',
                    data: base64Image
                  }
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.1,
            topK: 1,
            topP: 1,
            maxOutputTokens: 2048,
            stopSequences: []
          }
        })
      }
    );

    const data = await response.json();

    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {

      throw new Error('Invalid response from Gemini API');
    }

    return data.candidates[0].content.parts[0].text;
  } catch (error) {

    if (error instanceof Error) {
      const errorMessage = error.message.includes('overloaded')
        ? 'The service is currently busy. Please try again in a few moments.'
        : `Analysis failed: ${error.message}`;
      throw new Error(errorMessage);
    }
    throw new Error('Failed to analyze image');
  }
}