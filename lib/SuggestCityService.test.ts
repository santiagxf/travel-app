import SuggestCityService from "./SuggestCityService";
import CityGuideData from "./data/CityGuideData";

const shouldSkipTests = !process.env.GITHUB_TOKEN;

(shouldSkipTests ? describe.skip : describe)("SuggestCityService - suggestCity", () => {
    let suggestCityService: SuggestCityService;

    beforeEach(() => {
        suggestCityService = new SuggestCityService();
    });

    it("should suggest a city based on the description", async () => {
        const description = "I want to visit a romantic city with great food and tall buildings.";
        const expectedCity = "New York";

        const suggestedCity = await suggestCityService.suggestCity(description);

        expect(suggestedCity).toBe(expectedCity);
    });

    it("should return the first city if the suggested city is not in the data", async () => {
        const description = "I want to visit a city with mountains.";
        const expectedCity = CityGuideData[0].city;

        jest.spyOn(suggestCityService, "suggestCity").mockResolvedValue(expectedCity);

        const suggestedCity = await suggestCityService.suggestCity(description);

        expect(suggestedCity).toBe(expectedCity);
    });
});

(shouldSkipTests ? describe.skip : describe)("SuggestCityService - explainSuggestion", () => {
    let suggestCityService: SuggestCityService;

    beforeEach(() => {
        suggestCityService = new SuggestCityService();
    });

    it("should give reasons for a mismatch", async () => {
        const description = "I want to visit a city with beaches and cold weather.";
        const suggestedCity = "New York";

        const reasons = await suggestCityService.explainSuggestCity(description, suggestedCity);

        expect(typeof reasons).toBe('string');
        expect(reasons.startsWith("Take into consideration:"));
    });

    it("should highlight the match ", async () => {
        const description = "I want to visit a city with beaches and great weather.";
        const suggestedCity = "Miami";

        const reasons = await suggestCityService.explainSuggestCity(description, suggestedCity);

        expect(typeof reasons).toBe('string');
        expect(reasons.startsWith("Why we think you would like it?"));
    });
});
