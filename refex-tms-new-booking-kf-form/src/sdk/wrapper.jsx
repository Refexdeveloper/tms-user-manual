import KFSDK from '@kissflow/lowcode-client-sdk'
import React, { useEffect, useState } from 'react'

let kf

function createLocalKf() {
  const store = {}
  return {
    isLocal: true,
    user: {
      getUser: async () => ({
        Name: 'Pravin Kumar Raja',
        Email: 'pravin@refex.local',
      }),
    },
    context: {
      watchParams: () => {},
      updateField: async (payload) => {
        Object.assign(store, payload)
        console.info('[local kf] updateField', Object.keys(payload).length, 'fields')
        return true
      },
      getField: async (id) => store[id],
      submit: async () => console.info('[local kf] submit'),
      save: async () => console.info('[local kf] save'),
    },
  }
}

export function SDKWrapper({ children }) {
  const [ready, setReady] = useState(null)

  useEffect(() => {
    if (window.kf && !window.kf.isError) {
      kf = window.kf
      setReady(kf)
      return
    }
    KFSDK.initialize()
      .then((sdk) => {
        window.kf = kf = sdk
        setReady(sdk)
      })
      .catch(() => {
        kf = createLocalKf()
        window.kf = kf
        setReady(kf)
      })
  }, [])

  if (!ready) return <div className="nb-loading">Loading…</div>
  return <>{children}</>
}

export { kf }
