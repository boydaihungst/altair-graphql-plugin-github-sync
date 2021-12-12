import axios, { AxiosInstance } from 'axios';

interface IGistFile {
  filename: string;
  truncated: boolean;
  content: string;
  raw_url: string; // eslint-disable-line camelcase
}

interface IGistFiles {
  'altair_data.json': IGistFile;
}

interface IGist {
  id: string;
  description: string;
  files: IGistFiles;
}

class GitHubService {
  api: AxiosInstance;

  constructor(token: string) {
    this.api = axios.create({
      baseURL: 'https://api.github.com/',
      headers: { Authorization: `Bearer ${token.trim()}` },
    });
  }

  updateAuthToken(newToken: string) {
    this.api = axios.create({
      baseURL: 'https://api.github.com/',
      headers: { Authorization: `Bearer ${newToken.trim()}` },
    });
  }

  async getGists(): Promise<IGist[]> {
    const response = await this.api.get<IGist[]>('/gists');
    const gists = response.data.filter(gist => gist.files['altair_data.json']);
    return gists;
  }

  async getGist(gistId: string): Promise<IGist> {
    const response = await this.api.get<IGist>(`/gists/${gistId}`);
    return response.data;
  }

  async getByUrl(url: string): Promise<string> {
    const response = await this.api.get(url);
    return JSON.stringify(response.data);
  }

  async createGist(content: string): Promise<IGist> {
    const response = await this.api.post<IGist>('/gists', {
      files: {
        'altair_data.json': {
          content,
        },
      },
      description: 'altair Sync Data',
      public: false,
    });
    return response.data;
  }

  async updateGist(gistId: string, content: string): Promise<IGist> {
    const response = await this.api.patch<IGist>(`/gists/${gistId}`, {
      files: {
        'altair_data.json': {
          content,
        },
      },
    });
    return response.data;
  }
}

export { IGist };
export default GitHubService;
