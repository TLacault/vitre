# Vitre privacy policy

_Last updated: 14 November 2026_

Vitre replaces your browser's new tab page. It collects nothing, has no account, no analytics and no server.

**Stored on your device only.** Your settings live in the browser's extension storage, and the pictures you add live in the browser's IndexedDB. Neither leaves your device, and both are removed when you uninstall Vitre. "Export" writes your settings to a file only when you click it.

**Network requests.** Vitre makes one kind of request to a third party: when a favourite tab is set to show its site's icon, the browser loads that icon from Google's favicon service (`www.google.com/s2/favicons`), which receives the site's domain name. Choosing a brand icon, a Lucide icon or a letter for the tab avoids that request. Searching from the search bar sends your query to the search engine you picked, as any search box does. Nothing else is fetched from the network; the brand and icon libraries ship inside the extension.

**Permissions.** `storage` and `unlimitedStorage` keep your settings and your picture gallery on your device.

Questions: open an issue at https://github.com/TLacault/vitre/issues.
