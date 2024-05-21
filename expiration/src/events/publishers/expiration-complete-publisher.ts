import { Publisher, Subjects, ExpirationCompleteEvent } from '@greg12348tickets/common/build';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
}
