import * as styles from './style/consent.module.scss'
import stylesText from 'bundle-text:./style/consent.scss'
// import stylesText from 'bundle-text:./style/consent.module.scss'

export function Consent(options, $t) {
    console.log('gut', styles, stylesText);
    return `<div class="${styles.consent}">${backdrop()}${modal(options, $t)}</div>`
}

export function backdrop() {
    return `<div class="${styles.fullscreen} ${styles.backdrop}"></div>`
}

export function modal(options, $t) {
    const consents = []
    for (const key in options.consentTypes) {
        consents.push(option(key, options.consentTypes[key]))
    }

    return `
        <div class="${styles.modal} ${styles.centered}">
            <div class="${styles.consent_content}">
                <div class="${styles.consent_title} ${styles.text_lg}">${$t('title')}</div>
                <div class="${styles.body} ${styles.text_sm}">${$t('body')}</div>
                <div class="${styles.consent_options} ">
                <div class="accordion-container">
                    ${consents.join('')}
                </div>
                
                </div>
                
                <div class="${styles.flex}"> 
                    <div style="flex-grow: 1; padding: 0 .5em 0 0;">
                        <div class="${styles.btn}" style="margin: 0">Settings</div>
                    </div>
                    <div style="flex-grow: 1; padding: 0 0 0 .5em;">
                        <div class="${styles.btn} ${styles.primary}" style="margin: 0">Accept</div>
                    </div>
                </div>
            </div>
        </div>`
    }

export function option(key, consent) {
    return `
    <div class="ac ${styles['ac']}">
        <div class="ac-header ${styles['ac-header']}">
            <button class="ac-trigger ${styles['ac-trigger']}"></button>
            ${toggle(consent.i18n?.title, consent.disabled)}
        </div>
        <div class="ac-panel ${styles['ac-panel']}">
          <p class="ac-text ${styles['ac-text']}">${consent.i18n?.description}</p>
        </div>
      </div>`
}

export function toggle(title, disabled = false) {
    const disabledAttr = disabled ? 'disabled="" checked=""' : ''
    const label = disabled ? title + '<span style="font-weight:400;font-size: .75em; margin-left:.5em;">(Always Enabled)</span>' : title
    return `
    <label class="${styles['cl-switch']} ${styles['ios']} switch">
        <input type="checkbox" ${disabledAttr}>
        <span class="${styles['switcher']}"></span>
        <span class="${styles['label']}">${label}</span>
    </label>
    `
}

export function button(title, disabled = false) {

}
