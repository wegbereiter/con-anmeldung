import { createContext, useEffect, useState } from 'react';

interface Config {
    npcBeds?: number;
    pcBeds?: number;
    showRemainingBeds?: boolean;
    coronaVaccine?: boolean;
    minAge?: number;
    start?: string;
    end?: string;
    name?: string;
    subname?: string;
    description?: string;
    type?: string;
    location?: string[];
    website?: string;
    pcPrice?: number;
    npcPrice?: number;
    orga?: {
        name: string;
        email?: string;
    }[];
    itRooms?: boolean;
    fears?: boolean;
    roomRequest?: boolean;
    npcCatering?: boolean;
    pcCatering?: boolean;
    npcPermit?: boolean;
    mythodea?: boolean;
    ruleset?: string;
}

let promise: ReturnType<typeof fetch> | undefined;

export default function useConfig(): Config | undefined {
    const [config, setConfig] = useState<Config | undefined>();

    useEffect(() => {
        if (!promise) {
            promise = fetch('/api/config')
                .then(response => response.json())
                .then((config) => {
                    console.log('Config loaded', config);
                    return config;
                });
        }

        promise.then(result => setConfig(result));
    }, []);

    return config;
}