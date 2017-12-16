import React from 'react'
import auth from '../auth'
import VideoReceiver from './VideoReceiver'

import '../../styles/Dialog.scss'
import '../../styles/GameSession.scss'

export default class GameSessionForWatcher extends React.Component {

    constructor(props) {
        super(props);

        this.createSocket = this.createSocket.bind(this);
        this.handleMessage = this.handleMessage.bind(this);
        this.handleStreamStaff = this.handleStreamStaff.bind(this);

        this.state = {
            stream: null
        };

        this.socket = this.createSocket();
        this.pc = null;
    }

    createSocket() {
        let url = 'ws://' + window.location.host +
            '/gamesession/' + this.props.player +
            '?login=' + auth.getLogin() +
            '&role=' + auth.getRole() +
            '&token=' + auth.getToken();

        let socket = new WebSocket(url);

        socket.onmessage = (message) => {
            this.handleMessage(JSON.parse(message.data));
        }

        socket.onerror = (error) => {
            console.log(error);
        }

        return socket;
    }

    handleMessage(data) {
        switch (data.type) {
            case 'stream-staff': {
                this.handleStreamStaff(data.description, data.iceCandidates);
            } break;
        }
    }

    async handleStreamStaff(description, iceCandidates){
        this.pc = new RTCPeerConnection();

        this.pc.onaddstream = (stream) => {
            this.setState({
                stream
            });
        }

        await this.pc.setRemoteDescription(description);

        for(let candidate of iceCandidates) {
            this.pc.addIceCandidate(candidate);
        }
    }

    render() {
        return (
            <Dialog
                open={this.props.open}
                contentClassName='Dialog'
                bodyClassName='Container'
                actions={[
                    <FlatButton
                        label='Disconnect'
                        onClick={this.props.onDisconnect}
                    />
                ]}
            >
                <div className='GameSession'>
                    <div className='Video'>
                        <VideoReceiver
                            stream={this.state.stream}
                        />
                    </div>
                    <div className='Chat'>
                        chat
                </div>
                </div>
            </Dialog>
        );
    }

}