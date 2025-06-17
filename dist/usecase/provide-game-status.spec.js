import { ProvideGameStatus } from './provide-game-status.js';
import { of } from 'rxjs';
describe('ProvideGameStatus', () => {
    let useCase;
    let publisher;
    beforeEach(() => {
        publisher = new InMemoryGameStatusPublisher();
        useCase = new ProvideGameStatus(new InMemoryGameStatusProvider(), publisher);
    });
    it('publishes status', async () => {
        await useCase.provide();
        expect(publisher.currentStatus).toEqual({
            maxPlayers: 40,
            playerCount: 5
        });
    });
});
class InMemoryGameStatusProvider {
    provide() {
        return of({
            maxPlayers: 40,
            playerCount: 5,
            name: 'Test-Server',
            map: 'Foy',
        });
    }
}
class InMemoryGameStatusPublisher {
    currentStatus = undefined;
    async publish(status) {
        this.currentStatus = status;
    }
}
