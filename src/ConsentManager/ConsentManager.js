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

    /*
     * Check if user already consent
     */
    loadConsent(e) {
        this.consentCookie = Cookies.get(this.options.cookie.name)
        this.hasConsent = false

        if (this.consentCookie) {
            this.consent = this.consentCookie
            this.hasConsent = true
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
        document.body.insertAdjacentHTML('beforeend', Consent(this.options, this.$t));

        new Accordion('.accordion-container');
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
}

export default new ConsentManager