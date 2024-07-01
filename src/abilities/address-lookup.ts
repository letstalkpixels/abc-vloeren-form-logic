export default class AddressLookup {
    private readonly debounceTime = 250;

    private debounceTimeout: number | null = null;

    public init(): void {
        document
            .querySelectorAll('[data-address-lookup="container"]')
            .forEach(container => {
                const zipCodeInput = container.querySelector(
                    '[data-address-lookup="zip-code"]',
                );
                const houseNumberInput = container.querySelector(
                    '[data-address-lookup="house-number"]',
                );

                const cityResultInput = container.querySelector(
                    '[data-address-lookup="city-result"]',
                );
                const streetResultInput = container.querySelector(
                    '[data-address-lookup="street-result"]',
                );

                [zipCodeInput, houseNumberInput].forEach(element => {
                    element?.addEventListener('change', () =>
                        this.onLookupValuesChanged(
                            zipCodeInput as HTMLInputElement,
                            houseNumberInput as HTMLInputElement,
                            cityResultInput as HTMLInputElement,
                            streetResultInput as HTMLInputElement,
                        ),
                    );
                    element?.addEventListener('keyup', () =>
                        this.onLookupValuesChanged(
                            zipCodeInput as HTMLInputElement,
                            houseNumberInput as HTMLInputElement,
                            cityResultInput as HTMLInputElement,
                            streetResultInput as HTMLInputElement,
                        ),
                    );
                });
            });
    }

    private onLookupValuesChanged(
        zipCodeInput: HTMLInputElement,
        houseNumberInput: HTMLInputElement,
        cityResultInput: HTMLInputElement,
        streetResultInput: HTMLInputElement,
    ): void {
        const zipCode = zipCodeInput?.value;
        const houseNumber = houseNumberInput?.value;

        if (zipCode && this.isZipCode(zipCode) && houseNumber) {
            this.debouncedLookupAddress(
                zipCode,
                houseNumber,
                cityResultInput,
                streetResultInput,
            );
        }
    }

    private debouncedLookupAddress(
        zipCode: string,
        houseNumber: string,
        cityResultInput: HTMLInputElement,
        streetResultInput: HTMLInputElement,
    ): void {
        if (this.debounceTimeout) {
            clearTimeout(this.debounceTimeout);
        }

        this.debounceTimeout = window.setTimeout(() => {
            this.lookupAddress(
                zipCode,
                houseNumber,
                cityResultInput,
                streetResultInput,
            );
        }, this.debounceTime);
    }

    private async lookupAddress(
        zipCode: string,
        houseNumber: string,
        cityResultInput: HTMLInputElement,
        streetResultInput: HTMLInputElement,
    ): Promise<void> {
        const lookupUrl = `https://api.pdok.nl/bzk/locatieserver/search/v3_1/free?fq=postcode:${zipCode
            .replace(' ', '')
            .trim()}&fq=huisnummer:${houseNumber}`;

        const response = await fetch(lookupUrl, {
            method: 'GET',
            mode: 'cors',
            headers: {
                Accept: 'application/json',
            },
        }).catch(error => error);

        if (response instanceof Error) {
            return;
        }

        const data = await (response as Response).json();

        if (data?.response?.docs?.length > 0) {
            this.processLookupResult(
                data?.response?.docs,
                cityResultInput,
                streetResultInput,
            );
        }
    }

    private processLookupResult(
        lookupResults: { woonplaatsnaam: string; straatnaam: string }[],
        cityResultInput: HTMLInputElement,
        streetResultInput: HTMLInputElement,
    ): void {
        const [bestMatch] = lookupResults;

        cityResultInput!.value = bestMatch?.woonplaatsnaam ?? '';
        streetResultInput!.value = bestMatch?.straatnaam ?? '';
    }

    private isZipCode(zipCode: string): boolean {
        return /^\d{4}\s?[a-zA-Z]{2}$/.test(zipCode);
    }
}
