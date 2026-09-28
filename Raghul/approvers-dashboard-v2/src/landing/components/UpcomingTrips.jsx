import { useEffect, useState } from 'react'
import { kf } from '../../sdk/index.js'

function formatDate(dateString) {
    const date = new Date(dateString)
    if (Number.isNaN(date.getTime())) return '—'
    const day = date.getDate()
    const month = date.toLocaleString('default', { month: 'short' })

    let dayString = day.toString()
    if (day > 10 && day < 20) {
        dayString += 'th'
    } else {
        const lastDigit = day % 10
        switch (lastDigit) {
            case 1:
                dayString += 'st'
                break
            case 2:
                dayString += 'nd'
                break
            case 3:
                dayString += 'rd'
                break
            default:
                dayString += 'th'
        }
    }
    return `${dayString} ${month}`
}

function formatYear(dateString) {
    const date = new Date(dateString)
    if (Number.isNaN(date.getTime())) return ''
    return String(date.getFullYear())
}

export default function UpcomingTrips() {
    const [loading, setLoading] = useState(true)
    const [rows, setRows] = useState([])
    const [travelPageId, setTravelPageId] = useState('')
    const [fieldMap, setFieldMap] = useState({
        from: '',
        to: '',
        fromDate: '',
        toDate: '',
        description: '',
        mode: '',
    })

    useEffect(() => {
        const fetchData = async () => {
            try {
                const applicationId = kf?.app?._id
                const accountId = kf?.account?._id
                if (!applicationId || !accountId) return

                let travelProcessId = await kf.app.getVariable('travel_process_id')
                let upcomingReportId = await kf.app.getVariable('upcoming_travels_report_id')
                const tripsPage = await kf.app.getVariable('travels_page_id')
                setTravelPageId(tripsPage || '')

                if (!travelProcessId) {
                    const processList = await kf.api(`/flow/2/${accountId}/process?_application_id=${applicationId}`)
                    const travelProcess = (processList || []).find((item) => item?.Name === 'Travel Management')
                    travelProcessId = travelProcess?._id || ''
                    if (travelProcessId) await kf.app.setVariable('travel_process_id', travelProcessId)
                }

                if (!upcomingReportId && travelProcessId) {
                    const reports = await kf.api(`/flow/2/${accountId}/process/${travelProcessId}/report?_application_id=${applicationId}`)
                    const report = (reports || []).find((item) => item?.Name === 'Upcoming travels')
                    upcomingReportId = report?._id || ''
                    if (upcomingReportId) await kf.app.setVariable('upcoming_travels_report_id', upcomingReportId)
                }

                if (!travelProcessId || !upcomingReportId) {
                    setRows([])
                    setLoading(false)
                    return
                }

                const url = `/process-report/2/${accountId}/${travelProcessId}/${upcomingReportId}?_application_id=${applicationId}`
                const response = await kf.api(url)
                const columns = response?.Columns || []

                const colId = (fieldIds) => {
                    for (const fid of fieldIds) {
                        const id = columns.find((col) => col?.FieldId === fid)?.Id
                        if (id) return id
                    }
                    return ''
                }

                setFieldMap({
                    from: colId(['FS_From_City', 'Column_1qX1HxE34f', 'common_From']) || 'Column_1qX1HxE34f',
                    to: colId(['FS_To_City', 'Column_6VWxLVKxdg', 'common_To']) || 'Column_6VWxLVKxdg',
                    fromDate: colId(['FS_Departure_Date', 'Column_T7yk_UT6Hk', 'Common_from_date']) || 'Column_T7yk_UT6Hk',
                    toDate: columns.find((col) => col?.FieldId === 'Common_to_date')?.Id || '',
                    description: columns.find((col) => col?.FieldId === 'Purpose_of_Travel')?.Id || '',
                    mode: columns.find((col) => col?.FieldId === 'Mode_of_Transport')?.Id || '',
                })

                setRows(response?.Data || [])
            } catch (error) {
                console.error('Error fetching upcoming trips:', error)
                setRows([])
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    const viewMoreTravels = () => {
        if (!travelPageId) return
        kf.app.openPage(travelPageId)
    }

    const topRows = rows.slice(0, 2)

    return (
        <div className="overflow-hidden rounded-xl border border-white/80 bg-white/95 p-2.5 shadow-lg shadow-slate-200/40 backdrop-blur-sm sm:rounded-2xl sm:p-4 lg:rounded-3xl lg:p-5">
            <div className="mb-2.5 flex items-center justify-between sm:mb-4">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#1E88E5]/10 text-[#1E88E5] sm:h-9 sm:w-9">
                        <i className="ri-flight-takeoff-line text-sm sm:text-base" aria-hidden />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-800 sm:text-base">My upcoming travels</h3>
                </div>
                {rows.length > 2 && (
                    <button type="button" className="text-[10px] sm:text-xs font-semibold text-[#1E88E5] hover:underline" onClick={viewMoreTravels}>
                        View more
                    </button>
                )}
            </div>

            {loading ? (
                <div
                    className="animate-pulse space-y-3 rounded-xl p-3"
                    style={{
                        border: '1px solid #EEF2F7',
                        background: 'linear-gradient(135deg, #FAFCFF, #FFFFFF)',
                    }}
                >
                    {[0, 1].map((idx) => (
                        <div key={idx} className="rounded-xl border border-gray-100 p-3 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gray-200 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <div className="h-3 w-2/3 rounded bg-gray-200 mb-2" />
                                <div className="h-3 w-1/2 rounded bg-gray-100" />
                            </div>
                            <div className="w-16">
                                <div className="h-3 w-full rounded bg-gray-200 mb-2" />
                                <div className="h-3 w-2/3 rounded bg-gray-100 ml-auto" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : topRows.length > 0 ? (
                <div className="space-y-1.5 sm:space-y-2.5">
                    {topRows.map((item, idx) => {
                        const fromVal = item?.[fieldMap.from] || '—'
                        const toVal = item?.[fieldMap.to] || '—'
                        const desc = item?.[fieldMap.description] || 'No description'
                        const mode = item?.[fieldMap.mode] || ''
                        const fromDateVal = item?.[fieldMap.fromDate]
                        const toDateVal = item?.[fieldMap.toDate]
                        const isPublicTransport = String(mode).toLowerCase() === 'public transport'

                        return (
                            <div
                                key={item?._id || idx}
                                className="kpi-card flex flex-col gap-1.5 rounded-xl border border-slate-100/90 bg-gradient-to-br from-sky-50/60 via-white to-white p-2 sm:flex-row sm:items-center sm:gap-3 sm:p-3 animate-fade-in-up"
                                style={{ animationDelay: `${idx * 80}ms` }}
                            >
                                <div className="flex h-7 w-7 sm:h-9 sm:w-9 flex-shrink-0 items-center justify-center rounded-lg sm:rounded-xl text-white shadow-sm" style={{ background: 'linear-gradient(135deg, #1E88E5, #42A5F5)' }}>
                                    <i className={`${isPublicTransport ? 'ri-bus-line' : 'ri-train-line'} text-[10px] sm:text-base`} />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-[10px] font-semibold text-slate-800 sm:text-xs">{`${fromVal} - ${toVal}`}</p>
                                    <p className="mt-0.5 truncate text-[8px] text-slate-500 sm:text-xs">{desc}</p>
                                </div>

                                <div className="w-full flex-shrink-0 text-left sm:w-auto sm:text-right">
                                    <p className="text-[10px] font-semibold text-slate-800 sm:text-xs">{`${formatDate(fromDateVal)} - ${formatDate(toDateVal)}`}</p>
                                    <p className="text-[8px] text-slate-400 sm:text-xs">{formatYear(fromDateVal)}</p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            ) : (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center">
                    <div className="mx-auto mb-2" style={{ width: 80, height: 80 }}>
                        <svg viewBox="0 0 120 120" width="80" height="80" aria-hidden="true">
                            <rect x="18" y="18" width="84" height="84" rx="18" fill="#F8FAFC" stroke="#E4E7EC" />
                            <path d="M34 72h52l-6-18H40l-6 18z" fill="#1E88E5" opacity="0.18" />
                            <path d="M42 54h36v10H42z" fill="#1E88E5" opacity="0.35" />
                            <circle cx="48" cy="74" r="4" fill="#94A3B8" />
                            <circle cx="72" cy="74" r="4" fill="#94A3B8" />
                        </svg>
                    </div>
                    <p className="text-sm font-semibold text-slate-800">No upcoming travels found</p>
                </div>
            )}
        </div>
    )
}
