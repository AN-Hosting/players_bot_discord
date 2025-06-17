import { PollingProvider } from '../polling-provider.js';
import { GameDig } from "gamedig";
export class SteamQueryProvider extends PollingProvider {
    gameType;
    gameIp;
    gameQueryPort;
    constructor(gameType, gameIp, gameQueryPort) {
        super();
        this.gameType = gameType;
        this.gameIp = gameIp;
        this.gameQueryPort = gameQueryPort;
    }
    async retrieve() {
        const result = await GameDig.query({
            type: this.gameType,
            host: this.gameIp,
            port: this.gameQueryPort,
        });
        return {
            playerCount: result.players.length,
            maxPlayers: result.maxplayers,
            map: result.map,
            name: result.name,
        };
    }
}
