import SyncProvider from './SyncProvider';
import GitHubSyncProvider from './GitHubSyncProvider';
import { AltairContext } from '../@types/altair';
import { SyncProviders } from '../constant/gist-provider.enum';
class SyncProviderFactory {
  constructor(private altairContext: AltairContext) {}

  getProvider(provider: SyncProviders): SyncProvider {
    switch (provider) {
      case SyncProviders.GitHub:
        return new GitHubSyncProvider(this.altairContext);
      default:
        throw new Error();
    }
  }
}

export default SyncProviderFactory;
export { SyncProviders };
