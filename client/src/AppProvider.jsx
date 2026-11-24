import { FetcherProvider } from './contexts/Fetcher/FetcherProvider.jsx';
import { AuthProvider } from './contexts/Auth/AuthProvider.jsx';


export const AppProvider = ({ children }) => {
  return (
    <FetcherProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </FetcherProvider>
  );
};
