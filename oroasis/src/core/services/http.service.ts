export class HttpService {
  async get<TResponse>(url: string, queryParams?: Record<string,string|number|boolean>, headers?: Record<string,string>): Promise<TResponse> {
    let fullUrl = url;
    if(queryParams && Object.keys(queryParams).length) {
      fullUrl += '?' + new URLSearchParams(queryParams as any).toString();
    }
    
    const res = await fetch(fullUrl, { method:'GET', headers });
    if(!res.ok) {
        throw new Error(`HTTP GET ${res.status} ${res.statusText}`);
    }

    return res.json() as Promise<TResponse>;
  }

  async post<TRequest, TResponse>(url: string, body: TRequest, headers?: Record<string,string>, queryParams?: Record<string,string|number|boolean>): Promise<TResponse> {
    const fullUrl = queryParams ? `${url}?${new URLSearchParams(queryParams as any).toString()}` : url;
    const res = await fetch(fullUrl, {
      method:'POST',
      headers:{'Content-Type':'application/json', ...(headers||{})},
      body: JSON.stringify(body)
    });
    
    if(!res.ok) {
        throw new Error(`HTTP POST ${res.status} ${res.statusText}`);
    }

    return res.json() as Promise<TResponse>;
  }
}
