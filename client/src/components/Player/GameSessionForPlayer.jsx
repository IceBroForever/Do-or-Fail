import React from 'react'
import auth from '../../auth'
import VideoStreamer from './VideoStreamer'
import Chat from '../Chat'
import TaskManager from '../TaskManager'

import '../../../styles/GameSession.scss'

export default class GameSessionForPlayer extends React.Component {

    constructor(props) {
        super(props);

        this.createSocket = this.createSocket.bind(this);
        this.handleMessage = this.handleMessage.bind(this);
        this.streamReady = this.streamReady.bind(this);
        this.handleWatcherConnection = this.handleWatcherConnection.bind(this);
        this.sendMessage = this.sendMessage.bind(this);
        this.onConfirmingTask = this.onConfirmingTask.bind(this);
        this.onRejectingTask = this.onRejectingTask.bind(this);

        this.state = {
            status: 'WAITING_FOR_TASK',
            creator: '',
            mission: ''
        };

        this.socket = this.createSocket();
        this.pcs = {};
        this.stream = null;

        window.onunload = () => {
            this.socket.close();
        }
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

    componentWillUnmount() {
        this.socket.close();
        window.onunload = null;
    }

    handleMessage(data) {
        switch (data.type) {
            case 'ok': {
                console.log('Session created');
            } break;
            case 'watcher-connected': {
                this.handleWatcherConnection(data.login);
                this.chat.newMessage('info', `${data.login} connected to session`);
            } break;
            case 'answer': {
                this.handleAnswer(data.login, data.description);
            } break;
            case 'message': {
                this.chat.newMessage('message', data);
            } break;
            case 'watcher-disconnected': {
                this.chat.newMessage('info', `${data.login} disconnected from session`);
            } break;
            case 'task-suggested': {
                this.chat.newMessage('info', `${data.creator} suggested new task: ${data.mission}`);
                this.setState({
                    status: 'WAITING_FOR_CONFIRMING',
                    creator: data.creator,
                    mission: data.mission
                });
            } break;
            case 'task-confirmed': {
                this.chat.newMessage('info', `You have confirmed task from ${data.creator}: ${data.mission}`);
                this.setState({
                    status: 'DOING_TASK',
                    creator: data.creator,
                    mission: data.mission
                });
            } break;
            case 'task-rejected': {
                this.chat.newMessage('info', `You have rejected task from ${data.creator}: ${data.mission}`);
                this.setState({
                    status: 'WAITING_FOR_TASK',
                    creator: '',
                    mission: ''
                });
            } break;
            case 'task-done': {
                this.chat.newMessage('info', `You have done task from ${data.creator}: ${data.mission}`);
                this.setState({
                    status: 'WAITING_FOR_TASK',
                    creator: '',
                    mission: ''
                });
            } break;
            case 'task-failed': {
                this.chat.newMessage('info', `You have has failed task from ${data.creator}: ${data.mission}`);
                this.setState({
                    status: 'WAITING_FOR_TASK',
                    creator: '',
                    mission: ''
                });
            } break;
        }
    }

    onConfirmingTask(){
        this.socket.send(JSON.stringify({
            type: 'task-confirmed'
        }));
    }

    onRejectingTask() {
        this.socket.send(JSON.stringify({
            type: 'task-rejected'
        }));
    }

    async handleWatcherConnection(login) {
        console.log('here');
        this.pcs[login] = new RTCPeerConnection();

        let iceCandidates = [];
        this.pcs[login].onicecandidate = (event) => {
            if (event.candidate) iceCandidates.push(event.candidate);
            else this.socket.send(JSON.stringify({
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

    sendMessage(message) {
        this.socket.send(JSON.stringify({
            type: 'message',
            login: auth.getLogin(),
            message
        }));
    }

    render() {
        return (
            <div className='GameSession'>
                <div className='Video'>
                    <VideoStreamer
                        streamGenerated={this.streamReady}
                    />
                </div>
                <div className='ChatAndTask'>
                    <TaskManager
                        status={this.state.status}
                        creator={this.state.creator}
                        mission={this.state.mission}
                        isPlayer={true}
                        onConfirming={this.onConfirmingTask}
                        onRejecting={this.onRejectingTask}
                    />
                    <Chat
                        ref={instance => { this.chat = instance }}
                        sendMessage={this.sendMessage}
                    />
                </div>
            </div>
        );
    }

}