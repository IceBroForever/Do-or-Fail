import React from 'react'
import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'
import RaisedButton from 'material-ui/RaisedButton'

import '../../styles/PlayerProfile.scss'

export default class PlayerProfile extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            playerLogin: this.props.player,
            player: this.props.player,
            open: this.props.player != ''
        };
    }

    componentWillReceiveProps(newProps) {
        this.setState({
            playerLogin: newProps.player,
            open: newProps.player != ''
        })
    }

    render() {
        return (
            <Dialog
                open={this.state.open}
                contentClassName='Dialog'
                bodyClassName='Container'
                actions={[
                ]}
            >
                123
            </Dialog>
        );
    }

}