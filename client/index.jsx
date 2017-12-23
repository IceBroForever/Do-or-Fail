import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import App from './src/App'
import auth from './src/auth'

import './styles/main.scss'

function render() {
    ReactDOM.render(
        <MuiThemeProvider>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </MuiThemeProvider>,
        document.getElementById('root')
    );
}

auth.verifyAuthorization()
    .then(() => render());