import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { Order, OrderStatus } from '../../models/order';
import { natsWrapper } from '../../nats-wrapper';

const buildTicket = async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'connect',
    price: 20
  });
  await ticket.save();

  return ticket;
}

it("marks an order as cancelled", async () => {
  const ticket = await buildTicket();

  const user = global.signup();

  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201);

  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .expect(204);

  const updatedOrder = await Order.findById(order.id);
  
  expect(updatedOrder?.status).toEqual(OrderStatus.Cancelled);
});

it("emits an order cancelled event", async () => {
  const ticket = await buildTicket();

  const user = global.signup();

  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201);

  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .expect(204);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

