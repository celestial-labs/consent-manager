import defaultConfig from './config/defaults.json'
import i18n from './i18n/de.json'
import Cookies from 'js-cookie'
import mitt from 'mitt'
import merge from 'lodash/merge'
import clone from 'lodash/clone'
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
        this.hasConsent = false
        this.consent = null
        this.state = null
        this.consentManagerEl = null
        this.lastCommit = null
        this.emitter = mitt()
        this.isBot = this.isBotCheck()
        this.isToTrack = this.isToTrackCheck()

        // this.emitter.on('*', (type, e) => console.log(type, e))
        this.emitter.on('consent:initialized', (e) => this.loadConsent(e))

        if(this.options.autorun) {
            this.emitter.on('consent:loaded', (e) => this.run(e))
        }

        this.emitter.emit('consent:initialized', this)
        this.emitter.on('consent:update', (e) => {
            if(window.dataLayer) {
                window.dataLayer.push({"event": 'consent:update', payload: e });
            }
        })
    }

    defaultState() {
        let state = {}

        Object.entries(this.options.consentTypes).forEach((consent) => {
            state[consent[0]] = !!(consent[1].defaultState === 'granted')
        })

        return state
    }

    loadConsent(e) {
        let state = this.defaultState()

        const consentCookie = Cookies.get(this.options.cookie.name)

        if (consentCookie) {
            state = merge(state, JSON.parse(consentCookie))
            this.hasConsent = true
        }

        this.state = state
        this.emitter.emit('consent:loaded', {hasConsent: this.hasConsent, state: state})
    }

    run(e) {
        if(!this.hasConsent) {
            this.show()
        }

        this.emitter.emit('consent:ran')
    }

    show(e) {
        if(!this.isBot && this.isToTrack) {
            if(!this.consentManagerEl) {
                this.render()
            } else {
                this.consentManagerEl.classList.remove('hidden')
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

    render() {
        document.body.insertAdjacentHTML('beforeend', Consent(this.options, this.$t));
        this.consentManagerEl = document.getElementById('consent-manager')

        setTimeout(() => { // TODO: find solution without timeout
            new Accordion('.accordion-container');
            const switches = this.consentManagerEl.querySelectorAll('.consent .consent-option .switch input')

            switches.forEach((toggle) => {
                toggle.addEventListener('change', () => {
                    this.state[toggle.getAttribute('data-consent')] = toggle.checked
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
                    this.acceptConsent()
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

    setState(state) {
        this.state = state
        this.emitter.emit('state:changed', this.state)
    }

    acceptConsent() {
        this.commitConsent()
        this.consentManagerEl.classList.add('hidden')
    }

    commitConsent() {
        Cookies.set(this.options.cookie.name, JSON.stringify(this.state))

        const newState = {}

        Object.entries(this.state).forEach((item) => {
            if(!this.lastCommit || this.lastCommit[item[0]] != item[1]) {
                newState[item[0]] = (item[1]) ? 'granted' : 'denied'
            }
        })

        this.emitter.emit('consent:update', newState)
        this.lastCommit = clone(this.state)
    }
}

export default new ConsentManager
