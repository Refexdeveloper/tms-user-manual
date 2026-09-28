import KFSDK from '@kissflow/lowcode-client-sdk'
import React, { useEffect, useState } from 'react'
import { createPreviewKf } from './preview.js'

let kf

export function SDKWrapper(props) {
    const [kfInstance, setKfInstance] = useState(null)
    const [previewMode, setPreviewMode] = useState(false)

    useEffect(function onLoad() {
        if (window.kf) {
            kf = window.kf
            setKfInstance(window.kf)
            setPreviewMode(Boolean(window.kf.__preview))
            return
        }

        KFSDK.initialize()
            .then((sdk) => {
                window.kf = kf = sdk
                setKfInstance(sdk)
                setPreviewMode(false)
                console.info('SDK initialized successfully')
            })
            .catch((err) => {
                const preview = createPreviewKf()
                window.kf = kf = preview
                window.__KF_BROWSER_PREVIEW__ = true
                setKfInstance(preview)
                setPreviewMode(true)
                console.warn('SDK not available — browser preview mode:', err?.message || err)
            })
    }, [])

    return (
        <React.Fragment>
            {previewMode && (
                <div className="preview-banner">
                    Browser preview with sample data — connect this component in Kissflow for live records.
                </div>
            )}
            {kfInstance && props.children}
        </React.Fragment>
    )
}

export { kf }
