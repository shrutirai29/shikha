import { Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import * as addressService from "../../services/address/address.service";
import {
  createAddressSchema,
  updateAddressSchema,
} from "../../validators/address/address.validator";

export const createAddress = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const data = createAddressSchema.parse(req.body);

    const address = await addressService.createAddress(
      req.user!._id.toString(),
      data
    );

    res.status(201).json({
      success: true,
      message: "Address created successfully",
      data: address,
    });
  }
);

export const getMyAddresses = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const addresses = await addressService.getMyAddresses(
      req.user!._id.toString()
    );

    res.status(200).json({
      success: true,
      data: addresses,
    });
  }
);

export const getAddressById = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const address = await addressService.getAddressById(
      req.user!._id.toString(),
      req.params.id as string
    );

    res.status(200).json({
      success: true,
      data: address,
    });
  }
);

export const updateAddress = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const data = updateAddressSchema.parse(req.body);

    const address = await addressService.updateAddress(
      req.user!._id.toString(),
      req.params.id as string,
      data
    );

    res.status(200).json({
      success: true,
      message: "Address updated successfully",
      data: address,
    });
  }
);

export const setDefaultAddress = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const address = await addressService.setDefaultAddress(
      req.user!._id.toString(),
      req.params.id as string
    );

    res.status(200).json({
      success: true,
      message: "Default address updated successfully",
      data: address,
    });
  }
);

export const deleteAddress = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const result = await addressService.deleteAddress(
      req.user!._id.toString(),
      req.params.id as string
    );

    res.status(200).json({
      success: true,
      message: result.message,
    });
  }
);
