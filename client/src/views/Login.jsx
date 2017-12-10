import React from 'react'
import { Redirect } from 'react-router-dom'
import { Card, CardTitle, CardText, CardActions } from 'material-ui/Card'
import TextField from 'material-ui/TextField'
import RaisedButton from 'material-ui/RaisedButton'
import CheckBox from 'material-ui/Checkbox'
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton';
import Visibility from 'material-ui/svg-icons/action/visibility';
import VisibilityOff from 'material-ui/svg-icons/action/visibility-off';
import auth from '../auth'

import '../../styles/LoginAndRegisterForm.scss'

const patternError = 'Use characters, numbers, ".", "_". Length 5 - 16.';
const requireError = 'This field is required';

export default class LoginWindow extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            login: '',
            password: '',
            showPassword: false,
            loginError: '',
            passwordError: '',
            role: '',
            roleError: '',
            loginned: false
        }

        this.handleLoginChange = this.handleLoginChange.bind(this);
        this.handlePasswordChange = this.handlePasswordChange.bind(this);
        this.handleCheckboxChange = this.handleCheckboxChange.bind(this);
        this.handleRoleChange = this.handleRoleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleLoginChange(event, newValue) {
        event.preventDefault();

        this.setState({
            login: newValue
        })
    }

    handlePasswordChange(event, newValue) {
        event.preventDefault();

        this.setState({
            password: newValue
        })
    }

    handleCheckboxChange(event, isChecked) {
        event.preventDefault();

        this.setState({
            showPassword: isChecked
        })
    }

    handleRoleChange(event, newValue) {
        event.preventDefault();

        this.setState({
            role: newValue
        });
    }

    async handleSubmit(event) {
        event.preventDefault();

        let { login, password, role } = this.state;
        let loginError = '', passwordError = '', roleError = '';

        if (!login || !/[a-zA-Z0-9._]{5,16}/.test(login)) {
            if (login) loginError = patternError;
            else loginError = requireError;
        }

        if (!password || !/[a-zA-Z0-9._]{5,16}/.test(password)) {
            if (password) passwordError = patternError;
            else passwordError = requireError;
        }

        if (!role) roleError = requireError;

        if (!loginError && !passwordError && !roleError) {
            try {
                await auth.logIn(login, password, role);

                this.setState({
                    loginned: true
                })
            } catch (error) {
                if (error == 'No such user')
                    loginError = error;
                else passwordError = error;

                this.setState({
                    loginError: loginError,
                    passwordError: passwordError,
                    role: roleError
                })
            }
        } else {
            this.setState({
                loginError,
                passwordError,
                roleError
            })
        }
    }

    render() {
        if (this.state.loginned) return (
            <Redirect to='/' />
        );

        return (
            <div className='LoginAndRegisterForm'>
                <Card className='card'>
                    <CardTitle title='Authorization' />
                    <CardText>
                        <TextField
                            name='login'
                            hintText={this.state.login || 'Write your login'}
                            floatingLabelText='Login'
                            fullWidth={true}
                            type='text'
                            onChange={this.handleLoginChange}
                            errorText={this.state.loginError}
                        />
                        <TextField
                            name='password'
                            hintText={this.state.password || 'Write your password'}
                            floatingLabelText='Password'
                            fullWidth={true}
                            type={this.state.showPassword ? 'text' : 'password'}
                            onChange={this.handlePasswordChange}
                            errorText={this.state.passwordError}
                        />
                        <CheckBox
                            label='Show password'
                            checked={this.state.showPassword}
                            onCheck={this.handleCheckboxChange}
                            checkedIcon={<Visibility />}
                            uncheckedIcon={<VisibilityOff />}
                        />
                        <RadioButtonGroup
                            className='role'
                            onChange={this.handleRoleChange}
                            name='role'
                        >
                            <RadioButton
                                value='player'
                                label='Player'
                            />
                            <RadioButton
                                value='watcher'
                                label='Watcher'
                            />
                        </RadioButtonGroup>
                    </CardText>
                    <CardActions>
                        <RaisedButton
                            primary={true}
                            label='Log in'
                            onClick={this.handleSubmit}
                        />
                        <RaisedButton
                            secondary={true}
                            label='Register'
                            href='/register'
                        />
                    </CardActions>
                </Card>
            </div>
        );
    }
}