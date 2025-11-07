import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import AuthForm from "./segments/AuthForm";

interface LoginSignupWizard {
    defAuthMode: "signup" | "signin";
    open: boolean;
    setOpen: (value: boolean) => void;
    storeId: string,
    companyId: string
}


const LoginSignupWizard: React.FC<LoginSignupWizard> = ({
    open,
    setOpen,
    defAuthMode,
    storeId,
    companyId
}) => {

    const [headerText, setHeaderText] = useState(
        defAuthMode === "signup"
            ? "Create an Account"
            : "Login to your Account"
    );

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-[300px] sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-xl sm:text-2xl font-bold text-center">
                        {headerText}
                    </DialogTitle>
                </DialogHeader>
                <AuthForm
                    defAuthMode={defAuthMode}
                    setHeaderText={setHeaderText}
                    storeId={storeId}
                    companyId={companyId}
                />
            </DialogContent>
        </Dialog>
    );
};

export default LoginSignupWizard;
