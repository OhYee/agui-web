import { useState, useRef, useCallback } from 'react'
import { useAGUIClient } from './hooks/useAGUIClient'
import Header from './components/Header'
import ConfigPanel from './components/ConfigPanel'
import ChatPanel from './components/ChatPanel'
import EventsPanel from './components/EventsPanel'
import StatePanel from './components/StatePanel'
import './App.css'

function App() {
  // Persist endpoint in localStorage under key `AGUI_ENDPOINT`
  const [apiUrl, setApiUrl] = useState(() => {
    try {
      return localStorage.getItem('AGUI_ENDPOINT') || 'http://localhost:9000/agui/v1/run'
    } catch (e) {
      return 'http://localhost:9000/agui/v1/run'
    }
  })
  const [messages, setMessages] = useState([])
  const [events, setEvents] = useState([])
  const [state, setState] = useState({})
  const [steps, setSteps] = useState([])
  const [toolCalls, setToolCalls] = useState({})
  const [currentMessage, setCurrentMessage] = useState(null)
  const [isRunning, setIsRunning] = useState(false)
  // Ensure we have a stable user id for messages; persist to localStorage
  const [userId] = useState(() => {
    try {
      const existing = localStorage.getItem('AGUI_USER_ID')
      if (existing) return existing
      const newId = 'user-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 9)
      localStorage.setItem('AGUI_USER_ID', newId)
      return newId
    } catch (e) {
      return 'user-local'
    }
  })

  const messagesRef = useRef([])

  const handleEvent = useCallback((event) => {
    // 记录所有事件
    setEvents(prev => [...prev, { ...event, _id: Date.now() + Math.random() }])

    const { type } = event

    switch (type) {
      case 'RUN_STARTED':
        setIsRunning(true)
        break

      case 'RUN_FINISHED':
        setIsRunning(false)
        if (currentMessage) {
          setCurrentMessage(null)
        }
        break

      case 'RUN_ERROR':
        setIsRunning(false)
        setMessages(prev => [...prev, {
          id: Date.now(),
          role: 'error',
          content: event.message || 'Unknown error',
          code: event.code
        }])
        break

      case 'STEP_STARTED':
        setSteps(prev => [...prev, {
          name: event.stepName,
          status: 'running',
          startTime: event.timestamp
        }])
        break

      case 'STEP_FINISHED':
        setSteps(prev => prev.map(step =>
          step.name === event.stepName
            ? { ...step, status: 'finished', endTime: event.timestamp }
            : step
        ))
        break

      case 'TEXT_MESSAGE_START':
        setCurrentMessage({
          id: event.messageId,
          role: event.role || 'assistant',
          content: ''
        })
        break

      case 'TEXT_MESSAGE_CONTENT':
        setCurrentMessage(prev => prev ? {
          ...prev,
          content: prev.content + (event.delta || '')
        } : null)
        break

      case 'TEXT_MESSAGE_END':
        setCurrentMessage(prev => {
          if (prev) {
            setMessages(msgs => [...msgs, prev])
          }
          return null
        })
        break

      case 'TOOL_CALL_START':
        setToolCalls(prev => ({
          ...prev,
          [event.toolCallId]: {
            id: event.toolCallId,
            name: event.toolCallName,
            args: '',
            result: null,
            status: 'calling'
          }
        }))
        break

      case 'TOOL_CALL_ARGS':
        setToolCalls(prev => ({
          ...prev,
          [event.toolCallId]: {
            ...prev[event.toolCallId],
            args: (prev[event.toolCallId]?.args || '') + (event.delta || '')
          }
        }))
        break

      case 'TOOL_CALL_RESULT':
        setToolCalls(prev => ({
          ...prev,
          [event.toolCallId]: {
            ...prev[event.toolCallId],
            result: event.result,
            status: 'completed'
          }
        }))
        break

      case 'TOOL_CALL_END':
        setToolCalls(prev => ({
          ...prev,
          [event.toolCallId]: {
            ...prev[event.toolCallId],
            status: 'finished'
          }
        }))
        break

      case 'STATE_SNAPSHOT':
        setState(event.snapshot || {})
        break

      case 'STATE_DELTA':
        // Apply JSON Patch
        if (event.delta && Array.isArray(event.delta)) {
          setState(prev => applyJsonPatch(prev, event.delta))
        }
        break

      case 'MESSAGES_SNAPSHOT':
        if (event.messages) {
          setMessages(event.messages.map(m => ({
            id: m.id,
            role: m.role,
            content: m.content
          })))
        }
        break

      case 'CUSTOM':
        // Custom events are just logged
        break

      default:
        break
    }
  }, [currentMessage])

  const { sendMessage } = useAGUIClient(apiUrl, handleEvent)

  // wrapper to persist API url when changed
  const handleApiUrlChange = (url) => {
    setApiUrl(url)
    try { localStorage.setItem('AGUI_ENDPOINT', url) } catch (e) { }
  }

  const handleSend = async (content) => {
    // Add user message
    const userMsg = {
      id: Date.now(),
      role: 'user',
      content,
      user: { id: userId }
    }
    setMessages(prev => [...prev, userMsg])
    messagesRef.current = [...messagesRef.current, userMsg]

    // Clear previous run state
    setSteps([])
    setToolCalls({})

    // Build full message objects including ids and user ids where appropriate
    const messagesToSend = messagesRef.current.map(m => ({
      id: `${m.id}`,
      role: m.role,
      content: m.content,
    }))

    // Minimal required additional fields to satisfy backend validation
    const extra = {
      state: state || {},
      tools: [],
      context: [],
      forwardedProps: {}
    }

    // Send to API with extra parameters
    await sendMessage(messagesToSend, { extra })
  }

  const handleClear = () => {
    setMessages([])
    setEvents([])
    setState({})
    setSteps([])
    setToolCalls({})
    setCurrentMessage(null)
    messagesRef.current = []
  }

  return (
    <div className="app">
      <Header />

      <div className="app-layout">
        <div className="main-column">
          <ConfigPanel
            apiUrl={apiUrl}
            onApiUrlChange={handleApiUrlChange}
            onClear={handleClear}
            isRunning={isRunning}
          />

          <ChatPanel
            messages={messages}
            currentMessage={currentMessage}
            steps={steps}
            toolCalls={toolCalls}
            onSend={handleSend}
            isRunning={isRunning}
          />
        </div>

        <div className="side-column">
          <StatePanel state={state} />
          <EventsPanel events={events} />
        </div>
      </div>
    </div>
  )
}

// Simple JSON Patch apply
function applyJsonPatch(obj, patches) {
  const result = JSON.parse(JSON.stringify(obj))

  for (const patch of patches) {
    const { op, path, value } = patch
    const parts = path.split('/').filter(Boolean)

    if (op === 'add' || op === 'replace') {
      let current = result
      for (let i = 0; i < parts.length - 1; i++) {
        current = current[parts[i]]
      }
      current[parts[parts.length - 1]] = value
    } else if (op === 'remove') {
      let current = result
      for (let i = 0; i < parts.length - 1; i++) {
        current = current[parts[i]]
      }
      delete current[parts[parts.length - 1]]
    }
  }

  return result
}

export default App

