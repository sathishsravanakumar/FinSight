import client from './client'

export const cardsApi = {
  validate: (card_number) => client.post('/cards/validate', { card_number }),
}
