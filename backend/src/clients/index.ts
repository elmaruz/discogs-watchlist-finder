import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import Bottleneck from 'bottleneck';
import { fetchListingsForRelease } from '../services/listings.js';

const limiter = new Bottleneck({ minTime: 1100 });

export const fetchListingsForReleaseLimited = limiter.wrap(
  fetchListingsForRelease,
);

const client: AxiosInstance = axios.create({
  baseURL: 'https://api.discogs.com',
  headers: {
    'User-Agent': 'DiscogsSnapshot/1.0',
    Authorization: `Discogs token=${process.env.DISCOGS_TOKEN}`,
  },
});

export const discogs = {
  get: <T = any>(url: string, config?: AxiosRequestConfig) =>
    limiter.schedule(() => client.get<T>(url, config)),
};
