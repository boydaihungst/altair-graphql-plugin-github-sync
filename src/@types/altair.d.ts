import { PluginContext } from 'altair-graphql-core/build/plugin/context/context.interface';
import {
  IQueryCollection,
  ISelectedFile,
  StorageService,
} from '../providers/StorageService';

export type AltairContext = PluginContext & { db: StorageService };

export type AltairData = {
  queryCollections: IQueryCollection[];

  appState: { key: string; value: unknown }[];

  selectedFiles: ISelectedFile[];

  localStorage: Storage;
};
