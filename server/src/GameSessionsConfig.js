const GameSessions = require('./GameSessions');

let gameSessions = new GameSessions();

module.exports = function (server) {
    server.on('upgrade', (req, socket, head) => {
        let url = Url.parse(req.url, true);
        let { login, role } = url.query;

        let player = url.pathname.substr('/gamesession/'.length);

        let gameSession = GameSessions.getPlayerGameSession(login);

        if (!gameSession) {
            if (role == 'player' && login == player) {
                GameSessions.createPlayerGameSession(login);
                gameSession = GameSessions.getPlayerGameSession(login);
            }
            else return socket.close(500, 'Forbidden');
        }

        gameSession.handleUpgrade(req, socket, head);
    });
}