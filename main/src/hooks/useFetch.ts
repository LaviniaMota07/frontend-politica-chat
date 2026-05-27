import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

const BASE_URL = import.meta.env.VITE_URL_API || 'http://localhost:8080';

// ─── Tipos ────────────────────────────────────────────────────────────

interface SuccessAlert {
    title: string;
    message: string;
}

interface FetchOptions {
    body?: unknown;
    formData?: FormData;
    headers?: HeadersInit;
    successAlert?: SuccessAlert;
}

interface UseFetchReturn<T = unknown> {
    data: T | null;
    error: string | null;
    loading: boolean;
    get: (url: string, options?: Pick<FetchOptions, 'headers' | 'successAlert'>) => Promise<T | null>;
    post: (url: string, options?: FetchOptions) => Promise<T | null>;
    put: (url: string, options?: FetchOptions) => Promise<T | null>;
    patch: (url: string, options?: FetchOptions) => Promise<T | null>;
    del: (url: string, options?: Pick<FetchOptions, 'headers' | 'successAlert'>) => Promise<T | null>;
}

// ─── Hook ─────────────────────────────────────────────────────────────

export function useFetch<T = unknown>(): UseFetchReturn<T> {
    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const request = useCallback(
        async (
            method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
            url: string,
            options?: FetchOptions,
        ): Promise<T | null> => {
            setLoading(true);
            setError(null);

            try {
                const fetchInit: RequestInit = { method };

                // ── Headers & Body ──────────────────────────────
                if (options?.formData) {
                    // Quando é FormData, NÃO definir Content-Type — o browser define com boundary
                    fetchInit.body = options.formData;
                    fetchInit.headers = options.headers
                        ? { ...Object.fromEntries(new Headers(options.headers).entries()) }
                        : undefined;
                } else if (options?.body) {
                    fetchInit.body = JSON.stringify(options.body);
                    fetchInit.headers = {
                        'Content-Type': 'application/json',
                        ...(options.headers
                            ? Object.fromEntries(new Headers(options.headers).entries())
                            : {}),
                    };
                } else if (options?.headers) {
                    fetchInit.headers = options.headers;
                }

                // Incluir cookies/credenciais por padrão
                fetchInit.credentials = 'include';

                const response = await fetch(`${BASE_URL}${url}`, fetchInit);

                // ── Resposta não-ok → toast.error ───────────────
                if (!response.ok) {
                    let errorMessage = `Erro ${response.status}: ${response.statusText}`;

                    try {
                        const errorBody = await response.json();
                        if (errorBody?.message) {
                            errorMessage = typeof errorBody.message === 'string'
                                ? errorBody.message
                                : JSON.stringify(errorBody.message);
                        }
                    } catch {
                        // resposta não é JSON, usa a mensagem padrão
                    }

                    setError(errorMessage);
                    toast.error(errorMessage);
                    setLoading(false);
                    return null;
                }

                // ── Resposta ok ─────────────────────────────────
                let responseData: T | null = null;

                const contentType = response.headers.get('Content-Type') ?? '';
                if (contentType.includes('application/json')) {
                    responseData = (await response.json()) as T;
                } else {
                    // Para respostas sem corpo (204) ou texto simples
                    const text = await response.text();
                    responseData = (text ? text : null) as T | null;
                }

                setData(responseData);

                // ── Alerta de sucesso (quando configurado) ──────
                if (options?.successAlert) {
                    toast.success(
                        `${options.successAlert.title}\n${options.successAlert.message}`,
                        { duration: 4000 },
                    );
                }

                setLoading(false);
                return responseData;
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Erro inesperado na requisição.';
                setError(message);
                toast.error(message);
                setLoading(false);
                return null;
            }
        },
        [],
    );

    // ─── Métodos de conveniência ──────────────────────────────────────

    const get = useCallback(
        (url: string, options?: Pick<FetchOptions, 'headers' | 'successAlert'>) =>
            request('GET', url, options),
        [request],
    );

    const post = useCallback(
        (url: string, options?: FetchOptions) => request('POST', url, options),
        [request],
    );

    const put = useCallback(
        (url: string, options?: FetchOptions) => request('PUT', url, options),
        [request],
    );

    const patch = useCallback(
        (url: string, options?: FetchOptions) => request('PATCH', url, options),
        [request],
    );

    const del = useCallback(
        (url: string, options?: Pick<FetchOptions, 'headers' | 'successAlert'>) =>
            request('DELETE', url, options),
        [request],
    );

    return { data, error, loading, get, post, put, patch, del };
}
