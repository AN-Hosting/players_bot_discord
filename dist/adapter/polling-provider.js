import { asyncScheduler, delayWhen, from, map, retryWhen, Subject, tap, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';
export class PollingProvider {
    healthy = true;
    try = 1;
    interval = 10000;
    resultSubject = new Subject();
    constructor() {
        timer(0, this.interval).pipe(switchMap(() => from(this.retrieve())), retryWhen((errors => {
            if (this.healthy) {
                return errors.pipe(tap(val => {
                    this.resultSubject.next(undefined);
                    if (this.try > 15) {
                        this.try = 1;
                        throw new Error('PollingProvider became unhealty, exiting... Check the configuration and make sure the game server is online.');
                    }
                    console.log('PollingProvider errored, retrying in ' + (this.try + 1) * 2 + ' seconds for max 15 tries (' + this.try + '. try). Error:', val.message);
                    this.try++;
                }), delayWhen(() => {
                    return timer(this.try * 2 * 1000, asyncScheduler);
                }));
            }
            else {
                return errors.pipe(tap(err => console.log(err.message)), map(() => {
                    throw new Error('PollingProvider never became healthy. Check the configuration for errors and try again.');
                }));
            }
        })), tap(() => {
            this.healthy = true;
            this.try = 1;
        })).subscribe((val) => this.resultSubject.next(val));
    }
    provide() {
        return this.resultSubject.asObservable();
    }
}
