import { getCollections, deleteCollection, renameCollection } from '../services/database';
import { renameFolderInCollection } from '../services/database/stores/collections';
import type { WebRsRequest } from '../types/request.types';

/**
 * Fetches and formats collections for use in the UI.
 * @returns {Promise<any[]>} A promise that resolves to formatted collection data.
 */
export const fetchAndFormatCollections = async (): Promise<any[]> => {
  const collections = await getCollections();
  return collections.map((collection) => ({
    title: collection.name,
    key: collection.id,
    isLeaf: false,
  }));
};

/**
 * Renames a collection and triggers a refresh event.
 * @param {number} collectionId - The ID of the collection to rename.
 * @param {string} newName - The new name for the collection.
 */
export const renameCollectionAndRefresh = async (collectionId: string, newName: string): Promise<void> => {
  await renameCollection(collectionId, newName);
  if (typeof window !== 'undefined' && window.dispatchEvent) {
    window.dispatchEvent(new Event('refreshCollections'));
  }
};

/**
 * Renames a folder in a collection and triggers a refresh event.
 * @param {string} collectionId - The ID of the collection containing the folder.
 * @param {string} folderId - The ID of the folder to rename.
 * @param {string} newName - The new name for the folder.
 */
export const renameFolderAndRefresh = async (collectionId: string, folderId: string, newName: string): Promise<void> => {
  await renameFolderInCollection(collectionId, folderId, newName);
  if (typeof window !== 'undefined' && window.dispatchEvent) {
    window.dispatchEvent(new Event('refreshCollections'));
  }
};

/**
 * Deletes a collection and triggers a refresh event.
 * @param {number} collectionId - The ID of the collection to delete.
 */
export const deleteCollectionAndRefresh = async (collectionId: string): Promise<void> => {
  await deleteCollection(collectionId);
  if (typeof window !== 'undefined' && window.dispatchEvent) {
    window.dispatchEvent(new Event('refreshCollections'));
  }
};

/**
 * Prepares an empty request object with default values.
 * @param {number} collectionId - The ID of the collection the request belongs to.
 * @returns {WebRsRequest} A new empty request object.
 */
export const prepareEmptyRequest = (collectionId: string): WebRsRequest => {
  return {
    id: `${collectionId}-${Date.now()}`,
    name: `Request from Collection ${collectionId}`,
    url: '',
    method: 'GET',
    headers: [],
    queryParams: [],
    body: '',
  };
};
