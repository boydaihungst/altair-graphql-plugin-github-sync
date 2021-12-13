import { AltairData, AltairContext } from '../@types/altair';
import { IQueryCollection } from './StorageService';
import merge from 'lodash/merge';
import values from 'lodash/values';
import keyBy from 'lodash/keyBy';
import {
  STORE_KEY_API_KEY,
  STORE_KEY_GIST_FILE,
} from '../constant/common.enum';
import { IGistFile } from 'src/@types/gist';
import { v4 as uuid } from 'uuid';
abstract class SyncProvider {
  private altairContext: AltairContext;

  constructor(altairContext: AltairContext) {
    this.altairContext = altairContext;
  }

  /**
   * Deep merge Queries base on `id`props
   * @param oldQueries
   * @param newQueries
   * @returns
   */
  mergeQueriesOfCollection(oldQueries: any[], newQueries: any[]) {
    const now = this.altairContext.db.now();
    const mergedQueries = values(
      merge(keyBy(oldQueries, 'id'), keyBy(newQueries, 'id')),
    ).map(query => {
      return { ...query, created_at: now, updated_at: now };
    });
    return mergedQueries;
  }

  isValidAltairData(data: AltairData): boolean {
    if (
      !data ||
      !data.appState ||
      !data.localStorage ||
      !data.queryCollections ||
      !data.selectedFiles ||
      !Array.isArray(data.queryCollections) ||
      !Array.isArray(data.appState) ||
      !Array.isArray(data.selectedFiles) ||
      typeof localStorage !== 'object'
    ) {
      return false;
    }
    return true;
  }

  createCollection(collection: IQueryCollection) {
    const now = this.altairContext.db.now();

    collection.queries = collection.queries.map(query => {
      return { ...query, created_at: now, updated_at: now };
    });
    return this.altairContext.db.queryCollections.add({
      ...collection,
      created_at: now,
      updated_at: now,
    });
  }

  protected async updateCollection(
    oldCollection: IQueryCollection,
    newCollection: IQueryCollection,
  ) {
    if (!oldCollection.id) return null;
    const mergedQueries = this.mergeQueriesOfCollection(
      oldCollection.queries,
      newCollection.queries,
    );
    return await this.altairContext.db.queryCollections
      .where('id')
      .equals(oldCollection.id)
      .modify({
        queries: mergedQueries,
      });
  }

  protected async importToAltair(content: string | object): Promise<void> {
    try {
      const data: AltairData =
        typeof content === 'object' ? content : JSON.parse(content);

      if (!this.isValidAltairData(data)) {
        throw new Error('Data from gist is empty or corrupted!');
      }
      // Restore localStorage
      if (data.localStorage) {
        // Restore localStorage
        Object.keys(data.localStorage).forEach(key => {
          if ([STORE_KEY_API_KEY, STORE_KEY_GIST_FILE].includes(key)) return;
          localStorage.setItem(key, data.localStorage[key]);
        });
      }
      // Restore collections and querys
      for (const collection of data.queryCollections) {
        if (!collection.title) {
          // Case there are no title in collections
          collection.title = uuid();
        }
        collection.queries.forEach(q => (q.id = q.id || uuid()));
        const oldCollection = await this.altairContext.db.queryCollections
          .where('title')
          .equals(collection.title)
          .first();
        // Update old one with new one
        if (oldCollection) {
          await this.updateCollection(oldCollection, collection);
          continue;
        }
        // Create if not exist
        await this.createCollection(collection);
      }
      // Restore app state: window
      if (data.appState && data.appState.length > 0) {
        // Restore windowId for selectedFiles and inputed variables
        const dataToUpdate = data.appState.filter(
          item => !['[altair_]::settings'].includes(item.key),
        );
        await this.altairContext.db.appState.bulkPut(dataToUpdate);
      }
      // Restore selected files
      if (data.selectedFiles && data.selectedFiles.length > 0) {
        // Restore selectedFiles
        await this.altairContext.db.selectedFiles.bulkPut(data.selectedFiles);
      }
    } catch (error) {
      throw new Error('Data from gist is empty or corrupted!');
    }
  }

  protected async exportFromAltair(): Promise<string> {
    const altairCollections =
      await this.altairContext.db.queryCollections.toArray();
    const altairAppState = await this.altairContext.db.appState.toArray();
    const altairsSlectedFiles =
      await this.altairContext.db.selectedFiles.toArray();

    const data: AltairData = {
      queryCollections: altairCollections,
      appState: altairAppState,
      selectedFiles: altairsSlectedFiles,
      localStorage,
    };
    return JSON.stringify(data, null, 2);
  }

  public cacheSelectedGistFile(key: string, value: IGistFile): void {
    return localStorage.setItem(key, JSON.stringify(value));
  }

  public getCachedGistFile(key: string): IGistFile | null {
    const rawGistFile = localStorage.getItem(key);
    try {
      if (rawGistFile) return JSON.parse(rawGistFile);
      return null;
    } catch (error) {
      return null;
    }
  }

  public cacheSelectedApiKey(key: string, value: string): void {
    return localStorage.setItem(key, value);
  }

  public getCachedApiKey(key: string): string | null {
    return localStorage.getItem(key);
  }

  /**
   * Restore altair data from cloud (gist). Must selected a gist file before restore
   */
  abstract restoreAltairData(): Promise<void>;

  /**
   * backup/upload altair data to cloud (gist)
   * @param newGistFileName name of gist sub file in case create new gist. if selected a gist file -> set to null
   * @returns void
   */
  abstract uploadAltairData(newGistFileName: string): Promise<IGistFile | null>;

  /**
   * Get list of gist file
   */
  abstract getListGistFile(): Promise<IGistFile[]>;
}

export default SyncProvider;
