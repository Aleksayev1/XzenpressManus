
type SWConfig = {
    onUpdate?: (registration: ServiceWorkerRegistration) => void;
    onSuccess?: (registration: ServiceWorkerRegistration) => void;
};

const SW_URL = '/sw.js';

const isLocalhost = Boolean(
    window.location.hostname === 'localhost' ||
    window.location.hostname === '[::1]' ||
    /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/.test(
        window.location.hostname
    )
);

export function register(config?: SWConfig) {
    if (!('serviceWorker' in navigator)) return;

    window.addEventListener('load', () => {
        if (isLocalhost) {
            validateServiceWorker(SW_URL, config);
            logDevInfo();
        } else {
            registerServiceWorker(SW_URL, config);
        }
    });
}

function registerServiceWorker(swUrl: string, config?: SWConfig) {
    navigator.serviceWorker
        .register(swUrl)
        .then((registration) => {
            registration.onupdatefound = () => {
                const worker = registration.installing;
                if (!worker) return;

                worker.onstatechange = () => {
                    if (worker.state !== 'installed') return;

                    if (navigator.serviceWorker.controller) {
                        console.info('XZenPress: New content available.');
                        config?.onUpdate?.(registration);
                    } else {
                        console.info('XZenPress: Content cached for offline use.');
                        config?.onSuccess?.(registration);
                    }
                };
            };
        })
        .catch((error) => {
            console.error('XZenPress: SW registration failed:', error);
        });
}

function validateServiceWorker(swUrl: string, config?: SWConfig) {
    fetch(swUrl, { headers: { 'Service-Worker': 'script' } })
        .then((response) => {
            const contentType = response.headers.get('content-type');

            if (
                response.status === 404 ||
                !contentType?.includes('javascript')
            ) {
                navigator.serviceWorker.ready.then((registration) => {
                    registration.unregister().then(() => window.location.reload());
                });
            } else {
                registerServiceWorker(swUrl, config);
            }
        })
        .catch(() => {
            console.warn(
                'XZenPress: Offline mode active. Service Worker not validated.'
            );
        });
}

export function unregister() {
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker.ready
        .then((registration) => registration.unregister())
        .catch((error) =>
            console.error('XZenPress: SW unregister failed:', error)
        );
}

function logDevInfo() {
    navigator.serviceWorker.ready.then(() => {
        console.info(
            'XZenPress DEV: App is served by a Service Worker (cache-first).'
        );
    });
}
