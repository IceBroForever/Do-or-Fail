import React from 'react'

export default class VideoReceiver extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            stream: null
        };
    }

    componentWillReceiveProps(newProps) {
        if(newProps.stream) {
            this.setState({
                stream: newProps.stream
            });
        }
    }

    render() {
        if (!this.state.stream) return (
            <CircularProgress />
        );

        return (
            <video src={URL.createObjectURL(this.state.stream)} autoPlay={true}/>
        );
    }

}