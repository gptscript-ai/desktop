"use client";
import React, { useEffect } from 'react';

const TitleBar: React.FC = () => {
    useEffect(() => {
        document.getElementById("drag-bar")?.style.setProperty("-webkit-app-region", "drag");
    }, []);

    return <div id="drag-bar" className="w-full h-6 mb-4"/>
};

export default TitleBar;