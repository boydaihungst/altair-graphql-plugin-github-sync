import Dexie from 'dexie';

export interface IQueryCollection {
  id?: number;
  title: string;
  description?: string;
  queries: any[];
  collections?: IQueryCollection[];

  created_at?: number;
  updated_at?: number;
}

export interface ISelectedFile {
  id: string;
  windowId: string;
  data: File[];
}

export class StorageService extends Dexie {
  queryCollections!: Dexie.Table<IQueryCollection, number>;

  appState!: Dexie.Table<{ key: string; value: any }, string>;

  selectedFiles!: Dexie.Table<ISelectedFile, string>;

  /**
   *
   * @param databaseVersion https://github.com/altair-graphql/altair/blob/master/packages/altair-app/src/app/modules/altair/services/storage/storage.service.ts
   */
  dexieSchemaVersion = 5;

  constructor() {
    super('AltairDB');
    this.schema(this.dexieSchemaVersion);
  }

  schema(databaseVersion: number) {
    this.version(databaseVersion).stores({
      queryCollections: '++id, title, parentPath',
      appState: 'key',
      selectedFiles: 'id, windowId',
      localActionLogs: '++id',
    });
  }

  now() {
    return +new Date();
  }

  clearAllLocalData() {
    // Clear indexedDb
    Dexie.getDatabaseNames().then(names => {
      names.forEach(name => {
        const db = new Dexie(name);
        db.delete().catch(() => {
          //
        });
      });
    });

    localStorage.clear();
  }
}
