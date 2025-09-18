export interface SuggestionInfo {
  title: string,
  suggestedCity: string;
  explanation: string | null;
}
export class TravelGuideClient {
  /**
   * Get a city suggestion based on activity description
   */
  async suggestCity(description: string): Promise<SuggestionInfo> {
    const response = await fetch('/api/travel-guide/suggest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ description }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to get city suggestion');
    }
    
    const data = await response.json();
    return data as SuggestionInfo;
  }
}
