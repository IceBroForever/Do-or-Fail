import axios from 'axios';

export default class auth {
    static isAuthorized() {
        return localStorage.getItem('isAuthorized') === 'true';
    }

    static getLogin() {
        return localStorage.getItem('login');
    }

    static getRole() {
        return localStorage.getItem('role');
    }

    static getToken() {
        return localStorage.getItem('token');
    }

    static async verifyAuthorization() {
        localStorage.setItem('isAuthorized', false);
        try {
            let response = await this.request({
                url: '/verify',
                method: 'POST'
            });

            localStorage.setItem('isAuthorized', true);
            localStorage.setItem('login', response.data.login);
            localStorage.setItem('role', response.data.role);

        } catch (error) {
            this.logOut();
            throw error;
        }
    }

    static async logIn(login, password, role) {
        try {
            let response = await axios({
                url: '/login',
                method: 'POST',
                data: {
                    login,
                    password,
                    role
                }
            });

            localStorage.setItem('isAuthorized', true);
            localStorage.setItem('login', response.data.login);
            localStorage.setItem('role', response.data.role);
            localStorage.setItem('token', response.data.token);

        } catch (error) {
            throw error.response.data.error;
        }
    }

    static async register(login, password, role, avatar) {
        let data = new FormData();

        data.append('login', login);
        data.append('password', password);
        data.append('role', role);
        data.append('avatar', avatar);

        try {
            await axios({
                url: '/register',
                method: 'POST',
                data
            });
        } catch (error) {
            throw error.response.data.error;
        }
    }

    static logOut() {
        localStorage.setItem('isAuthorized', false);
        localStorage.removeItem('login');
        localStorage.removeItem('role');
        localStorage.removeItem('token');
    }

    static async request({
        method,
        url,
        params = null,
        data = null
    }) {
        try {
            return await axios({
                method,
                url,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': undefined
                },
                params,
                data
            })
        } catch (error) {
            throw error.response.data.error;
        }
    }
}