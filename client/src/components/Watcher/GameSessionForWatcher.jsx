import React from 'react'
import auth from '../../auth'
import Dialog from 'material-ui/Dialog'
import VideoReceiver from './VideoReceiver'
import FlatButton from 'material-ui/FlatButton'
import Chat from '../Chat'
import TaskManager from '../TaskManager'

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
        this.onSuggestingTask = this.onSuggestingTask.bind(this);
        this.onConfirmingDone = this.onConfirmingDone.bind(this);
        this.onConfirmingFailed = this.onConfirmingFailed.bind(this);

        this.state = {
            stream: null,
            show: false,
            status: '',
            creator: '',
            mission: ''
        };

        this.socket = null;
        this.pc = null;
    }

    componentWillReceiveProps(newProps) {

        if (newProps.show) {
            if (!this.socket) {
                this.socket = this.createSocket(newProps.player);
            }
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
        let protocol = process.env.production ? 'wss://' : 'ws://';

        let url = protocol + window.location.host +
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

        socket.onopen = () => {
            socket.send(JSON.stringify({
                type: 'task-info'
            }));
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
            case 'task-info': {
                console.log(data);
                let status = data.status,
                    mission = data.mission || '',
                    creator = data.creator || ''

                this.setState({
                    status,
                    mission,
                    creator
                })
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
                this.chat.newMessage('info', `${this.props.player} has confirmed task from ${data.creator}: ${data.mission}`);
                this.setState({
                    status: 'DOING_TASK',
                    creator: data.creator,
                    mission: data.mission
                });
            } break;
            case 'task-rejected': {
                this.chat.newMessage('info', `${this.props.player} has rejected task from ${data.creator}: ${data.mission}`);
                this.setState({
                    status: 'WAITING_FOR_TASK',
                    creator: '',
                    mission: ''
                });
            } break;
            case 'task-done': {
                this.chat.newMessage('info', `${this.props.player} has done task from ${data.creator}: ${data.mission}`);
                this.setState({
                    status: 'WAITING_FOR_TASK',
                    creator: '',
                    mission: ''
                });
            } break;
            case 'task-failed': {
                this.chat.newMessage('info', `${this.props.player} has failed task from ${data.creator}: ${data.mission}`);
                this.setState({
                    status: 'WAITING_FOR_TASK',
                    creator: '',
                    mission: ''
                });
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

    onSuggestingTask(mission) {
        this.socket.send(JSON.stringify({
            type: 'suggest-task',
            mission
        }));
    }

    onConfirmingDone() {
        this.socket.send(JSON.stringify({
            type: 'confirm-done'
        }));
    }

    onConfirmingFailed() {
        this.socket.send(JSON.stringify({
            type: 'confirm-fail'
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
                    <div className='ChatAndTask'>
                        <TaskManager
                            status={this.state.status}
                            creator={this.state.creator}
                            mission={this.state.mission}
                            isPlayer={false}
                            onTaskSuggested={this.onSuggestingTask}
                            onClickedDone={this.onConfirmingDone}
                            onClickedFailed={this.onConfirmingFailed}
                        />
                        <Chat
                            ref={instance => { this.chat = instance }}
                            sendMessage={this.sendMessage}
                        />
                    </div>
                </div>
            </Dialog>
        );
    }

}