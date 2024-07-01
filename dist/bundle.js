(()=>{"use strict";var e={39:(e,t)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.default=class{debounceTime=250;debounceTimeout=null;init(){document.querySelectorAll('[data-address-lookup="container"]').forEach((e=>{const t=e.querySelector('[data-address-lookup="zip-code"]'),o=e.querySelector('[data-address-lookup="house-number"]'),s=e.querySelector('[data-address-lookup="city-result"]'),c=e.querySelector('[data-address-lookup="street-result"]');[t,o].forEach((e=>{e?.addEventListener("change",(()=>this.onLookupValuesChanged(t,o,s,c))),e?.addEventListener("keyup",(()=>this.onLookupValuesChanged(t,o,s,c)))}))}))}onLookupValuesChanged(e,t,o,s){const c=e?.value,r=t?.value;c&&this.isZipCode(c)&&r&&this.debouncedLookupAddress(c,r,o,s)}debouncedLookupAddress(e,t,o,s){this.debounceTimeout&&clearTimeout(this.debounceTimeout),this.debounceTimeout=window.setTimeout((()=>{this.lookupAddress(e,t,o,s)}),this.debounceTime)}async lookupAddress(e,t,o,s){const c=`https://api.pdok.nl/bzk/locatieserver/search/v3_1/free?fq=postcode:${e.replace(" ","").trim()}&fq=huisnummer:${t}`,r=await fetch(c,{method:"GET",mode:"cors",headers:{Accept:"application/json"}}).catch((e=>e));if(r instanceof Error)return;const i=await r.json();i?.response?.docs?.length>0&&this.processLookupResult(i?.response?.docs,o,s)}processLookupResult(e,t,o){const[s]=e;t.value=s?.woonplaatsnaam??"",o.value=s?.straatnaam??""}isZipCode(e){return/^\d{4}\s?[a-zA-Z]{2}$/.test(e)}}},607:function(e,t,o){var s=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});const c=s(o(39));new class{flow=["section-1"];form=null;debug=!0;constructor(){this.form=document.querySelector("[data-form-logic]"),this.form&&(this.log("FormLogic initialized",this.form),this.setupListeners())}setupListeners(){this.form?.querySelectorAll("input").forEach((e=>{e.addEventListener("change",(()=>{this.formChange()}))})),this.form?.querySelectorAll("[data-section-toggle]").forEach((e=>{e.addEventListener("change",(()=>{this.setFlow()}))})),this.form?.querySelectorAll("[data-action]").forEach((e=>{e.addEventListener("click",(t=>this.handleButtonAction(e,t)))})),this.form?.querySelectorAll('[fs-accordion-element="trigger"]').forEach((e=>{e.addEventListener("click",(t=>{const o=t.target.closest("[data-section]");e.classList.contains("is-active-accordion")?this.closeSection(o):this.openSection(o)}))})),this.form?.querySelectorAll("[data-part-toggle]").forEach((e=>{this.setupPartToggle(e)})),this.form?.querySelectorAll("[data-section-toggle-link]").forEach((e=>{this.setupSectionToggleLink(e)})),this.form?.querySelectorAll("[data-part-choice]").forEach((e=>{this.setupPartChoices(e)}))}formChange(){}setFlow(){const e=this.form?.querySelectorAll("[data-section-toggle]");this.flow=["section-1"],[...e??[]].forEach((e=>{const t=e,o=t.dataset.sectionToggle;let s=o;if(o?.indexOf("=")??-1){const[e]=o?.split("=")??[];s=e}const c=this.form?.querySelector(`[data-section="${s}"]`);if(s!==o){const e=this.form?.querySelector(`[data-section-toggle-link="${o}"]`);e&&e.checked!==t.checked&&e.parentElement?.click()}c&&s&&t.checked&&!this.flow.includes(s)&&this.flow.push(s)})),this.flow.length>1&&(this.flow.push("section-comments"),this.flow.push("section-customer")),this.renderFlow()}renderFlow(){this.form?.querySelectorAll("[data-section]").forEach((e=>{e.classList.add("d-none")})),console.log(this.flow),this.flow.forEach(((e,t)=>{const o=this.form?.querySelector(`[data-section="${e}"]`);if(!o)return;const s=o.querySelector("[data-section-counter]");s&&(s.innerText=(t+1).toString()),o.classList.remove("d-none")}))}setupPartToggle(e){const t=e.querySelector('input[type="checkbox"]'),o=e.querySelector(".wrapper");t&&o&&t.addEventListener("change",(e=>{e.target.checked?o.classList.remove("d-none"):o.classList.add("d-none")}))}setupPartChoices(e){const t=e.querySelector('input[type="radio"]'),o=e.querySelector(".wrapper");t&&t.addEventListener("change",(()=>{const e=t.checked,s=this.form?.querySelectorAll(`input[name="${t.name}"]`);s?.forEach((e=>{const t=e.closest("[data-part-choice]"),o=t?.querySelector(".wrapper");t&&o&&o.classList.add("d-none")})),o&&(e?o.classList.remove("d-none"):o.classList.add("d-none"))}))}openSection(e){e.classList.add("is-active-accordion"),e.querySelector('[fs-accordion-element="trigger"]')?.classList.add("is-active-accordion"),e.querySelector('[fs-accordion-element="content"]')?.classList.add("is-active-accordion"),e.querySelector('[fs-accordion-element="arrow"]')?.classList.add("is-active-accordion"),setTimeout((()=>{window.scrollTo({top:e.getBoundingClientRect().top+window.scrollY-128,behavior:"smooth"})}),150)}closeSection(e){e.classList.remove("is-active-accordion"),e.querySelector('[fs-accordion-element="trigger"]')?.classList.remove("is-active-accordion"),e.querySelector('[fs-accordion-element="content"]')?.classList.remove("is-active-accordion"),e.querySelector('[fs-accordion-element="arrow"]')?.classList.remove("is-active-accordion")}setupSectionToggleLink(e){e.addEventListener("change",(t=>{const o=t.target.checked,s=e.dataset.sectionToggleLink,c=this.form?.querySelector(`[data-section-toggle="${s}"]`);s&&c&&c.checked!==o&&c.parentElement?.click()}))}validateInput(e,t,o){if(t.endsWith("[]")){const s=e.querySelectorAll(`[name="${t}"]:checked`);return(o.required&&s.length>0||!o.required)&&s.length>=(o.min??0)&&s.length<=(o.max??s.length)}const s=e.querySelector(`[name="${t}"]`);if(!s)return!1;if("radio"===s.type){console.log("Radio validation:",s);const c=e.querySelectorAll(`[name="${t}"]:checked`);return console.log("Checked inputs:",c.length),(o.required&&c.length>0||!o.required)&&c.length>=(o.min??0)&&c.length<=(o.max??c.length)}return(o.required&&s.value.length>0||!o.required)&&s.value.length>=(o.min??0)&&s.value.length<=(o.max??s.value.length)}toggleButtonState(e,t){const o=e.querySelector('[data-action="next"]');o&&(t?(o.removeAttribute("disabled"),o.classList.remove("button-disabled")):(o.setAttribute("disabled","disabled"),o.classList.add("button-disabled")))}handleButtonAction(e,t){t.preventDefault(),e.classList.contains("button-disabled")||e.hasAttribute("disabled")||(this.log("Button clicked",e),"next"===e.getAttribute("data-action")&&this.goToNextInFlow(e))}goToNextInFlow(e){const t=e.closest("[data-section]"),o=t.dataset.section,s=this.flow.indexOf(o??"");this.closeSection(t);const c=this.form?.querySelector(`[data-section="${this.flow[s+1]}"]`);c&&this.openSection(c)}log(e,t){this.debug&&(t?console.log(e,t):console.log(e))}},(new c.default).init()}},t={};!function o(s){var c=t[s];if(void 0!==c)return c.exports;var r=t[s]={exports:{}};return e[s].call(r.exports,r,r.exports,o),r.exports}(607)})();