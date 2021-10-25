// import * as styles from './style/consent.module.scss'
import stylesText from 'bundle-text:./style/consent.scss'

export function Consent(options, $t) {
    injectStyle()
    return `<div id="consent-manager" class="consent">${backdrop()}${modal(options, $t)}</div>`
}

export function injectStyle() {
    const style = document.createElement('style');
    style.textContent = stylesText;
    document.head.appendChild(style);
}

export function backdrop() {
    return `<div class="fullscreen consent-backdrop"></div>`
}

export function modal(options, $t) {
    const consents = []
    for (const key in options.consentTypes) {
        consents.push(option(key, options.consentTypes[key]))
    }

    return `
        <div class="modal centered">
            <div class="consent_content">
                <div class="consent_title text_lg">${$t('title')}</div>
                <div class="consent_body text_base">${$t('body')}</div>
                <div id="consent-options" class="consent_options hidden">
                    <div class="accordion-container">
                        ${consents.join('')}
                    </div>
                </div>
                
                <div class="flex"> 
                    <div style="flex-grow: 1; padding: 0 .5em 0 0;">
                        <div id="consent-settings-btn" class="btn" data- style="margin: 0">Settings</div>
                    </div>
                    <div style="flex-grow: 1; padding: 0 0 0 .5em;">
                        <div id="consent-accept-btn" class="btn primary" style="margin: 0">Accept</div>
                    </div>
                </div>
            </div>
        </div>`
    }

export function option(key, consent) {
    return `
    <div class="ac consent-option">
        <div class="ac-header">
            <button class="ac-trigger"></button>
            ${toggle(key, consent)}
        </div>
        <div class="ac-panel">
          <p class="ac-text">${consent.i18n?.description}</p>
        </div>
      </div>`
}

export function toggle(key, consent) {
    const disabledAttr = consent.required ? 'disabled' : ''
    const checkedAttr = (ConsentManager.state[key]) ? 'checked' : ''
    const label = consent.required ? consent.i18n?.title + '<span style="font-weight:400;font-size: .75em; margin-left:.5em;">(Always Enabled)</span>' : consent.i18n?.title
    return `
    <label class="cl-switch ios switch">
        <input id="consent-toggle-${key}" data-consent="${key}" type="checkbox" ${disabledAttr} ${checkedAttr}>
        <span class="switcher"></span>
        <span class="label">${label}</span>
    </label>
    `
}

export function button(title, disabled = false) {

}
