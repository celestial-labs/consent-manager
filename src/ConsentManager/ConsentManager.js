import defaultConfig from './config/defaults.json'
import i18n from './i18n/de.json'
import Cookies from 'js-cookie'
import mitt from 'mitt'
import merge from 'lodash/merge'
import { Consent } from './templates/default/consent.js';
import Accordion from 'accordion-js';

export class ConsentManager {
    constructor( options = {} ) {
        if (ConsentManager._instance) {
            console.warn("CookieConsent already created, returning the original instance.")
            return ConsentManager._instance
        }

        ConsentManager._instance = this
        window.ConsentManager = ConsentManager._instance

        this.options = {...defaultConfig, ...options}

        this.init()
    }

    init() {
        this.consentCookie = null
        this.hasConsent = null
        this.consent = null
        this.state = null
        this.consentManagerEl = null
        this.emitter = mitt()
        this.isBot = this.isBotCheck()
        this.isToTrack = this.isToTrackCheck()
        this.consentManager = null

        this.emitter.on('*', (type, e) => console.log(type, e))
        this.emitter.on('manager:initialized', (e) => this.loadConsent(e))

        if(this.options.autorun) {
            this.emitter.on('consent:loaded', (e) => this.run(e))
        }

        this.emitter.emit('manager:initialized', this)
    }

    loadConsent(e) {
        this.consentCookie = Cookies.get(this.options.cookie.name)
        this.hasConsent = false

        if (this.consentCookie) {
            this.consent = this.consentCookie
            this.state = this.consentCookie
            this.hasConsent = true
        } else {
            const state = {}

            Object.entries(this.options.consentTypes).forEach((consent) => {
                state[consent[0]] = !!(consent[1].defaultState === 'granted')
            })

            this.state = state
        }

        this.emitter.emit('consent:loaded', {hasConsent: this.hasConsent, consent: this.consent})
    }

    run(e) {
        if(!this.hasConsent) {
            this.show()
        }

        this.emitter.emit('consent:ran')
    }

    show(e) {
        if(!this.isBot && this.isToTrack) {
            if(!this.consentManager) {
                this.render()
            }
        }
    }

    $t($key) {
        return i18n[$key];
    }

    isBotCheck() {
        // Detect if the visitor is a bot or not
        const bots = /bot|crawler|spider|crawling/i;
        this.isBot = bots.test(navigator.userAgent);

        return this.isBot
    }

    isToTrackCheck() {
        // Check if DoNotTrack is activated
        const dnt = navigator.doNotTrack || navigator.msDoNotTrack || window.doNotTrack;
        this.isToTrack = (dnt !== null && dnt !== undefined) ? (dnt && dnt !== 'yes' && dnt !== 1 && dnt !== '1') : true;

        return this.isToTrack
    }

    open() {
        this.show();
    }

    render() {
        // const consentDom = Consent(this.options, this.$t)
        document.body.insertAdjacentHTML('beforeend', Consent(this.options, this.$t));
        this.consentManagerEl = document.getElementById('consent-manager')

        setTimeout(() => {
            new Accordion('.accordion-container');
            const switches = this.consentManagerEl.querySelectorAll('.consent .consent-option .switch input')

            switches.forEach((toggle) => {
                toggle.addEventListener('change', () => {
                    this.emitter.emit('consent:toggle', {consent: toggle.getAttribute('data-consent'), value: toggle.checked})
                });
            })

            this.consentManagerEl.querySelectorAll('.btn').forEach((btn) => {
                btn.addEventListener('click', event => {
                    this.emitter.emit('consent:btn-clicked', {btn: event.target.id, target: event.target})
                });
            })

            this.emitter.on('consent:btn-clicked', (payload) => {
                if(payload.btn === 'consent-accept-btn') {
                    this.commitConsent()
                }

                if(payload.btn === 'consent-settings-btn') {
                    this.consentManagerEl.querySelector('#consent-options').classList.toggle('hidden')
                }
            })
        }, 100)
    }

    // noinspection JSUnusedGlobalSymbols
    gTagParseOptions(options) {
        this.mergeOptions(options)
    }

    mergeOptions(options) {
        this.options = merge(this.options, options)
        this.emitter.emit('options:merged', {newOptions: this.options, oldOptions: options})
    }

    gTag(method, data) {
        console.log(method, data)
    }

    setState(state) {
        this.state = state
        this.emitter.emit('state:changed', this.state)
    }

    commitConsent() {
        // console.log(window.dataLayer, this.state)

        this.updateGoogleConsent()
        // console.log(window.dataLayer)
    }

    updateGoogleConsent() {
        window.gtag('consent', 'update', {
            'ad_storage': 'granted',
            'analytics_storage': 'denied'
        });
    }
}

export default new ConsentManager