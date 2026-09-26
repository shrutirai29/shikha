import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Banknote, CreditCard, MapPin, ShieldCheck } from "lucide-react";
import { api, getErrorMessage } from "@/lib/api";
import { useCart, useAddresses } from "@/hooks/useApi";
import { useToast } from "@/context/ToastContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/States";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageLoader } from "@/components/ui/Card";
import { cn, formatCurrency } from "@/lib/utils";
import type { Address } from "@/types";

const checkoutSchema = z.object({
  fullName: z.string().min(2, "Full name is required").max(80),
  phone: z.string().min(10, "Enter a valid phone number").max(15),
  addressLine1: z.string().min(5, "Address is required").max(150),
  addressLine2: z.string().max(150).optional().or(z.literal("")),
  city: z.string().min(2, "City is required").max(80),
  state: z.string().min(2, "State is required").max(80),
  country: z.string().min(2, "Country is required").max(80),
  postalCode: z.string().min(4, "Postal code is required").max(10),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export const CheckoutPage = () => {
  const { data: cart, isLoading: cartLoading } = useCart();
  const { data: addresses, isLoading: addressesLoading } = useAddresses();
  const toast = useToast();
  const navigate = useNavigate();

  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "RAZORPAY">("COD");
  const [placing, setPlacing] = useState(false);
  const [useNewAddress, setUseNewAddress] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
  });

  useEffect(() => {
    if (!selectedAddress && addresses && addresses.length > 0 && !useNewAddress) {
      const defaultAddress =
        addresses.find((address) => address.isDefault) ?? addresses[0];

      setSelectedAddress(defaultAddress);
    }
  }, [addresses, selectedAddress, useNewAddress]);

  if (cartLoading || addressesLoading) {
    return <PageLoader />;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <PageLayout title="Checkout">
        <EmptyState
          title="Your cart is empty"
          description="Add items to your cart before checking out."
          action={
            <Link to="/products">
              <Button>Browse products</Button>
            </Link>
          }
        />
      </PageLayout>
    );
  }

  const discountedSubtotal = cart.finalAmount;
  const shipping = discountedSubtotal >= 500 ? 0 : 50;
  const tax = Number((discountedSubtotal * 0.18).toFixed(2));
  const totalAmount = discountedSubtotal + shipping + tax;

  const buildShippingAddress = (values: CheckoutForm) => ({
    fullName: values.fullName,
    phone: values.phone,
    addressLine1: values.addressLine1,
    addressLine2: values.addressLine2 || undefined,
    city: values.city,
    state: values.state,
    country: values.country,
    postalCode: values.postalCode,
  });

  const placeOrder = async (
    shippingAddress: {
      fullName: string;
      phone: string;
      addressLine1: string;
      addressLine2?: string;
      city: string;
      state: string;
      country: string;
      postalCode: string;
    }
  ) => {
    setPlacing(true);

    try {
      const { data } = await api.post<{
        success: boolean;
        data: { _id: string; paymentMethod: string };
      }>("/orders", {
        shippingAddress,
        paymentMethod,
      });

      toast.success("Order placed successfully");

      if (data.data.paymentMethod === "RAZORPAY") {
        navigate(`/payment/${data.data._id}`);
      } else {
        navigate(`/orders/${data.data._id}`);
      }
    } catch (orderError) {
      toast.error(getErrorMessage(orderError));
    } finally {
      setPlacing(false);
    }
  };

  const onAddressSubmit = (values: CheckoutForm) => {
    void placeOrder(buildShippingAddress(values));
  };

  return (
    <PageLayout title="Checkout" subtitle="Review your order and choose delivery">
      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          {/* Address selection */}
          <Card className="p-5">
            <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-[#3B2924] dark:text-[#FFF4E8]">
              <MapPin className="size-4.5 text-[#B85C4A] dark:text-[#D47763]" />
              Delivery address
            </h2>

            {addresses && addresses.length > 0 && !useNewAddress ? (
              <>
                <div className="space-y-2">
                  {addresses.map((address) => (
                    <button
                      key={address._id}
                      type="button"
                      onClick={() => setSelectedAddress(address)}
                      className={cn(
                        "w-full rounded-xl border-2 p-4 text-left transition",
                        selectedAddress?._id === address._id
                          ? "border-[#B85C4A] bg-[#B85C4A]/5 dark:border-[#D47763] dark:bg-[#D47763]/10"
                          : "border-[#E8DCD0] bg-[#FFFCF7] hover:border-[#B85C4A]/40 dark:border-[#493A34] dark:bg-[#2A211E] dark:hover:border-[#D47763]/40"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-[#3B2924] dark:text-[#FFF4E8]">
                          {address.fullName}
                          {address.isDefault && (
                            <span className="ml-2 rounded-full bg-[#7A8B68]/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#7A8B68] dark:bg-[#9BAF83]/20 dark:text-[#9BAF83]">
                              Default
                            </span>
                          )}
                        </p>
                        <span className="text-xs text-[#806E66] dark:text-[#C7B8AE]">{address.phone}</span>
                      </div>
                      <p className="mt-1 text-sm text-[#806E66] dark:text-[#C7B8AE]">
                        {address.addressLine1}
                        {address.addressLine2 ? `, ${address.addressLine2}` : ""}
                        <br />
                        {address.city}, {address.state} — {address.postalCode}, {address.country}
                      </p>
                    </button>
                  ))}
                </div>
                <div className="mt-3 flex justify-between">
                  <Link
                    to="/addresses"
                    className="text-sm font-medium text-[#B85C4A] hover:text-[#914536] dark:text-[#D47763] dark:hover:text-[#E28A76]"
                  >
                    Manage addresses
                  </Link>
                  <button
                    type="button"
                    onClick={() => setUseNewAddress(true)}
                    className="text-sm font-medium text-[#B85C4A] hover:text-[#914536] dark:text-[#D47763] dark:hover:text-[#E28A76]"
                  >
                    Use a new address
                  </button>
                </div>
              </>
            ) : (
              <form
                onSubmit={handleSubmit(onAddressSubmit)}
                className="grid gap-4 sm:grid-cols-2"
                noValidate
              >
                <Input label="Full name" error={errors.fullName?.message} {...register("fullName")} />
                <Input label="Phone" type="tel" error={errors.phone?.message} {...register("phone")} />
                <div className="sm:col-span-2">
                  <Input label="Address line 1" error={errors.addressLine1?.message} {...register("addressLine1")} />
                </div>
                <div className="sm:col-span-2">
                  <Input label="Address line 2 (optional)" error={errors.addressLine2?.message} {...register("addressLine2")} />
                </div>
                <Input label="City" error={errors.city?.message} {...register("city")} />
                <Input label="State" error={errors.state?.message} {...register("state")} />
                <Input label="Country" defaultValue="India" error={errors.country?.message} {...register("country")} />
                <Input label="Postal code" error={errors.postalCode?.message} {...register("postalCode")} />
                {addresses && addresses.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setUseNewAddress(false);
                      reset();
                    }}
                    className="text-sm font-medium text-[#B85C4A] hover:text-[#914536] dark:text-[#D47763] dark:hover:text-[#E28A76]"
                  >
                    Back to saved addresses
                  </button>
                )}
                <Button type="submit" className="sm:col-span-2" loading={placing}>
                  Continue to payment
                </Button>
              </form>
            )}
          </Card>

          {/* Payment method */}
          <Card className="p-5">
            <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-[#3B2924] dark:text-[#FFF4E8]">
              <CreditCard className="size-4.5 text-[#B85C4A] dark:text-[#D47763]" />
              Payment method
            </h2>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setPaymentMethod("COD")}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border-2 p-4 text-left transition",
                  paymentMethod === "COD"
                    ? "border-[#B85C4A] bg-[#B85C4A]/5 dark:border-[#D47763] dark:bg-[#D47763]/10"
                    : "border-[#E8DCD0] bg-[#FFFCF7] hover:border-[#B85C4A]/40 dark:border-[#493A34] dark:bg-[#2A211E] dark:hover:border-[#D47763]/40"
                )}
              >
                <Banknote className="size-5 text-[#806E66] dark:text-[#C7B8AE]" />
                <div>
                  <p className="text-sm font-semibold text-[#3B2924] dark:text-[#FFF4E8]">
                    Cash on Delivery
                  </p>
                  <p className="text-xs text-[#806E66] dark:text-[#C7B8AE]">
                    Pay when your order arrives
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("RAZORPAY")}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border-2 p-4 text-left transition",
                  paymentMethod === "RAZORPAY"
                    ? "border-[#B85C4A] bg-[#B85C4A]/5 dark:border-[#D47763] dark:bg-[#D47763]/10"
                    : "border-[#E8DCD0] bg-[#FFFCF7] hover:border-[#B85C4A]/40 dark:border-[#493A34] dark:bg-[#2A211E] dark:hover:border-[#D47763]/40"
                )}
              >
                <ShieldCheck className="size-5 text-[#806E66] dark:text-[#C7B8AE]" />
                <div>
                  <p className="text-sm font-semibold text-[#3B2924] dark:text-[#FFF4E8]">
                    Pay online (Razorpay)
                  </p>
                  <p className="text-xs text-[#806E66] dark:text-[#C7B8AE]">
                    UPI, cards, net banking & wallets
                  </p>
                </div>
              </button>
            </div>
          </Card>

          {!useNewAddress && addresses && addresses.length > 0 && selectedAddress && (
            <Button
              size="lg"
              className="w-full lg:hidden"
              onClick={() => placeOrder(selectedAddress)}
              loading={placing}
            >
              Place order · {formatCurrency(totalAmount)}
            </Button>
          )}
        </div>

        {/* Summary */}
        <div className="h-fit space-y-4 lg:sticky lg:top-24">
          <Card className="p-5">
            <h2 className="mb-4 text-base font-semibold text-[#3B2924] dark:text-[#FFF4E8]">
              Order summary
            </h2>

            <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
              {cart.items.map((item) => {
                const product = item.product as {
                  _id: string;
                  name: string;
                  slug: string;
                  images: string[];
                };

                return (
                  <div key={product._id} className="flex items-center gap-3">
                    <div className="size-12 shrink-0 overflow-hidden rounded-lg bg-[#F5EDE4] dark:bg-[#352925]">
                      {product.images[0] ? (
                        <img src={product.images[0]} alt="" className="size-full object-cover" />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[#3B2924] dark:text-[#FFF4E8]">
                        {product.name}
                      </p>
                      <p className="text-xs text-[#806E66] dark:text-[#C7B8AE]">Qty {item.quantity}</p>
                    </div>
                    <span className="text-sm font-semibold text-[#3B2924] dark:text-[#FFF4E8]">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                );
              })}
            </div>

            <dl className="mt-4 space-y-2.5 border-t border-[#E8DCD0] pt-4 text-sm dark:border-[#493A34]">
              <div className="flex justify-between text-[#806E66] dark:text-[#C7B8AE]">
                <dt>Subtotal</dt>
                <dd>{formatCurrency(cart.totalAmount)}</dd>
              </div>
              {cart.discount > 0 && (
                <div className="flex justify-between text-[#7A8B68] dark:text-[#9BAF83]">
                  <dt>Discount</dt>
                  <dd>−{formatCurrency(cart.discount)}</dd>
                </div>
              )}
              <div className="flex justify-between text-[#806E66] dark:text-[#C7B8AE]">
                <dt>Shipping</dt>
                <dd>{shipping === 0 ? "Free" : formatCurrency(shipping)}</dd>
              </div>
              <div className="flex justify-between text-[#806E66] dark:text-[#C7B8AE]">
                <dt>Estimated GST / Tax (18%)</dt>
                <dd>{formatCurrency(tax)}</dd>
              </div>
              <div className="flex justify-between border-t border-[#E8DCD0] pt-2.5 text-base font-bold text-[#3B2924] dark:border-[#493A34] dark:text-[#FFF4E8]">
                <dt>Total</dt>
                <dd>{formatCurrency(totalAmount)}</dd>
              </div>
            </dl>

            {!useNewAddress && addresses && addresses.length > 0 && selectedAddress ? (
              <Button
                size="lg"
                className="mt-4 hidden w-full lg:flex"
                onClick={() => placeOrder(selectedAddress)}
                loading={placing}
              >
                Place order · {formatCurrency(totalAmount)}
              </Button>
            ) : null}
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

export default CheckoutPage;
