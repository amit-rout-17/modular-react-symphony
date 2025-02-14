
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [organizationId, setOrganizationId] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (organizationId.trim()) {
      navigate(`/${organizationId}/video-wall`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Flytbase</h1>
          <p className="text-gray-400">Enter your organization details to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-2">
            <label htmlFor="organizationId" className="text-sm font-medium text-gray-300">
              Organization ID
            </label>
            <Input
              id="organizationId"
              type="text"
              value={organizationId}
              onChange={(e) => setOrganizationId(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
              placeholder="Enter your organization ID"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            Continue to Video Wall
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Index;
