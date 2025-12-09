import { useState, useRef, useEffect } from 'react'
import EventTag from './EventTag'
import './ChatPanel.css'

export default function ChatPanel({ 
  messages, 
  currentMessage, 
  steps, 
  toolCalls,
  onSend, 
  isRunning 
}) {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  
  useEffect(() => {
    scrollToBottom()
  }, [messages, currentMessage, steps, toolCalls])
  
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!input.trim() || isRunning) return
    
    onSend(input.trim())
    setInput('')
  }
  
  const activeToolCalls = Object.values(toolCalls).filter(tc => tc.status !== 'finished')
  const finishedToolCalls = Object.values(toolCalls).filter(tc => tc.status === 'finished')
  
  return (
    <div className="chat-panel">
      <div className="chat-messages">
        {/* Steps indicator */}
        {steps.length > 0 && (
          <div className="chat-steps">
            {steps.map((step, idx) => (
              <div key={idx} className={`chat-step chat-step--${step.status}`}>
                <EventTag type={step.status === 'running' ? 'STEP_STARTED' : 'STEP_FINISHED'} />
                <span className="chat-step-name">{step.name || 'Step'}</span>
                {step.status === 'running' && (
                  <span className="chat-step-spinner" />
                )}
              </div>
            ))}
          </div>
        )}
        
        {/* Messages */}
        {messages.map((msg) => (
          <div key={msg.id} className={`chat-message chat-message--${msg.role}`}>
            <div className="chat-message-header">
              <span className="chat-message-role">{msg.role}</span>
              {msg.role === 'error' && msg.code && (
                <span className="chat-message-error-code">{msg.code}</span>
              )}
            </div>
            <div className="chat-message-content">
              {msg.content}
            </div>
          </div>
        ))}
        
        {/* Tool calls */}
        {finishedToolCalls.map((tc) => (
          <div key={tc.id} className="chat-tool-call chat-tool-call--finished">
            <div className="chat-tool-call-header">
              <EventTag type="TOOL_CALL_END" />
              <span className="chat-tool-call-name">{tc.name}</span>
            </div>
            <div className="chat-tool-call-body">
              <div className="chat-tool-call-section">
                <span className="chat-tool-call-label">Arguments</span>
                <pre className="chat-tool-call-code">{formatJson(tc.args)}</pre>
              </div>
              {tc.result && (
                <div className="chat-tool-call-section">
                  <span className="chat-tool-call-label">Result</span>
                  <pre className="chat-tool-call-code">{tc.result}</pre>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {/* Active tool calls */}
        {activeToolCalls.map((tc) => (
          <div key={tc.id} className="chat-tool-call chat-tool-call--active">
            <div className="chat-tool-call-header">
              <EventTag type="TOOL_CALL_START" />
              <span className="chat-tool-call-name">{tc.name}</span>
              <span className="chat-tool-call-spinner" />
            </div>
            {tc.args && (
              <div className="chat-tool-call-body">
                <div className="chat-tool-call-section">
                  <span className="chat-tool-call-label">Arguments</span>
                  <pre className="chat-tool-call-code">{formatJson(tc.args)}</pre>
                </div>
              </div>
            )}
          </div>
        ))}
        
        {/* Streaming message */}
        {currentMessage && (
          <div className={`chat-message chat-message--${currentMessage.role} chat-message--streaming`}>
            <div className="chat-message-header">
              <span className="chat-message-role">{currentMessage.role}</span>
              <span className="chat-message-streaming-indicator">
                <span className="streaming-dot" />
                streaming
              </span>
            </div>
            <div className="chat-message-content">
              {currentMessage.content}
              <span className="chat-cursor" />
            </div>
          </div>
        )}
        
        {/* Running indicator */}
        {isRunning && !currentMessage && activeToolCalls.length === 0 && (
          <div className="chat-thinking">
            <span className="chat-thinking-dot" />
            <span className="chat-thinking-dot" />
            <span className="chat-thinking-dot" />
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <form className="chat-input-form" onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          type="text"
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          disabled={isRunning}
        />
        <button 
          type="submit" 
          className="chat-send-btn"
          disabled={isRunning || !input.trim()}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
          </svg>
        </button>
      </form>
    </div>
  )
}

function formatJson(str) {
  try {
    const obj = typeof str === 'string' ? JSON.parse(str) : str
    return JSON.stringify(obj, null, 2)
  } catch {
    return str
  }
}

