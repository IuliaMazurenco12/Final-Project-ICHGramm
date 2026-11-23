import { Routes, Route } from 'react-router-dom';
import GuardedRoute from './components/GuardedRoute';
import ShellLayout from './components/ShellLayout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Messages from './pages/Messages';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import PostPage from './pages/PostPage';
import NotFound from './pages/NotFound';

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route
        element={
          <GuardedRoute>
            <ShellLayout />
          </GuardedRoute>
        }
      >
        <Route index element={<Home />} />
        <Route path="explore" element={<Explore />} />
        <Route path="messages" element={<Messages />} />
        <Route path="profile/edit" element={<EditProfile />} />
        <Route path="profile/:id" element={<Profile />} />
        <Route path="post/:id" element={<PostPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default App;