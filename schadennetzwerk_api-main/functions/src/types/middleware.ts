import { CallableRequest } from "firebase-functions/v2/https";

export type Middleware<T = any> = (request: CallableRequest<T>, next: Handler<T>) => Promise<unknown>;

export type Handler<T = any> = (request: CallableRequest<T>) => any;
