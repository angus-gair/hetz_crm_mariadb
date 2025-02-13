import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function TeamSection() {
  const team = [
    {
      initial: "S",
      name: "Sarah Johnson",
      role: "Lead Designer",
      description: "With 15 years of architectural experience, Sarah brings creativity and innovation to every design."
    },
    {
      initial: "M",
      name: "Mike Thompson",
      role: "Master Craftsman",
      description: "Mike ensures every cubby house meets our high standards of quality and safety."
    },
    {
      initial: "E",
      name: "Emily Chen",
      role: "Customer Experience",
      description: "Emily works closely with families to bring their dream playhouse visions to life."
    }
  ];

  return (
    <section id="about" className="w-full py-12 md:py-24 lg:py-32 bg-background">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
            Meet Our Team
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {team.map((member) => (
            <div key={member.name} className="flex flex-col items-center space-y-4 text-center">
              <Avatar className="h-24 w-24 bg-gray-200">
                <AvatarFallback className="text-2xl">{member.initial}</AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <h3 className="font-semibold">{member.name}</h3>
                <p className="text-sm text-muted-foreground">{member.role}</p>
                <p className="text-sm text-gray-500">{member.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
