import { useState, useEffect, useRef, useCallback } from 'react';

export default function useStateWithPromise<T>(initialState: T): [T, (stateAction: T) => Promise<void>] {
  const [state, setState] = useState<T>(initialState);
  const resolverRef = useRef<(value?: unknown) => void>(null) as any;

  useEffect(() => {
    if (resolverRef.current) {
      resolverRef.current(state);
      resolverRef.current = null;
    }
  }, [state]);

  const setStateWithPromise = useCallback((stateAction: T) => {
    setState(stateAction);
    return new Promise<void>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  return [state, setStateWithPromise];
}
