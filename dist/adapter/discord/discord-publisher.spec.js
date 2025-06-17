import { DiscordPublisher } from './discord-publisher.js';
import { Client } from 'discord.js';
import { config } from 'dotenv';
config();
describe('DiscordPublisher', () => {
    let client;
    let publisher;
    beforeEach((done) => {
        client = new Client({ intents: 0 });
        client.on('ready', () => {
            done();
        });
        client.login(process.env.DISCORD_TOKEN || '');
        publisher = new DiscordPublisher(client, new NoOpMapsRepository(), { playerCount: '', queuedPlayers: '' });
    });
    afterEach(() => {
        client.destroy();
    });
    it('sets new status to discord bot', async () => {
        await publisher.publish({ playerCount: 5, maxPlayers: 40, name: null, map: null });
        expect(await publisher.currentStatus()).toEqual({
            playerCount: 5, maxPlayers: 40
        });
    });
    it('handles queued players if present', async () => {
        await publisher.publish({ playerCount: 5, maxPlayers: 40, queuedPlayers: 2, name: null, map: null });
        expect(await publisher.currentStatus()).toEqual({
            playerCount: 5, maxPlayers: 40, queuedPlayers: 2
        });
    });
    it('goes offline when null GameStatus provided', async () => {
        await publisher.publish(undefined);
        expect(await publisher.currentStatus()).toBeUndefined();
    });
});
class NoOpMapsRepository {
    find(name) {
        return undefined;
    }
}
