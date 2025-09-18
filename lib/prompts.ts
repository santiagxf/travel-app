'server-only';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';


export interface ChatMessage {
  role: string;
  content: string;
//   tool_call_id?: string;

}

export interface ChatPromptPayload {
  messages: ChatMessage[];
  model: string;
}

export const cityRecommenderPrompt: ChatPromptPayload = yaml.load(fs.readFileSync(
  path.join(process.cwd(), 'app', 'prompts', 'city_recommender.prompt.yml'),
  'utf8',
)) as ChatPromptPayload;

export const cityRecommenderExplainPrompt: ChatPromptPayload = yaml.load(fs.readFileSync(
  path.join(process.cwd(), 'app', 'prompts', 'city_recommender_explain.prompt.yml'),
  'utf8',
)) as ChatPromptPayload;