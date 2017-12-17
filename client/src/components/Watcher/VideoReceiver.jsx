import React from 'react'
import CircularProgress from 'material-ui/CircularProgress'

export default class VideoReceiver extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            stream: null
        };
    }

    componentWillReceiveProps(newProps) {
        if (!this.state.stream)
            this.setState({
                stream: URL.createObjectURL(newProps.stream)
            });
    }

    render() {
        if (!this.state.stream) return (
            <CircularProgress />
        );

        return (
            <video src={this.state.stream} autoPlay={true} />
        );
    }

}