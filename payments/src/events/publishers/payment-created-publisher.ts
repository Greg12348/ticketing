import { Subjects, Publisher, PaymentCreatedEvent } from "@greg12348tickets/common/build";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
}
