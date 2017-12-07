import React from 'react';
import ReactDOM from 'react-dom';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import App from './src/App'
import ConfigWraper from './src/ConfigWraper'

import './styles/main.scss'

ReactDOM.render(
    <MuiThemeProvider>
        <ConfigWraper>
            <App />
        </ConfigWraper>
    </MuiThemeProvider>,
    document.getElementById('root')
)