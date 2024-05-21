import { Message } from 'node-nats-streaming';
import mongoose from 'mongoose';
import { OrderCancelledEvent, OrderStatus } from "@greg12348tickets/common/build";
import { OrderCancelledListener } from '../order-cancelled-listener';
import { natsWrapper } from "../../../nats-wrapper";
import { Order } from '../../../models/order';

const setup = async () => {
  // create an instance of the listener
  const listener = new OrderCancelledListener(natsWrapper.client);

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: new mongoose.Types.ObjectId().toHexString(),
    price: 10
  });
  await order.save();

  const data: OrderCancelledEvent['data'] = {
    version: 1,
    id: order.id,
    ticket: {
      id: new mongoose.Types.ObjectId().toHexString()
    }
  };  

  // create a fake message
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  };

  return { listener, data, msg, order };
};

it('updates the status of the order', async () => {
  const { listener, data, msg, order } = await setup();

  // call the onMessage function with the data object + message object
  await listener.onMessage(data, msg);

  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('ack the message', async () => {
  const { listener, data, msg, order } = await setup();

  // call the onMessage function with the data object + message object
  await listener.onMessage(data, msg);

  // write assertions to make sure ack function was called
  expect(msg.ack).toHaveBeenCalled();
});

