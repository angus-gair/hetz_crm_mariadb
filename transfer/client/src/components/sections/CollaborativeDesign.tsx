import React from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { MessageSquare, Users, Share2 } from "lucide-react";

export const CollaborativeDesign = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Design Together</h2>
          <p className="text-xl text-gray-600">
            Collaborate with our design experts and share your vision with stakeholders
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="p-6">
            <MessageSquare className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Real-time Chat</h3>
            <p className="text-gray-600 mb-4">
              Communicate directly with designers through our integrated chat system
            </p>
            <Button variant="outline" className="w-full">
              Start Chat
            </Button>
          </Card>
          <Card className="p-6">
            <Users className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Team Workspace</h3>
            <p className="text-gray-600 mb-4">
              Invite team members and stakeholders to contribute to your design
            </p>
            <Button variant="outline" className="w-full">
              Add Members
            </Button>
          </Card>
          <Card className="p-6">
            <Share2 className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Share Designs</h3>
            <p className="text-gray-600 mb-4">
              Export and share your designs in various formats
            </p>
            <Button variant="outline" className="w-full">
              Share Project
            </Button>
          </Card>
        </div>
      </div>
    </section>
  );
};
