import { useCallback, useEffect, useRef, useState } from 'react';
export type SceneView = 'room' | 'board' | 'phone' | 'casefile' | 'notebook' | 'map' | 'recorder' | 'report' | 'cctv' | 'locker28' | 'v17';
type Anchor = { xPct: number; yPct: number } | null;
type Entry = { view: SceneView; anchor: Anchor };
const floor: Entry[] = [{ view: 'room', anchor: null }];
export function useCameraController() {
  const [entries, setEntries] = useState<Entry[]>(floor);
  const ref = useRef(entries);
  const [isAnimating, setAnimating] = useState(false);
  const pending = useRef(false);
  const commit = useCallback((next: Entry[]) => {
    ref.current = next; setEntries(next); setAnimating(true); pending.current = false;
  }, []);
  useEffect(() => {
    window.history.replaceState({ ...window.history.state, investigation: floor }, '');
    const back = (event: PopStateEvent) => commit(event.state?.investigation ?? floor);
    const escape = (event: KeyboardEvent) => { if(event.key === 'Escape' && ref.current.length > 1) window.history.back(); };
    window.addEventListener('popstate', back);
    window.addEventListener('keydown', escape);
    return () => { window.removeEventListener('popstate', back); window.removeEventListener('keydown', escape); };
  }, [commit]);
  const pushView = useCallback((view: SceneView, anchor?: NonNullable<Anchor>) => {
    if (pending.current || ref.current.at(-1)?.view === view) return;
    const next = [...ref.current, {view, anchor: anchor ?? ref.current.at(-1)?.anchor ?? null}];
    window.history.pushState({ investigation: next }, ''); commit(next);
  }, [commit]);
  const popView = useCallback(() => {
    if (pending.current || ref.current.length <= 1) return;
    pending.current = true; window.history.back();
  }, []);
  useEffect(() => { if (!isAnimating) return; const id = setTimeout(() => setAnimating(false), 460); return () => clearTimeout(id); }, [isAnimating, entries]);
  const current = entries.at(-1)!.view;
  return { current, stack: entries.map(e => e.view), anchor: entries.at(-1)!.anchor, isAnimating, isRoom: current === 'room', isActive: (view: SceneView) => current === view, pushView, popView };
}
export type CameraController = ReturnType<typeof useCameraController>;
