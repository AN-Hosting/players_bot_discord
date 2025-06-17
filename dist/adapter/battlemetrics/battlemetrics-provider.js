import { PollingProvider } from "../polling-provider.js";
export class BattlemetricsProvider extends PollingProvider {
    accessToken;
    serverId;
    constructor(accessToken, serverId) {
        super();
        this.accessToken = accessToken;
        this.serverId = serverId;
    }
    async retrieve() {
        const response = await fetch(`https://api.battlemetrics.com/servers/${this.serverId}`, {
            headers: {
                Authorization: `Bearer ${this.accessToken}`,
            }
        });
        if (response.status !== 200) {
            throw new Error('unexpected response code, expected 200, got: ' + response.status);
        }
        const gameInfo = await response.json();
        return {
            playerCount: gameInfo.data.attributes.players,
            maxPlayers: gameInfo.data.attributes.maxPlayers,
            map: gameInfo.data.attributes.details?.map || '',
            name: gameInfo.data.attributes.name,
        };
    }
}
