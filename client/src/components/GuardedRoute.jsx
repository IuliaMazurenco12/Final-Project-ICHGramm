import { Navigate } from 'react-router-dom';
import { useCurrentUser } from '../context/CurrentUserContext';

const GuardedRoute = ({ children }) => {
  const { currentUser, isChecking } = useCurrentUser();

  if (isChecking) return null;

  if (!currentUser) return <Navigate to="/login" replace />;

  return children;
};

export default GuardedRoute;