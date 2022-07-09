import { useState, useCallback, useRef, useEffect } from 'react';
import { httpMethods } from './enum';

export const useHttpClient = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();

  const activeHttpRequests = useRef([]);
  const basicHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
  };

  const sendRequest = useCallback(async (url, method, authToken, body = null, headers = {}) => {
    if (
      Object.prototype.hasOwnProperty.call(headers, 'Content-Type') &&
      headers['Content-Type'] === 'multipart/form-data'
    ) {
      delete headers['Content-Type'];
      // console.log(headers);
      // let formBody = new FormData();
      // for (const property in body) {
      //   console.log(property);
      //   console.log(body[property]);
      //   formBody.append(property, body[property]);
      // }

      for (var key of body.entries()) {
        console.log(key[0] + ', ' + key[1]);
      }
    } else if ([httpMethods.Post, httpMethods.Patch, httpMethods.Put].includes(method)) {
      basicHeaders['Content-Type'] = 'application/json';
    }
    setIsLoading(true);
    const httpAbortCtrl = new AbortController();
    activeHttpRequests.current.push(httpAbortCtrl);
    const authHeader = authToken ? { Authorization: `Bearer ${authToken}` } : {};
    try {
      headers = { ...authHeader, ...basicHeaders, ...headers };
      console.log({
        method,
        body,
        headers,
        signal: httpAbortCtrl.signal
      });
      const response = await fetch(url, {
        method,
        body,
        headers,
        signal: httpAbortCtrl.signal
      });
      const responseData = await response.json();

      activeHttpRequests.current = activeHttpRequests.current.filter(
        (reqCtrl) => reqCtrl !== httpAbortCtrl
      );

      if (!response.ok) {
        throw new Error(responseData.message);
      }

      setIsLoading(false);
      return responseData;
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
      throw err;
    }
  }, []);

  const clearError = () => {
    setError(null);
  };

  useEffect(() => {
    return () => {
      activeHttpRequests.current.forEach((abortCtrl) => abortCtrl.abort());
    };
  }, []);

  return { isLoading, error, sendRequest, clearError };
};
