import { InputRules } from './interfaces/input-rules';
import { SectionValidation } from './interfaces/section-validation';

class FormLogic {
    private flow: string[] = ['section-1', 'section-customer'];
    private subFlow: string[] = [];
    private flowIndex = 0;
    private subFlowIndex = 0;
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
            input.addEventListener('change', event => {
                this.formChange();
            });
        });

        this.form
            ?.querySelectorAll('[data-action]')
            .forEach((button: Element) => {
                button.addEventListener('click', event =>
                    this.handleButtonAction(button, event),
                );
            });
    }

    private formChange(): void {
        const activeSection = this.form?.querySelector(
            `.${this.flow[this.flowIndex]}`,
        ) as HTMLElement;

        if (!activeSection) {
            return;
        }

        (
            [
                ...activeSection.querySelectorAll('[data-section-validation]'),
            ] as HTMLElement[]
        ).forEach(validationSection => {
            const validationRules = validationSection.dataset.sectionValidation;

            if (!validationRules) {
                return;
            }

            const rules = JSON.parse(
                decodeURIComponent(validationRules),
            ) as SectionValidation;
            let sectionPassed = true;

            Object.keys(rules).forEach(key => {
                sectionPassed = !sectionPassed
                    ? sectionPassed
                    : this.validateInput(validationSection, key, rules[key]);
            });

            if (sectionPassed) {
                this.log('Section passed validation!', validationSection);
            } else {
                this.log('Section failed validation!', validationSection);
            }

            this.toggleButtonState(validationSection, sectionPassed);
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

    private handleButtonAction(button: Element, event: Event) {
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
            this.goToNextInFlow();
        } else if (action === 'back') {
            this.goToPreviousInFlow();
        }
    }

    private checkActiveQuestionForSectionPush(section?: Element | null) {
        if (!section) {
            return;
        }

        const inputs = section.querySelectorAll('[data-push-section]');

        const sectionsToPush: string[] = [];

        inputs.forEach(input => {
            const inputElement = input as HTMLInputElement;

            if (inputElement.checked) {
                const flowPush = inputElement.dataset.pushSection;

                if (flowPush && !this.flow.includes(flowPush)) {
                    sectionsToPush.push(flowPush);

                    this.log('Flow pushed', input);
                }
            }
        });

        this.flow.splice(this.flowIndex + 1, 0, ...sectionsToPush);

        console.log(this.flow);
    }

    private goToNextInFlow() {
        if (this.flow.length < this.flowIndex + 1) {
            return;
        }

        const activeSection = this.form?.querySelector(
            `[data-section="${this.flow[this.flowIndex]}"]`,
        );

        this.checkActiveQuestionForSubSectionPush(activeSection);

        if (this.subFlowIndex + 1 < this.subFlow.length) {
            this.setNextActiveSubSection();
        } else {
            this.checkActiveQuestionForSectionPush(activeSection);
            this.setNextActiveSection(activeSection as HTMLElement);
        }
    }

    private checkActiveQuestionForSubSectionPush(section?: Element | null) {
        if (!section) {
            return;
        }

        this.subFlow = [];

        const inputs = section.querySelectorAll('[data-push-sub-section]');

        let sectionsToPush: string[] = [];

        inputs.forEach(input => {
            const inputElement = input as HTMLInputElement;

            if (inputElement.checked) {
                const flowPush = inputElement.dataset.pushSubSection;

                if (flowPush && !this.subFlow.includes(flowPush)) {
                    sectionsToPush.push(flowPush);

                    this.log('SubFlow pushed', input);
                }
            }
        });

        const subSections = section.querySelectorAll(
            '[data-section]',
        ) as NodeListOf<HTMLElement>;

        if (subSections.length > 0) {
            const subSection = subSections[0];
            sectionsToPush = [
                subSection.dataset.section ?? '',
                ...sectionsToPush,
            ];
        }

        this.subFlow = sectionsToPush.sort();

        console.log(this.subFlow);
    }

    private setNextActiveSection(activeSection?: HTMLElement | null) {
        const newSection = this.form?.querySelector(
            `[data-section="${this.flow[this.flowIndex + 1]}"]`,
        );

        if (!activeSection || !newSection) {
            return;
        }

        activeSection.classList.add('d-none');
        newSection.classList.remove('d-none');

        this.subFlow = [];
        this.subFlowIndex = 0;

        this.log('Going to next in flow', newSection);

        const subSections = newSection.querySelectorAll(
            '[data-section]',
        ) as NodeListOf<HTMLElement>;

        if (subSections.length > 0) {
            const subSection = subSections[0];
            this.subFlow.push(subSection.dataset.section ?? '');

            subSection.classList.remove('d-none');
        }

        this.flowIndex++;
    }

    private setNextActiveSubSection() {
        const activeSubSection = this.form?.querySelector(
            `[data-section="${this.subFlow[this.subFlowIndex]}"]`,
        );
        const newSubSection = this.form?.querySelector(
            `[data-section="${this.subFlow[this.subFlowIndex + 1]}"]`,
        );

        if (!activeSubSection || !newSubSection) {
            return;
        }

        activeSubSection.classList.add('d-none');
        newSubSection.classList.remove('d-none');

        this.log('Going to next in sub flow', newSubSection);

        this.subFlowIndex++;
    }

    private goToPreviousInFlow() {
        if (this.flowIndex === 0) {
            return;
        }

        const activeSection = this.form?.querySelector(
            `[data-section="${this.flow[this.flowIndex]}"]`,
        );

        if (this.subFlowIndex > 0) {
            const activeSubSection = this.form?.querySelector(
                `[data-section="${this.subFlow[this.subFlowIndex]}"]`,
            );
            const newSubSection = this.form?.querySelector(
                `[data-section="${this.subFlow[this.subFlowIndex - 1]}"]`,
            );

            if (!activeSubSection || !newSubSection) {
                return;
            }

            activeSubSection.classList.add('d-none');
            newSubSection.classList.remove('d-none');

            this.log('Going to previous in sub flow', newSubSection);

            this.subFlowIndex--;
        } else {
            const newSection = this.form?.querySelector(
                `[data-section="${this.flow[this.flowIndex - 1]}"]`,
            );

            if (!activeSection || !newSection) {
                return;
            }

            activeSection.classList.add('d-none');
            newSection.classList.remove('d-none');

            this.checkActiveQuestionForSubSectionPush(newSection);

            if (this.subFlow.length > 0) {
                const subSection = newSection.querySelector(
                    `[data-section="${this.subFlow[this.subFlow.length - 1]}"]`,
                );

                if (subSection) {
                    this.subFlowIndex = this.subFlow.length - 1;
                    subSection.classList.remove('d-none');
                }
            }

            this.log('Going to previous in flow', newSection);

            this.flowIndex--;
        }
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
