"use client"

// Removed Nhost authentication - using mock authentication for now
import AccountSettings from "../UserAccount/components/AccountSettings"
import CacheManager from "@/components/CacheManager"

interface AllSettingsProps {
    necessary: {
        storeId: string;
        companyId: string;
        storeCurrency: string
    }
}

const AllSettings = ({ necessary }: AllSettingsProps) => {

    // Mock user data - in a real implementation, you'd get this from your auth system
    const userData = { id: 'mock-user-id', displayName: 'User' }

    return (
        <div className="space-y-6">
            <AccountSettings userData={userData} storeId={necessary?.storeId} />
            <CacheManager />
        </div>
    )
}

export default AllSettings