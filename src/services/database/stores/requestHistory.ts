import type { RequestHistory } from '../../../types/request.types';
import { STORE_NAMES } from '../types';
import { getDB } from '../index';

export const addRequestHistory = async (history: RequestHistory): Promise<void> => {
  const db = await getDB();
  await db.add(STORE_NAMES.REQUEST_HISTORY, history);
};

export const removeRequestHistory = async (historyId: string): Promise<void> => {
  const db = await getDB();
  await db.delete(STORE_NAMES.REQUEST_HISTORY, historyId);
};

export const getAllRequestHistory = async (): Promise<RequestHistory[]> => {
  const db = await getDB();
  return await db.getAll(STORE_NAMES.REQUEST_HISTORY);
};

export const getRequestHistoryById = async (historyId: string): Promise<RequestHistory | undefined> => {
  const db = await getDB();
  return await db.get(STORE_NAMES.REQUEST_HISTORY, historyId);
};