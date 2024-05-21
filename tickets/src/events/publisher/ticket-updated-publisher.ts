import { Publisher, Subjects, TicketUpdatedEvent } from "@greg12348tickets/common/build";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
}