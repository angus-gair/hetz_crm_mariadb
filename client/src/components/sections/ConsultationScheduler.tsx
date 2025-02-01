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
import { MapPin, Video } from "lucide-react";
import { format } from "date-fns";

const timeSlots = [
  "9:00", "9:30", "10:00", "10:30", "11:00", "11:30",
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30"
];

const consultationSchema = z.object({
  consultationType: z.enum(["onsite", "video"], {
    required_error: "Please select a consultation type",
  }),
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
      consultationType: "onsite",
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
    <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-8">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
            Schedule a Consultation
          </h2>
          <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed">
            Book a free consultation with our design experts to discuss your dream cubby house
          </p>
        </div>

        <div className="mx-auto max-w-4xl">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Consultation Type Selection */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Select Consultation Type</h3>
                <FormField
                  control={form.control}
                  name="consultationType"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid grid-cols-2 gap-4"
                        >
                          <FormItem>
                            <FormControl>
                              <RadioGroupItem
                                value="onsite"
                                className="peer sr-only"
                                id="onsite"
                              />
                            </FormControl>
                            <FormLabel
                              htmlFor="onsite"
                              className="flex flex-col items-center justify-center h-24 rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                            >
                              <div className="flex items-center space-x-2">
                                <MapPin className="h-5 w-5" />
                                <span className="font-medium">On-site Visit</span>
                              </div>
                              <span className="text-sm text-muted-foreground mt-1">We'll visit your location</span>
                            </FormLabel>
                          </FormItem>

                          <FormItem>
                            <FormControl>
                              <RadioGroupItem
                                value="video"
                                className="peer sr-only"
                                id="video"
                              />
                            </FormControl>
                            <FormLabel
                              htmlFor="video"
                              className="flex flex-col items-center justify-center h-24 rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                            >
                              <div className="flex items-center space-x-2">
                                <Video className="h-5 w-5" />
                                <span className="font-medium">Video Call</span>
                              </div>
                              <span className="text-sm text-muted-foreground mt-1">Online consultation</span>
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Date & Time Selection */}
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  {/* Calendar */}
                  <div className="w-full">
                    <h3 className="text-lg font-semibold mb-4">Date & Time</h3>
                    <FormField
                      control={form.control}
                      name="preferredDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col w-full">
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
                            className="rounded-md border shadow-sm w-full"
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Time Slots */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Available Time Slots</h3>
                    <FormField
                      control={form.control}
                      name="preferredTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="grid grid-cols-3 gap-2"
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
                                    className="flex h-9 w-full items-center justify-center rounded-md border-2 border-muted bg-popover px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
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
                  </div>
                </div>

                {/* Your Information - Two Columns */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Your Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
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
                          <FormLabel>Phone</FormLabel>
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
                          <FormLabel>Email</FormLabel>
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
                          <FormLabel>Notes (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Any special requirements or questions" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

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