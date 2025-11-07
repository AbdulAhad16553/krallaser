export interface MetaEvent {
    event_name: string;
    event_time: number;
    action_source: string;
    user_data: UserData;
    custom_data: CustomData;
    storeId: String
}

export interface UserData {
    em: string[];
    ph: string[];
    fn: string[];
    ct: string[];
    country: string[];
    zp: string[];
    client_ip_address: string;
    client_user_agent: string;
    fbc?: string;
}

export interface CustomData {
    currency: string;
    value: number;
    content_category: string;
    content_name: string;
    status: string;
}
