import SuiteCRMTest from "@/components/SuiteCRMTest";

export default function AdminPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">SuiteCRM Integration</h2>
          <SuiteCRMTest />
        </section>
      </div>
    </div>
  );
}