import { WatchedList } from '@core/entities/watched-list';
import { Order } from './order';

export class ServiceOrderList extends WatchedList<Order> {
  compareItems(a: Order, b: Order): boolean {
    return a.id.equals(b.id);
  }
}
