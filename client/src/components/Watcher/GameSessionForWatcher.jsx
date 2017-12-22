import React from 'react'
import auth from '../../auth'
import Dialog from 'material-ui/Dialog'
import VideoReceiver from './VideoReceiver'
import FlatButton from 'material-ui/FlatButton'
import Chat from '../Chat'

import '../../../styles/Dialog.scss'
import '../../../styles/GameSession.scss'

export default class GameSessionForWatcher extends React.Component {

    constructor(props) {
        super(props);

        this.createSocket = this.createSocket.bind(this);
        this.destroyConnections = this.destroyConnections.bind(this);
        this.handleMessage = this.handleMessage.bind(this);
        this.handleStreamStaff = this.handleStreamStaff.bind(this);
        this.sendMessage = this.sendMessage.bind(this);

        this.state = {
            stream: null,
            show: false
        };

        this.socket = null;
        this.pc = null;
    }

    componentWillReceiveProps(newProps) {

        if (newProps.show) {
            if (!this.socket) this.socket = this.createSocket(newProps.player);
        }

        this.setState({
            stream: newProps.show ? this.state.stream : null,
            show: newProps.show
        });
    }

    componentWillUnmount() {
        this.destroyConnections();
    }

    createSocket(player) {
        let url = 'ws://' + window.location.host +
            '/gamesession/' + player +
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

        socket.onclose = async (event) => {
            let byPlayer = event.reason == 'player disconnected';
            if (byPlayer) await this.destroyConnections();
            this.props.onClose(byPlayer);
        }

        return socket;
    }

    async destroyConnections() {
        if (this.socket) {
            if (this.socket.readyState == 1)
                await this.socket.close(1000, 'watcher disconnected');
            this.socket = null;
        }

        if (this.pc) {
            this.pc.close();
            this.pc = null;
        }
    }

    handleMessage(data) {
        switch (data.type) {
            case 'offer': {
                this.handleStreamStaff(data.description, data.iceCandidates);
            } break;
            case 'message': {
                this.chat.newMessage('message', data);
            } break;
            case 'watcher-connected': {
                this.chat.newMessage('info', `${data.login} connected to session`);
            } break;
            case 'watcher-disconnected': {
                this.chat.newMessage('info', `${data.login} disconnected from session`);
            } break;
        }
    }

    sendMessage(message) {
        this.socket.send(JSON.stringify({
            type: 'message',
            login: auth.getLogin(),
            message
        }));
    }

    async handleStreamStaff(description, iceCandidates) {
        this.pc = new RTCPeerConnection();

        this.pc.onaddstream = async (event) => {
            this.setState({
                stream: event.stream
            });
        }

        await this.pc.setRemoteDescription(new RTCSessionDescription(description));

        for (let candidate of iceCandidates) {
            if (candidate) this.pc.addIceCandidate(new RTCIceCandidate(candidate));
        }

        let answer = await this.pc.createAnswer();
        await this.pc.setLocalDescription(answer);

        this.socket.send(JSON.stringify({
            type: 'answer',
            description: answer
        }));
    }

    render() {
        return (
            <Dialog
                open={this.state.show}
                contentClassName='Dialog'
                bodyClassName='Container'
                actions={[
                    <FlatButton
                        label='Disconnect'
                        onClick={this.destroyConnections}
                    />
                ]}
            >
                <div className='GameSession'>
                    <div className='Video'>
                        <VideoReceiver
                            stream={this.state.stream}
                        />
                    </div>
                    <Chat
                        ref={instance => { this.chat = instance }}
                        sendMessage={this.sendMessage}
                    />
                </div>
            </Dialog>
        );
    }

}