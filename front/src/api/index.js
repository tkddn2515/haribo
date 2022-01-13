import axios from "axios";

export const get = async (url, params) => {
  const fullUrl = process.env.REACT_APP_API_URL + url;
  const req = await axios.get(fullUrl);
  return req.data;
}

export const post = async (url, params) => {
  const fullUrl = process.env.REACT_APP_API_URL + url;
  const req = await axios.post(fullUrl,  params);
  return req.data;
}

export const put = async (url, params) => {
  const fullUrl = process.env.REACT_APP_API_URL + url;
  const req = await axios.put(fullUrl,  params);
  return req.data;
}