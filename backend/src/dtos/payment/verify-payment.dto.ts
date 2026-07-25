export interface VerifyPaymentDto {
  razorpayOrderId: string;

  razorpayPaymentId: string;

  razorpaySignature: string;
}