import React from 'react'
import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'
import RaisedButton from 'material-ui/RaisedButton'
import auth from '../../auth'
import Avatar from 'material-ui/Avatar'
import CircularProgress from 'material-ui/CircularProgress'

import '../../../styles/PlayerProfile.scss'

export default class PlayerProfile extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            player: null,
            show: false
        };

        this.getPlayerInfo = this.getPlayerInfo.bind(this);
    }

    async getPlayerInfo(login) {
        let responce = await auth.request({
            method: 'GET',
            url: `/player/${login}/fullInfo`
        });

        console.log(responce.data);
        return responce.data;
    }

    async componentWillReceiveProps(newProps) {
        if (!newProps.show) {
            return this.setState({
                show: false,
                player: null
            });
        }

        let player = null;

        try {
            player = await this.getPlayerInfo(newProps.player);
        } catch (error) {
            console.log(error);
        }

        this.setState({
            show: true,
            player
        })
    }

    render() {

        let complitedTasks = [];
        let rejectedTasks = [];
        let failedTasks = [];

        if (this.state.player) {
            for (let task of this.state.player.complitedTasks)
                complitedTasks.push(
                    <div className='Task' key={Math.random()}>
                        <p><b>Created by: </b>{task.creator}</p>
                        <p><b>Mission: </b>{task.mission}</p>
                    </div>
                );

            for (let task of this.state.player.rejectedTasks)
                rejectedTasks.push(
                    <div className='Task' key={Math.random()}>
                        <p><b>Created by: </b>{task.creator}</p>
                        <p><b>Mission: </b>{task.mission}</p>
                    </div>
                );

            for (let task of this.state.player.failedTasks)
                failedTasks.push(
                    <div className='Task' key={Math.random()}>
                        <p><b>Created by: </b>{task.creator}</p>
                        <p><b>Mission: </b>{task.mission}</p>
                    </div>
                );
        }

        console.log('player');
        console.log(this.state.player);

        return (
            <Dialog
                open={this.state.show}
                contentClassName='Dialog'
                bodyClassName='Container'
                actions={this.props.actions}
            >
                {this.state.player ? (
                    <div className='Profile'>
                        <div className='Avatar'>
                            <Avatar
                                src={`/player/${this.state.player.login}/cover`}
                                size={150}
                            />
                        </div>
                        <div className='Info'>
                            <h1>{this.state.player.login} <small>{this.state.player.isOnline && '(online)'}</small></h1>
                            {this.state.player.isOnline && (
                                <div className='TaskBlock'>
                                    <h2>Active task</h2>
                                    {this.state.player.activeTask ? (
                                        <div className='Task'>
                                            <p><b>Created by: </b>{this.state.player.activeTask.creator}</p>
                                            <p><b>Mission: </b>{this.state.player.activeTask.mission}</p>
                                        </div>
                                    ) : (
                                            <p>None</p>
                                        )}
                                </div>
                            )}
                            <div className='TaskBlock'>
                                <h2>Complited tasks</h2>
                                {complitedTasks || <p>None</p>}
                            </div>
                            <div className='TaskBlock'>
                                <h2>Rejected tasks</h2>
                                {rejectedTasks || <p>None</p>}
                                <div className='TaskBlock'>
                                </div>
                                <h2>Failed tasks</h2>
                                {failedTasks || <p>None</p>}
                            </div>
                        </div>
                    </div>
                ) : (
                        <CircularProgress />
                    )
                }
            </Dialog>
        );
    }

}