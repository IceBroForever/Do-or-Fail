import React from 'react'
import CircularProgress from 'material-ui/CircularProgress';

export default class VideoStreamer extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            stream: null
        }
    }

    async componentDidMount() {
        navigator.getUserMedia = navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia;

        let stream = await navigator.getUserMedia(
            {
                video: true,
                audio: true
            },
            stream => {
                this.setState({
                    stream
                });

                this.props.streamGenerated(stream);
            },
            error => {
                console.log(error);
            }
        );
    }

    render() {
        if (!this.state.stream) return (
            <CircularProgress />
        );

        console.dir(this.state.stream);

        return (
            <video src={URL.createObjectURL(this.state.stream)} autoPlay={true}/>
        );
    }

}