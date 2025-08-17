export const API_ENDPOINTS = {
  FLOWISE_BOT: "https://flowise-2-0.onrender.com/api/v1/prediction/f8433523-af63-4c53-8db9-63ed3b923f2e",
  GEORGIAN_CORRECTION: "https://flowise-2-0.onrender.com/api/v1/prediction/40072086-c362-4b00-9b79-1ff3400b4bf6",
  // AWS Lambda URL for MediVoice transcription (this needs AWS credentials to access your S3 bucket)
  MEDIVOICE_TRANSCRIPTION: "https://omlim4irpt7vnzwjqi4jm6gumy0ypxne.lambda-url.us-east-1.on.aws/",
  PRESIGNED_URL: "https://asuiigts4jk2kv65horcj5t5uu0pdupx.lambda-url.us-east-1.on.aws/"
} as const;

// Validate API endpoints after export
if (!API_ENDPOINTS.MEDIVOICE_TRANSCRIPTION) {

}