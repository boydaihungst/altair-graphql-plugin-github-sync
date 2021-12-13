import SyncProvider from './SyncProvider';
import GitHubService from '../services/github';
import {
  STORE_KEY_API_KEY,
  STORE_KEY_GIST_FILE,
} from '../constant/common.enum';
import { IGistFile } from 'src/@types/gist';

class GitHubSyncProvider extends SyncProvider {
  async restoreAltairData(): Promise<void> {
    const apiKey = this.getCachedApiKey(STORE_KEY_API_KEY);
    if (!apiKey) {
      throw new Error('Please input gist apiKey');
    }

    const selectedGistFile = this.getCachedGistFile(STORE_KEY_GIST_FILE);
    if (!selectedGistFile) {
      throw new Error('Please select gist file');
    }

    const gitHubService = new GitHubService(apiKey);
    const gist = await gitHubService.getGist(selectedGistFile.gistId);
    if (!gist) throw new Error('Selected gist not found');
    const listGistFile = GitHubService.mapToListGistFile(gist);
    const oldGistFile = listGistFile.find(
      x => x.filename === selectedGistFile.filename,
    );
    if (!oldGistFile) {
      throw new Error('Selected gist file not found');
    }

    const gitfileContent = await gitHubService.getGistFileContent(
      oldGistFile.rawUrl!,
    );
    await this.importToAltair(gitfileContent);
  }

  async uploadAltairData(newGistFileName: string): Promise<IGistFile | null> {
    const apiKey = this.getCachedApiKey(STORE_KEY_API_KEY);
    const gistFile = this.getCachedGistFile(STORE_KEY_GIST_FILE);
    if (!apiKey) throw new Error('Please input gist apiKey');
    if (!newGistFileName) throw new Error('Please input gist file name');
    const content = await this.exportFromAltair();
    const gitHubService = new GitHubService(apiKey);
    // Create new Gist
    if (!gistFile) {
      const createdGist = await gitHubService.createGist(
        newGistFileName,
        content,
      );

      const createdGistFile = GitHubService.findGistFileFromGist(
        newGistFileName,
        createdGist,
      );
      if (!createdGistFile) {
        await gitHubService.removeGistFileFromGist(
          createdGist.id,
          newGistFileName,
        );
        return null;
      }
      this.cacheSelectedGistFile(STORE_KEY_GIST_FILE, createdGistFile);
      return createdGistFile;
    }

    if (newGistFileName !== gistFile.displayName) {
      await gitHubService.removeGistFileFromGist(
        gistFile.gistId,
        gistFile.displayName,
      );
    }
    // Append file to old Gist
    const updatedGist = await gitHubService.appendGistFileToGist(
      gistFile.gistId,
      content,
      newGistFileName,
    );
    const updatedGistFile = GitHubService.findGistFileFromGist(
      newGistFileName,
      updatedGist,
    );
    return updatedGistFile!;
  }

  async getListGistFile(): Promise<IGistFile[]> {
    const listGistFile: IGistFile[] = [];
    const apiKey = this.getCachedApiKey(STORE_KEY_API_KEY);
    if (!apiKey) {
      throw new Error('Please input gist apiKey');
    }

    const gitHubService = new GitHubService(apiKey);
    const githubGists = await gitHubService.getListGist();

    githubGists.forEach(gist => {
      // Extract IGithubGistFile then Map to -> Generic type IGistFile
      listGistFile.push(...GitHubService.mapToListGistFile(gist));
    });
    return listGistFile;
  }
}

export default GitHubSyncProvider;
