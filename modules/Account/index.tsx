"use client"

import Link from "next/link";
import { Button } from "@/components/ui/button";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
// Removed Nhost authentication - using mock authentication for now
import UserPopover from "./segments/UserPopover";
import LoginSignupWizard from "@/common/LoginSignupWizard";

interface UserWizardProps {
    storeId: string
    companyId: string
}

const UserWizard = ({ storeId, companyId }: UserWizardProps) => {

    const [open, setOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    // Mock authentication state - in a real implementation, you'd get this from your auth system
    const isAuthenticated = false;

    useEffect(() => {
        setMounted(true);
    }, []);

    // Don't render anything until mounted to avoid SSR issues
    if (!mounted) {
        return (
            <Button variant="outline" disabled>
                Loading...
            </Button>
        );
    }

    return (
        <>
            {!isAuthenticated ? (
                <Button variant="outline" onClick={() => setOpen(true)}>
                    Login
                </Button>
            ) : (
                <UserPopover />
            )}
            {!isAuthenticated && (
                <LoginSignupWizard
                    open={open}
                    setOpen={setOpen}
                    defAuthMode="signin"
                    storeId={storeId}
                    companyId={companyId}
                />
            )}
        </>
    );
};

export default UserWizard;
