import ContactMessage from "../../models/contact/contact.model";
import { NotFoundError } from "../../errors/NotFoundError";
import { escapeRegex } from "../../utils/regex.util";
import { sendContactNotificationEmail } from "../email/email.service";

export interface CreateContactDto {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export const submitContact = async (data: CreateContactDto) => {
  const contact = await ContactMessage.create({
    name: data.name,
    email: data.email,
    phone: data.phone,
    subject: data.subject,
    message: data.message,
    status: "New",
  });

  // Non-blocking email dispatch to notify owner and acknowledge customer
  sendContactNotificationEmail(data).catch((err) => {
    console.error("[contact:email] failed to send notification:", err);
  });

  return contact;
};

export const listContactMessages = async (
  page = 1,
  limit = 10,
  status?: string,
  search?: string
) => {
  const filter: any = {};

  if (status && ["New", "In Progress", "Resolved"].includes(status)) {
    filter.status = status;
  }

  if (search) {
    const escaped = escapeRegex(search);
    filter.$or = [
      { name: { $regex: escaped, $options: "i" } },
      { email: { $regex: escaped, $options: "i" } },
      { subject: { $regex: escaped, $options: "i" } },
      { message: { $regex: escaped, $options: "i" } },
    ];
  }

  const total = await ContactMessage.countDocuments(filter);
  const messages = await ContactMessage.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return {
    messages,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const updateContactMessageStatus = async (
  id: string,
  status: "New" | "In Progress" | "Resolved",
  notes?: string
) => {
  const updatePayload: any = { status };
  if (notes !== undefined) {
    updatePayload.notes = notes;
  }

  const message = await ContactMessage.findByIdAndUpdate(id, updatePayload, {
    new: true,
  });

  if (!message) {
    throw new NotFoundError("Contact inquiry not found");
  }

  return message;
};

export const deleteContactMessage = async (id: string) => {
  const message = await ContactMessage.findByIdAndDelete(id);

  if (!message) {
    throw new NotFoundError("Contact inquiry not found");
  }

  return { message: "Inquiry deleted successfully" };
};
