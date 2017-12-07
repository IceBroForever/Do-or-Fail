import React from 'react'
import auth from './auth'
import CircularProgress from 'material-ui/CircularProgress';

export default class AuthWrapper extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <CircularProgress
                thickness={6}
                size={60}
            />
        );
    }

}