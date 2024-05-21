import { Publisher, Subjects, OrderCreatedEvent } from '@greg12348tickets/common/build';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
}
