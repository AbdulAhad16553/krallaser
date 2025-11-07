"use client";

import { useEffect, useState } from 'react';
import HeaderSkeleton from './HeaderSkeleton';
import Header from './index';

interface ClientHeaderProps {
    storeData: any;
}

const ClientHeader = ({ storeData }: ClientHeaderProps) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <HeaderSkeleton />;
    }

    return <Header storeData={storeData} />;
};

export default ClientHeader;
