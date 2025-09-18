import "@/instrumentation.node"
import { NextRequest, NextResponse } from "next/server";
import SuggestCityService from "../../../../lib/SuggestCityService";

export async function POST(request: NextRequest) {
  try {
    const { description } = await request.json();
    
    if (!description) {
      return NextResponse.json(
        { error: "Description is required" },
        { status: 400 }
      );
    }
    
    const suggestCityService = new SuggestCityService();
    const suggestedCity = await suggestCityService.suggestCity(description);
    const explanationInfo = await suggestCityService.explainSuggestCity(description, suggestedCity);
    const title = explanationInfo.split(":")[0]
    const explanation = explanationInfo.split(":")[1];

    return NextResponse.json({ suggestedCity, title, explanation });
  } catch (error) {
    console.error("Failed to suggest city:", error);
    return NextResponse.json(
      { error: "Failed to suggest city" },
      { status: 500 }
    );
  }
}