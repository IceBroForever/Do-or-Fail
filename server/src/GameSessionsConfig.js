const GameSessions = require('./GameSessions'),
    GameSession = require('./GameSession'),
    Url = require('url');

let gameSessions = new GameSessions();

setInterval(() => {console.dir(gameSessions); console.log('///////')}, 5000);

module.exports = (server) => {
    server.on('upgrade', (req, socket, head) => {
        let url = Url.parse(req.url, true);
        let { login, role } = url.query;

        let player = url.pathname.substr('/gamesession/'.length);

        let gameSession = gameSessions.getPlayerGameSession(player);

        if (!gameSession) {
            if (role == 'player' && login == player) {
                gameSessions.createPlayerGameSession(player);
                gameSession = gameSessions.getPlayerGameSession(player);
            }
            else return socket.close(500, 'Forbidden');
        }

        gameSession.handleUpgrade(req, socket, head);
    });
}