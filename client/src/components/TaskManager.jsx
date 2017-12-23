import React from 'react'
import TextField from 'material-ui/TextField'
import FlatButton from 'material-ui/FlatButton'
import { green500, red500 } from 'material-ui/styles/colors'

export default class TaskManager extends React.Component {

    constructor(props) {
        super(props);

        let { status, mission, creator, isPlayer } = this.props;

        this.state = {
            status,
            mission,
            creator,
            isPlayer,
            input: ''
        }

        this.onInput = this.onInput.bind(this);
        this.onSuggestTaskClicked = this.onSuggestTaskClicked.bind(this);
    }

    componentWillReceiveProps(props) {
        let { status, mission, creator, isPlayer } = props;
        this.setState({
            status,
            mission,
            creator,
            isPlayer
        });
    }

    onSuggestTaskClicked() {
        if (this.state.input)
            this.props.onTaskSuggested(this.state.input);
        this.setState({
            input: ''
        });
    }

    onInput(event, newValue) {
        event.preventDefault();
        this.setState({
            input: newValue
        })
    }

    render() {
        let actions = [];

        switch (this.state.status) {
            case 'WAITING_FOR_TASK': {
                if (!this.state.isPlayer) {
                    actions = [
                        <TextField
                            key='mission'
                            hintText='Mission'
                            onChange={this.onInput}
                        />,
                        <FlatButton
                            key='suggest'
                            label='Suggest'
                            onClick={this.onSuggestTaskClicked}
                        />
                    ];
                }
            } break;
            case 'WAITING_FOR_CONFIRMING': {
                if (this.state.isPlayer) {
                    actions = [
                        <FlatButton
                            key='confirm'
                            label='Confirm'
                            labelStyle={{
                                color: green500
                            }}
                            onClick={this.props.onConfirming}
                        />,
                        <FlatButton
                            key='reject'
                            label='Reject'
                            labelStyle={{
                                color: red500
                            }}
                            onClick={this.props.onRejecting}
                        />
                    ];
                }
            } break;
            case 'DOING_TASK': {
                if (!this.state.isPlayer) {
                    actions = [
                        <FlatButton
                            key='done'
                            label='Done'
                            labelStyle={{
                                color: green500
                            }}
                            onClick={this.props.onClickedDone}
                        />,
                        <FlatButton
                            key='failed'
                            label='Failed'
                            labelStyle={{
                                color: red500
                            }}
                            onClick={this.props.onClickedFailed}
                        />
                    ]
                }
            }
        }

        return (
            <div className='TaskManager'>
                <div className='Text' key='status'>Status: {this.state.status.split('_').join(' ').toLowerCase()}</div>
                {this.state.status != 'WAITING_FOR_TASK' && [
                    <div className='Text' key='creator'>Creator: {this.state.creator}</div>,
                    <div className='Text' key='mission'>Mission: {this.state.mission}</div>
                ]}
                {actions}
            </div>
        );

    }

}