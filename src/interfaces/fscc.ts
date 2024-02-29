import { StoreConsents } from './store-consents';

export interface FsCC {
    store: {
        getConsents: () => StoreConsents;
    };
    banner: {
        on: (
            event: string,
            callback: (consents?: StoreConsents) => void,
        ) => void;
    };
}
