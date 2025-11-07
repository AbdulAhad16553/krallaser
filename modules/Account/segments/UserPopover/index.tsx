import React from "react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Settings, LogOut, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { AvatarImage } from "@radix-ui/react-avatar";

const UserPopover = () => {

    const router = useRouter();
    // Mock user data for now - in a real implementation, you'd get this from ERPNext or your auth system
    const userData = {
        displayName: "User",
        avatarUrl: null
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Avatar className="cursor-pointer h-8 w-8">
                    <AvatarFallback className="h-full w-full flex items-center justify-center">
                        {userData?.displayName
                            ?.split(" ")
                            .map((word) => word.charAt(0).toUpperCase())
                            .join("")
                        }
                    </AvatarFallback>
                </Avatar>
            </PopoverTrigger>
            <PopoverContent className="w-56 mr-5">
                <div className="grid gap-4">
                    <div className="font-medium">My Account</div>
                    <div className="grid gap-2">
                        <Button
                            variant="ghost"
                            className="w-full justify-start"
                            onClick={() => {
                                router.push("/account");
                            }}
                        >
                            <User className="mr-2 h-4 w-4" />
                            Account
                        </Button>
                        <Button
                            variant="ghost"
                            className="w-full justify-start"
                            onClick={() => {
                                router.push("/orders");
                            }}
                        >
                            <ShoppingBag className="mr-2 h-4 w-4" />
                            Orders
                        </Button>
                        <Button variant="ghost"
                            className="w-full justify-start"
                            onClick={() => { router.push("/settings"); }}
                        >
                            <Settings className="mr-2 h-4 w-4" />
                            Settings
                        </Button>
                        <Button
                            variant="ghost"
                            className="w-full justify-start"
                            onClick={() => {
                                // In a real implementation, you'd handle logout with your auth system
                                console.log("Logout clicked");
                                router.push("/");
                            }}
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Logout
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
};

export default UserPopover;
