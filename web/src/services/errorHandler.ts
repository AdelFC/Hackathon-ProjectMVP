import { AxiosError } from 'axios';

// Types d'erreurs personnalisés
export enum ErrorType {
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  SERVER = 'SERVER',
  UNKNOWN = 'UNKNOWN'
}

export interface AppError {
  type: ErrorType;
  message: string;
  details?: any;
  statusCode?: number;
  timestamp: string;
}

// Mapper les codes d'erreur HTTP aux types d'erreur
function getErrorType(statusCode?: number): ErrorType {
  if (!statusCode) return ErrorType.NETWORK;
  
  switch (statusCode) {
    case 400:
      return ErrorType.VALIDATION;
    case 401:
      return ErrorType.AUTHENTICATION;
    case 403:
      return ErrorType.AUTHORIZATION;
    case 404:
      return ErrorType.NOT_FOUND;
    case 500:
    case 502:
    case 503:
    case 504:
      return ErrorType.SERVER;
    default:
      return ErrorType.UNKNOWN;
  }
}

// Messages d'erreur user-friendly
const errorMessages: Record<ErrorType, string> = {
  [ErrorType.NETWORK]: 'Impossible de se connecter au serveur. Vérifiez votre connexion internet.',
  [ErrorType.VALIDATION]: 'Les données fournies sont invalides. Veuillez vérifier et réessayer.',
  [ErrorType.AUTHENTICATION]: 'Vous devez vous connecter pour accéder à cette ressource.',
  [ErrorType.AUTHORIZATION]: 'Vous n\'avez pas les permissions nécessaires pour cette action.',
  [ErrorType.NOT_FOUND]: 'La ressource demandée n\'existe pas.',
  [ErrorType.SERVER]: 'Une erreur serveur est survenue. Veuillez réessayer plus tard.',
  [ErrorType.UNKNOWN]: 'Une erreur inattendue est survenue.'
};

// Gestionnaire d'erreur principal
export function handleError(error: any): AppError {
  const timestamp = new Date().toISOString();

  // Erreur Axios
  if (error.isAxiosError) {
    const axiosError = error as AxiosError<any>;
    const statusCode = axiosError.response?.status;
    const type = getErrorType(statusCode);
    
    // Extraire le message d'erreur du backend si disponible
    let message = errorMessages[type];
    if (axiosError.response?.data?.detail) {
      message = axiosError.response.data.detail;
    } else if (axiosError.response?.data?.message) {
      message = axiosError.response.data.message;
    }

    return {
      type,
      message,
      details: axiosError.response?.data,
      statusCode,
      timestamp
    };
  }

  // Erreur JavaScript standard
  if (error instanceof Error) {
    return {
      type: ErrorType.UNKNOWN,
      message: error.message,
      details: error.stack,
      timestamp
    };
  }

  // Erreur inconnue
  return {
    type: ErrorType.UNKNOWN,
    message: typeof error === 'string' ? error : 'Une erreur inconnue est survenue',
    details: error,
    timestamp
  };
}

// Logger d'erreur (peut être étendu pour envoyer à un service externe)
export function logError(error: AppError): void {
  if (import.meta.env.DEV) {
    console.group(`🚨 Error [${error.type}]`);
    console.error('Message:', error.message);
    console.error('Timestamp:', error.timestamp);
    if (error.details) {
      console.error('Details:', error.details);
    }
    if (error.statusCode) {
      console.error('Status Code:', error.statusCode);
    }
    console.groupEnd();
  }

  // En production, envoyer à un service de monitoring
  if (import.meta.env.PROD) {
    // TODO: Intégrer avec Sentry, LogRocket, etc.
    // window.Sentry?.captureException(error);
  }
}

// Retry logic pour les erreurs réseau
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: any;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Ne pas réessayer pour certaines erreurs
      const appError = handleError(error);
      if ([
        ErrorType.VALIDATION,
        ErrorType.AUTHENTICATION,
        ErrorType.AUTHORIZATION,
        ErrorType.NOT_FOUND
      ].includes(appError.type)) {
        throw error;
      }
      
      // Attendre avant de réessayer avec backoff exponentiel
      if (i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

// Hook pour gérer les erreurs dans les composants
export function useApiError() {
  const [error, setError] = React.useState<AppError | null>(null);
  const [isRetrying, setIsRetrying] = React.useState(false);

  const handleApiError = React.useCallback((error: any) => {
    const appError = handleError(error);
    logError(appError);
    setError(appError);
    return appError;
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  const retry = React.useCallback(async (fn: () => Promise<any>) => {
    setIsRetrying(true);
    clearError();
    
    try {
      const result = await retryWithBackoff(fn);
      return result;
    } catch (error) {
      handleApiError(error);
      throw error;
    } finally {
      setIsRetrying(false);
    }
  }, [handleApiError, clearError]);

  return {
    error,
    isRetrying,
    handleApiError,
    clearError,
    retry
  };
}

import React from 'react';