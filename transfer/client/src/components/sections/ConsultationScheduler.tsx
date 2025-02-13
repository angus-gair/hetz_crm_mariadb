import React, { useState } from "react";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { format } from "date-fns";

export const ConsultationScheduler = () => {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState<string>("");

  const availableTimes = [
    "09:00 AM",
    "10:00 AM",
    "11:00 AM",
    "02:00 PM",
    "03:00 PM",
    "04:00 PM",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
  };

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Schedule a Consultation</h2>
          <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>First Name</Label>
                  <Input type="text" placeholder="Enter your first name" />
                </div>
                <div>
                  <Label>Last Name</Label>
                  <Input type="text" placeholder="Enter your last name" />
                </div>
              </div>

              <div>
                <Label>Email</Label>
                <Input type="email" placeholder="Enter your email" />
              </div>

              <div>
                <Label>Phone</Label>
                <Input type="tel" placeholder="Enter your phone number" />
              </div>

              <div>
                <Label>Select Date</Label>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border mt-2"
                />
              </div>

              <div>
                <Label>Select Time</Label>
                <select
                  className="w-full mt-2 p-2 border rounded-md"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                >
                  <option value="">Select a time</option>
                  {availableTimes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <Button type="submit" className="w-full">
                Schedule Consultation
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </section>
  );
};
