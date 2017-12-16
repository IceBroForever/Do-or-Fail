const GameSession = require('./GameSession');

function GameSessions(){ };

GameSessions.prototype.getPlayerGameSession = function (login) {
    return this[login];
}

GameSessions.prototype.createPlayerGameSession = function (login) {
    this[login] = new GameSession(login, this.deletePlayerGameSession.bind(this, login));
}

GameSessions.prototype.deletePlayerGameSession = function (login) {
    delete this[login];
}

module.exports = GameSessions;