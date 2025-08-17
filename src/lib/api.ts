const API_URL = "https://flowise-2-0.onrender.com/api/v1/prediction/f8433523-af63-4c53-8db9-63ed3b923f2e";

export async function fetchAIResponse(message: string) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message })
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    return await response.json();
  } catch (error) {

    throw error;
  }
}