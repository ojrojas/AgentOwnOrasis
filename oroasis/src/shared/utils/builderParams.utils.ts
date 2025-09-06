import { IProviderConfig } from "../../core/types/provider.type";

export function buildProviderUrl(config: IProviderConfig, path: string, queryParams?: Record<string, string | number | boolean>): string {
    let url = config.baseUrl || '';

    if (config.version) {
        url += `/${config.version}`;
    }

    if (path) {
        url += `/${path.replace(/^\/+/, '')}`;
    }

    if (queryParams && Object.keys(queryParams).length > 0) {
        const query = Object.entries(queryParams)
            .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
            .join('&');
        url += `?${query}`;
    }

    return url;
}