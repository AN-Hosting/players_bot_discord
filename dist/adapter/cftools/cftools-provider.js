import { Game } from 'cftools-sdk';
import { PollingProvider } from '../polling-provider.js';
export class CFToolsProvider extends PollingProvider {
    client;
    hostname;
    port;
    constructor(client, hostname, port) {
        super();
        this.client = client;
        this.hostname = hostname;
        this.port = port;
    }
    async retrieve() {
        const details = await this.client.getGameServerDetails({
            game: Game.DayZ,
            ip: this.hostname,
            port: this.port,
        });
        return {
            name: details.name,
            maxPlayers: details.status.players.slots,
            playerCount: details.status.players.online,
            queuedPlayers: details.status.players.queue,
            map: details.map,
        };
    }
}
