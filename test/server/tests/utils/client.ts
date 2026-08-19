import { ofetch } from 'ofetch';

// Create a configured fetch instance pointing to the local API
export const api = ofetch.create({
  baseURL: 'http://localhost:4000/api/v1',
  ignoreResponseError: true, // We want to inspect error responses in our tests, not throw JS exceptions
});
