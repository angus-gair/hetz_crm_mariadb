import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { crmConfig } from "@/config";
import { format } from "date-fns";

const consultationTypes = [
  { id: "initial", label: "Initial Consultation (30 mins)" },
  { id: "detailed", label: "Detailed Planning (1 hour)" },
  { id: "followup", label: "Follow-up Meeting (45 mins)" }
];

const timeSlots = [
  "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"
];

const consultationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  message: z.string().optional(),
  consultationType: z.enum(["initial", "detailed", "followup"], {
    required_error: "Please select a consultation type",
  }),
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
      message: "",
      consultationType: "initial",
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
          preferredDate: format(data.preferredDate, "yyyy-MM-dd"),
        }),
      });

      if (!response.ok) throw new Error("Failed to schedule consultation");

      toast({
        title: "Success!",
        description: "Your consultation has been scheduled. We'll contact you soon.",
      });
      
      form.reset();
      setDate(undefined);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to schedule consultation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section id="consultation" className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
            Schedule a Consultation
          </h2>
          <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            Let's discuss how we can help you achieve your goals
          </p>
        </div>
        
        <div className="mx-auto max-w-lg mt-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="consultationType"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Consultation Type</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        {consultationTypes.map((type) => (
                          <FormItem
                            key={type.id}
                            className="flex items-center space-x-3 space-y-0"
                          >
                            <FormControl>
                              <RadioGroupItem value={type.id} />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {type.label}
                            </FormLabel>
                          </FormItem>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
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
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input type="tel" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="preferredDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Preferred Date</FormLabel>
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date) => {
                        field.onChange(date);
                        setDate(date);
                      }}
                      disabled={(date) => {
                        // Disable weekends and past dates
                        const day = date.getDay();
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        return date < today || day === 0 || day === 6;
                      }}
                      className="rounded-md border"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="preferredTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Time</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid grid-cols-2 gap-2"
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
                              className="flex h-10 w-full items-center justify-center rounded-md border-2 border-muted bg-popover px-3 py-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                            >
                              {time}
                            </FormLabel>
                          </FormItem>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message (Optional)</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Scheduling..." : "Schedule Consultation"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </section>
  );
}
