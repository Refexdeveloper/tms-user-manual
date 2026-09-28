import { useState } from 'react'

const expenseTypeOptions = [
    { value: 'Daily Allowance', icon: 'ri-sun-line', color: '#EE6A31', bg: 'rgba(238,106,49,0.1)', label: 'Daily Allowance', hint: 'Per diem for official travel days' },
    { value: 'Food Claim', icon: 'ri-restaurant-2-line', color: '#139B49', bg: 'rgba(19,155,73,0.1)', label: 'Food Claim', hint: 'Meal expenses during official duties' },
    { value: 'Local Conveyance', icon: 'ri-taxi-line', color: '#2879b6', bg: 'rgba(40,121,182,0.1)', label: 'Local Conveyance', hint: 'Local travel within city for work' },
]

export default function AddExpenseModal({ onClose, onSave, defaultCategory = '', editingExpense = null }) {
    const [form, setForm] = useState({
        category: editingExpense?.category ?? defaultCategory,
        description: editingExpense?.description ?? '',
        amount: editingExpense?.amount?.toString() ?? '',
        date: editingExpense?.date ?? '',
        currency: 'INR',
        notes: '',
    })
    const [uploadedFiles, setUploadedFiles] = useState([])
    const [dragging, setDragging] = useState(false)
    const [submitted, setSubmitted] = useState(false)

    const selectedType = expenseTypeOptions.find((t) => t.value === form.category)

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        setSubmitted(true)
        setTimeout(() => {
            onSave(form)
            onClose()
        }, 800)
    }

    const handleDrop = (e) => {
        e.preventDefault()
        setDragging(false)
        const files = Array.from(e.dataTransfer.files)
        setUploadedFiles((prev) => [...prev, ...files.map((f) => f.name)])
    }

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-scale-in" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
                <div
                    className="h-1 w-full"
                    style={{
                        background: selectedType ? `linear-gradient(90deg, ${selectedType.color}, #7dc244)` : 'linear-gradient(90deg, #2879b6, #7dc244, #EE6A31)',
                    }}
                />

                <div className="flex items-center justify-between px-4 sm:px-6 py-4" style={{ borderBottom: '1px solid #f5f5f5' }}>
                    <div className="flex items-center gap-3">
                        {selectedType && (
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: selectedType.bg }}>
                                <i className={`${selectedType.icon} text-lg`} style={{ color: selectedType.color }} />
                            </div>
                        )}
                        <div>
                            <h3 className="text-base font-bold text-gray-900">
                                {editingExpense ? 'Edit Claim' : selectedType ? `New ${selectedType.label}` : 'New Expense Claim'}
                            </h3>
                            <p className="text-xs text-gray-400 mt-0.5">{selectedType ? selectedType.hint : 'Select an expense type to get started'}</p>
                        </div>
                    </div>
                    <button type="button" onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                        <i className="ri-close-line text-gray-500 text-lg" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="px-4 sm:px-6 py-5 space-y-5">
                    <div>
                        <label className="text-xs font-bold text-gray-700 block mb-2">
                            Expense Type <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            {expenseTypeOptions.map((opt) => (
                                <button
                                    type="button"
                                    key={opt.value}
                                    onClick={() => setForm({ ...form, category: opt.value })}
                                    className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 transition-all cursor-pointer"
                                    style={{
                                        borderColor: form.category === opt.value ? opt.color : '#f0f0f0',
                                        background: form.category === opt.value ? opt.bg : 'white',
                                        transform: form.category === opt.value ? 'scale(1.04)' : 'scale(1)',
                                        transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
                                        boxShadow: form.category === opt.value ? `0 4px 16px ${opt.bg}` : 'none',
                                    }}
                                >
                                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: form.category === opt.value ? opt.bg : '#f7f7f7' }}>
                                        <i className={`${opt.icon} text-lg`} style={{ color: form.category === opt.value ? opt.color : '#9ca3af' }} />
                                    </div>
                                    <span className="text-xs font-semibold text-center leading-tight" style={{ color: form.category === opt.value ? opt.color : '#6b7280' }}>
                                        {opt.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="text-xs font-medium text-gray-700 block mb-1.5">
                                Description <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                required
                                placeholder="Brief description of the expense"
                                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-gray-400 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-700 block mb-1.5">
                                Expense Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                name="date"
                                value={form.date}
                                onChange={handleChange}
                                required
                                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-gray-400 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-700 block mb-1.5">
                                Amount <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">₹</span>
                                <input
                                    type="number"
                                    name="amount"
                                    value={form.amount}
                                    onChange={handleChange}
                                    required
                                    placeholder="0.00"
                                    min="0"
                                    step="0.01"
                                    className="w-full border border-gray-200 rounded-xl pl-7 pr-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-gray-400 transition-colors"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-medium text-gray-700 block mb-1.5">Additional Notes</label>
                        <textarea
                            name="notes"
                            value={form.notes}
                            onChange={handleChange}
                            placeholder="Any additional context for this expense..."
                            rows={2}
                            maxLength={500}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-gray-400 resize-none transition-colors"
                        />
                        <div className="text-right mt-1">
                            <span className="text-xs text-gray-400">{form.notes.length}/500</span>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-medium text-gray-700 block mb-1.5">Upload Receipt / Bill</label>
                        <div
                            onDragOver={(e) => {
                                e.preventDefault()
                                setDragging(true)
                            }}
                            onDragLeave={() => setDragging(false)}
                            onDrop={handleDrop}
                            className={`border-2 border-dashed rounded-xl px-4 py-5 text-center transition-all cursor-pointer ${dragging ? 'scale-[1.02]' : ''}`}
                            style={{
                                borderColor: dragging ? (selectedType?.color ?? '#2879b6') : '#e5e7eb',
                                background: dragging ? (selectedType?.bg ?? 'rgba(40,121,182,0.06)') : '#fafafa',
                            }}
                        >
                            <div className="w-8 h-8 flex items-center justify-center mx-auto mb-2">
                                <i className="ri-upload-cloud-2-line text-2xl text-gray-400" />
                            </div>
                            <p className="text-sm text-gray-600 font-medium">
                                Drag &amp; drop or <span style={{ color: selectedType?.color ?? '#2879b6' }} className="cursor-pointer">browse files</span>
                            </p>
                            <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG up to 10MB</p>
                        </div>
                        {uploadedFiles.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                                {uploadedFiles.map((f, i) => (
                                    <div
                                        key={`${f}-${i}`}
                                        className="flex items-center gap-1.5 rounded-lg px-2.5 py-1"
                                        style={{
                                            background: selectedType?.bg ?? 'rgba(40,121,182,0.08)',
                                            border: `1px solid ${selectedType?.color ?? '#2879b6'}30`,
                                        }}
                                    >
                                        <div className="w-3 h-3 flex items-center justify-center">
                                            <i className="ri-file-line text-xs" style={{ color: selectedType?.color ?? '#2879b6' }} />
                                        </div>
                                        <span className="text-xs font-medium" style={{ color: selectedType?.color ?? '#2879b6' }}>
                                            {f}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setUploadedFiles(uploadedFiles.filter((_, idx) => idx !== i))}
                                            className="ml-1 cursor-pointer opacity-60 hover:opacity-100"
                                        >
                                            <i className="ri-close-line text-xs" style={{ color: selectedType?.color ?? '#2879b6' }} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-2" style={{ borderTop: '1px solid #f5f5f5' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors cursor-pointer whitespace-nowrap w-full sm:w-auto"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitted}
                            className="flex items-center justify-center gap-2 px-5 py-2.5 text-white text-sm font-bold rounded-xl cursor-pointer transition-all hover:scale-105 whitespace-nowrap disabled:opacity-70 disabled:cursor-not-allowed w-full sm:w-auto"
                            style={{
                                background: selectedType ? `linear-gradient(135deg, ${selectedType.color}, ${selectedType.color}cc)` : 'linear-gradient(135deg, #2879b6, #1D9AD4)',
                                boxShadow: `0 4px 16px ${selectedType?.bg ?? 'rgba(40,121,182,0.35)'}`,
                            }}
                        >
                            {submitted ? (
                                <>
                                    <i className="ri-loader-4-line animate-spin text-base" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <div className="w-4 h-4 flex items-center justify-center">
                                        <i className="ri-send-plane-line text-base" />
                                    </div>
                                    {editingExpense ? 'Update Claim' : 'Submit Claim'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
