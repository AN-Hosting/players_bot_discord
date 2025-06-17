import { CFToolsProvider } from './cftools-provider.js';
import { firstValueFrom } from 'rxjs';
import { config } from 'dotenv';
import { CFToolsClientBuilder } from 'cftools-sdk';
config();
describe('CFToolsProvider', () => {
    let provider;
    beforeEach(() => {
        provider = new CFToolsProvider(new CFToolsClientBuilder().build(), process.env.CFTOOLS_HOSTNAME || '', parseInt(process.env.CFTOOLS_PORT || '0'));
    });
    it('returns game status', async () => {
        expect(await firstValueFrom(provider.provide())).toEqual(expect.objectContaining({
            maxPlayers: 60,
            playerCount: expect.any(Number),
            queuedPlayers: expect.any(Number),
        }));
    });
});
