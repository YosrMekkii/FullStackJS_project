import axios, { AxiosInstance } from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Define types to match your Challenge interface
export interface ChallengeContent {
  question?: string;
  options?: string[];
  code?: string;
  correctAnswer?: string | string[];
}

export interface Challenge {
  _id: string;
  title: string;
  description: string;
  type: 'coding' | 'quiz' | 'interactive';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  xp: number;
  timeLimit: number;
  category: string;
  tags: string[];
  content?: ChallengeContent;
  dailyChallenge?: boolean;
}

// Type for creating/updating challenges
export type ChallengeInput = Omit<Challenge, '_id'>;

class ChallengeApi {
  private axios: AxiosInstance;
  private token: string | null;

  constructor() {
    this.axios = axios.create({
      baseURL: `${BASE_URL}/challenges`,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    this.token = null;
  }

  setAuthToken(token: string): void {
    this.token = token;
    this.axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  async fetchChallenges(filter: string = 'all'): Promise<Challenge[]> {
    try {
      const response = await this.axios.get(`/?filter=${filter}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching challenges:', error);
      throw error;
    }
  }

  async getChallengeById(id: string): Promise<Challenge> {
    try {
      const response = await this.axios.get(`/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching challenge ${id}:`, error);
      throw error;
    }
  }

  async createChallenge(challengeData: Partial<ChallengeInput>): Promise<Challenge> {
    try {
      const response = await this.axios.post('/', challengeData);
      return response.data;
    } catch (error) {
      console.error('Error creating challenge:', error);
      throw error;
    }
  }

  async updateChallenge(id: string, challengeData: Partial<ChallengeInput>): Promise<Challenge> {
    try {
      const response = await this.axios.put(`/${id}`, challengeData);
      return response.data;
    } catch (error) {
      console.error(`Error updating challenge ${id}:`, error);
      throw error;
    }
  }

  async deleteChallenge(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.axios.delete(`/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting challenge ${id}:`, error);
      throw error;
    }
  }
}

// Create a singleton instance
const challengeApi = new ChallengeApi();

export default challengeApi;