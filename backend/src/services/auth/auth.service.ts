import bcrypt from "bcrypt";
import User from "../../models/auth/auth.model";

import { ConflictError } from "../../errors/ConflictError";
import { UnauthorizedError } from "../../errors/UnauthorizedError";

import { generateAccessToken } from "../../utils/jwt";

interface RegisterDto {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

interface LoginDto {
  email: string;
  password: string;
}

export const register = async (data: RegisterDto) => {
  const existingUser = await User.findOne({
    email: data.email.toLowerCase(),
  });

  if (existingUser) {
    throw new ConflictError("Email already registered");
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await User.create({
    name: data.name,
    email: data.email.toLowerCase(),
    password: hashedPassword,
    phone: data.phone,
    role: "customer",
  });

  return {
    id: user._id,
    name: user.name,
    email: user.email,
  };
};

export const login = async (data: LoginDto) => {
  const user = await User.findOne({
    email: data.email.toLowerCase(),
  });

  if (!user) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const isMatch = await bcrypt.compare(
    data.password,
    user.password
  );

  if (!isMatch) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const token = generateAccessToken(
    user._id.toString(),
    user.role
  );

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};