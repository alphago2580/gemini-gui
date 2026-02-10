import { useEffect, useRef } from 'react';

/**
 * Hook that sets the document title and restores the previous title on unmount.
 */
export function useDocumentTitle(title: string, restoreOnUnmount = true): void {
  const previousTitle = useRef(document.title);

  useEffect(() => {
    document.title = title;
  }, [title]);

  useEffect(() => {
    const saved = previousTitle.current;
    return () => {
      if (restoreOnUnmount) {
        document.title = saved;
      }
    };
  }, [restoreOnUnmount]);
}
