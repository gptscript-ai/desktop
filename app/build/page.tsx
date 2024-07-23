"use client";

import 'reactflow/dist/style.css';
import {ReactFlowProvider} from 'reactflow';
import {Suspense} from 'react';
import Graph from '@/components/build/graph';
import {GraphContextProvider} from '@/contexts/graph';

export default function Build() {
    return (
        <ReactFlowProvider>
            <GraphContextProvider>
                <Suspense>
                    <Graph/>
                </Suspense>
            </GraphContextProvider>
        </ReactFlowProvider>
    );
}

