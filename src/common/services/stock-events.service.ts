import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';
import { EventoRealTimeStock } from '../../dashboards/interfaces/dashboard-graficos.interface';
@Injectable()
export class StockEventsService {
  private readonly events = new Subject<EventoRealTimeStock>();
  emit(event: EventoRealTimeStock) {
    this.events.next(event);
  }
  stream() {
    return this.events.asObservable();
  }
}
