import swaggerJsdoc from "swagger-jsdoc";
import { env } from "./env";

const config = env();

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Knottiingale Ecommerce API",
    version: "1.0.0",
    description:
      "Backend API for the Knottiingale handmade ecommerce platform. Includes auth, catalog, cart, orders, payments (Razorpay), coupons, wishlist, reviews, addresses, dashboard and analytics.",
  },
  servers: [
    {
      url: `http://localhost:${config.PORT}/api`,
      description: "Local server",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      Pagination: {
        type: "object",
        properties: {
          total: { type: "number" },
          page: { type: "number" },
          limit: { type: "number" },
          totalPages: { type: "number" },
        },
      },
      Error: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string" },
          requestId: { type: "string" },
        },
      },
      Product: {
        type: "object",
        properties: {
          _id: { type: "string" },
          name: { type: "string" },
          slug: { type: "string" },
          description: { type: "string" },
          price: { type: "number" },
          discountPrice: { type: "number" },
          stock: { type: "number" },
          images: { type: "array", items: { type: "string" } },
          category: { type: "string" },
          isFeatured: { type: "boolean" },
          isActive: { type: "boolean" },
          averageRating: { type: "number" },
          totalReviews: { type: "number" },
        },
      },
      Category: {
        type: "object",
        properties: {
          _id: { type: "string" },
          name: { type: "string" },
          slug: { type: "string" },
          description: { type: "string" },
          image: { type: "string" },
          isActive: { type: "boolean" },
        },
      },
      User: {
        type: "object",
        properties: {
          _id: { type: "string" },
          name: { type: "string" },
          email: { type: "string" },
          role: { type: "string", enum: ["admin", "customer"] },
          phone: { type: "string" },
          isVerified: { type: "boolean" },
          isActive: { type: "boolean" },
        },
      },
      Order: {
        type: "object",
        properties: {
          _id: { type: "string" },
          user: { type: "string" },
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                product: { type: "string" },
                name: { type: "string" },
                image: { type: "string" },
                quantity: { type: "number" },
                price: { type: "number" },
              },
            },
          },
          paymentMethod: { type: "string", enum: ["COD", "RAZORPAY"] },
          paymentStatus: {
            type: "string",
            enum: ["Pending", "Paid", "Failed", "Refunded"],
          },
          orderStatus: {
            type: "string",
            enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
          },
          subtotal: { type: "number" },
          discount: { type: "number" },
          shippingCharge: { type: "number" },
          tax: { type: "number" },
          totalAmount: { type: "number" },
        },
      },
      Payment: {
        type: "object",
        properties: {
          _id: { type: "string" },
          user: { type: "string" },
          order: { type: "string" },
          amount: { type: "number" },
          currency: { type: "string" },
          razorpayOrderId: { type: "string" },
          razorpayPaymentId: { type: "string" },
          status: {
            type: "string",
            enum: ["Pending", "Authorized", "Paid", "Failed", "Refunded"],
          },
          refundId: { type: "string" },
          refundAmount: { type: "number" },
          refundReason: { type: "string" },
        },
      },
      Coupon: {
        type: "object",
        properties: {
          _id: { type: "string" },
          code: { type: "string" },
          description: { type: "string" },
          discountType: { type: "string", enum: ["PERCENTAGE", "FIXED"] },
          discountValue: { type: "number" },
          minimumPurchase: { type: "number" },
          maximumDiscount: { type: "number" },
          usageLimit: { type: "number" },
          usedCount: { type: "number" },
          expiresAt: { type: "string", format: "date-time" },
          isActive: { type: "boolean" },
        },
      },
      Review: {
        type: "object",
        properties: {
          _id: { type: "string" },
          user: { type: "string" },
          product: { type: "string" },
          rating: { type: "number", minimum: 1, maximum: 5 },
          comment: { type: "string" },
          verifiedPurchase: { type: "boolean" },
          isActive: { type: "boolean" },
        },
      },
      Wishlist: {
        type: "object",
        properties: {
          _id: { type: "string" },
          user: { type: "string" },
          products: { type: "array", items: { type: "string" } },
        },
      },
      Address: {
        type: "object",
        properties: {
          _id: { type: "string" },
          fullName: { type: "string" },
          phone: { type: "string" },
          addressLine1: { type: "string" },
          addressLine2: { type: "string" },
          city: { type: "string" },
          state: { type: "string" },
          country: { type: "string" },
          postalCode: { type: "string" },
          isDefault: { type: "boolean" },
        },
      },
    },
  },
};

const options = {
  definition: swaggerDefinition,
  apis: ["./src/routes/**/*.routes.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
