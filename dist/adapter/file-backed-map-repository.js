import { existsSync, readFileSync } from 'fs';
export class FileBackedMapRepository {
    maps;
    constructor() {
        const mapsPath = './config/maps.json';
        if (!existsSync(mapsPath)) {
            console.debug('./config/maps.json does not exist');
            this.maps = {};
            return;
        }
        this.maps = JSON.parse(readFileSync(mapsPath).toString());
    }
    find(name) {
        return this.maps[name];
    }
}
