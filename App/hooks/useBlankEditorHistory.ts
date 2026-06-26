import { useCallback, useRef, useState } from 'react';
import type { BlankLayer } from '@/components/create/BlankPhotoEditorCanvas';
import {
  DEFAULT_PHOTO_BACKGROUND,
  type PhotoBackgroundKey
} from '@/constants/photoEditorBackgrounds';

export type BlankEditorSnapshot = {
  layers: BlankLayer[];
  backgroundKey: PhotoBackgroundKey;
};

function cloneLayers(layers: BlankLayer[]): BlankLayer[] {
  return layers.map((layer) => ({ ...layer }));
}

function cloneSnapshot(snapshot: BlankEditorSnapshot): BlankEditorSnapshot {
  return {
    layers: cloneLayers(snapshot.layers),
    backgroundKey: snapshot.backgroundKey
  };
}

export function useBlankEditorHistory(
  initial: BlankEditorSnapshot = {
    layers: [],
    backgroundKey: DEFAULT_PHOTO_BACKGROUND
  }
) {
  const historyRef = useRef<BlankEditorSnapshot[]>([cloneSnapshot(initial)]);
  const indexRef = useRef(0);
  const [layers, setLayersState] = useState<BlankLayer[]>(cloneLayers(initial.layers));
  const [backgroundKey, setBackgroundKeyState] = useState<PhotoBackgroundKey>(initial.backgroundKey);
  const [revision, setRevision] = useState(0);

  const stateRef = useRef<BlankEditorSnapshot>({ layers, backgroundKey });
  stateRef.current = { layers, backgroundKey };

  const applySnapshot = useCallback((snapshot: BlankEditorSnapshot) => {
    const cloned = cloneSnapshot(snapshot);
    setLayersState(cloned.layers);
    setBackgroundKeyState(cloned.backgroundKey);
    setRevision((value) => value + 1);
  }, []);

  const commitState = useCallback(
    (next: BlankEditorSnapshot) => {
      const trimmed = historyRef.current.slice(0, indexRef.current + 1);
      const snapshot = cloneSnapshot(next);
      trimmed.push(snapshot);
      historyRef.current = trimmed;
      indexRef.current = trimmed.length - 1;
      applySnapshot(snapshot);
    },
    [applySnapshot]
  );

  const commitLayers = useCallback(
    (nextLayers: BlankLayer[]) => {
      commitState({ ...stateRef.current, layers: nextLayers });
    },
    [commitState]
  );

  const setLayersTransient = useCallback((nextLayers: BlankLayer[]) => {
    setLayersState(cloneLayers(nextLayers));
  }, []);

  const setBackgroundKey = useCallback(
    (nextBackgroundKey: PhotoBackgroundKey) => {
      commitState({ ...stateRef.current, backgroundKey: nextBackgroundKey });
    },
    [commitState]
  );

  const undo = useCallback(() => {
    if (indexRef.current <= 0) return;
    indexRef.current -= 1;
    applySnapshot(historyRef.current[indexRef.current]);
  }, [applySnapshot]);

  const redo = useCallback(() => {
    if (indexRef.current >= historyRef.current.length - 1) return;
    indexRef.current += 1;
    applySnapshot(historyRef.current[indexRef.current]);
  }, [applySnapshot]);

  const canUndo = revision >= 0 && indexRef.current > 0;
  const canRedo = revision >= 0 && indexRef.current < historyRef.current.length - 1;

  return {
    layers,
    backgroundKey,
    commitLayers,
    setLayersTransient,
    setBackgroundKey,
    undo,
    redo,
    canUndo,
    canRedo
  };
}
