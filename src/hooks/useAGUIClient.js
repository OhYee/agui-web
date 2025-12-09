import { useCallback, useRef } from 'react'

export function useAGUIClient(apiUrl, onEvent) {
  const abortControllerRef = useRef(null)
  
  const sendMessage = useCallback(async (messages, options = {}) => {
    // Abort previous request if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    
    abortControllerRef.current = new AbortController()
    
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify({
          messages,
          threadId: options.threadId || crypto.randomUUID(),
          runId: options.runId || crypto.randomUUID(),
          ...options.extra
        }),
        signal: abortControllerRef.current.signal
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      
      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break
        
        buffer += decoder.decode(value, { stream: true })
        
        // Parse SSE events
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim()
            
            if (data === '[DONE]') {
              continue
            }
            
            try {
              const event = JSON.parse(data)
              onEvent(event)
            } catch (e) {
              console.warn('Failed to parse event:', data, e)
            }
          }
        }
      }
      
      // Process remaining buffer
      if (buffer.startsWith('data: ')) {
        const data = buffer.slice(6).trim()
        if (data && data !== '[DONE]') {
          try {
            const event = JSON.parse(data)
            onEvent(event)
          } catch (e) {
            console.warn('Failed to parse final event:', data, e)
          }
        }
      }
      
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Request aborted')
        return
      }
      
      onEvent({
        type: 'RUN_ERROR',
        message: error.message,
        code: 'CLIENT_ERROR',
        timestamp: Date.now()
      })
    }
  }, [apiUrl, onEvent])
  
  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }, [])
  
  return { sendMessage, abort }
}

