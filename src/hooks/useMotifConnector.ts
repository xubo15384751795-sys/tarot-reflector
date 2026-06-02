"use client";

import {
  useLayoutEffect,
  useSyncExternalStore,
  useRef,
  type RefObject,
} from "react";
import {
  buildMotifConnectorPath,
  measureMotifConnectorPoints,
} from "@/lib/motifConnectorPath";

type ConnectorSnapshot = {
  key: string;
  path: string | null;
};

const EMPTY_SNAPSHOT: ConnectorSnapshot = { key: "", path: null };

/**
 * Phase 2：仅对当前 visible motif 测量 DOM，生成一条 SVG path。
 * 桌面档案三栏布局使用；移动端不渲染 SVG 层即可。
 */
export function useMotifConnector(
  layoutRef: RefObject<HTMLElement | null>,
  visibleId: string | null,
  side: "left" | "right" | null,
  enabled: boolean,
): string | null {
  const cacheKey = `${enabled ? 1 : 0}:${visibleId ?? ""}:${side ?? ""}`;
  const storeRef = useRef<{
    snapshot: ConnectorSnapshot;
    listeners: Set<() => void>;
  }>({
    snapshot: EMPTY_SNAPSHOT,
    listeners: new Set(),
  });

  const subscribe = (onStoreChange: () => void) => {
    storeRef.current.listeners.add(onStoreChange);
    return () => {
      storeRef.current.listeners.delete(onStoreChange);
    };
  };

  const getSnapshot = () => storeRef.current.snapshot;

  useLayoutEffect(() => {
    const store = storeRef.current;

    const publish = (path: string | null) => {
      const next = { key: cacheKey, path };
      if (
        store.snapshot.key === next.key &&
        store.snapshot.path === next.path
      ) {
        return;
      }
      store.snapshot = next;
      store.listeners.forEach((listener) => listener());
    };

    if (!enabled || !visibleId || !side) {
      publish(null);
      return;
    }

    const root = layoutRef.current;
    if (!root) {
      publish(null);
      return;
    }

    const update = () => {
      const points = measureMotifConnectorPoints(root, visibleId, side);
      publish(points ? buildMotifConnectorPath(points, side) : null);
    };

    update();

    const ro = new ResizeObserver(update);
    ro.observe(root);
    const anchorEl = root.querySelector(`[data-motif-anchor="${visibleId}"]`);
    const noteEl = root.querySelector(`[data-motif-note="${visibleId}"]`);
    if (anchorEl) ro.observe(anchorEl);
    if (noteEl) ro.observe(noteEl);

    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [layoutRef, visibleId, side, enabled, cacheKey]);

  const snapshot = useSyncExternalStore(subscribe, getSnapshot, () => EMPTY_SNAPSHOT);
  return snapshot.key === cacheKey ? snapshot.path : null;
}
