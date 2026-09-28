import { recentActivity } from '../../mocks/dashboard.js'

const statusConfig = {
    pending: { dot: '#FB8C00', bg: 'rgba(251,140,0,0.12)', glow: 'rgba(251,140,0,0.5)' },
    approved: { dot: '#43A047', bg: 'rgba(67,160,71,0.12)', glow: 'rgba(67,160,71,0.5)' },
    rejected: { dot: '#E53935', bg: 'rgba(229,57,53,0.12)', glow: 'rgba(229,57,53,0.5)' },
}

const avatarGradients = {
    AM: ['#1E88E5', '#42A5F5'],
    PS: ['#1565C0', '#1E88E5'],
    RN: ['#FB8C00', '#FB8C00'],
    SK: ['#1565C0', '#42A5F5'],
    VP: ['#43A047', '#43A047'],
    DM: ['#58595B', '#333842'],
}

const typeIcons = {
    expense: { icon: 'ri-receipt-line', color: '#FB8C00' },
    travel: { icon: 'ri-flight-takeoff-line', color: '#1E88E5' },
}

export default function RecentActivity() {
    return (
        <div className="overflow-hidden rounded-xl border border-white/80 bg-white/95 p-4 shadow-lg shadow-slate-200/40 backdrop-blur-sm sm:rounded-2xl sm:p-5 lg:rounded-3xl">
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1E88E5]/10 text-[#1E88E5]">
                        <i className="ri-history-line text-lg" aria-hidden />
                    </div>
                    <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-slate-800 sm:text-base">Recent Activity</h3>
                        <span className="rounded-full bg-[#f0f7ff] px-2 py-0.5 text-[11px] font-semibold text-[#1E88E5] ring-1 ring-[#1E88E5]/20">
                            {recentActivity.length}
                        </span>
                    </div>
                </div>
                <span className="cursor-pointer text-xs font-semibold text-[#1E88E5] hover:underline">View all</span>
            </div>

            <div className="space-y-2">
                {recentActivity.map((item, idx) => {
                    const grads = avatarGradients[item.avatar] || ['#58595B', '#333842']
                    const sc = statusConfig[item.status] || statusConfig.pending
                    const ti = typeIcons[item.type] || typeIcons.expense
                    return (
                        <div
                            key={item.id}
                            className="kpi-card flex cursor-pointer items-center gap-3 rounded-xl border border-slate-100/90 bg-gradient-to-br from-slate-50/80 via-white to-white p-3 animate-fade-in-up"
                            style={{ animationDelay: `${idx * 60}ms` }}
                        >
                            <div className="relative flex-shrink-0">
                                <div
                                    className="flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold text-white shadow-sm"
                                    style={{ background: `linear-gradient(135deg, ${grads[0]}, ${grads[1]})` }}
                                >
                                    {item.avatar}
                                </div>
                                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white" style={{ background: sc.dot }} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs leading-snug text-slate-800">
                                    <span className="font-semibold">{item.user}</span>{' '}
                                    <span className="text-slate-500">{item.action}</span>
                                </p>
                                <div className="mt-0.5 flex items-center gap-1.5">
                                    <div className="flex h-3 w-3 items-center justify-center" style={{ color: ti.color }}>
                                        <i className={`${ti.icon} text-[10px]`} />
                                    </div>
                                    <p className="text-xs text-slate-400">{item.time}</p>
                                </div>
                            </div>
                            <div className="flex-shrink-0 text-right">
                                <span className="rounded-full px-2 py-0.5 text-xs font-bold" style={{ background: sc.bg, color: sc.dot }}>
                                    {item.amount}
                                </span>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
