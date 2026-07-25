import User from "../../models/auth/auth.model";
import { UpdateProfileDto } from "../../dtos/user/update-profile.dto";
import { IUserListQuery } from "../../interfaces/user/user.interface";
import { NotFoundError } from "../../errors/NotFoundError";
import { ConflictError } from "../../errors/ConflictError";

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

export const updateUserRole = async (
  currentUserId: string,
  userId: string,
  role: "admin" | "customer"
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
