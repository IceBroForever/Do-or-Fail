import React from 'react'
import auth from '../auth'
import VideoStreamer from './VideoStreamer'

import '../../styles/GameSession.scss'

export default class GameSessionForPlayer extends React.Component {

    constructor(props) {
        super(props);

        this.createSocket = this.createSocket.bind(this);
        this.handleMessage = this.handleMessage.bind(this);
        this.streamReady = this.streamReady.bind(this);
        this.sendIceCandidate = this.sendIceCandidate.bind(this);

        this.state = {

        };

        this.socket = this.createSocket();
        this.pc = null;
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

    async streamReady(stream) {
        this.pc = new RTCPeerConnection();

        this.pc.onicecandidate = (event) => {
            this.sendIceCandidate(event.candidate);
        }

        this.pc.addStream(stream);

        let description = await this.pc.createOffer();
        await this.pc.setLocalDescription(description);

        this.socket.send(JSON.stringify({
            type: 'description',
            description
        }));
    }

    sendIceCandidate(iceCandidate) {
        this.socket.send(JSON.stringify({
            type: 'ice-candidate',
            iceCandidate
        }));
    }

    handleMessage(data) {
        switch (data.type) {
            case 'ok': {
                console.log('Session created');
            } break;
        }
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