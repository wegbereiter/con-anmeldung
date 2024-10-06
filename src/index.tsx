import React from 'react';
import { createRoot } from 'react-dom/client';
import { setLocale } from 'yup';
import { de } from 'yup-locales';
import App from './App';

setLocale({
    ...de,
    mixed: {
        ...de.mixed,
        notType: ({ path }) => `${path} muss ein gültiges Datum sein (tt.mm.yyyy)`,
    },
});

const rootElement = document.getElementById('root');

if (!rootElement) {
    throw new Error('Could not find node to render app into');
}

const root = createRoot(rootElement);

root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
);
