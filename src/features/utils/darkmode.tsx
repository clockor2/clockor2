import { useState, useEffect } from 'react';

export const useDarkMode = () => {
    // Initial check in localStorage
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const storedValue = localStorage.getItem('darkMode');
        return storedValue !== null ? JSON.parse(storedValue) : false;
    });

    useEffect(() => {
        const handleClassChange = () => {
            const isDark = document.documentElement.classList.contains('dark');
            setIsDarkMode(isDark);
            // Save preference in localStorage
            localStorage.setItem('darkMode', JSON.stringify(isDark));
        };

        // Event listener for class changes
        const observer = new MutationObserver(mutations => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    handleClassChange();
                }
            });
        });

        // Start observing the html element for attribute changes
        observer.observe(document.documentElement, {
            attributes: true
        });

        // Set the initial mode based on localStorage
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        // Cleanup
        return () => {
            observer.disconnect();
        };
    }, [isDarkMode]);

    return isDarkMode;
};