import { v4 as uuid } from 'uuid';
import { AltairData, AltairContext } from '../@types/altair';
import { IQueryCollection } from './StorageService';
import merge from 'lodash/merge';
import values from 'lodash/values';
import keyBy from 'lodash/keyBy';
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
    const mergedQueries = values(
      merge(
        keyBy(oldQueries, o => o.id),
        keyBy(newQueries, o => o.id),
      ),
    );
    return mergedQueries;
  }

  createCollection(collection: IQueryCollection) {
    const now = this.altairContext.db.now();

    collection.queries = collection.queries.map(query => {
      return { ...query, id: uuid(), created_at: now, updated_at: now };
    });
    return this.altairContext.db.queryCollections.add({
      ...collection,
      created_at: now,
      updated_at: now,
    });
  }

  protected async updateCollection(
    collectionTitle: string,
    modifiedCollection: IQueryCollection,
  ) {
    return this.altairContext.db.queryCollections
      .where('title')
      .equals(collectionTitle)
      .modify((oldCollection, ctx) => {
        modifiedCollection.queries = this.mergeQueriesOfCollection(
          oldCollection.queries,
          modifiedCollection.queries,
        );
        ctx.value = modifiedCollection;
      });
  }

  protected async importToAltair(content: string): Promise<void> {
    const data: AltairData = JSON.parse(content);
    if (!data) {
      throw new Error('Data from gist is empty or corrupted!');
    }
    // Restore localStorage
    if (data.localStorage) {
      // Restore localStorage
      Object.keys(data.localStorage).forEach(key => {
        localStorage.setItem(key, data.localStorage[key]);
      });
    }
    // Restore collections and querys
    for (const collection of data.queryCollections) {
      if (!collection.title) continue;
      const oldCollection = await this.altairContext.db.queryCollections
        .where('title')
        .equals(collection.title)
        .first();
      // Update old one with new one
      if (oldCollection) {
        await this.updateCollection(
          collection.title,
          merge(oldCollection, collection),
        );
        continue;
      }
      // Create if not exist
      await this.createCollection(collection);
    }
    // Restore app state: window
    if (data.appState && data.appState.length > 0) {
      // Keep app settings
      const appSettings = await this.altairContext.db.appState
        .where('key')
        .equals('[altair_]::settings')
        .first();
      await this.altairContext.db.appState.clear();
      if (appSettings) await this.altairContext.db.appState.add(appSettings);
      // Restore windowId for selectedFiles and inputed variables
      await this.altairContext.db.appState.bulkAdd(data.appState);
    }
    // Restore selected files
    if (data.selectedFiles && data.selectedFiles.length > 0) {
      await this.altairContext.db.selectedFiles.clear();
      // Restore selectedFiles
      await this.altairContext.db.selectedFiles.bulkAdd(data.selectedFiles);
    }
  }

  protected async exportFromAltair(): Promise<string> {
    const altairCollections = await this.altairContext.db.queryCollections.toArray();
    const altairAppState = await this.altairContext.db.appState.toArray();
    // Prevent save app settings
    altairAppState.splice(
      altairAppState.findIndex(item => item.key === '[altair_]::settings'),
    );
    const altairsSlectedFiles = await this.altairContext.db.selectedFiles.toArray();

    const data: AltairData = {
      queryCollections: altairCollections,
      appState: altairAppState,
      selectedFiles: altairsSlectedFiles,
      localStorage,
    };
    return JSON.stringify(data, null, 2);
  }

  protected getAltairStoreData(key: string): string | null {
    return localStorage.getItem(key);
  }

  protected setAltairStoreData(key: string, value: string): void {
    return localStorage.setItem(key, value);
  }

  abstract receive(): Promise<void>;

  abstract send(): Promise<void>;
}

export default SyncProvider;
