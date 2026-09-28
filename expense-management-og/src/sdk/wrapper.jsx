import KFSDK from '@kissflow/lowcode-client-sdk'
import React, { useState, useEffect } from 'react'

let kf

// ─── Dev-mode bypass ─────────────────────────────────────────────────────────
// In local dev (`npm run dev`), skip SDK initialization and inject mock data.
// In production builds this entire branch is tree-shaken away.
const IS_DEV = import.meta.env.DEV

export function SDKWrapper(props) {
    const [kfInstance, setKfInstance] = useState(IS_DEV ? 'pending' : null)

    useEffect(function onLoad() {
        const loadDevMock = async () => {
            try {
                const { mockKf } = await import('../dev-mock-kf.js')
                window.kf = kf = mockKf
                setKfInstance(mockKf)
                console.info('[DEV] Mock Kissflow SDK injected — running with local mock data.')
            } catch (err) {
                console.error('[DEV] Failed to load mock SDK:', err)
                setKfInstance({ isError: true })
            }
        }

        if (IS_DEV) {
            loadDevMock()
            return
        }

        if (!window.kf) {
            KFSDK.initialize()
                .then((sdk) => {
                    window.kf = kf = sdk
                    setKfInstance(sdk)
                    console.info('SDK initialized successfully')
                })
                .catch(async (err) => {
                    console.warn('Error initializing SDK (not inside Kissflow):', err)
                    // Fallback to mock data for local dev or preview outside Kissflow iframe
                    await loadDevMock()
                })
        } else {
            kf = window.kf
            setKfInstance(window.kf)
        }
    }, [])

    // While mock is loading, show nothing (fast, < 1 frame)
    if (kfInstance === 'pending') return null

    return (
        <React.Fragment>
            {kfInstance && !kfInstance.isError && props.children}
            {kfInstance && kfInstance.isError && (
                <div
                    style={{
                        minHeight: '100vh',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: 'system-ui, sans-serif',
                        color: '#64748b',
                        flexDirection: 'column',
                        gap: '12px',
                    }}
                >
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                        <rect width="48" height="48" rx="12" fill="#f1f5f9"/>
                        <path d="M24 14v12M24 30v2" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round"/>
                    </svg>
                    <p style={{ fontSize: '15px', fontWeight: 600 }}>Please use this component inside Kissflow</p>
                </div>
            )}
        </React.Fragment>
    )
}

export { kf }
