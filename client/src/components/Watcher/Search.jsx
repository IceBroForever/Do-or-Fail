import React from 'react'
import ReactDOM from 'react-dom'
import Popover from 'material-ui/Popover'
import SearchBar from 'material-ui-search-bar'
import Avatar from 'material-ui/Avatar'
import auth from '../../auth'
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';

import '../../../styles/Search.scss'

export default class Search extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            input: '',
            players: [],
            open: false
        };

        this.onInputChange = this.onInputChange.bind(this);
        this.handleRequestClose = this.handleRequestClose.bind(this);
        this.onSearchBarCreated = this.onSearchBarCreated.bind(this);
    }

    async onInputChange(newValue) {
        try {
            let responce = await auth.request({
                method: 'GET',
                url: '/watcher/find',
                params: {
                    login: newValue
                }
            });

            this.setState({
                input: newValue,
                players: responce.data.players,
                open: true
            });
        } catch (error) {
            this.setState({
                input: newValue,
                players: [],
                open: true
            });
        }
    }

    handleRequestClose() {
        this.setState({
            open: false,
        });
    };

    onSearchBarCreated(instance) {
        this.searchBar = ReactDOM.findDOMNode(instance);
    }

    render() {

        let players = this.state.players.map(player => {
            return (
                <MenuItem
                    leftIcon={<Avatar src={`/player/${player.login}/cover`} />}
                    key={player.login}
                    size={40}
                    primaryText={player.login}
                    onClick={() => { this.props.onSelect(player.login) }}
                    style={{
                        width: '7cm'
                    }}
                />
            );
        });

        if (!players.length) players = <span>Nothing to show</span>;

        return (
            <div className='Search'>
                <SearchBar
                    id='search'
                    onChange={this.onInputChange}
                    onRequestSearch={() => { }}
                    style={{
                        width: '100%'
                    }}
                    hintText={this.state.input}
                    ref={this.onSearchBarCreated}
                />
                <Popover
                    open={this.state.open}
                    anchorEl={this.searchBar}
                    onRequestClose={this.handleRequestClose}
                    anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
                    targetOrigin={{ horizontal: "left", vertical: "top" }}
                >
                    <Menu
                        disableAutoFocus={true}
                    >
                        {players}
                    </Menu>
                </Popover>
            </div>
        );
    }

}