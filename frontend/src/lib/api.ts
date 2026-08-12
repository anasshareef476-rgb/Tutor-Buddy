import axios from 'axios'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

// Chat
export const sendMessage = (message: string, chatId?: number) =>
  api.post('/chats/', { message, chat_id: chatId }).then(r => r.data)

export const getChats = () =>
  api.get('/chats/').then(r => r.data)

export const getChatMessages = (chatId: number) =>
  api.get(`/chats/${chatId}/messages`).then(r => r.data)

export const deleteChat = (chatId: number) =>
  api.delete(`/chats/${chatId}`).then(r => r.data)

// Flashcards
export const getDecks = () =>
  api.get('/flashcards/decks').then(r => r.data)

export const createDeck = (name: string, description?: string) =>
  api.post('/flashcards/decks', { name, description }).then(r => r.data)

export const deleteDeck = (deckId: number) =>
  api.delete(`/flashcards/decks/${deckId}`).then(r => r.data)

export const getDeckCards = (deckId: number) =>
  api.get(`/flashcards/decks/${deckId}/cards`).then(r => r.data)

export const getDueCards = (deckId: number) =>
  api.get(`/flashcards/decks/${deckId}/due`).then(r => r.data)

export const addCard = (deckId: number, question: string, answer: string) =>
  api.post(`/flashcards/decks/${deckId}/cards`, { question, answer }).then(r => r.data)

export const reviewCard = (cardId: number, rating: 'again' | 'hard' | 'good' | 'easy') =>
  api.post(`/flashcards/cards/${cardId}/review`, { rating }).then(r => r.data)

export const generateFlashcards = (deckId: number, text: string) =>
  api.post('/flashcards/generate', { deck_id: deckId, text }).then(r => r.data)

// Documents
export const getDocuments = () =>
  api.get('/documents/').then(r => r.data)

export const uploadDocument = (file: File) => {
  const form = new FormData()
  form.append('file', file)
  return api.post('/documents/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data)
}

export const deleteDocument = (docId: number) =>
  api.delete(`/documents/${docId}`).then(r => r.data)

export default api
