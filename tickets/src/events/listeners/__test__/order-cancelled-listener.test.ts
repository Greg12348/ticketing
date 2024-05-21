import { Message } from 'node-nats-streaming';
import mongoose from 'mongoose';
import { OrderCancelledEvent, TicketUpdatedEvent } from "@greg12348tickets/common/build";
import { OrderCancelledListener } from '../order-cancelled-listener';
import { natsWrapper } from "../../../nats-wrapper";
import { Ticket } from '../../../models/ticket';

const setup = async () => {
  // create an instance of the listener
  const listener = new OrderCancelledListener(natsWrapper.client);
  
  // create and save a ticket
  const orderId = new mongoose.Types.ObjectId().toHexString();
  const ticket = Ticket.build({
    userId: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20
  });
  ticket.set({ orderId });
  await ticket.save();

  // create a fake data event
  const data: OrderCancelledEvent['data'] = {
    version: 0,
    id: orderId,
    ticket: {
      id: ticket.id
    }
  };

  // create a fake message
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  };

  return { listener, data, msg, ticket, orderId };
};

it('updates the ticket, publishes an event, and ack the message', async () => {
  const { listener, data, msg, ticket, orderId } = await setup();

  // call the onMessage function with the data object + message object
  await listener.onMessage(data, msg);

  // write assertions to make sure a ticket was created
  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.orderId).toEqual(null);
  expect(msg.ack).toHaveBeenCalled();
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

