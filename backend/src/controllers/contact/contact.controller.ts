import { Request, Response, NextFunction } from "express";
import * as contactService from "../../services/contact/contact.service";

export const postContactMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const contact = await contactService.submitContact(req.body);

    res.status(201).json({
      success: true,
      message: "Thank you! Your message has been received. We will get back to you shortly.",
      data: contact,
    });
  } catch (error) {
    next(error);
  }
};

export const getContactMessages = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 10));
    const status = req.query.status as string | undefined;
    const search = req.query.search as string | undefined;

    const result = await contactService.listContactMessages(
      page,
      limit,
      status,
      search
    );

    res.status(200).json({
      success: true,
      messages: result.messages,
      data: result.messages,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const patchContactMessageStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id as string;
    const { status, notes } = req.body;

    const updated = await contactService.updateContactMessageStatus(
      id,
      status,
      notes
    );

    res.status(200).json({
      success: true,
      message: "Inquiry status updated",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const removeContactMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id as string;

    const result = await contactService.deleteContactMessage(id);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};
