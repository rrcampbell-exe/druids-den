import { useState, useEffect, useMemo } from 'react'
import { ResponsiveLine } from '@nivo/line'
import { ResponsiveBar } from '@nivo/bar'
import './Reports.scss'

const Reports = () => {
  const [reservations, setReservations] = useState([])
  const [timeRange, setTimeRange] = useState('ytd') // ytd, year, custom
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')
  const [includeOwnerInMetrics, setIncludeOwnerInMetrics] = useState(false)
  const [includeOwnerInBookings, setIncludeOwnerInBookings] = useState(true)

  useEffect(() => {
    // Load reservations
    fetch('/mock-reservations.json')
      .then(res => res.json())
      .then(data => setReservations(data.reservations || data))
      .catch(err => console.error('Error loading reservations:', err))
  }, [])

  // Filter reservations by time range and completed/approved status
  const filteredReservations = useMemo(() => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const yearStart = new Date(currentYear, 0, 1)
    
    let startDate = yearStart
    let endDate = now
    
    if (timeRange === 'year') {
      startDate = new Date(currentYear, 0, 1)
      endDate = new Date(currentYear, 11, 31)
    } else if (timeRange === 'custom' && customStart && customEnd) {
      startDate = new Date(customStart)
      endDate = new Date(customEnd)
    }
    
    return reservations.filter(res => {
      if (res.status !== 'completed' && res.status !== 'approved') return false
      const checkOut = new Date(res.checkOut)
      return checkOut >= startDate && checkOut <= endDate
    })
  }, [reservations, timeRange, customStart, customEnd])

  // Calculate metrics
  const metrics = useMemo(() => {
    const metricsReservations = includeOwnerInMetrics 
      ? filteredReservations 
      : filteredReservations.filter(r => !r.isOwnerReservation)
    
    if (metricsReservations.length === 0) {
      return {
        totalRevenue: 0,
        avgRevenuePerBooking: 0,
        avgRevenuePerNight: 0,
        totalNights: 0,
        occupancyRate: 0,
        totalBookings: 0,
        avgStayLength: 0,
        avgLeadTime: 0,
        avgPartySize: 0,
        guestReservations: 0,
        ownerReservations: 0
      }
    }

    const guestReservations = metricsReservations.filter(r => !r.isOwnerReservation)
    const ownerReservations = metricsReservations.filter(r => r.isOwnerReservation)
    
    const totalRevenue = guestReservations.reduce((sum, res) => {
      return sum + (res.estimatedTotal || 0)
    }, 0)

    const totalNights = guestReservations.reduce((sum, res) => {
      const checkIn = new Date(res.checkIn)
      const checkOut = new Date(res.checkOut)
      const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24))
      return sum + nights
    }, 0)

    const totalGuests = guestReservations.reduce((sum, res) => {
      return sum + (res.adults || 0) + (res.children || 0)
    }, 0)

    const totalLeadTime = guestReservations.reduce((sum, res) => {
      const submitted = new Date(res.submittedAt)
      const checkIn = new Date(res.checkIn)
      const leadDays = Math.ceil((checkIn - submitted) / (1000 * 60 * 60 * 24))
      return sum + leadDays
    }, 0)

    // Calculate occupancy (total booked nights / available nights in period)
    const now = new Date()
    const currentYear = now.getFullYear()
    const yearStart = new Date(currentYear, 0, 1)
    const yearEnd = new Date(currentYear, 11, 31)
    
    let periodStart = yearStart
    let periodEnd = now
    
    if (timeRange === 'year') {
      periodStart = yearStart
      periodEnd = yearEnd
    } else if (timeRange === 'custom' && customStart && customEnd) {
      periodStart = new Date(customStart)
      periodEnd = new Date(customEnd)
    }
    
    const availableDays = Math.ceil((periodEnd - periodStart) / (1000 * 60 * 60 * 24))
    const allBookedNights = metricsReservations.reduce((sum, res) => {
      const checkIn = new Date(res.checkIn)
      const checkOut = new Date(res.checkOut)
      const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24))
      return sum + nights
    }, 0)

    return {
      totalRevenue,
      avgRevenuePerBooking: guestReservations.length > 0 ? totalRevenue / guestReservations.length : 0,
      avgRevenuePerNight: totalNights > 0 ? totalRevenue / totalNights : 0,
      totalNights,
      occupancyRate: availableDays > 0 ? (allBookedNights / availableDays) * 100 : 0,
      totalBookings: guestReservations.length,
      avgStayLength: guestReservations.length > 0 ? totalNights / guestReservations.length : 0,
      avgLeadTime: guestReservations.length > 0 ? totalLeadTime / guestReservations.length : 0,
      avgPartySize: guestReservations.length > 0 ? totalGuests / guestReservations.length : 0,
      guestReservations: guestReservations.length,
      ownerReservations: ownerReservations.length
    }
  }, [filteredReservations, timeRange, customStart, customEnd, includeOwnerInMetrics])

  // Revenue by month data
  const revenueByMonth = useMemo(() => {
    const monthlyData = {}
    
    filteredReservations
      .filter(r => !r.isOwnerReservation)
      .forEach(res => {
        const checkOut = new Date(res.checkOut)
        const monthKey = `${checkOut.getFullYear()}-${String(checkOut.getMonth() + 1).padStart(2, '0')}`
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = {
            month: monthKey,
            revenue: 0,
            bookings: 0
          }
        }
        
        monthlyData[monthKey].revenue += res.estimatedTotal || 0
        monthlyData[monthKey].bookings += 1
      })

    const sortedData = Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month))
    
    return [{
      id: 'Revenue',
      data: sortedData.map(d => ({
        x: d.month,
        y: d.revenue
      }))
    }]
  }, [filteredReservations])

  // Bookings by month for bar chart
  const bookingsByMonth = useMemo(() => {
    const bookingsReservations = includeOwnerInBookings 
      ? filteredReservations 
      : filteredReservations.filter(r => !r.isOwnerReservation)
    
    const monthlyData = {}
    
    bookingsReservations.forEach(res => {
      const checkOut = new Date(res.checkOut)
      const monthKey = `${checkOut.getFullYear()}-${String(checkOut.getMonth() + 1).padStart(2, '0')}`
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthKey,
          guest: 0,
          owner: 0
        }
      }
      
      if (res.isOwnerReservation) {
        monthlyData[monthKey].owner += 1
      } else {
        monthlyData[monthKey].guest += 1
      }
    })

    return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month))
  }, [filteredReservations, includeOwnerInBookings])

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const formatMonth = (monthStr) => {
    const [year, month] = monthStr.split('-')
    const date = new Date(year, parseInt(month) - 1)
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }

  // Get today's date in YYYY-MM-DD format for max date constraint
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className='reports-container'>
      <div className='reports-header'>
        <h2>Analytics & Reports</h2>
        
        <div className='time-range-selector'>
          <button
            className={timeRange === 'ytd' ? 'active' : ''}
            onClick={() => setTimeRange('ytd')}
          >
            Year to Date
          </button>
          <button
            className={timeRange === 'year' ? 'active' : ''}
            onClick={() => setTimeRange('year')}
          >
            Full Year
          </button>
          <button
            className={timeRange === 'custom' ? 'active' : ''}
            onClick={() => setTimeRange('custom')}
          >
            Custom Range
          </button>
        </div>

        {timeRange === 'custom' && (
          <div className='custom-range-inputs'>
            <input
              type='date'
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              max={today}
              placeholder='Start date'
            />
            <span>to</span>
            <input
              type='date'
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              max={today}
              placeholder='End date'
            />
          </div>
        )}
      </div>

      {/* Key Metrics Cards */}
      <div className='metrics-section'>
        <div className='section-header'>
          <h3>Key Metrics</h3>
          <label className='toggle-label'>
            <input
              type='checkbox'
              checked={includeOwnerInMetrics}
              onChange={(e) => setIncludeOwnerInMetrics(e.target.checked)}
            />
            <span>Include Owner Reservations</span>
          </label>
        </div>
      </div>
      <div className='metrics-grid'>
        <div className='metric-card revenue'>
          <div className='metric-icon'>💰</div>
          <div className='metric-content'>
            <h3>Total Revenue</h3>
            <p className='metric-value'>{formatCurrency(metrics.totalRevenue)}</p>
            <p className='metric-detail'>{metrics.totalBookings} bookings</p>
          </div>
        </div>

        <div className='metric-card occupancy'>
          <div className='metric-icon'>📊</div>
          <div className='metric-content'>
            <h3>Occupancy Rate</h3>
            <p className='metric-value'>{metrics.occupancyRate.toFixed(1)}%</p>
            <p className='metric-detail'>{metrics.totalNights} nights booked</p>
          </div>
        </div>

        <div className='metric-card avg-revenue'>
          <div className='metric-icon'>📈</div>
          <div className='metric-content'>
            <h3>Avg Revenue/Booking</h3>
            <p className='metric-value'>{formatCurrency(metrics.avgRevenuePerBooking)}</p>
            <p className='metric-detail'>{formatCurrency(metrics.avgRevenuePerNight)}/night</p>
          </div>
        </div>

        <div className='metric-card stay-length'>
          <div className='metric-icon'>🗓️</div>
          <div className='metric-content'>
            <h3>Avg Stay Length</h3>
            <p className='metric-value'>{metrics.avgStayLength.toFixed(1)} nights</p>
            <p className='metric-detail'>{metrics.totalNights} total nights</p>
          </div>
        </div>

        <div className='metric-card lead-time'>
          <div className='metric-icon'>⏱️</div>
          <div className='metric-content'>
            <h3>Avg Booking Lead Time</h3>
            <p className='metric-value'>{metrics.avgLeadTime.toFixed(0)} days</p>
            <p className='metric-detail'>in advance</p>
          </div>
        </div>

        <div className='metric-card party-size'>
          <div className='metric-icon'>👥</div>
          <div className='metric-content'>
            <h3>Avg Party Size</h3>
            <p className='metric-value'>{metrics.avgPartySize.toFixed(1)} guests</p>
            <p className='metric-detail'>{metrics.guestReservations} guest bookings</p>
          </div>
        </div>
      </div>

      {/* Revenue Over Time Chart */}
      {revenueByMonth[0]?.data.length > 0 && (
        <div className='chart-container'>
          <h3>Revenue Over Time</h3>
          <div className='chart-wrapper'>
            <ResponsiveLine
              data={revenueByMonth}
              margin={{ top: 20, right: 20, bottom: 60, left: 80 }}
              xScale={{ type: 'point' }}
              yScale={{ type: 'linear', min: 'auto', max: 'auto' }}
              curve='monotoneX'
              axisBottom={{
                tickRotation: -45,
                format: formatMonth,
                legend: 'Month',
                legendOffset: 50,
                legendPosition: 'middle'
              }}
              axisLeft={{
                format: (value) => formatCurrency(value),
                legend: 'Revenue',
                legendOffset: -70,
                legendPosition: 'middle'
              }}
              colors={['#BAB6A2']}
              lineWidth={3}
              pointSize={10}
              pointColor='#fff'
              pointBorderWidth={2}
              pointBorderColor={{ from: 'serieColor' }}
              enableArea={true}
              areaOpacity={0.1}
              useMesh={true}
              tooltip={({ point }) => (
                <div style={{
                  background: 'white',
                  padding: '12px 16px',
                  border: '2px solid #BAB6A2',
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                }}>
                  <strong>{formatMonth(point.data.x)}</strong>
                  <div style={{ marginTop: '4px' }}>{formatCurrency(point.data.y)}</div>
                </div>
              )}
            />
          </div>
        </div>
      )}

      {/* Bookings by Month Chart */}
      {bookingsByMonth.length > 0 && (
        <div className='chart-container'>
          <div className='chart-header'>
            <h3>Bookings by Month</h3>
            <label className='toggle-label'>
              <input
                type='checkbox'
                checked={includeOwnerInBookings}
                onChange={(e) => setIncludeOwnerInBookings(e.target.checked)}
              />
              <span>Include Owner Reservations</span>
            </label>
          </div>
          <div className='chart-wrapper'>
            <ResponsiveBar
              data={bookingsByMonth}
              keys={['owner', 'guest']}
              indexBy='month'
              margin={{ top: 20, right: 120, bottom: 60, left: 60 }}
              padding={0.3}
              groupMode='stacked'
              colors={['#6b8e6f', '#BAB6A2']}
              axisBottom={{
                tickRotation: -45,
                format: formatMonth,
                legend: 'Month',
                legendOffset: 50,
                legendPosition: 'middle'
              }}
              axisLeft={{
                legend: 'Bookings',
                legendOffset: -50,
                legendPosition: 'middle'
              }}
              labelSkipWidth={12}
              labelSkipHeight={12}
              legends={[
                {
                  dataFrom: 'keys',
                  anchor: 'bottom-right',
                  direction: 'column',
                  justify: false,
                  translateX: 120,
                  translateY: 0,
                  itemsSpacing: 2,
                  itemWidth: 100,
                  itemHeight: 20,
                  itemDirection: 'left-to-right',
                  symbolSize: 20,
                  effects: [
                    {
                      on: 'hover',
                      style: {
                        itemOpacity: 1
                      }
                    }
                  ]
                }
              ]}
              tooltip={({ id, value, indexValue }) => (
                <div style={{
                  background: 'white',
                  padding: '12px 16px',
                  border: '2px solid #464645',
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                }}>
                  <strong>{formatMonth(indexValue)}</strong>
                  <div style={{ marginTop: '4px', textTransform: 'capitalize' }}>
                    {id}: {value} booking{value !== 1 ? 's' : ''}
                  </div>
                </div>
              )}
            />
          </div>
        </div>
      )}

      {/* Revenue Table */}
      {filteredReservations.filter(r => !r.isOwnerReservation).length > 0 && (
        <div className='revenue-table-container'>
          <h3>Revenue Breakdown</h3>
          <table className='revenue-table'>
            <thead>
              <tr>
                <th>Guest</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Nights</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {filteredReservations
                .filter(r => !r.isOwnerReservation)
                .sort((a, b) => new Date(b.checkOut) - new Date(a.checkOut))
                .map(res => {
                  const checkIn = new Date(res.checkIn)
                  const checkOut = new Date(res.checkOut)
                  const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24))
                  
                  return (
                    <tr key={res.id}>
                      <td>{res.firstName} {res.lastName}</td>
                      <td>{checkIn.toLocaleDateString()}</td>
                      <td>{checkOut.toLocaleDateString()}</td>
                      <td>{nights}</td>
                      <td className='revenue-cell'>{formatCurrency(res.estimatedTotal || 0)}</td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>
      )}

      {filteredReservations.length === 0 && (
        <div className='no-data'>
          <p>No data available for the selected time period.</p>
        </div>
      )}
    </div>
  )
}

export default Reports
