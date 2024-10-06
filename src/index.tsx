import { registerGermanYupLocale, mixed } from '@stephen-r/yup-i18n-de';
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

mixed.notType = ({ path }) => `${path} muss ein gültiges Datum sein (tt.mm.yyyy)`;
registerGermanYupLocale();

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
