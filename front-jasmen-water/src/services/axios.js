import axios from 'axios'

// const baseURL = import.meta.env.VITE_BASE_URL

export const baseURL = 'https://jasminewaterflow.com:5000/'
// export const baseURL = 'http://localhost:3000/'

export default axios.create({
  baseURL: baseURL
})
