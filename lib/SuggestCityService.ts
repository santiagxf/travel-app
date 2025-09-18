"use server";

import "openai/shims/node";
import OpenAI from "openai";
import { cityRecommenderPrompt, cityRecommenderExplainPrompt } from "./prompts";
import TravelGuideService from "./TravelGuideService";
import { task } from "@traceloop/node-server-sdk";

class SuggestCityService {
  private openai: OpenAI;
  private travelGuideService: TravelGuideService;
  private availableCities: string[];
  
  constructor() {
    // Initialize OpenAI with API key from environment variable
    this.openai = new OpenAI({
      //baseURL: process.env.OPENAI_API_BASE,
      baseURL: "https://models.github.ai/inference",
      apiKey: process.env.GITHUB_TOKEN,
      dangerouslyAllowBrowser: true
    });
    this.travelGuideService = new TravelGuideService();

    // Get all available cities from our data
    this.availableCities = this.travelGuideService.getCityGuideData().map(city => 
      `${city.city}, ${city.country}: ${city.description}. Highlights: ${city.highlights.join(', ')}`
    );
  }

  /**
   * Suggests a city from the available city guides that matches the user's activity description
   * @param description - User's description of desired activities
   * @returns The name of a suggested city
   */
  @task({ name: "suggestCity" })
  async suggestCity(description: string): Promise<string> {
    try {
      const cityList = this.availableCities.join('\n\n');

      // template the prompt with the user's description and the list of cities
      const messages = cityRecommenderPrompt.messages.map(m => ({
        ...m,
        content: m.content
          .replace(/{{input}}/gi, description)
          .replace(/{{cityList}}/gi, cityList),
      })) as OpenAI.ChatCompletionMessage[];
      
      // Create a prompt for the OpenAI model
      const response = await this.openai.chat.completions.create({
        model: cityRecommenderPrompt.model,
        messages: messages,
        temperature: 0.7,
      });
      
      // Extract just the city name from the response
      const suggestedCity = response.choices[0].message.content?.trim() || "";
      
      // Make sure the suggested city exists in our data
      const cityExists = this.travelGuideService.getCityGuideData().some(
        city => suggestedCity.includes(city.city)
      );
      
      if (!cityExists) {
        // If the model returned something not in our list, return a default city
        return this.travelGuideService.getCityGuideData()[0].city;
      }
      
      // Extract just the city name in case the model returned additional text
      const cityNameMatch = suggestedCity.match(/^([^,]+)/);
      return cityNameMatch ? cityNameMatch[0] : this.travelGuideService.getCityGuideData()[0].city;
      
    } catch (error) {
      console.error("Error suggesting city:", error);
      // Return the first city as a fallback
      return this.travelGuideService.getCityGuideData()[0].city;
    }
  }

  /**
   * Gives the reasons for the suggested city
   * @param description - User's description of desired activities
   * @param suggestedCity - The city suggested by the model
   * @returns The reasons for suggesting this city
   */
  @task({ name: "explainSuggestCity" })
  async explainSuggestCity(description: string, suggestedCity: string): Promise<string> {
    try {
      // template the prompt with the user's description and the list of cities
      const messages = cityRecommenderExplainPrompt.messages.map(m => ({
        ...m,
        content: m.content
          .replace(/{{input}}/gi, description)
          .replace(/{{suggestedCity}}/gi, suggestedCity),
      })) as OpenAI.ChatCompletionMessage[];
      
      // Create a prompt for the OpenAI model
      const response = await this.openai.chat.completions.create({
        model: cityRecommenderPrompt.model,
        messages: messages,
        temperature: 0.7,
      });
      
      const reasons = response.choices[0].message.content?.trim() || "";
      return reasons;
      
    } catch (error) {
      console.error("Error explaining city suggestion:", error);
      // Return no reasons
      return "";
    }
  }
}

export default SuggestCityService;