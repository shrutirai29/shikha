import Address from "../../models/address/address.model";
import { AddressDto, UpdateAddressDto } from "../../dtos/address/address.dto";
import { NotFoundError } from "../../errors/NotFoundError";

const clearDefaultAddress = async (userId: string) => {
  await Address.updateMany(
    {
      user: userId,
      isDefault: true,
    },
    {
      $set: {
        isDefault: false,
      },
    }
  );
};

export const createAddress = async (
  userId: string,
  data: AddressDto
) => {
  const existingCount = await Address.countDocuments({
    user: userId,
    isActive: true,
  });

  const shouldBeDefault = data.isDefault || existingCount === 0;

  if (shouldBeDefault) {
    await clearDefaultAddress(userId);
  }

  return await Address.create({
    ...data,
    user: userId,
    isDefault: shouldBeDefault,
  });
};

export const getMyAddresses = async (userId: string) => {
  return await Address.find({
    user: userId,
    isActive: true,
  }).sort({
    isDefault: -1,
    createdAt: -1,
  });
};

export const getAddressById = async (
  userId: string,
  addressId: string
) => {
  const address = await Address.findOne({
    _id: addressId,
    user: userId,
    isActive: true,
  });

  if (!address) {
    throw new NotFoundError("Address not found");
  }

  return address;
};

export const updateAddress = async (
  userId: string,
  addressId: string,
  data: UpdateAddressDto
) => {
  const address = await getAddressById(userId, addressId);

  if (data.isDefault) {
    await clearDefaultAddress(userId);
  }

  Object.assign(address, data);

  await address.save();

  return address;
};

export const setDefaultAddress = async (
  userId: string,
  addressId: string
) => {
  const address = await getAddressById(userId, addressId);

  await clearDefaultAddress(userId);

  address.isDefault = true;

  await address.save();

  return address;
};

export const deleteAddress = async (
  userId: string,
  addressId: string
) => {
  const address = await getAddressById(userId, addressId);

  address.isActive = false;
  address.isDefault = false;

  await address.save();

  const defaultAddress = await Address.findOne({
    user: userId,
    isActive: true,
  }).sort({
    createdAt: -1,
  });

  if (defaultAddress) {
    defaultAddress.isDefault = true;
    await defaultAddress.save();
  }

  return {
    message: "Address deleted successfully",
  };
};
