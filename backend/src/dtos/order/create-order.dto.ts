export interface ShippingAddressDto {
  fullName: string;
  phone: string;

  addressLine1: string;
  addressLine2?: string;

  city: string;
  state: string;
  country: string;

  postalCode: string;
}

export interface CreateOrderDto {
  shippingAddress: ShippingAddressDto;

  paymentMethod: "COD" | "RAZORPAY";
}