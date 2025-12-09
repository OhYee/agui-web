import { useState, useRef, useEffect } from 'react'
import EventTag from './EventTag'
import './EventsPanel.css'

export default function EventsPanel({ events }) {
  const [expandedEvents, setExpandedEvents] = useState({})
  const [autoScroll, setAutoScroll] = useState(true)
  const listRef = useRef(null)
  
  useEffect(() => {
    if (autoScroll && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [events, autoScroll])
  
  const toggleEvent = (id) => {
    setExpandedEvents(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }
  
  const formatTimestamp = (ts) => {
    if (!ts) return ''
    const date = new Date(ts)
    return date.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3
    })
  }
  
  return (
    <div className="events-panel">
      <div className="events-header">
        <h3 className="events-title">
          Events
          <span className="events-count">{events.length}</span>
        </h3>
        <label className="events-autoscroll">
          <input
            type="checkbox"
            checked={autoScroll}
            onChange={(e) => setAutoScroll(e.target.checked)}
          />
          Auto-scroll
        </label>
      </div>
      
      <div className="events-list" ref={listRef}>
        {events.length === 0 ? (
          <div className="events-empty">
            No events yet. Send a message to see AG-UI events.
          </div>
        ) : (
          events.map((event) => (
            <div 
              key={event._id} 
              className={`event-item ${expandedEvents[event._id] ? 'event-item--expanded' : ''}`}
            >
              <button 
                className="event-item-header"
                onClick={() => toggleEvent(event._id)}
              >
                <EventTag type={event.type} />
                <span className="event-item-time">
                  {formatTimestamp(event.timestamp)}
                </span>
                <svg 
                  className="event-item-chevron" 
                  width="14" 
                  height="14" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              
              {expandedEvents[event._id] && (
                <div className="event-item-body">
                  <pre className="event-item-json">
                    {JSON.stringify(event, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

