import { defer, Observable, of } from 'rxjs';

import {
  ReactiveIDBDatabase,
  ReactiveIDBTransformer,
} from './reactive-idb-database';
import { ReactiveIDBObjectStore } from './reactive-idb-object-store';

export class ReactiveIDBTransaction {
  /**
   * If the transaction was aborted, returns the error (a DOMException) providing the reason.
   */
  get error(): DOMException | null {
    return this.transaction.error;
  }

  /**
   * Returns the mode the transaction was created with ("readonly" or "readwrite"), or "versionchange" for an upgrade transaction.
   */
  get mode(): IDBTransactionMode {
    return this.transaction.mode;
  }

  /**
   * Returns a list of the names of object stores in the transaction's scope. For an upgrade transaction this is all object stores in the database.
   */
  get objectStoreNames(): DOMStringList {
    return this.transaction.objectStoreNames;
  }

  /**
   * Constructs a ReactiveIDBTransaction
   *
   * @param transaction The underlying IDBTransaction object
   * @param db The associated ReactiveIDBDatabase of this transaction
   */
  constructor(
    private readonly transaction: IDBTransaction,
    readonly db: ReactiveIDBDatabase
  ) {}

  /**
   * Aborts the transaction. All pending requests will fail with a "AbortError" DOMException and all changes made to the database will be reverted.
   */
  abort(): void {
    this.transaction.abort();
  }

  /**
   * Returns a ReactiveIDBObjectStore in the transaction's scope.
   */
  objectStore<T = unknown>(
    name: string,
    transformer: ReactiveIDBTransformer<T> = {
      serialize: (o) => o,
      deserialize: (v) => v as T,
    }
  ): ReactiveIDBObjectStore<T> {
    return new ReactiveIDBObjectStore(
      this.transaction.objectStore(name),
      this,
      transformer
    );
  }

  /**
   * Returns a ReactiveIDBObjectStore in the transaction's scope.
   */
  objectStore$<T = unknown>(
    name: string,
    transformer: ReactiveIDBTransformer<T> = {
      serialize: (o) => o,
      deserialize: (v) => v as T,
    }
  ): Observable<ReactiveIDBObjectStore<T>> {
    return defer(() => of(this.objectStore<T>(name, transformer)));
  }

  addEventListener<K extends keyof IDBTransactionEventMap>(
    type: K,
    listener: (this: IDBTransaction, ev: IDBTransactionEventMap[K]) => void,
    options?: boolean | AddEventListenerOptions
  ): void {
    this.transaction.addEventListener(type, listener, options);
  }

  removeEventListener<K extends keyof IDBTransactionEventMap>(
    type: K,
    listener: (this: IDBTransaction, ev: IDBTransactionEventMap[K]) => void,
    options?: boolean | EventListenerOptions
  ): void {
    this.transaction.removeEventListener(type, listener, options);
  }
}
