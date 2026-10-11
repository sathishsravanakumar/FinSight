import client from './client'

export const ratesApi = {
  live:     ()                        => client.get('/rates/live'),
  forecast: (currency, days = 120)    => client.get(`/rates/forecast/${currency}?days=${days}`),
  news:     ()                        => client.get('/rates/news'),
}
