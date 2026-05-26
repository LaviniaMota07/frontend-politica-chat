import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';

interface UseScrollingOptions {
    threshold?: number;
}

export function useScrolling<T extends HTMLElement>(
    elementRef: RefObject<T | null>,
    onScrollEnd: () => Promise<void>,
    options: UseScrollingOptions = {}
) {
    const { threshold = 50 } = options;
    const isLoading = useRef(false);

    useEffect(() => {
        const element = elementRef.current;
        if (!element) return;

        const handleScroll = async () => {
            if (isLoading.current) return;

            const { scrollTop, scrollHeight, clientHeight } = element;
            const distanceToBottom = scrollHeight - (scrollTop + clientHeight);

            if (distanceToBottom <= threshold) {
                isLoading.current = true;
                try {
                    await onScrollEnd();
                } finally {
                    isLoading.current = false;
                }
            }
        };

        element.addEventListener('scroll', handleScroll);

        return () => {
            element.removeEventListener('scroll', handleScroll);
        };
    }, [elementRef, onScrollEnd, threshold]);
}
