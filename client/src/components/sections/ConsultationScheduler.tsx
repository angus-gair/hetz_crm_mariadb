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
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  notes: z.string().optional(),
  preferredDate: z.date({
    required_error: "Please select a date",
  }),
  preferredTime: z.string().min(1, "Please select a time slot"),
});

type ConsultationData = z.infer<typeof consultationSchema>;

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
  });

  async function onSubmit(data: ConsultationData) {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/schedule-consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          preferredDate: date?.toISOString(),
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        if (response.status === 503) {
          throw new Error("Our scheduling system is temporarily unavailable. Please try again later or contact us directly.");
        } else if (response.status === 400) {
          throw new Error("Please fill in all required fields.");
        } else {
          throw new Error(responseData.message || "Failed to schedule consultation");
        }
      }

      toast({
        title: "Success!",
        description: "Your consultation has been scheduled. We'll contact you soon.",
      });

      form.reset();
      setDate(undefined);
    } catch (error) {
      console.error('Consultation scheduling error:', error);
      toast({
        title: "Unable to Schedule",
        description: error instanceof Error ? error.message : "Failed to schedule consultation. Please try again.",
        variant: "destructive",
      });
    } finally {
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
              {/* Calendar and Time Slots */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Calendar */}
                <div>
                  <h3 className="text-lg font-semibold mb-6">Date & Time</h3>
                  <FormField
                    control={form.control}
                    name="preferredDate"
                    render={({ field }) => (
                      <FormItem>
                        <div className="p-6 border rounded-md shadow-sm">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => {
                              field.onChange(date);
                              setDate(date);
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Time Slots */}
                <div>
                  <h3 className="text-lg font-semibold mb-6">Available Time Slots</h3>
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Your Information */}
              <div className="border rounded-md p-8 shadow-sm">
                <h3 className="text-lg font-semibold mb-6">Your Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Phone</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="Your phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="your@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
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
                          <Input placeholder="Any special requirements or questions" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-11 text-base" disabled={isSubmitting}>
                {isSubmitting ? "Scheduling..." : "Schedule Consultation"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}