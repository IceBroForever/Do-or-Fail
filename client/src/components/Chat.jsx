import React from 'react'
import TextField from 'material-ui/TextField'
import RaisedButton from 'material-ui/RaisedButton'
import auth from '../auth'

import '../../styles/Chat.scss'

export default class Chat extends React.Component {

    constructor(props) {
        super(props);

        this.generateBlock = this.generateBlock.bind(this);
        this.onInputChange = this.onInputChange.bind(this);
        this.newMessage = this.newMessage.bind(this);
        this.onClick = this.onClick.bind(this);

        this.state = {
            messages: this.props.messages ? this.props.messages.map(message => this.generateBlock(message)) : [],
            input: ''
        };
    }

    async generateBlock(message) {
        return (
            <div
                key={Math.random()}
                className='Message'
            >
                <h3>{message.sender}</h3>
                {message.message}
            </div>
        );
    }

    async newMessage(message) {

        let messages = this.state.messages;
        messages.push(await this.generateBlock(message));

        this.setState({
            messages
        });
    }

    onInputChange(event, newValue) {
        event.preventDefault();
        this.setState({
            input: newValue
        });
    }

    onClick() {
        this.props.sendMessage(this.state.input);
        this.setState({
            input: ''
        });
    }

    render() {
        return (
            <div className='Chat'>
                <div className='Messages'>
                    <div className='Container'>
                        {this.state.messages}
                    </div>
                </div>
                <div>
                    <TextField
                        hintText={'Write a message'}
                        value={this.state.input}
                        onChange={this.onInputChange}
                    />
                    <RaisedButton
                        style={{ marginLeft: '20px' }}
                        label='Send'
                        primary={true}
                        onClick={this.onClick}
                    />
                </div>
            </div>
        );
    }

}