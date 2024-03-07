import { FsCC } from './interfaces/fscc';
import { StoreConsents } from './interfaces/store-consents';

const setGtagConsentMode = (
    mode: 'default' | 'update',
    consents: StoreConsents,
) => {
    const localWindow = window as any;
    localWindow.gtag = function () {
        localWindow.dataLayer.push(arguments);
    };

    if (!localWindow.dataLayer) {
        return;
    }

    const consentObject = {
        ad_storage: consents.marketing ? 'granted' : 'denied',
        analytics_storage: consents.analytics ? 'granted' : 'denied',
        functionality_storage: 'granted',
        personalization_storage: consents.personalization
            ? 'granted'
            : 'denied',
        security_storage: 'granted',
        ad_user_data: consents.marketing ? 'granted' : 'denied',
        ad_personalization: consents.marketing ? 'granted' : 'denied',
    };

    localWindow.gtag('consent', mode, consentObject);
};

(() => {
    const localWindow = window as any;

    if (!localWindow.FsCC) {
        return;
    }

    localWindow.FsCC.push((FsCC: FsCC) => {
        setGtagConsentMode('default', FsCC.store.getConsents());

        FsCC.banner.on('allow', () => {
            setGtagConsentMode('update', FsCC.store.getConsents());
        });

        FsCC.banner.on('deny', () => {
            setGtagConsentMode('update', FsCC.store.getConsents());
        });

        FsCC.banner.on('updateconsents', () => {
            setGtagConsentMode('update', FsCC.store.getConsents());
        });
    });
})();
