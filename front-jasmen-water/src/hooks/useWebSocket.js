import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'

const baseURL = 'https://jasminewaterflow.com:5000/'
// const baseURL = 'http://localhost:3000/'

export function useWebSocket(userId) {
  const [socket, setSocket] = useState(null)
  const [userRealTimeData, setUserRealTimeData] = useState(null)

  useEffect(() => {
    // Initialize WebSocket connection
    const newSocket = io(baseURL, {
      withCredentials: true,
      transports: ['websocket']
    })

    setSocket(newSocket)

    // Clean up connection on unmount
    return () => {
      newSocket.disconnect()
    }
  }, [])

  useEffect(() => {
    if (socket && userId) {
      // Emit an event to request user data
      socket.emit('viewUserProfile', userId)

      // Listen for real-time updates
      socket.on('userConsumptionUpdate', (data) => {
        setUserRealTimeData(data)
      })
    }

    // Cleanup event listeners when the component unmounts or dependencies change
    return () => {
      if (socket) {
        socket.off('userConsumptionUpdate')
      }
    }
  }, [socket, userId])

  return { socket, userRealTimeData }
}
