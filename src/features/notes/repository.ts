/**
 * Notes Repository 入口
 *
 * 浏览器端：Dexie IndexedDB（ensureNotesRepository 后可用）
 * SSR / 测试：createLocalNotesRepository()
 */

import { createDexieNotesRepository } from "./dexieRepository";
import { createLocalNotesRepository } from "./localRepository";
import type { NotesRepository } from "./types";

export { createLocalNotesRepository } from "./localRepository";
export { createDexieNotesRepository, clearLegacyLocalStorage } from "./dexieRepository";

let _repo: NotesRepository | null = null;
let _initPromise: Promise<NotesRepository> | null = null;

/** 应用启动时调用，hydrate Dexie 并完成 localStorage 迁移 */
export function ensureNotesRepository(): Promise<NotesRepository> {
  if (typeof window === "undefined") {
    return Promise.resolve(createLocalNotesRepository());
  }
  if (_repo) return Promise.resolve(_repo);
  if (!_initPromise) {
    _initPromise = createDexieNotesRepository().then((repo) => {
      _repo = repo;
      return repo;
    });
  }
  return _initPromise;
}

/** 同步获取；Dexie 未 hydrate 前回退 localStorage */
export function getNotesRepository(): NotesRepository {
  if (_repo) return _repo;
  return createLocalNotesRepository();
}

/** 测试用：重置 singleton */
export function resetNotesRepository(): void {
  _repo = null;
  _initPromise = null;
}
