'use client';
    
import {
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  CollectionReference,
  DocumentReference,
  SetOptions,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { saveStoredCollection, globalCollectionCache } from '@/firebase/firestore/use-collection';
import { saveStoredDoc, globalDocCache } from '@/firebase/firestore/use-doc';

/**
 * Initiates a setDoc operation for a document reference.
 * Updates local cache immediately so data is never lost, then syncs to Firestore.
 */
export function setDocumentNonBlocking(docRef: DocumentReference, data: any, options?: SetOptions) {
  // Optimistic local persistence
  const existing = globalDocCache.get(docRef.path) || {};
  const merged = options && 'merge' in options && options.merge ? { ...existing, ...data } : data;
  saveStoredDoc(docRef.path, merged);

  const promise = (options ? setDoc(docRef, data, options) : setDoc(docRef, data))
    .catch((error: unknown) => {
      console.warn('Firestore setDocument error at', docRef.path, error);
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: docRef.path,
          operation: 'write',
          requestResourceData: data,
        })
      );
    });

  return promise;
}

/**
 * Initiates an addDoc operation for a collection reference.
 * Generates an ID, saves to local cache immediately so records are never lost,
 * then persists directly to Firestore.
 */
export function addDocumentNonBlocking(colRef: CollectionReference, data: any) {
  // Generate deterministic doc reference
  const newDocRef = doc(colRef);
  const itemWithId = {
    ...data,
    id: newDocRef.id,
    completedAt: data.completedAt || { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 },
    createdAt: data.createdAt || { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 },
  };

  // Optimistically store in memory and localStorage so dashboard and history update instantly
  const path = colRef.path;
  const existing = (globalCollectionCache.get(path) as any[]) || [];
  const updated = [itemWithId, ...existing.filter((item) => item.id !== newDocRef.id)];
  saveStoredCollection(path, updated);

  const promise = setDoc(newDocRef, data)
    .catch((error: unknown) => {
      console.warn('Firestore addDocument error at', colRef.path, error);
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: colRef.path,
          operation: 'create',
          requestResourceData: data,
        })
      );
    });

  return promise;
}

/**
 * Initiates an updateDoc operation for a document reference.
 */
export function updateDocumentNonBlocking(docRef: DocumentReference, data: any) {
  const existing = globalDocCache.get(docRef.path) || {};
  saveStoredDoc(docRef.path, { ...existing, ...data });

  const promise = updateDoc(docRef, data)
    .catch((error: unknown) => {
      console.warn('Firestore updateDoc error at', docRef.path, error);
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: data,
        })
      );
    });

  return promise;
}

/**
 * Initiates a deleteDoc operation for a document reference.
 */
export function deleteDocumentNonBlocking(docRef: DocumentReference) {
  const promise = deleteDoc(docRef)
    .catch((error: unknown) => {
      console.warn('Firestore deleteDoc error at', docRef.path, error);
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: docRef.path,
          operation: 'delete',
        })
      );
    });

  return promise;
}
