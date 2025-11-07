import React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Apple, ArrowRight, ArrowLeft } from "lucide-react";
import { useForm, SubmitHandler } from "react-hook-form";
import dynamic from "next/dynamic";

const AuthAnimations = dynamic(() => import("@/common/LoginSignupWizard/segments/AuthAnimations"), { ssr: false })

interface AuthFormProps {
    defAuthMode: "signup" | "signin";
    setHeaderText: (value: string) => void;
    storeId: string,
    companyId: string
}

type EmailFormData = {
    email: string;
    name?: string;
    phone?: string;
};

type OTPFormData = {
    otp: string;
};

const AuthForm: React.FC<AuthFormProps> = ({ defAuthMode, setHeaderText, storeId, companyId }) => {
    const [step, setStep] = useState<number>(1);
    const [userEmail, setUserEmail] = useState<string>("");
    const [userPhone, setUserPhone] = useState<string>("");
    const [userName, setUserName] = useState<string>("");
    const [authMode, setAuthMode] = useState<"signup" | "signin">(defAuthMode);
    const [showAnimation, setShowAnimation] = useState(false);
    const [animationType, setAnimationType] = useState<'signup' | 'signin'>(defAuthMode);
    const [loading, setLoading] = useState<boolean>(false);
    // react-hook-form setup for email step
    const {
        register: registerEmailForm,
        handleSubmit: handleEmailSubmit,
        reset: resetEmailForm,
        setError: setEmailError,
        formState: { errors: emailErrors },
    } = useForm<EmailFormData>();

    // react-hook-form setup for OTP step
    const {
        register: registerOTPForm,
        handleSubmit: handleOTPSubmit,
        reset: resetOTPForm,
        setError: setOTPError,
        formState: { errors: otpErrors },
    } = useForm<OTPFormData>();

    // Handle email form submission (simplified for ERPNext)
    const onSubmitEmail: SubmitHandler<EmailFormData> = async (formData) => {
        setLoading(true);

        try {
            setUserEmail(formData?.email);
            setUserPhone(formData?.phone || "");
            setUserName(formData?.name || "");

            // For now, just simulate authentication
            // In a real implementation, you would integrate with ERPNext's authentication
            console.log('Authentication with ERPNext not implemented yet');
            
            setStep(2);
            setHeaderText("Verify your Email");
            resetEmailForm();
        } finally {
            setLoading(false);
        }
    };

    // Handle OTP form submission (simplified for ERPNext)
    const onSubmitOTP: SubmitHandler<OTPFormData> = async (data) => {
        setLoading(true);
        try {
            // For now, just simulate OTP verification
            // In a real implementation, you would integrate with ERPNext's authentication
            console.log('OTP verification with ERPNext not implemented yet');
            
            resetOTPForm();
            setAnimationType(authMode);
            setShowAnimation(true);
        } finally {
            setLoading(false);
        }
    };

    // Helper to reset forms and state
    const setStepAndReset = (stepNumber: number) => {
        setStep(stepNumber);
        resetEmailForm();
        resetOTPForm();
        setUserEmail("");
        setUserPhone("");
        setUserName("");
    };

    // Toggle between signup and signin modes
    const toggleAuthMode = () => {
        setHeaderText(
            authMode === "signin" ? "Create an Account" : "Login to your Account"
        );
        setAuthMode(authMode === "signup" ? "signin" : "signup");
        setStepAndReset(1);
    };

    return (
        <div>
            <AuthAnimations
                type={animationType}
                show={showAnimation}
                onComplete={() => {
                    setShowAnimation(false);
                    setStepAndReset(1);
                }}
            />
            {/* Step 1: Email Form */}
            {step === 1 ? (
                <form onSubmit={handleEmailSubmit(onSubmitEmail)} className="space-y-4">
                    {authMode === "signin" ? (
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="Enter your email"
                                {...registerEmailForm("email", {
                                    required: "Email is required",
                                })}
                            />
                            {emailErrors.email && (
                                <p className="text-red-600 text-sm">
                                    {emailErrors.email.message}
                                </p>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    placeholder="Enter your full name"
                                    {...registerEmailForm("name", {
                                        required: "Full name is required",
                                    })}
                                />
                                {emailErrors.name && (
                                    <p className="text-red-600 text-sm">
                                        {emailErrors.name.message}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input
                                    id="phone"
                                    placeholder="Enter your Phone"
                                    {...registerEmailForm("phone", {
                                        required: "Phone is required",
                                    })}
                                />
                                {emailErrors.phone && (
                                    <p className="text-red-600 text-sm">
                                        {emailErrors.phone.message}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Enter your email"
                                    {...registerEmailForm("email", {
                                        required: "Email is required",
                                    })}
                                />
                                {emailErrors.email && (
                                    <p className="text-red-600 text-sm">
                                        {emailErrors.email.message}
                                    </p>
                                )}
                            </div>
                        </>
                    )}

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? (
                            "Sending OTP..."
                        ) : (
                            <>
                                Continue
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                        )}
                    </Button>
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                                Or continue with
                            </span>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Button variant="outline" type="button" className="w-full">
                            <svg
                                className="mr-2 h-4 w-4"
                                aria-hidden="true"
                                focusable="false"
                                data-prefix="fab"
                                data-icon="google"
                                role="img"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 488 512"
                            >
                                <path
                                    fill="currentColor"
                                    d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
                                ></path>
                            </svg>
                            Google
                        </Button>
                        <Button variant="outline" type="button" className="w-full">
                            <Apple className="mr-2 h-4 w-4" />
                            Apple
                        </Button>
                    </div>
                </form>
            ) : (
                /* Step 2: OTP Form */
                <form onSubmit={handleOTPSubmit(onSubmitOTP)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="otp">Enter OTP</Label>
                        <Input
                            id="otp"
                            placeholder="Enter the OTP sent to your email"
                            {...registerOTPForm("otp", { required: "OTP is required" })}
                        />
                        {otpErrors.otp && (
                            <p className="text-red-600 text-sm">{otpErrors.otp.message}</p>
                        )}
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading
                            ? "Verifying..."
                            : authMode === "signin"
                                ? "Verify & Sign In"
                                : "Verify & Sign Up"}
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => setStepAndReset(1)}
                        className="w-full"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                </form>
            )}

            <div className="mt-4 text-center text-sm">
                {authMode === "signup" ? (
                    <p>
                        Already have an account?{" "}
                        <Button variant="link" className="p-0" onClick={toggleAuthMode}>
                            Sign In
                        </Button>
                    </p>
                ) : (
                    <p>
                        Don&apos;t have an account?{" "}
                        <Button variant="link" className="p-0" onClick={toggleAuthMode}>
                            Sign Up
                        </Button>
                    </p>
                )}
            </div>
        </div>
    );
};

export default AuthForm;
