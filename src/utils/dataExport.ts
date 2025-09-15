// Utility functions for exporting data to CSV format

export const exportToCSV = (data: any[], filename: string) => {
  if (!data || data.length === 0) {
    console.warn('No data to export')
    return
  }

  // Get headers from the first object's keys
  const headers = Object.keys(data[0])
  
  // Create CSV content
  const csvContent = [
    // Header row
    headers.join(','),
    // Data rows
    ...data.map(row => 
      headers.map(header => {
        const value = row[header]
        // Handle values that might contain commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value || ''
      }).join(',')
    )
  ].join('\n')

  // Create and download the file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

export const formatAttendanceForExport = (attendance: any[]) => {
  return attendance.map(record => ({
    'Date': new Date(record.marked_at).toLocaleDateString(),
    'Class Name': record.class_name,
    'Status': record.status,
    'Time Marked': new Date(record.marked_at).toLocaleTimeString(),
    'QR Code Used': record.qr_code_used || 'N/A'
  }))
}

export const formatProfileForExport = (profile: any) => {
  return [{
    'Full Name': profile.full_name,
    'Email': profile.email,
    'Role': profile.role,
    'Department': profile.department || 'N/A',
    'Student ID': profile.student_id || 'N/A',
    'Created At': new Date(profile.created_at).toLocaleDateString(),
    'Last Updated': new Date(profile.updated_at).toLocaleDateString()
  }]
}