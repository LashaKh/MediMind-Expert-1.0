import { encode } from 'base64-arraybuffer';

const WEBHOOK_URL = 'https://hook.eu2.make.com/kg5sksa7m8j7u0htjy29ucaogvhlacfl';

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function makeRequestWithRetry(url: string, options: RequestInit, retries = MAX_RETRIES): Promise<Response> {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      if (retries > 0) {
        await delay(RETRY_DELAY);
        return makeRequestWithRetry(url, options, retries - 1);
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response;
  } catch (error) {
    if (retries > 0) {
      await delay(RETRY_DELAY);
      return makeRequestWithRetry(url, options, retries - 1);
    }
    throw error;
  }
}

export async function analyzeECG(imageFile: File): Promise<string> {
  try {
    // Validate file type
    if (!imageFile.type.match(/^image\/(jpeg|png|webp|gif)$/)) {
      throw new Error('Unsupported file type. Please use JPEG, PNG, WEBP, or non-animated GIF.');
    }

    // Validate image quality
    const img = new Image();
    const imageUrl = URL.createObjectURL(imageFile);
    
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = imageUrl;
    });

    if (img.width < 700 || img.height < 400) {
      URL.revokeObjectURL(imageUrl);
      throw new Error('Image resolution is too low. Please provide a higher quality image for accurate analysis.');
    }

    // Create FormData with both file and URI
    const base64Data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(imageFile);
    });

    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('imageUri', imageUrl);
    formData.append('imageBase64', base64Data);
    formData.append('timestamp', new Date().toISOString());
    formData.append('filename', imageFile.name);
    formData.append('fileType', imageFile.type);
    formData.append('fileSize', imageFile.size.toString());
    formData.append('dimensions', `${img.width}x${img.height}`);

    // Send to webhook
    const response = await makeRequestWithRetry(WEBHOOK_URL, {
      method: 'POST',
      body: formData
    });

    // Clean up the object URL
    URL.revokeObjectURL(imageUrl);

    const result = await response.text();
    return result;

  } catch (error) {

    throw new Error(error instanceof Error ? error.message : 'Failed to analyze ECG');
  }
}