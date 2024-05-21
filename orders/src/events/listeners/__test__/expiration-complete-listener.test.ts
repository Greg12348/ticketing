import { Message } from 'node-nats-streaming';
import mongoose from 'mongoose';
import { OrderStatus, ExpirationCompleteEvent } from '@greg12348tickets/common/build';
import { ExpirationCompleteListener } from '../expiration-complete-listener';
import { natsWrapper } from "../../../nats-wrapper";
import { Ticket } from '../../../models/ticket';
import { Order } from '../../../models/order';

const setup = async () => {
  // create an instance of the listener
  const listener = new ExpirationCompleteListener(natsWrapper.client);
  
  // create and save a ticket and an order
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20
  });
  await ticket.save();

  const order = Order.build({
    status: OrderStatus.Created,
    userId: new mongoose.Types.ObjectId().toHexString(),
    expiresAt: new Date(),
    ticket
  });
  await order.save();


  // create a fake data event
  const data: ExpirationCompleteEvent['data'] = {
    orderId: order.id
  };

  // create a fake message
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  };

  return { listener, order, ticket, data, msg };
};

it('updates the order status to cancelled', async () => {
  const { listener, order, ticket, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const updatedOrder = await Order.findById(order.id);
  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('emit an OrderCancelled event', async () => {
  const { listener, order, ticket, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const eventData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);
  expect(eventData.id).toEqual(order.id);
});

it('ack the message', async () => {
  const { listener, order, ticket, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();

});

