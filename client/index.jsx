import React from 'react';
import ReactDOM from 'react-dom';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import App from './src/App'
import AuthWrapper from './src/AuthWrapper'

import './styles/main.scss'

ReactDOM.render(
    <MuiThemeProvider>
        <AuthWrapper>
            <App />
        </AuthWrapper>
    </MuiThemeProvider>,
    document.getElementById('root')
)