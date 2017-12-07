import React from 'react'
import auth from './auth'
import CircularProgress from 'material-ui/CircularProgress';

import '../styles/ConfigWraper.scss'

export default class ConfigWraper extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            checked: false,
            error: false
        }
    }

    async componentDidMount() {
        if (!localStorage || !WebSocket || !RTCPeerConnection) {
            this.setState({
                error: true
            })
        }
        else {
            try {
                await auth.verifyAuthorization();
            } catch (error) { }

            this.setState({
                checked: true
            })
        }
    }

    render() {

        if (this.state.error) {
            return (
                <div className='ConfigWraper'>
                    <h1 className='message'>Sorry, but your browser do not support this game</h1>
                </div>
            );
        }

        if (!this.state.checked) return (
            <div className='ConfigWraper'>
                <CircularProgress
                    thickness={6}
                    size={80}
                />
                <h1 className='message'>Please wait...</h1>
            </div>
        );

        return (
            this.props.children
        );
    }

}