import React from "react"

export default class VideoStreamer extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            localStream: null,
            localStreamURL: null
        }

        this.peerConnections = [];

        
    }

    componentDidMount() {
        navigator.getUserMedia({ video: true, audio: true },
            (stream) => this.setState({
                localStream: stream,
                localStreamURL: URL.createObjectURL(stream)
            }),
            () => console.log("Uuups... Camera did not work"));
    }

    render() {
        return <video src={this.state.localStreamURL} autoPlay="true"></video>;
    }

}