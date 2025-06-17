import { PollingProvider } from '../polling-provider.js';
export class SteamProvider extends PollingProvider {
    steamApiToken;
    gameAddress;
    constructor(steamApiToken, gameAddress) {
        super();
        this.steamApiToken = steamApiToken;
        this.gameAddress = gameAddress;
    }
    async retrieve() {
        const response = await fetch(`https://api.steampowered.com/IGameServersService/GetServerList/v1/?key=${this.steamApiToken}&filter=\\addr\\${this.gameAddress}`);
        if (response.status !== 200) {
            throw new Error('unexpected response code, expected 200, got: ' + response.status);
        }
        const steamGameInfo = await response.json();
        if (!steamGameInfo || !steamGameInfo.response || !steamGameInfo.response.servers || steamGameInfo.response.servers.length !== 1) {
            throw new Error('Steam did not respond with a single server. Returned servers: ' + steamGameInfo?.response?.servers?.length);
        }
        const server = steamGameInfo.response.servers[0];
        return {
            maxPlayers: server.max_players,
            playerCount: server.players,
            name: server.name,
            map: server.map,
        };
    }
}
