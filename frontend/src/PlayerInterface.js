import React from "react"
import VideoStreamer from "./VideoStreamer"

export default class PlayerInterface extends React.Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
    }

    render() {
        return <VideoStreamer player={this.props.player} />
    }

}