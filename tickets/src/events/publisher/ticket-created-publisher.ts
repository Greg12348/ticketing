import { Publisher, Subjects, TicketCreatedEvent } from "@greg12348tickets/common/build";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
}
