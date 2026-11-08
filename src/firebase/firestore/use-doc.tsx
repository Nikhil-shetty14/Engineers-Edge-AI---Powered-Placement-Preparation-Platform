'use client';
    
import { useState, useEffect } from 'react';
import {
  DocumentReference,
  onSnapshot,
  DocumentData,
  FirestoreError,
  DocumentSnapshot,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/** Utility type to add an 'id' field to a given type T. */
import type { WithId } from './use-collection';

/**
 * Interface for the return value of the useDoc hook.
 * @template T Type of the document data.
 */
export interface UseDocResult<T> {
  data: WithId<T> | null; // Document data with ID, or null.
  isLoading: boolean;       // True if loading.
  error: FirestoreError | Error | null; // Error object, or null.
}

// In-memory cache for single documents
export const globalDocCache = new Map<string, any>();

function getStoredDoc(path: string | null): any | null {
  if (!path) return null;
  if (globalDocCache.has(path)) {
    return globalDocCache.get(path) || null;
  }
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('cns_doc_' + path);
      if (stored) {
        const parsed = JSON.parse(stored);
        globalDocCache.set(path, parsed);
        return parsed;
      }
    } catch {
      // ignore
    }
  }
  return null;
}

export function saveStoredDoc(path: string | null, data: any) {
  if (!path) return;
  globalDocCache.set(path, data);
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('cns_doc_' + path, JSON.stringify(data));
    } catch {
      // ignore
    }
  }
}

/**
 * React hook to subscribe to a single Firestore document in real-time.
 * Features in-memory stale-while-revalidate caching for instant rendering.
 */
export function useDoc<T = any>(
  memoizedDocRef: DocumentReference<DocumentData> | null | undefined,
): UseDocResult<T> {
  type StateDataType = WithId<T> | null;

  const docPath = memoizedDocRef?.path || null;
  const initialData = (getStoredDoc(docPath) as StateDataType) || null;

  const [data, setData] = useState<StateDataType>(initialData);
  const [isLoading, setIsLoading] = useState<boolean>(!initialData && !!memoizedDocRef);
  const [error, setError] = useState<FirestoreError | Error | null>(null);

  useEffect(() => {
    if (!memoizedDocRef) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    const path = memoizedDocRef.path;
    const cached = (getStoredDoc(path) as StateDataType) || null;

    if (cached) {
      setData(cached);
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }
    setError(null);

    let unsubscribe = () => {};
    try {
      unsubscribe = onSnapshot(
        memoizedDocRef,
        (snapshot: DocumentSnapshot<DocumentData>) => {
          if (snapshot.exists()) {
            const result = { ...(snapshot.data() as T), id: snapshot.id };
            if (path) saveStoredDoc(path, result);
            setData(result);
          } else {
            setData(null);
          }
          setError(null);
          setIsLoading(false);
        },
        (err: FirestoreError) => {
          const contextualError = new FirestorePermissionError({
            operation: 'get',
            path: memoizedDocRef.path,
          });

          // Use cached fallback if available
          const fallback = getStoredDoc(path) as StateDataType | null;
          if (fallback) {
            setData(fallback);
          }

          setError(contextualError);
          setIsLoading(false);
          errorEmitter.emit('permission-error', contextualError);
        }
      );
    } catch (snapshotErr) {
      console.warn('Firestore onSnapshot doc safely caught:', snapshotErr);
      const fallback = getStoredDoc(path) as StateDataType | null;
      if (fallback) {
        setData(fallback);
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
  }, [memoizedDocRef]);

  return { data, isLoading, error };
}
