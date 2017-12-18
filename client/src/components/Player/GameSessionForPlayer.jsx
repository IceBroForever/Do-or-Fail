import React from 'react'
import auth from '../../auth'
import VideoStreamer from './VideoStreamer'

import '../../../styles/GameSession.scss'

export default class GameSessionForPlayer extends React.Component {

    constructor(props) {
        super(props);

        this.createSocket = this.createSocket.bind(this);
        this.handleMessage = this.handleMessage.bind(this);
        this.streamReady = this.streamReady.bind(this);
        this.handleWatcherConnection = this.handleWatcherConnection.bind(this);

        this.state = {

        };

        this.socket = this.createSocket();
        this.pcs = {};
        this.stream = null;
    }

    createSocket() {
        let url = 'ws://' + window.location.host +
            '/gamesession/' + auth.getLogin() +
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

    streamReady(stream) {
        this.stream = stream;
    }

    handleMessage(data) {
        switch (data.type) {
            case 'ok': {
                console.log('Session created');
            } break;
            case 'watcher-connected': {
                this.handleWatcherConnection(data.login);
            } break;
            case 'answer': {
                this.handleAnswer(data.login, data.description);
            } break;
        }
    }

    async handleWatcherConnection(login) {console.log('here');
        this.pcs[login] = new RTCPeerConnection();

        let iceCandidates = [];
        this.pcs[login].onicecandidate = (event) => {
            if(event.candidate) iceCandidates.push(event.candidate);
            else  this.socket.send(JSON.stringify({
                type: 'offer',
                login,
                description,
                iceCandidates
            }));
        }

        this.pcs[login].addStream(this.stream);
        let description = await this.pcs[login].createOffer();
        await this.pcs[login].setLocalDescription(description);
    }

    async handleAnswer(login, description) {
        await this.pcs[login].setRemoteDescription(description);
    }

    render() {
        return (
            <div className='GameSession'>
                <div className='Video'>
                    <VideoStreamer
                        streamGenerated={this.streamReady}
                    />
                </div>
                <div className='Chat'>
                    chat
                </div>
            </div>
        );
    }

}