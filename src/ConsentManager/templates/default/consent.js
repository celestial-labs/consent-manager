// import * as styles from './style/consent.module.scss'
import stylesText from 'bundle-text:./style/consent.scss'

export function Consent(options, $t) {
    injectStyle()
    return `<div class="consent">${backdrop()}${modal(options, $t)}</div>`
}

export function injectStyle() {
    const style = document.createElement('style');
    style.textContent = stylesText;
    document.head.appendChild(style);
}

export function backdrop() {
    return `<div class="fullscreen backdrop"></div>`
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
                <div class="body text_sm">${$t('body')}</div>
                <div class="consent_options">
                <div class="accordion-container">
                    ${consents.join('')}
                </div>
                
                </div>
                
                <div class="flex"> 
                    <div style="flex-grow: 1; padding: 0 .5em 0 0;">
                        <div class="btn" style="margin: 0">Settings</div>
                    </div>
                    <div style="flex-grow: 1; padding: 0 0 0 .5em;">
                        <div class="btn primary" style="margin: 0">Accept</div>
                    </div>
                </div>
            </div>
        </div>`
    }

export function option(key, consent) {
    return `
    <div class="ac">
        <div class="ac-header">
            <button class="ac-trigger"></button>
            ${toggle(consent.i18n?.title, consent.disabled)}
        </div>
        <div class="ac-panel">
          <p class="ac-text">${consent.i18n?.description}</p>
        </div>
      </div>`
}

export function toggle(title, disabled = false) {
    const disabledAttr = disabled ? 'disabled="" checked=""' : ''
    const label = disabled ? title + '<span style="font-weight:400;font-size: .75em; margin-left:.5em;">(Always Enabled)</span>' : title
    return `
    <label class="cl-switch ios switch">
        <input type="checkbox" ${disabledAttr}>
        <span class="switcher"></span>
        <span class="label">${label}</span>
    </label>
    `
}

export function button(title, disabled = false) {

}
