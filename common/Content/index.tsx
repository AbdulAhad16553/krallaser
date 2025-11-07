"use client"

import React, { useEffect, useRef } from 'react'

interface ContentProps {
    content: string
}

const Content = ({ content }: ContentProps) => {

    const contentRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (contentRef.current) {
            contentRef.current.innerHTML = content || "";
        }
    }, [content]);

    return (
        <div
            ref={contentRef}
            className="[&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5 
                   [&>a]:text-blue-600 [&>a]:underline 
                   [&>em]:italic [&>u]:underline"
        />
    )
}

export default Content