import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'ws';

@WebSocketGateway({ path: '/ws', cors: true })
export class EventsGateway {
  @WebSocketServer()
  server!: Server;

  emitProductUpdated(productId: string): void {
    if (!this.server?.clients) return;
    const payload = JSON.stringify({ event: 'product_updated', productId });
    this.server.clients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(payload);
      }
    });
  }
}
