import bcrypt from "bcrypt";
import User from "../../models/auth/auth.model";
import { UpdateProfileDto } from "../../dtos/user/update-profile.dto";
import { IUserListQuery } from "../../interfaces/user/user.interface";
import { NotFoundError } from "../../errors/NotFoundError";
import { ConflictError } from "../../errors/ConflictError";
import { UnauthorizedError } from "../../errors/UnauthorizedError";

const userSelect = "-password";

export const getProfile = async (userId: string) => {
  const user = await User.findById(userId).select(userSelect);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  return user;
};

export const updateProfile = async (
  userId: string,
  data: UpdateProfileDto
) => {
  const user = await User.findByIdAndUpdate(
    userId,
    {
      $set: data,
    },
    {
      new: true,
      runValidators: true,
    }
  ).select(userSelect);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  return user;
};

export const getAllUsers = async ({
  page = 1,
  limit = 10,
  search = "",
  role,
  isActive,
}: IUserListQuery) => {
  const filter: Record<string, unknown> = {};

  if (search) {
    filter.$or = [
      {
        name: {
          $regex: search,
          $options: "i",
        },
      },
      {
        email: {
          $regex: search,
          $options: "i",
        },
      },
    ];
  }

  if (role) {
    filter.role = role;
  }

  if (typeof isActive === "boolean") {
    filter.isActive = isActive;
  }

  const total = await User.countDocuments(filter);

  const users = await User.find(filter)
    .select(userSelect)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return {
    users,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const createDeliveryAgent = async (data: {
  name: string;
  email: string;
  phone: string;
  password: string;
}) => {
  const existing = await User.findOne({
    email: data.email.toLowerCase(),
  });

  if (existing) {
    throw new ConflictError("A user with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const agent = await User.create({
    name: data.name,
    email: data.email.toLowerCase(),
    phone: data.phone,
    password: hashedPassword,
    role: "delivery_agent",
    isVerified: true,
    phoneVerified: true,
    isActive: true,
  });

  return User.findById(agent._id).select(userSelect);
};

export const getDeliveryAgents = async ({
  page = 1,
  limit = 50,
  search = "",
}: {
  page?: number;
  limit?: number;
  search?: string;
}) => {
  const filter: Record<string, unknown> = { role: "delivery_agent" };

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const total = await User.countDocuments(filter);

  const agents = await User.find(filter)
    .select(userSelect)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return {
    agents,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getUserById = async (userId: string) => {
  const user = await User.findById(userId).select(userSelect);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  return user;
};

export const updateUserStatus = async (
  currentUserId: string,
  userId: string,
  isActive: boolean
) => {
  if (currentUserId === userId && !isActive) {
    throw new ConflictError("You cannot deactivate your own account");
  }

  const user = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        isActive,
      },
    },
    {
      new: true,
      runValidators: true,
    }
  ).select(userSelect);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  return user;
};

export const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  const isMatch = await bcrypt.compare(
    currentPassword,
    user.password
  );

  if (!isMatch) {
    throw new UnauthorizedError(
      "Current password is incorrect"
    );
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  user.password = hashedPassword;

  await user.save();

  return {
    message: "Password changed successfully",
  };
};

export const updateUserRole = async (
  currentUserId: string,
  userId: string,
  role: "admin" | "customer" | "delivery_agent"
) => {
  if (currentUserId === userId && role !== "admin") {
    throw new ConflictError("You cannot remove your own admin role");
  }

  const user = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        role,
      },
    },
    {
      new: true,
      runValidators: true,
    }
  ).select(userSelect);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  return user;
};
