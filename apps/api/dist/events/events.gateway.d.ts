import { Server } from 'ws';
export declare class EventsGateway {
    server: Server;
    emitProductUpdated(productId: string): void;
}
