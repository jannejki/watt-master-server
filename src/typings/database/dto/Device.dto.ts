export interface Relay {
    relay: number;
    mode: 'auto' | 'manual';
    state: 'on' | 'off';
    threshold: number;
    price: number | undefined;

}

export interface Device {
    id: number;
    uuid: string;
    owner_id: number;
    relays: Relay[];
}


export interface DeviceFromDatabase {
    id: number;
    uuid: string;
    owner_id: number;
    relays: string; // Assuming relays are stored as a array of Relay objects in the database
    // Add other properties as needed
}