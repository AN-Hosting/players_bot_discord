export class ProvideGameStatus {
    provider;
    publisher;
    constructor(provider, publisher) {
        this.provider = provider;
        this.publisher = publisher;
    }
    provide() {
        return this.provider.provide().subscribe(async (status) => {
            await this.publisher.publish(status);
        });
    }
}
