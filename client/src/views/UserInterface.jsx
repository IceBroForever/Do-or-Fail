import React from 'react'
import auth from '../auth'
import Header from '../components/Header'
import PlayerInterface from '../components/Player/PlayerInterface'
import WatcherInterface from '../components/Watcher/WatcherInterface'

import '../../styles/Interface.scss'

export default class UserInterface extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className='Interface'>
                <div className='Header'>
                    <Header />
                </div>
                {auth.getRole() == 'player' ?
                    <PlayerInterface /> :
                    <WatcherInterface />}
            </div>
        );
    }

}