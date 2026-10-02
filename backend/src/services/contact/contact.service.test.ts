import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../models/contact/contact.model", () => ({
  default: {
    create: vi.fn(),
    countDocuments: vi.fn(),
    find: vi.fn(),
    findById: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    findByIdAndDelete: vi.fn(),
  },
}));

vi.mock("../email/email.service", () => ({
  sendContactNotificationEmail: vi.fn().mockResolvedValue(undefined),
}));

import ContactMessage from "../../models/contact/contact.model";
import {
  submitContact,
  listContactMessages,
  updateContactMessageStatus,
  deleteContactMessage,
} from "./contact.service";
import { NotFoundError } from "../../errors/NotFoundError";

describe("Contact Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("submitContact", () => {
    it("should create a contact message and send an email notification", async () => {
      const mockPayload = {
        name: "Aarav Sharma",
        email: "aarav@example.com",
        phone: "+91 9876543210",
        subject: "Custom Crochet Plushie",
        message: "Can you make a customized lavender dinosaur plushie?",
      };

      const mockSaved = {
        _id: "contact_123",
        ...mockPayload,
        status: "New",
        createdAt: new Date(),
      };

      (ContactMessage.create as any).mockResolvedValue(mockSaved);

      const result = await submitContact(mockPayload);

      expect(ContactMessage.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Aarav Sharma",
          email: "aarav@example.com",
          subject: "Custom Crochet Plushie",
        })
      );
      expect(result).toEqual(mockSaved);
    });
  });

  describe("listContactMessages", () => {
    it("should return paginated contact messages", async () => {
      const mockMessages = [
        { _id: "1", name: "User 1", subject: "Custom order" },
        { _id: "2", name: "User 2", subject: "Bulk flowers" },
      ];

      (ContactMessage.countDocuments as any).mockResolvedValue(2);
      const queryMock = {
        sort: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue(mockMessages),
      };
      (ContactMessage.find as any).mockReturnValue(queryMock);

      const result = await listContactMessages(1, 10);

      expect(result.messages).toEqual(mockMessages);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
      });
    });
  });

  describe("updateContactMessageStatus", () => {
    it("should update status and notes when inquiry exists", async () => {
      const updated = {
        _id: "contact_123",
        status: "In Progress",
        notes: "Called customer",
      };

      (ContactMessage.findByIdAndUpdate as any).mockResolvedValue(updated);

      const result = await updateContactMessageStatus(
        "contact_123",
        "In Progress",
        "Called customer"
      );

      expect(ContactMessage.findByIdAndUpdate).toHaveBeenCalledWith(
        "contact_123",
        { status: "In Progress", notes: "Called customer" },
        { new: true }
      );
      expect(result).toEqual(updated);
    });

    it("should throw NotFoundError if message is not found", async () => {
      (ContactMessage.findByIdAndUpdate as any).mockResolvedValue(null);

      await expect(
        updateContactMessageStatus("non_existent", "Resolved")
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("deleteContactMessage", () => {
    it("should delete inquiry if found", async () => {
      (ContactMessage.findByIdAndDelete as any).mockResolvedValue({ _id: "contact_123" });

      const result = await deleteContactMessage("contact_123");

      expect(result).toEqual({ message: "Inquiry deleted successfully" });
    });

    it("should throw NotFoundError if message does not exist", async () => {
      (ContactMessage.findByIdAndDelete as any).mockResolvedValue(null);

      await expect(deleteContactMessage("non_existent")).rejects.toThrow(
        NotFoundError
      );
    });
  });
});
