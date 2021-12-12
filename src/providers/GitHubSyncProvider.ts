import SyncProvider from './SyncProvider';
import GitHubService from '../services/github';
import {
  STORE_KEY_API_KEY,
  STORE_KEY_GIST_ID,
} from '../constant/gist-provider.enum';

class GitHubSyncProvider extends SyncProvider {
  async receive(): Promise<void> {
    const apiKey = this.getAltairStoreData(STORE_KEY_API_KEY);
    if (!apiKey) {
      throw new Error('Please input gist apiKey');
    }

    const gistId = this.getAltairStoreData(STORE_KEY_GIST_ID);
    if (!gistId) {
      throw new Error('Please select gist file');
    }

    const gitHubService = new GitHubService(apiKey);
    const gist = await gitHubService.getGist(gistId);
    const file = gist.files['altair_data.json'];

    if (!file.truncated) await this.importToAltair(file.content);
    else {
      const rawData = await gitHubService.getByUrl(file.raw_url);
      await this.importToAltair(rawData);
    }
  }

  async send(): Promise<void> {
    const apiKey = this.getAltairStoreData(STORE_KEY_API_KEY);
    if (!apiKey) throw new Error();
    const gistId = this.getAltairStoreData(STORE_KEY_GIST_ID);

    const content = await this.exportFromAltair();
    const gitHubService = new GitHubService(apiKey);

    if (!gistId) {
      const gist = await gitHubService.createGist(content);
      this.setAltairStoreData(STORE_KEY_GIST_ID, gist.id);
    } else {
      await gitHubService.updateGist(gistId, content);
    }
  }
}

export default GitHubSyncProvider;
