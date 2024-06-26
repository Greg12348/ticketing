import express from "express";
import 'express-async-errors';
import { json } from "body-parser";
import cookieSession from "cookie-session";
import { errorHandler, NotFoundError, currentUser } from '@greg12348tickets/common/build';

import { deleteOrdersRouter } from "./routes/delete";
import { newOrdersRouter } from "./routes/new";
import { showOrdersRouter } from "./routes/show";
import { indexOrdersRouter } from "./routes";

const app = express();
app.set('trust proxy', true);
app.use(json());
app.use(
  cookieSession({
    signed: false,
    secure: false,
  })
);

app.use(currentUser);

app.use(deleteOrdersRouter);
app.use(showOrdersRouter);
app.use(indexOrdersRouter);
app.use(newOrdersRouter);

app.all('*', async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };