import { API_ENDPOINTS } from './constants';

interface PresignedUrlResponse {
  uploadUrl: string;
  s3Uri: string;
  bucket: string;
  key: string;
}

async function getPresignedUrl(fileName: string, contentType: string): Promise<PresignedUrlResponse> {
  const response = await fetch(API_ENDPOINTS.PRESIGNED_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ fileName, contentType })
  });

  if (!response.ok) {
    throw new Error(`Failed to get pre-signed URL: ${response.statusText}`);
  }

  const data = await response.json();
  
  // Ensure we have a properly formatted S3 URI
  if (!data.s3Uri.startsWith('s3://')) {
    // Construct proper S3 URI if we have bucket and key
    if (data.bucket && data.key) {
      data.s3Uri = `s3://${data.bucket}/${data.key}`;
    } else {
      throw new Error('Invalid S3 URI format received from server');
    }
  }

  // If bucket and key are not provided but s3Uri is available, extract them
  if ((!data.bucket || !data.key) && data.s3Uri) {
    const extracted = extractBucketAndKeyFromS3Uri(data.s3Uri);
    if (extracted) {
      data.bucket = extracted.bucket;
      data.key = extracted.key;
    }
  }

  return data;
}

async function uploadFileToS3(file: File, presignedUrl: string, onProgress?: (progress: number) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && onProgress) {
        const percentage = (event.loaded / event.total) * 100;
        onProgress(Math.round(percentage));
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`S3 upload failed: ${xhr.statusText}`));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Network error occurred during upload'));
    });

    xhr.open('PUT', presignedUrl);
    xhr.send(file);
  });
}

export async function uploadAudioFile(file: File, onProgress?: (progress: number) => void): Promise<{ s3Uri: string; bucket: string; key: string }> {
  try {
    // Validate file type
    const validTypes = [
      'audio/mpeg',
      'audio/mp3',
      'audio/wav',
      'audio/wave',
      'audio/x-wav',
      'audio/webm',
      'audio/ogg'
    ];

    if (!validTypes.includes(file.type)) {
      throw new Error('Invalid file type. Please upload an audio file (MP3, WAV, OGG, or WebM).');
    }

    // Create unique file name
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    // Remove 'uploads/' prefix - it will be added by the backend
    const fileName = `${timestamp}-${randomString}-${file.name}`;

    // Get pre-signed URL
    const { uploadUrl, s3Uri, bucket, key } = await getPresignedUrl(fileName, file.type);

    // Verify bucket and key are present
    if (!bucket || !key) {

      // Try to extract bucket and key from s3Uri if they're missing
      const extractedValues = extractBucketAndKeyFromS3Uri(s3Uri);
      if (extractedValues) {
        return { 
          s3Uri, 
          bucket: extractedValues.bucket, 
          key: extractedValues.key 
        };
      } else {
        throw new Error('Invalid S3 response: Missing bucket and key values');
      }
    }

    // Upload file to S3
    await uploadFileToS3(file, uploadUrl, onProgress);

    return { s3Uri, bucket, key };
  } catch (error) {

    throw error instanceof Error ? error : new Error('Failed to upload file');
  }
}

export async function deleteAudioFile(s3Uri: string): Promise<void> {
  try {
    const response = await fetch(API_ENDPOINTS.PRESIGNED_URL, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ s3Uri })
    });

    if (!response.ok) {
      throw new Error('Failed to delete file');
    }
  } catch (error) {

    throw error instanceof Error ? error : new Error('Failed to delete file');
  }
}

function extractBucketAndKeyFromS3Uri(s3Uri: string): { bucket: string, key: string } | null {
  if (!s3Uri || !s3Uri.startsWith('s3://')) {
    return null;
  }

  const withoutProtocol = s3Uri.replace('s3://', '');
  const parts = withoutProtocol.split('/', 2);
  
  if (parts.length !== 2) {
    return null;
  }

  const bucket = parts[0];
  const key = withoutProtocol.substring(bucket.length + 1); // +1 for the slash
  
  return { bucket, key };
}