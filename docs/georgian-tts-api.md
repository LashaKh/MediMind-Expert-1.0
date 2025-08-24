# Georgian TTS API Documentation

## Overview

This document provides comprehensive information for integrating the Georgian Text-to-Speech (TTS) API from Enagramm.com into the MediMind Expert application. The API supports Georgian language speech recognition with features like punctuation, autocorrect, and speaker separation.

## Base URL
```
https://enagramm.com/API
```

## API Documentation
Full Swagger documentation: https://enagramm.com/api/swagger/index.html

## Authentication

### Token-Based Authentication
- **Access Token Lifetime**: 30 minutes
- **Authentication Header**: `Authorization: Bearer {AccessToken}`
- **Token Refresh**: Use RefreshToken when AccessToken expires (401 Unauthorized)

### Authentication Flow
1. Login with credentials → Get AccessToken + RefreshToken 
ENAGRAM 
Lasha.khosht@gmail.com
Dba545c5fde36242@

2. Use AccessToken for API calls (30min validity)
3. When token expires → Use RefreshToken to get new token pair
4. Continue with new AccessToken

## API Endpoints

### 1. Account/Login
**Purpose**: Authenticate user and obtain access tokens

**Endpoint**: `POST /Account/Login`

**Request Body**:
```json
{
  "Email": "string",
  "Password": "string", 
  "RememberMe": true
}
```

**Success Response (200)**:
```json
{
  "Success": true,
  "ErrorCode": "string",
  "Error": "string", 
  "Message": "string",
  "AccessToken": "string",
  "RefreshToken": "string",
  "Email": "string",
  "PackageID": 0
}
```

**Error Responses**:
- `400 Bad Request`: Invalid request data
- `403 Forbidden`: Authentication failed
- `422 Unprocessable Content`: Validation errors

### 2. Account/RefreshToken
**Purpose**: Refresh expired access token

**Endpoint**: `POST /Account/RefreshToken`

**Request Body**:
```json
{
  "AccessToken": "string",
  "RefreshToken": "string"
}
```

**Success Response (200)**:
```json
{
  "Success": true,
  "ErrorCode": "string",
  "Error": "string",
  "Message": "string", 
  "AccessToken": "string",
  "RefreshToken": "string"
}
```

### 3. STT/RecognizeSpeech
**Purpose**: Real-time speech recognition from base64 audio data

**Endpoint**: `POST /STT/RecognizeSpeech`

**Headers**:
```
Authorization: Bearer {AccessToken}
Content-Type: application/json
```

**Request Body**:
```json
{
  "Engine": "string",
  "theAudioDataAsBase64": "string",
  "Language": "string",
  "Autocorrect": true,
  "Punctuation": true,
  "Digits": true,
  "Model": "string"
}
```

**Key Parameters**:
- `theAudioDataAsBase64` (required): Audio data encoded in base64 format
- `Language`: Language code (e.g., "ka-GE" for Georgian)
- `Punctuation`: Set to `true` for automatic punctuation insertion
- `Autocorrect`: Enable automatic text correction
- `Engine`: Speech recognition engine (default available)

**Audio Constraints**:
- **Maximum Duration**: 25 seconds per request
- **Recommended Splitting**: Split on pauses/silence for better accuracy
- **Format**: Base64 encoded audio data

**Success Response (200)**:
```json
{
  "Success": true,
  "ErrorCode": "string",
  "Error": "string",
  "Message": "string",
  "Text": "string",
  "WordsCount": 0,
  "VoiceFilePath": "string"
}
```

**Error Responses**:
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Invalid or expired token
- `403 Forbidden`: Access denied
- `422 Unprocessable Content`: Processing error

### 4. STT/RecognizeSpeechFileSubmit
**Purpose**: File-based speech recognition with speaker separation

**Endpoint**: `POST /STT/RecognizeSpeechFileSubmit`

**Headers**:
```
Authorization: Bearer {AccessToken}
Content-Type: multipart/form-data
```

**Form Data Parameters**:
- `AudioFile` (required): MP3 audio file
- `Speakers` (required): Set to `1` for speaker separation
- `Language`: Language code (optional, defaults available)
- `Autocorrect`: Boolean for text correction
- `Punctuation`: Boolean for automatic punctuation
- `Digits`: Boolean for digit recognition
- `Engine`: Recognition engine selection

**File Constraints**:
- **Format**: MP3 files only
- **Upload Method**: multipart/form-data

**Success Response (200)**:
```json
{
  "Success": true,
  "ErrorCode": "string", 
  "Error": "string",
  "Message": "string",
  "lstSpeakers": [
    {
      "Speaker": "string",
      "Text": "string", 
      "CanBeMultiple": true,
      "StartSeconds": 0,
      "EndSeconds": 0
    }
  ],
  "VoiceFilePath": "string"
}
```

**Speaker Data Structure**:
- `Speaker`: Speaker identifier
- `Text`: Transcribed text for this speaker
- `CanBeMultiple`: Whether speaker appears multiple times
- `StartSeconds`: Speech start time
- `EndSeconds`: Speech end time

## Implementation Guidelines

### Authentication Management
```javascript
// Store tokens securely
const tokenManager = {
  accessToken: null,
  refreshToken: null,
  expiryTime: null,
  
  async login(email, password) {
    // Login implementation
  },
  
  async refreshTokens() {
    // Token refresh implementation
  },
  
  isTokenExpired() {
    // Check if token needs refresh
  }
};
```

### Real-time Speech Recognition
```javascript
// For microphone input (25-second chunks)
const processAudioChunk = async (audioBlob) => {
  const base64Audio = await convertToBase64(audioBlob);
  
  const response = await fetch('/API/STT/RecognizeSpeech', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      theAudioDataAsBase64: base64Audio,
      Language: 'ka-GE',
      Punctuation: true,
      Autocorrect: true
    })
  });
  
  return await response.json();
};
```

### File Upload Recognition
```javascript
// For MP3 file upload with speaker separation
const processAudioFile = async (file) => {
  const formData = new FormData();
  formData.append('AudioFile', file);
  formData.append('Speakers', '1');
  formData.append('Language', 'ka');
  formData.append('Punctuation', 'true');
  formData.append('Autocorrect', 'true');
  
  const response = await fetch('/API/STT/RecognizeSpeechFileSubmit', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    },
    body: formData
  });
  
  return await response.json();
};
```

### Error Handling Strategy
```javascript
const apiCall = async (endpoint, options) => {
  try {
    let response = await fetch(endpoint, options);
    
    // Handle token expiration
    if (response.status === 401) {
      await refreshTokens();
      // Retry with new token
      options.headers.Authorization = `Bearer ${newAccessToken}`;
      response = await fetch(endpoint, options);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};
```

## Integration Considerations

### For MediMind Expert
1. **Medical Context**: Optimize for medical terminology and Georgian medical vocabulary
2. **Privacy**: Ensure HIPAA compliance for medical audio data
3. **Real-time Feedback**: Implement streaming for doctor-patient conversations
4. **Error Handling**: Robust error handling for clinical environments
5. **Offline Fallback**: Consider offline capabilities for critical scenarios

### Performance Optimization
1. **Audio Chunking**: Split long recordings at natural pauses
2. **Background Processing**: Process audio chunks in background
3. **Caching**: Cache frequently used medical terms
4. **Compression**: Optimize audio encoding for faster uploads

### Quality Assurance
1. **Medical Accuracy**: Validate transcriptions for medical accuracy
2. **Georgian Language**: Test with medical Georgian terminology
3. **Speaker Recognition**: Verify doctor/patient speaker separation
4. **Punctuation**: Ensure proper medical documentation formatting

## Postman Collection
Test collection available upon request from the Enagramm team.

## Support
For technical issues or questions, contact the Enagramm team.

## Rate Limits & Constraints
- **Audio Duration**: Maximum 25 seconds per real-time request
- **Token Lifetime**: 30 minutes for AccessToken
- **File Format**: MP3 for file uploads
- **Audio Encoding**: Base64 for real-time recognition

## Language Codes
- Georgian: `ka-GE` (for RecognizeSpeech)
- Georgian: `ka` (for RecognizeSpeechFileSubmit)

## Next Steps for Implementation
1. Set up authentication flow with secure token storage
2. Implement microphone capture with 25-second chunking
3. Create file upload interface for longer recordings
4. Add speaker separation visualization
5. Integrate with MediMind Expert's medical workflow
6. Test with Georgian medical terminology
7. Implement privacy and security measures for medical data