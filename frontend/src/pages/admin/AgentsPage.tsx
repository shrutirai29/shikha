import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Truck, UserPlus } from "lucide-react";
import { useCreateDeliveryAgent, useDeliveryAgents } from "@/hooks/useApi";
import { useToast } from "@/context/ToastContext";
import { getErrorMessage } from "@/lib/api";
import { Badge, Card, PageLoader } from "@/components/ui/Card";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const agentSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Enter a valid email address"),
  phone: z
    .string()
    .min(10, "Phone must be at least 10 digits")
    .max(15, "Phone is too long"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type AgentForm = z.infer<typeof agentSchema>;

export const AgentsPage = () => {
  const toast = useToast();
  const createAgent = useCreateDeliveryAgent();
  const { data: agents, isLoading, isError, error, refetch } = useDeliveryAgents();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AgentForm>({
    resolver: zodResolver(agentSchema),
    defaultValues: { name: "", email: "", phone: "", password: "" },
  });

  const onSubmit = async (values: AgentForm) => {
    try {
      await createAgent.mutateAsync(values);
      toast.success("Delivery agent created");
      reset();
    } catch (createError) {
      toast.error(getErrorMessage(createError));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          <Truck className="size-6 text-indigo-600 dark:text-indigo-400" />
          Delivery agents
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Create and manage the people who deliver orders
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <Card className="h-fit p-5">
          <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-white">
            <UserPlus className="size-4.5 text-indigo-600 dark:text-indigo-400" />
            New agent
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <Input
              label="Full name"
              placeholder="Rahul Kumar"
              error={errors.name?.message}
              {...register("name")}
            />
            <Input
              label="Email"
              type="email"
              placeholder="agent@shikha.store"
              error={errors.email?.message}
              {...register("email")}
            />
            <Input
              label="Phone"
              type="tel"
              placeholder="+91 98765 43210"
              error={errors.phone?.message}
              {...register("phone")}
            />
            <Input
              label="Password"
              type="password"
              placeholder="Minimum 6 characters"
              error={errors.password?.message}
              {...register("password")}
            />
            <Button type="submit" className="w-full" loading={isSubmitting}>
              Create agent
            </Button>
          </form>
        </Card>

        <Card className="overflow-hidden">
          {isLoading ? (
            <PageLoader />
          ) : isError ? (
            <div className="p-6">
              <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />
            </div>
          ) : !agents || agents.length === 0 ? (
            <EmptyState
              icon={<Truck className="size-7" />}
              title="No delivery agents yet"
              description="Create an agent and assign orders to them from the Orders page."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400 dark:border-slate-700">
                    <th className="px-5 py-3 font-semibold">Name</th>
                    <th className="px-5 py-3 font-semibold">Email</th>
                    <th className="px-5 py-3 font-semibold">Phone</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {agents.map((agent) => (
                    <tr
                      key={agent._id}
                      className="border-b border-slate-100 last:border-0 dark:border-slate-700/60"
                    >
                      <td className="px-5 py-3 font-semibold text-slate-900 dark:text-white">
                        {agent.name}
                      </td>
                      <td className="px-5 py-3 text-slate-600 dark:text-slate-300">
                        {agent.email}
                      </td>
                      <td className="px-5 py-3 text-slate-600 dark:text-slate-300">
                        {agent.phone ?? "—"}
                      </td>
                      <td className="px-5 py-3">
                        <Badge variant={agent.isActive ? "success" : "danger"}>
                          {agent.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AgentsPage;
