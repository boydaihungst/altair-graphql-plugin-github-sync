import axios, { AxiosInstance } from 'axios';
import { IGistFile } from 'src/@types/gist';
import { PREFIX_FILE_NAME_GIST } from '../../constant/common.enum';

interface IGithubGistFile {
  filename: string;
  raw_url: string;
  size: number;
  truncated?: boolean;
  content?: string;
}

interface IGithubGist {
  id: string;
  description: string;
  files: Record<string, IGithubGistFile>;
}

class GitHubService {
  api: AxiosInstance;

  constructor(token: string) {
    this.api = axios.create({
      baseURL: 'https://api.github.com/',
      headers: { Authorization: `Bearer ${token.trim()}` },
    });
  }

  async getListGist(page = 1): Promise<IGithubGist[]> {
    const response = await this.api.get<IGithubGist[]>(
      `/gists?per_page=100&page=${page}`,
    );
    let data = response.data;
    if (data.length === 100) {
      data = data.concat(await this.getListGist(++page));
    }
    return data.filter(gist =>
      Object.keys(gist.files).some(filename => {
        return filename.startsWith(PREFIX_FILE_NAME_GIST);
      }),
    );
  }

  async getGist(gistId: string): Promise<IGithubGist | null> {
    const response = await this.api.get<IGithubGist>(`/gists/${gistId}`);
    const gist = response.data;
    const gistNotMatchNamePrefix = Object.keys(gist.files).every(
      filename => !filename.startsWith(PREFIX_FILE_NAME_GIST),
    );
    if (gistNotMatchNamePrefix) return null;
    return gist;
  }

  async getGistFileContent(gistFileRawUrl: string): Promise<any> {
    const response = await this.api.get(gistFileRawUrl);
    return response.data;
  }

  async createGist(fileName: string, content: string): Promise<IGithubGist> {
    const response = await this.api.post<IGithubGist>('/gists', {
      files: {
        [GitHubService.getFilename(fileName)]: {
          content,
        },
      },
      description: 'Altair Sync Data',
      public: false,
    });
    return response.data;
  }

  async removeGistFileFromGist(gistId: string, fileName: string) {
    const response = await this.api.patch<IGithubGist>(`/gists/${gistId}`, {
      files: {
        [GitHubService.getFilename(fileName)]: null,
      },
    });
    return response.data;
  }

  async appendGistFileToGist(
    gistId: string,
    content: string,
    newFileName: string,
  ): Promise<IGithubGist> {
    const response = await this.api.patch<IGithubGist>(`/gists/${gistId}`, {
      files: {
        [GitHubService.getFilename(newFileName)]: {
          content,
        },
      },
    });
    return response.data;
  }

  public static getFilename(fileName: string) {
    return PREFIX_FILE_NAME_GIST + fileName + '.json';
  }

  public static getDisplayFilename(originFileName: string) {
    return originFileName
      .replace(PREFIX_FILE_NAME_GIST, '')
      .replace('.json', '');
  }

  public static findGistFileFromGist(
    byFileName: string,
    gist: IGithubGist,
  ): IGistFile | null {
    const listGistFile = GitHubService.mapToListGistFile(gist);
    return (
      listGistFile.find(
        x => x.filename === GitHubService.getFilename(byFileName!)!,
      ) || null
    );
  }

  public static mapToListGistFile(githubGist: IGithubGist): IGistFile[] {
    const gistFiles = Object.keys(githubGist.files).map(
      filename => githubGist.files[filename],
    );
    return gistFiles.map<IGistFile>(gistFile => ({
      filename: gistFile.filename,
      displayName: GitHubService.getDisplayFilename(gistFile.filename),
      rawUrl: gistFile.raw_url,
      gistId: githubGist.id,
    }));
  }
}

export type { IGithubGist };
export default GitHubService;
