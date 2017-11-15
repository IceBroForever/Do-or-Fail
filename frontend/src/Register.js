import React from "react"
import axios from "axios"
import { Link } from "react-router-dom"

export default class Register extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            login: null,
            password: null,
            password2: null,
            role: null,
            avatar: null,
            avatarPreviewURL: null,
            message: null
        }

        this.handleLoginChange = this.handleLoginChange.bind(this);
        this.handlePasswordChange = this.handlePasswordChange.bind(this);
        this.handlePassword2Change = this.handlePassword2Change.bind(this);
        this.handleRoleChange = this.handleRoleChange.bind(this);
        this.handleAvatarChange = this.handleAvatarChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.onLogin = this.props.onLogin;
    }

    handleLoginChange(event) {
        this.setState({ login: event.target.value });
    }

    handlePasswordChange(event) {
        this.setState({ password: event.target.value });
    }

    handlePassword2Change(event) {
        this.setState({ password2: event.target.value });
    }

    handleRoleChange(event) {
        this.setState({ role: event.target.value });
    }

    handleAvatarChange(event) {
        let reader = new FileReader();
        let avatar = event.target.files[0];

        reader.onloadend = () => {
            this.setState({
                avatar,
                avatarPreviewURL: reader.result
            });
        };

        reader.readAsDataURL(avatar);
    }

    handleSubmit(event) {
        event.preventDefault();

        let { login, password, password2, role, avatar } = this.state;

        if (!login || !password || !password2 || !role || !avatar)
            this.setState({ message: "Fill in all the fields" });
        else {
            if (password !== password2) this.setState({ message: "Passwords didn&#39;t match" });
            else {
                let data = new FormData();

                data.append('login', login);
                data.append('password', password);
                data.append('role', role);
                data.append('avatar', avatar);

                axios.post('/register', data,
                    {
                        headers: { 'Content-Type': undefined }
                    })
                    .then((responce) => {
                        if (responce.data.error) this.setState({ message: responce.data.error })
                        else{
                            this.props.onLogin(responce.data);
                            this.setState({ redirectTo: "/" });
                        }
                    });
            }
        }
    }

    render() {
        if (this.state.redirectTo) return <Redirect to={this.state.redirectTo} />
        
        let messageElement = (<span>{this.state.message}</span>);

        let avatarPreview = null;
        if (this.state.avatarPreviewURL) avatarPreview = (<img src={this.state.avatarPreviewURL} />);

        return (
            <form onSubmit={this.handleSubmit} enctype="multipart/form-data">
                <label>
                    Login:
                <input type="text" value={this.state.login} onChange={this.handleLoginChange} />
                </label>
                {this.state.message == "Login is used" && messageElement}
                <label>
                    Password:
                <input type="password" value={this.state.password} onChange={this.handlePasswordChange} />
                </label>
                <label>
                    Confirm password:
                <input type="password" value={this.state.password2} onChange={this.handlePassword2Change} />
                </label>
                {this.state.message == "Passwords didn&#39;t match" && messageElement}
                <label>
                    Role:
                    <label>
                        Player
                        <input type="radio" name="role" value="player" onChange={this.handleRoleChange} checked={this.state.role === "player"} />
                    </label>
                    <label>
                        Watcher
                        <input type="radio" name="role" value="watcher" onChange={this.handleRoleChange} checked={this.state.role === "watcher"} />
                    </label>
                </label>
                <label>
                    Avatar:
                    <input type="file" onChange={this.handleAvatarChange} />
                </label>
                {avatarPreview}
                <input type="submit" value="Submit" />
                {this.state.message == "Fill in all the fields" && messageElement}
                <Link to="/login">Have an account? Log in</Link>
            </form>
        );
    }

}