export const initSecurity = () => {
    // Check if the current hostname is a local environment
    const isLocal = window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname.startsWith('192.168.') ||
        window.location.hostname.startsWith('10.');

    if (!isLocal) {
        // 1. Override console logs to prevent sensitive data leaks in console tab
        console.log = () => {};
        console.info = () => {};
        console.debug = () => {};
        console.warn = () => {};

        // 2. Disable right-click context menu to prevent inspecting elements easily
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });

        // 3. Disable developer tools keyboard shortcuts (F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U)
        document.addEventListener('keydown', (e) => {
            // Disable F12
            if (e.key === 'F12') {
                e.preventDefault();
                return false;
            }

            // Disable Ctrl+Shift+I / Cmd+Opt+I (Inspect)
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'i') {
                e.preventDefault();
                return false;
            }

            // Disable Ctrl+Shift+J / Cmd+Opt+J (Console)
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'j') {
                e.preventDefault();
                return false;
            }

            // Disable Ctrl+Shift+C / Cmd+Opt+C (Inspect Element Selector)
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'c') {
                e.preventDefault();
                return false;
            }

            // Disable Ctrl+U / Cmd+Opt+U (View Source)
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'u') {
                e.preventDefault();
                return false;
            }

            // Disable Ctrl+S / Cmd+S (Save Page)
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
                e.preventDefault();
                return false;
            }
        });
    }
};
