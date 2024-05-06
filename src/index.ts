import { InputRules } from './interfaces/input-rules';
import { SectionValidation } from './interfaces/section-validation';

class FormLogic {
    private flow: string[] = ['section-1'];
    private form: HTMLFormElement | null = null;
    private debug = true;

    constructor() {
        this.form = document.querySelector(
            '[data-form-logic]',
        ) as HTMLFormElement | null;

        if (!this.form) {
            return;
        }

        this.log('FormLogic initialized', this.form);

        this.setupListeners();
    }

    private setupListeners() {
        this.form?.querySelectorAll('input').forEach(input => {
            input.addEventListener('change', () => {
                this.formChange();
            });
        });

        this.form?.querySelectorAll('[data-section-toggle]').forEach(toggle => {
            const toggleElement = toggle as HTMLInputElement;

            toggleElement.addEventListener('change', () => {
                this.setFlow();
            });
        });

        this.form
            ?.querySelectorAll('[data-action]')
            .forEach((button: Element) => {
                button.addEventListener('click', event =>
                    this.handleButtonAction(button as HTMLElement, event),
                );
            });

        this.form
            ?.querySelectorAll('[fs-accordion-element="trigger"]')
            .forEach(trigger => {
                trigger.addEventListener('click', event => {
                    const section = (event.target as HTMLElement).closest(
                        '[data-section]',
                    ) as HTMLElement;
                    const isActive = trigger.classList.contains(
                        'is-active-accordion',
                    );

                    if (isActive) {
                        this.closeSection(section);
                    } else {
                        this.openSection(section);
                    }
                });
            });

        this.form
            ?.querySelectorAll('[data-part-toggle]')
            .forEach(partToggle => {
                this.setupPartToggle(partToggle as HTMLInputElement);
            });

        this.form
            ?.querySelectorAll('[data-section-toggle-link]')
            .forEach(sectionToggleLink => {
                this.setupSectionToggleLink(
                    sectionToggleLink as HTMLInputElement,
                );
            });

        this.form
            ?.querySelectorAll('[data-part-choice]')
            .forEach(partChoice => {
                this.setupPartChoices(partChoice as HTMLInputElement);
            });
    }

    private formChange(): void {
        // (
        //     [
        //         ...activeSection.querySelectorAll('[data-section-validation]'),
        //     ] as HTMLElement[]
        // ).forEach(validationSection => {
        //     const validationRules = validationSection.dataset.sectionValidation;
        //     if (!validationRules) {
        //         return;
        //     }
        //     const rules = JSON.parse(
        //         decodeURIComponent(validationRules),
        //     ) as SectionValidation;
        //     let sectionPassed = true;
        //     Object.keys(rules).forEach(key => {
        //         sectionPassed = !sectionPassed
        //             ? sectionPassed
        //             : this.validateInput(validationSection, key, rules[key]);
        //     });
        //     if (sectionPassed) {
        //         this.log('Section passed validation!', validationSection);
        //     } else {
        //         this.log('Section failed validation!', validationSection);
        //     }
        //     this.toggleButtonState(validationSection, sectionPassed);
        // });
    }

    private setFlow(): void {
        const sectionToggles = this.form?.querySelectorAll(
            '[data-section-toggle]',
        );

        this.flow = ['section-1'];

        [...(sectionToggles ?? [])].forEach(toggle => {
            const toggleElement = toggle as HTMLInputElement;
            const toggleKey = toggleElement.dataset.sectionToggle;
            let sectionIdentifier = toggleKey;

            if (toggleKey?.indexOf('=') ?? -1) {
                const [sectionKey] = toggleKey?.split('=') ?? [];

                sectionIdentifier = sectionKey;
            }

            const toggleSection = this.form?.querySelector(
                `[data-section="${sectionIdentifier}"]`,
            );

            if (sectionIdentifier !== toggleKey) {
                const linkedCheckbox = this.form?.querySelector(
                    `[data-section-toggle-link="${toggleKey}"]`,
                ) as HTMLInputElement;

                if (
                    linkedCheckbox &&
                    linkedCheckbox.checked !== toggleElement.checked
                ) {
                    linkedCheckbox.parentElement?.click();
                }
            }

            if (
                !toggleSection ||
                !sectionIdentifier ||
                !toggleElement.checked ||
                this.flow.includes(sectionIdentifier)
            ) {
                return;
            }

            this.flow.push(sectionIdentifier);
        });

        if (this.flow.length > 1) {
            this.flow.push('section-comments');
            this.flow.push('section-customer');
        }

        this.renderFlow();
    }

    private renderFlow() {
        this.form?.querySelectorAll('[data-section]').forEach(section => {
            section.classList.add('d-none');
        });

        console.log(this.flow);

        this.flow.forEach((section, index) => {
            const sectionElement = this.form?.querySelector(
                `[data-section="${section}"]`,
            );

            if (!sectionElement) {
                return;
            }

            const counter = sectionElement.querySelector(
                '[data-section-counter]',
            ) as HTMLElement;

            if (counter) {
                counter.innerText = (index + 1).toString();
            }

            sectionElement.classList.remove('d-none');
        });
    }

    private setupPartToggle(toggle: HTMLInputElement) {
        const checkbox = toggle.querySelector('input[type="checkbox"]');
        const wrapper = toggle.querySelector('.wrapper');

        if (!checkbox || !wrapper) {
            return;
        }

        checkbox.addEventListener('change', event => {
            const checked = (event.target as HTMLInputElement).checked;

            if (checked) {
                wrapper.classList.remove('d-none');
            } else {
                wrapper.classList.add('d-none');
            }
        });
    }

    private setupPartChoices(partChoice: HTMLElement): void {
        const input = partChoice.querySelector(
            'input[type="radio"]',
        ) as HTMLInputElement;
        const wrapper = partChoice.querySelector('.wrapper');

        if (!input) {
            return;
        }

        input.addEventListener('change', () => {
            const checked = input.checked;

            const otherChoices = this.form?.querySelectorAll(
                `input[name="${input.name}"]`,
            );

            otherChoices?.forEach(choice => {
                const baseElement = choice.closest('[data-part-choice]');
                const choiceWrapper = baseElement?.querySelector('.wrapper');

                if (!baseElement || !choiceWrapper) {
                    return;
                }

                choiceWrapper.classList.add('d-none');
            });

            if (!wrapper) {
                return;
            }

            if (checked) {
                wrapper.classList.remove('d-none');
            } else {
                wrapper.classList.add('d-none');
            }
        });
    }

    private openSection(section: HTMLElement) {
        section.classList.add('is-active-accordion');
        const header = section.querySelector(
            '[fs-accordion-element="trigger"]',
        );
        header?.classList.add('is-active-accordion');
        const content = section.querySelector(
            '[fs-accordion-element="content"]',
        );
        content?.classList.add('is-active-accordion');
        const arrow = section.querySelector('[fs-accordion-element="arrow"]');
        arrow?.classList.add('is-active-accordion');

        // Timeout to allow the content to expand before scrolling
        setTimeout(() => {
            window.scrollTo({
                top: section.getBoundingClientRect().top + window.scrollY - 128,
                behavior: 'smooth',
            });
        }, 150);
    }

    private closeSection(section: HTMLElement) {
        section.classList.remove('is-active-accordion');
        const header = section.querySelector(
            '[fs-accordion-element="trigger"]',
        );
        header?.classList.remove('is-active-accordion');
        const content = section.querySelector(
            '[fs-accordion-element="content"]',
        );
        content?.classList.remove('is-active-accordion');
        const arrow = section.querySelector('[fs-accordion-element="arrow"]');
        arrow?.classList.remove('is-active-accordion');
    }

    private setupSectionToggleLink(checkbox: HTMLElement): void {
        checkbox.addEventListener('change', event => {
            const checked = (event.target as HTMLInputElement).checked;
            const sectionIdentifier = checkbox.dataset.sectionToggleLink;
            const linkedCheckbox = this.form?.querySelector(
                `[data-section-toggle="${sectionIdentifier}"]`,
            ) as HTMLInputElement;

            if (!sectionIdentifier || !linkedCheckbox) {
                return;
            }

            if (linkedCheckbox.checked !== checked) {
                linkedCheckbox.parentElement?.click();
            }
        });
    }

    private validateInput(
        section: HTMLElement,
        inputName: string,
        rules: InputRules,
    ): boolean {
        if (inputName.endsWith('[]')) {
            const inputs = section.querySelectorAll(
                `[name="${inputName}"]:checked`,
            );

            return (
                ((rules.required && inputs.length > 0) || !rules.required) &&
                inputs.length >= (rules.min ?? 0) &&
                inputs.length <= (rules.max ?? inputs.length)
            );
        }

        const input = section.querySelector(
            `[name="${inputName}"]`,
        ) as HTMLInputElement;

        if (!input) {
            return false;
        }

        if (input.type === 'radio') {
            console.log('Radio validation:', input);

            const inputs = section.querySelectorAll(
                `[name="${inputName}"]:checked`,
            );

            console.log('Checked inputs:', inputs.length);

            return (
                ((rules.required && inputs.length > 0) || !rules.required) &&
                inputs.length >= (rules.min ?? 0) &&
                inputs.length <= (rules.max ?? inputs.length)
            );
        }

        return (
            ((rules.required && input.value.length > 0) || !rules.required) &&
            input.value.length >= (rules.min ?? 0) &&
            input.value.length <= (rules.max ?? input.value.length)
        );
    }

    private toggleButtonState(section: HTMLElement, active: boolean) {
        const actionButton = section.querySelector('[data-action="next"]');

        if (!actionButton) {
            return;
        }

        if (active) {
            actionButton.removeAttribute('disabled');
            actionButton.classList.remove('button-disabled');
        } else {
            actionButton.setAttribute('disabled', 'disabled');
            actionButton.classList.add('button-disabled');
        }
    }

    private handleButtonAction(button: HTMLElement, event: Event) {
        event.preventDefault();

        if (
            button.classList.contains('button-disabled') ||
            button.hasAttribute('disabled')
        ) {
            return;
        }

        this.log('Button clicked', button);

        const action = button.getAttribute('data-action');

        if (action === 'next') {
            this.goToNextInFlow(button);
        }
    }

    private goToNextInFlow(button: HTMLElement): void {
        const section = button.closest('[data-section]') as HTMLElement;
        const sectionIdentifier = section.dataset.section;
        const index = this.flow.indexOf(sectionIdentifier ?? '');

        this.closeSection(section);

        const nextSection = this.form?.querySelector(
            `[data-section="${this.flow[index + 1]}"]`,
        ) as HTMLElement;

        if (!nextSection) {
            return;
        }

        this.openSection(nextSection);
    }

    private log(message: string, element?: Element) {
        if (!this.debug) {
            return;
        }

        if (element) {
            console.log(message, element);
        } else {
            console.log(message);
        }
    }
}

(() => {
    new FormLogic();
})();
