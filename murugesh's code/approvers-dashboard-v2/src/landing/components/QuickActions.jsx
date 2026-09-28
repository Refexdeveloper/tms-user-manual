import { useState } from 'react'
import { kf } from '../../sdk/index.js'

const POPUPS = {
    expense: 'Popup_E4xarw8lLE',
    advance: 'Popup_J0C5lIdWCL',
    travel: 'Popup_rCILSrY8KF',
}

const actions = [
    {
        label: 'Create Travel Request',
        sub: 'Plan a business trip',
        icon: 'ri-flight-takeoff-line',
        actionType: 'popup',
        actionKey: 'travel',
        from: '#1E88E5',
        to: '#42A5F5',
        shadow: 'rgba(30,136,229,0.35)',
    },
    {
        label: 'Request Travel Advance',
        sub: 'Get funds before your trip',
        icon: 'ri-wallet-3-line',
        actionType: 'popup',
        actionKey: 'advance',
        from: '#43A047',
        to: '#66BB6A',
        shadow: 'rgba(67,160,71,0.35)',
    },
    {
        label: 'Submit Travel Expense',
        sub: 'Add a new expense claim',
        icon: 'ri-add-circle-line',
        actionType: 'popup',
        actionKey: 'expense',
        from: '#FB8C00',
        to: '#FFA726',
        shadow: 'rgba(251,140,0,0.35)',
    },
    {
        label: 'View Pending Approvals',
        sub: 'Review awaiting items',
        icon: 'ri-checkbox-circle-line',
        actionType: 'page',
        from: '#1565C0',
        to: '#1E88E5',
        shadow: 'rgba(35,94,172,0.3)',
    },
]

export default function QuickActions({ onPopupClosed } = {}) {
    const [hovered, setHovered] = useState(null)

    const markPopupOpened = () => {
        try {
            window.__KF_DASH_POPUP_SEQ__ = Number(window.__KF_DASH_POPUP_SEQ__ || 0) + 1
            window.__KF_DASH_POPUP_OPENED_AT__ = Date.now()
        } catch {
            // ignore
        }
    }

    const handleActionClick = async (action) => {
        if (action.actionType === 'popup') {
            const popupId = POPUPS[action.actionKey]
            if (!popupId) return
            try {
                markPopupOpened()
                kf.app.page.openPopup(popupId)
            } catch (e) {
                console.error('QuickActions openPopup failed', e)
                return
            }
            // Parent dashboard refreshes on focus/visibility regain.
            if (typeof onPopupClosed === 'function') setTimeout(() => onPopupClosed(), 1500)
            return
        }

        if (action.actionType === 'page') {
            const pendingApprovalsPageId = (await kf.app.getVariable('pending_approvals_page_id')) || (await kf.app.getVariable('approvals_page_id'))
            if (pendingApprovalsPageId) {
                kf.app.openPage(pendingApprovalsPageId)
            } else {
                kf.client.showInfo('Configure pending approvals page id variable to navigate.')
            }
        }
    }

    return (
        <div className="h-full overflow-hidden rounded-xl border border-white/80 bg-white/95 p-2.5 shadow-lg shadow-slate-200/40 backdrop-blur-sm sm:rounded-2xl sm:p-4 lg:rounded-3xl lg:p-5">
            <div className="mb-2.5 flex items-center justify-between sm:mb-4">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#1E88E5]/10 text-[#1E88E5] sm:h-9 sm:w-9">
                        <i className="ri-flashlight-line text-sm sm:text-base" aria-hidden />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-800 sm:text-base">Quick Actions</h3>
                </div>
            </div>

            <div className="space-y-1.5 sm:space-y-2">
                {actions.map((action, idx) => {
                    const isHovered = hovered === idx
                    return (
                        <button
                            key={action.label}
                            onMouseEnter={() => setHovered(idx)}
                            onMouseLeave={() => setHovered(null)}
                            onClick={() => handleActionClick(action)}
                            className="btn-press relative w-full flex items-center gap-1.5 sm:gap-3 overflow-hidden rounded-xl border px-2 sm:px-3 py-1.5 sm:py-2.5 text-left cursor-pointer animate-fade-in-up"
                            style={{
                                borderColor: isHovered ? `${action.from}40` : 'rgba(226, 232, 240, 0.9)',
                                background: isHovered ? `linear-gradient(135deg, ${action.from}0d 0%, ${action.to}07 100%)` : 'rgba(255,255,255,0.9)',
                                transform: isHovered ? 'translateY(-2px)' : 'translateY(0px)',
                                boxShadow: isHovered ? `0 10px 24px -12px ${action.shadow}` : '0 1px 2px rgba(15,23,42,0.04)',
                                transition: 'all 0.2s ease',
                                animationDelay: `${idx * 80}ms`,
                            }}
                        >
                            <div
                                className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full"
                                style={{
                                    background: `linear-gradient(180deg, ${action.from}, ${action.to})`,
                                    opacity: isHovered ? 1 : 0,
                                    transition: 'opacity 0.2s ease',
                                }}
                            />
                            <div
                                className="flex h-7 w-7 sm:h-9 sm:w-9 flex-shrink-0 items-center justify-center rounded-lg sm:rounded-xl"
                                style={{
                                    background: `linear-gradient(135deg, ${action.from}, ${action.to})`,
                                    boxShadow: isHovered ? `0 8px 18px -4px ${action.shadow}` : `0 4px 10px -4px ${action.shadow}`,
                                    transition: 'all 0.2s ease',
                                }}
                            >
                                <i className={`${action.icon} text-white text-[10px] sm:text-base`} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p
                                    className="truncate text-[10px] font-semibold sm:text-sm"
                                    style={{ color: isHovered ? action.from : '#2C3E50', transition: 'color 0.2s ease' }}
                                >
                                    {action.label}
                                </p>
                                <p className="mt-0.5 truncate text-[8px] text-slate-500 sm:text-xs">{action.sub}</p>
                            </div>
                            <div
                                className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg"
                                style={{
                                    background: isHovered ? `${action.from}18` : 'transparent',
                                    opacity: isHovered ? 1 : 0,
                                    transition: 'all 0.2s ease',
                                }}
                            >
                                <i className="ri-arrow-right-line text-[10px] sm:text-sm" style={{ color: action.from }} />
                            </div>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
