import { Publisher, Subjects, OrderCancelledEvent } from '@greg12348tickets/common/build';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
}