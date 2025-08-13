    // src/hooks/useIntersectionObserver.js
    import { useEffect, useRef } from 'react';

    const useIntersectionObserver = (options) => {
    const containerRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target); // Stop observing once it's visible
            }
        });
        }, options);

        const currentRef = containerRef.current;
        if (currentRef) {
        // Observe all direct children of the container
        const elements = Array.from(currentRef.children);
        elements.forEach(el => observer.observe(el));
        }

        return () => {
        if (currentRef) {
            const elements = Array.from(currentRef.children);
            elements.forEach(el => observer.unobserve(el));
        }
        };
    }, [options]);

    return containerRef;
    };

    export default useIntersectionObserver;