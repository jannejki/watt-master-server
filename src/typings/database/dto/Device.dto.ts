export interface Relay {
    relay: number;
    mode: 'auto' | 'manual';
    state: 'on' | 'off';
    threshold: number;
    price: number | undefined;
}

// Define a second interface for commands
export interface RelayCommand extends Partial<Relay> {
    relay: number; // Relay is still mandatory
}

export interface Device {
    id: number;
    uuid: string;
    owner_id: number;
    relays: Relay[];
    name: string;
}


export interface DeviceFromDatabase {
    id: number;
    uuid: string;
    owner_id: number;
    relays: string; // Assuming relays are stored as a array of Relay objects in the database
    // Add other properties as needed
    name: string;
}