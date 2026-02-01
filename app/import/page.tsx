'use client'
import { useState } from 'react'

export default function Import() {
  const [file, setFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<{ success: number; errors: string[] } | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setResult(null)
    }
  }

  const handleImport = async () => {
    if (!file) return

    setImporting(true)
    setResult(null)

    try {
      const text = await file.text()
      const response = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvData: text })
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ success: 0, errors: ['Failed to import file'] })
    } finally {
      setImporting(false)
    }
  }

  const downloadTemplate = () => {
    const template = `date,type,duration,distance,notes
2026-01-28,cycling,45,25.3,Indoor trainer session
2026-01-26,running,30,5.2,Easy recovery run
2026-01-24,cycling,60,32.1,Long endurance ride`

    const blob = new Blob([template], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'workout-template.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Import Workouts</h1>

        {/* Instructions */}
        <div className="bg-gray-800 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-bold text-white mb-4">How to Import</h2>
          <ol className="text-gray-300 space-y-2 list-decimal list-inside">
            <li>Download the template CSV file below</li>
            <li>Open it in Excel, Google Sheets, or any text editor</li>
            <li>Add your workout data (one workout per row)</li>
            <li>Save the file</li>
            <li>Upload it here</li>
          </ol>

          <button
            onClick={downloadTemplate}
            className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
          >
            Download CSV Template
          </button>
        </div>

        {/* CSV Format Info */}
        <div className="bg-gray-800 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-bold text-white mb-4">CSV Format</h2>
          <p className="text-gray-300 mb-2">Your CSV should have these columns:</p>
          <ul className="text-gray-400 space-y-1 list-disc list-inside">
            <li><span className="text-white">date</span> - Format: YYYY-MM-DD (e.g., 2026-01-28)</li>
            <li><span className="text-white">type</span> - cycling, running, swimming, or other</li>
            <li><span className="text-white">duration</span> - Minutes (e.g., 45)</li>
            <li><span className="text-white">distance</span> - Kilometers (e.g., 25.3) - optional</li>
            <li><span className="text-white">notes</span> - Any text - optional</li>
          </ul>
        </div>

        {/* File Upload */}
        <div className="bg-gray-800 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-bold text-white mb-4">Upload CSV File</h2>
          
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="block w-full text-gray-300 mb-4
              file:mr-4 file:py-2 file:px-4
              file:rounded-lg file:border-0
              file:bg-blue-600 file:text-white
              file:cursor-pointer file:hover:bg-blue-700"
          />

          {file && (
            <div className="mb-4">
              <p className="text-gray-300">Selected file: <span className="text-white">{file.name}</span></p>
            </div>
          )}

          <button
            onClick={handleImport}
            disabled={!file || importing}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            {importing ? 'Importing...' : 'Import Workouts'}
          </button>
        </div>

        {/* Results */}
        {result && (
          <div className={`p-6 rounded-lg ${result.errors.length > 0 ? 'bg-red-900/20 border border-red-500' : 'bg-green-900/20 border border-green-500'}`}>
            <h2 className="text-xl font-bold text-white mb-4">Import Results</h2>
            <p className="text-white mb-2">Successfully imported: {result.success} workouts</p>
            
            {result.errors.length > 0 && (
              <div>
                <p className="text-red-400 font-semibold mb-2">Errors:</p>
                <ul className="text-red-300 space-y-1 list-disc list-inside">
                  {result.errors.map((error, i) => (
                    <li key={i}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}