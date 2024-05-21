import { Message } from 'node-nats-streaming';
import mongoose from 'mongoose';
import { OrderCreatedEvent, OrderStatus } from "@greg12348tickets/common/build";
import { OrderCreatedListener } from "../order-created-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { Ticket } from '../../../models/ticket';

const setup = async () => {
  // create an instance of the listener
  const listener = new OrderCreatedListener(natsWrapper.client);
  
  // create and save a ticket
  const ticket = Ticket.build({
    userId: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20
  });
  await ticket.save();

  // create a fake data event
  const data: OrderCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: new mongoose.Types.ObjectId().toHexString(),
    expiresAt: new mongoose.Types.ObjectId().toHexString(),
    ticket: {
        id: ticket.id,
        price: ticket.price
    }
  };

  // create a fake message
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  };

  return { listener, ticket, data, msg };
};

it('sets the userId of the ticket', async () => {
  const { listener, ticket, data, msg } = await setup();

  // call the onMessage function with the data object + message object
  await listener.onMessage(data, msg);

  // write assertions to make sure a ticket was created
  const updatedticket = await Ticket.findById(ticket.id);

  expect(updatedticket).toBeDefined();
  expect(updatedticket!.orderId).toEqual(data.id);
});

it('ack the message', async () => {
  const { listener, data, msg } = await setup();

  // call the onMessage function with the data object + message object
  await listener.onMessage(data, msg);

  // write assertions to make sure ack function was called
  expect(msg.ack).toHaveBeenCalled();
});

it('publishes a ticket updated event', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const ticketUpdateData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);

  expect(ticketUpdateData.orderId).toEqual(data.id);
});