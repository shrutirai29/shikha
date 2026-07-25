import { IUser } from "../interfaces/auth/auth.interface";

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export {};