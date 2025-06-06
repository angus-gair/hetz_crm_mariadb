import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useMutation } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"

// Align schema with API expectations
const formSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string()
    .min(8, "Phone number must be at least 8 digits")
    .max(15, "Phone number must not exceed 15 digits")
    .regex(/^[0-9+\s-()]*$/, "Please enter a valid phone number")
    .optional(),
  notes: z.string().max(500, "Notes must not exceed 500 characters").optional(),
  marketingConsent: z.boolean().default(false),
  leadSource: z.string().default("Website")
})

type FormValues = z.infer<typeof formSchema>

export default function ContactForm() {
  const { toast } = useToast()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      notes: "",
      marketingConsent: false,
      leadSource: "Website"
    },
  })

  const mutation = useMutation({
    mutationFn: async (data: FormValues) => {
      console.log('=== Contact Form Submission ===');
      console.log('Form data being submitted:', data);

      try {
        console.log('Making request to SuiteCRM lead endpoint...');
        const response = await fetch('/api/crm/leads', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
            message: data.notes,
            company: 'Website Lead'
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Form submission failed:', errorData);
          throw new Error(errorData.message || 'Failed to submit form');
        }

        const result = await response.json();
        console.log('Lead creation successful:', result);
        return result;
      } catch (error) {
        console.error('Lead creation error:', error);
        if (error instanceof Error) {
          throw error;
        }
        throw new Error('An unexpected error occurred');
      }
    },
    onSuccess: (data) => {
      console.log('Mutation succeeded with data:', data);
      toast({
        title: "Thanks for your interest!",
        description: data.message || "Your information has been sent to our sales team. We'll be in touch with you shortly!",
      })
      form.reset()
    },
    onError: (error: Error) => {
      console.error('Mutation failed:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit form. Please try again.",
        variant: "destructive",
      })
    },
  })

  const onSubmit = (data: FormValues) => {
    mutation.mutate(data)
  }

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md space-y-6">
        <h2 className="text-2xl font-bold text-center">Contact Us</h2>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input {...field} className={`${
                      form.formState.errors.firstName ? 'border-red-500' :
                      field.value ? 'border-green-500' : ''
                    }`} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input {...field} className={`${
                      form.formState.errors.lastName ? 'border-red-500' :
                      field.value ? 'border-green-500' : ''
                    }`} />
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
                    <Input type="email" {...field} className={`${
                      form.formState.errors.email ? 'border-red-500' :
                      field.value ? 'border-green-500' : ''
                    }`} />
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
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input type="tel" {...field} className={`${
                      form.formState.errors.phone ? 'border-red-500' :
                      field.value ? 'border-green-500' : ''
                    }`} />
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
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea {...field} className={`${
                      form.formState.errors.notes ? 'border-red-500' :
                      field.value ? 'border-green-500' : ''
                    }`} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="marketingConsent"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      I consent to receiving marketing information
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Submitting..." : "Submit"}
            </Button>
          </form>
        </Form>
      </div>
    </section>
  )
}