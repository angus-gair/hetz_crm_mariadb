import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";

const timeSlots = [
  "9:00", "9:30", "10:00", "10:30", "11:00", "11:30",
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30"
];

const consultationSchema = z.object({
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must not exceed 50 characters")
    .regex(/^[a-zA-Z\s]*$/, "Name can only contain letters and spaces"),
  email: z.string()
    .email("Please enter a valid email address")
    .min(5, "Email must be at least 5 characters")
    .max(100, "Email must not exceed 100 characters"),
  phone: z.string()
    .min(8, "Phone number must be at least 8 digits")
    .max(15, "Phone number must not exceed 15 digits")
    .regex(/^[0-9+\s-()]*$/, "Please enter a valid phone number"),
  notes: z.string()
    .max(500, "Notes must not exceed 500 characters")
    .optional(),
  preferredDate: z.date({
    required_error: "Please select a date",
    invalid_type_error: "Invalid date format",
  }),
  preferredTime: z.string({
    required_error: "Please select a time slot",
  }).min(1, "Please select a time slot"),
});

type ConsultationData = z.infer<typeof consultationSchema>;

const RequiredLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex items-center gap-1">
    {children}
    <span className="text-red-500">*</span>
  </div>
);

export function ConsultationScheduler() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [date, setDate] = useState<Date>();

  const form = useForm<ConsultationData>({
    resolver: zodResolver(consultationSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      notes: "",
      preferredTime: "",
    },
    mode: "onChange",
  });

  const resetFormState = () => {
    form.reset();
    setDate(undefined);
    setIsSubmitting(false);
  };

  async function onSubmit(data: ConsultationData) {
    if (isSubmitting) return;

    if (!date) {
      toast({
        title: "Error",
        description: "Please select a consultation date",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    if (!data.preferredTime) {
      toast({
        title: "Error",
        description: "Please select a preferred time",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(true);
    console.log('1. Form submitted with data:', {
      ...data,
      preferredDate: date?.toISOString(),
    });

    try {
      const payload = {
        ...data,
        preferredDate: date?.toISOString(),
      };
      console.log('2. Sending API request to /api/schedule-consultation:', payload);

      const response = await fetch("/api/schedule-consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to schedule consultation");
      }

      const responseData = await response.json();
      console.log('3. Received API response:', responseData);

      toast({
        title: "Success!",
        description: responseData.message || "Your consultation has been scheduled.",
      });

      resetFormState();
    } catch (error) {
      console.error('4. Consultation scheduling error:', error);

      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive",
      });

      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full">
      <div className="container px-4 md:px-6 max-w-7xl mx-auto">
        <div className="flex flex-col items-center justify-center space-y-6 text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
            Schedule a Consultation
          </h2>
          <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            Book a free consultation with our design experts to discuss your dream cubby house
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold mb-6">
                    <RequiredLabel>Date & Time</RequiredLabel>
                  </h3>
                  <FormField
                    control={form.control}
                    name="preferredDate"
                    render={({ field }) => (
                      <FormItem>
                        <div className="p-6 border rounded-md shadow-sm">
                          <Calendar
                            mode="single"
                            selected={date}
                            onSelect={(date) => {
                              setDate(date);
                              field.onChange(date);
                            }}
                            disabled={(date) => {
                              const day = date.getDay();
                              const today = new Date();
                              today.setHours(0, 0, 0, 0);
                              return date < today || day === 0 || day === 6;
                            }}
                            className="w-full [&_.rdp-months]:w-full [&_.rdp-month]:w-full [&_.rdp-table]:w-full"
                          />
                        </div>
                        <FormMessage className="mt-2 text-sm text-red-500" />
                      </FormItem>
                    )}
                  />
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-6">
                    <RequiredLabel>Available Time Slots</RequiredLabel>
                  </h3>
                  <FormField
                    control={form.control}
                    name="preferredTime"
                    render={({ field }) => (
                      <FormItem>
                        <div className="p-6 border rounded-md shadow-sm">
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="grid grid-cols-3 gap-3"
                          >
                            {timeSlots.map((time) => (
                              <FormItem key={time}>
                                <FormControl>
                                  <RadioGroupItem
                                    value={time}
                                    className="peer sr-only"
                                    id={`time-${time}`}
                                  />
                                </FormControl>
                                <FormLabel
                                  htmlFor={`time-${time}`}
                                  className="flex h-10 w-full items-center justify-center rounded-md border-2 border-muted bg-popover px-3 text-sm hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                                >
                                  {time}
                                </FormLabel>
                              </FormItem>
                            ))}
                          </RadioGroup>
                        </div>
                        <FormMessage className="mt-2 text-sm text-red-500" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="border rounded-md p-8 shadow-sm">
                <h3 className="text-lg font-semibold mb-6">Your Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          <RequiredLabel>Name</RequiredLabel>
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Your full name" 
                            {...field} 
                            className={`${
                              form.formState.errors.name ? 'border-red-500 focus:ring-red-500' : 
                              field.value ? 'border-green-500 focus:ring-green-500' : ''
                            }`}
                          />
                        </FormControl>
                        <FormMessage className="mt-1 text-sm text-red-500" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          <RequiredLabel>Phone</RequiredLabel>
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="tel" 
                            placeholder="Your phone number" 
                            {...field}
                            className={`${
                              form.formState.errors.phone ? 'border-red-500 focus:ring-red-500' : 
                              field.value ? 'border-green-500 focus:ring-green-500' : ''
                            }`}
                          />
                        </FormControl>
                        <FormMessage className="mt-1 text-sm text-red-500" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          <RequiredLabel>Email</RequiredLabel>
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="email" 
                            placeholder="your@email.com" 
                            {...field}
                            className={`${
                              form.formState.errors.email ? 'border-red-500 focus:ring-red-500' : 
                              field.value ? 'border-green-500 focus:ring-green-500' : ''
                            }`}
                          />
                        </FormControl>
                        <FormMessage className="mt-1 text-sm text-red-500" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Notes (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Any special requirements or questions" 
                            {...field}
                            className={`${
                              form.formState.errors.notes ? 'border-red-500 focus:ring-red-500' : 
                              field.value ? 'border-green-500 focus:ring-green-500' : ''
                            }`}
                          />
                        </FormControl>
                        <FormMessage className="mt-1 text-sm text-red-500" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className={`w-full h-11 text-base bg-black text-white hover:bg-gray-800 ${
                  !form.formState.isValid || Object.keys(form.formState.dirtyFields).length === 0
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
                disabled={isSubmitting || !form.formState.isValid || Object.keys(form.formState.dirtyFields).length === 0}
              >
                {isSubmitting ? "Scheduling..." : 
                  !form.formState.isValid && Object.keys(form.formState.dirtyFields).length > 0 
                    ? "Please Fill All Required Fields"
                    : "Schedule Consultation"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}