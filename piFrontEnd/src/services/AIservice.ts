// src/services/AIService.ts
import { v4 as uuidv4 } from 'uuid';

// Types for AI service communication
export interface MessageHistory {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIConfig {
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
  model?: string;
}

export interface AIResponse {
  id: string;
  content: string;
  timestamp: Date;
}

class AIService {
  private apiEndpoint: string;
  private apiKey: string;
  private model: string;
  private defaultConfig: AIConfig;

  constructor(apiKey?: string, apiEndpoint?: string, model?: string) {
    this.apiKey = apiKey || process.env.REACT_APP_AI_API_KEY || '';
    this.apiEndpoint = apiEndpoint || process.env.REACT_APP_AI_API_ENDPOINT || 'https://api.openai.com/v1/chat/completions';
    this.model = model || process.env.REACT_APP_AI_MODEL || 'gpt-4';
    
    this.defaultConfig = {
      temperature: 0.7,
      max_tokens: 1000,
      stream: false
    };
  }

  // Send a message to the AI service and get a response
  async sendMessage(
    messages: MessageHistory[],
    config?: AIConfig
  ): Promise<AIResponse> {
    try {
      const requestConfig = { ...this.defaultConfig, ...config };
      
      const requestBody = {
        model: this.model,
        messages,
        temperature: requestConfig.temperature,
        max_tokens: requestConfig.max_tokens,
        stream: requestConfig.stream
      };

      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `AI service error (${response.status}): ${
            errorData.error?.message || response.statusText
          }`
        );
      }

      const data = await response.json();
      
      return {
        id: uuidv4(),
        content: data.choices?.[0]?.message?.content || '',
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error in AI service:', error);
      throw error;
    }
  }

  // Alternative implementation that supports streaming responses
  async sendMessageWithStream(
    messages: MessageHistory[],
    onChunk: (chunk: string) => void,
    config?: AIConfig
  ): Promise<AIResponse> {
    try {
      const requestConfig = { ...this.defaultConfig, stream: true, ...config };
      
      const requestBody = {
        model: this.model,
        messages,
        temperature: requestConfig.temperature,
        max_tokens: requestConfig.max_tokens,
        stream: true
      };

      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `AI service error (${response.status}): ${
            errorData.error?.message || response.statusText
          }`
        );
      }

      if (!response.body) {
        throw new Error('Response body is null');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let content = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }
        
        const chunk = decoder.decode(value);
        
        // Process SSE data - this part needs to be adjusted based on the API's response format
        const lines = chunk.split('\n');
        let chunkContent = '';
        
        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const data = JSON.parse(line.slice(6));
              const textChunk = data.choices?.[0]?.delta?.content || '';
              chunkContent += textChunk;
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
        
        if (chunkContent) {
          content += chunkContent;
          onChunk(chunkContent);
        }
      }

      return {
        id: uuidv4(),
        content,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error in AI streaming service:', error);
      throw error;
    }
  }
}

export default AIService;