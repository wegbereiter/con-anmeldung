import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { registerGermanYupLocale, mixed } from '@stephen-r/yup-i18n-de/dist';

mixed.notType = ({ path }) => `${path} muss ein gültiges Datum sein (tt.mm.yyyy)`;
registerGermanYupLocale();

ReactDOM.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
    document.getElementById('root'),
);
