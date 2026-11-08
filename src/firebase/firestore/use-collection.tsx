'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Query,
  onSnapshot,
  DocumentData,
  FirestoreError,
  QuerySnapshot,
  CollectionReference,
  getDocs,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/** Utility type to add an 'id' field to a given type T. */
export type WithId<T> = T & { id: string };

/**
 * Interface for the return value of the useCollection hook.
 * @template T Type of the document data.
 */
export interface UseCollectionResult<T> {
  data: WithId<T>[] | null; // Document data with ID, or null.
  isLoading: boolean;       // True if loading.
  error: FirestoreError | Error | null; // Error object, or null.
  refetch: () => void;
}

/* Internal implementation of Query:
  https://github.com/firebase/firebase-js-sdk/blob/c5f08a9bc5da0d2b0207802c972d53724ccef055/packages/firestore/src/lite-api/reference.ts#L143
*/
export interface InternalQuery extends Query<DocumentData> {
  _query: {
    path: {
      canonicalString(): string;
      toString(): string;
    }
  }
}

// In-memory cache for ultra-fast instant page transitions
export const globalCollectionCache = new Map<string, any[]>();

export function getQueryKey(target: any): string | null {
  if (!target) return null;
  try {
    if (target.type === 'collection' && target.path) return target.path;
    if (target._query?.path?.canonicalString) return target._query.path.canonicalString();
    if (target.path) return String(target.path);
  } catch {
    // fallback
  }
  return null;
}

function getStoredCollection(key: string | null): any[] | null {
  if (!key) return null;
  if (globalCollectionCache.has(key)) {
    return globalCollectionCache.get(key) || null;
  }
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('cns_col_' + key);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          globalCollectionCache.set(key, parsed);
          return parsed;
        }
      }
    } catch {
      // ignore JSON parse error
    }
  }
  return null;
}

export function saveStoredCollection(key: string | null, data: any[]) {
  if (!key) return;
  globalCollectionCache.set(key, data);
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('cns_col_' + key, JSON.stringify(data.slice(0, 50)));
    } catch {
      // quota or storage error
    }
  }
}

/**
 * React hook to subscribe to a Firestore collection or query in real-time.
 * Features in-memory stale-while-revalidate caching for zero-latency page transitions.
 */
export function useCollection<T = any>(
    memoizedTargetRefOrQuery: ((CollectionReference<DocumentData> | Query<DocumentData>) & {__memo?: boolean}) | null | undefined,
): UseCollectionResult<T> {
  type ResultItemType = WithId<T>;
  type StateDataType = ResultItemType[] | null;

  const cacheKey = getQueryKey(memoizedTargetRefOrQuery);
  const initialData = (getStoredCollection(cacheKey) as ResultItemType[]) || null;

  const [data, setData] = useState<StateDataType>(initialData);
  const [isLoading, setIsLoading] = useState<boolean>(!initialData && !!memoizedTargetRefOrQuery);
  const [error, setError] = useState<FirestoreError | Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!memoizedTargetRefOrQuery) {
        setData(null);
        setIsLoading(false);
        setError(null);
        return;
    }

    try {
        const snapshot = await getDocs(memoizedTargetRefOrQuery);
        const results: ResultItemType[] = [];
        for (const doc of snapshot.docs) {
            results.push({ ...(doc.data() as T), id: doc.id });
        }
        if (cacheKey) {
          saveStoredCollection(cacheKey, results);
        }
        setData(results);
        setError(null);
    } catch (e: any) {
        setError(e);
    } finally {
        setIsLoading(false);
    }
  }, [memoizedTargetRefOrQuery, cacheKey]);

  useEffect(() => {
    if (!memoizedTargetRefOrQuery) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    const key = getQueryKey(memoizedTargetRefOrQuery);
    const cached = (getStoredCollection(key) as ResultItemType[]) || null;

    if (cached && cached.length > 0) {
      setData(cached);
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }
    setError(null);

    let unsubscribe = () => {};
    try {
      unsubscribe = onSnapshot(
        memoizedTargetRefOrQuery,
        (snapshot: QuerySnapshot<DocumentData>) => {
          const results: ResultItemType[] = [];
          for (const doc of snapshot.docs) {
            results.push({ ...(doc.data() as T), id: doc.id });
          }
          if (key) {
            saveStoredCollection(key, results);
          }
          setData(results);
          setError(null);
          setIsLoading(false);
        },
        (err: FirestoreError) => {
          const path: string =
            memoizedTargetRefOrQuery.type === 'collection'
              ? (memoizedTargetRefOrQuery as CollectionReference).path
              : (memoizedTargetRefOrQuery as unknown as InternalQuery)._query.path.canonicalString();

          const contextualError = new FirestorePermissionError({
            operation: 'list',
            path,
          });

          // If we have cached/stored data, don't leave the user stuck on blank screen
          const localFallback = getStoredCollection(key) as ResultItemType[] | null;
          if (localFallback && localFallback.length > 0) {
            setData(localFallback);
          }

          setError(contextualError);
          setIsLoading(false);
          errorEmitter.emit('permission-error', contextualError);
        }
      );
    } catch (snapshotErr) {
      console.warn('Firestore onSnapshot subscription safely caught:', snapshotErr);
      const localFallback = getStoredCollection(key) as ResultItemType[] | null;
      if (localFallback && localFallback.length > 0) {
        setData(localFallback);
      }
      setIsLoading(false);
    }

    return () => {
      try {
        unsubscribe();
      } catch (unsubErr) {
        // Suppress Firestore SDK internal assertion failure on already-failed streams (ID: b815)
      }
    };
  }, [memoizedTargetRefOrQuery]);

  if (memoizedTargetRefOrQuery && !memoizedTargetRefOrQuery.__memo) {
    throw new Error(memoizedTargetRefOrQuery + ' was not properly memoized using useMemoFirebase');
  }

  return { data, isLoading, error, refetch: fetchData };
}
