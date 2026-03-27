import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
    const checkAuth = () => {
        const token = localStorage.getItem("token");
        const rawUser = localStorage.getItem("user");

        // If no token → user is logged out
        if (!token || !rawUser || rawUser === "undefined" || rawUser === "null") {
            setUser(null);
            setLoading(false);
            return;
        }

        try {
            const parsedUser = JSON.parse(rawUser);
            setUser(parsedUser);
        } catch (error) {
            console.error("Invalid user JSON:", error);
            // Clear corrupted data
            localStorage.removeItem("user");
            setUser(null);
        }

        setLoading(false);
    };

    checkAuth();
}, []);


    const login = async (email, password) => {
          localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("city"); 
        try {
            const response = await api.post('/auth/login', { email, password });
            const { token, user } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('city', user.city); 
            setUser(user);
            console.log("LOGIN USER:", user); 

            toast.success('Login successful!');

            // Redirect based on role
            switch (user.role) {
                case 'citizen':
                    navigate('/citizen/dashboard');
                    break;
                case 'admin':
                    navigate('/admin/dashboard');
                    break;
                case 'contractor':
                    navigate('/contractor/dashboard');
                    break;
                case 'superadmin':
                    navigate('/superadmin/dashboard');
                    break;
                default:
                    navigate('/');
            }
            return true;
        } catch (error) {
            console.error('Login error:', error);
            toast.error(error.response?.data?.message || 'Login failed');
            return false;
        }
    };

    const register = async (userData) => {
        localStorage.removeItem("token");
        try {
            const response = await api.post('/auth/register', userData);
            toast.success('Registration successful! Please login.');
            navigate('/login');
            return true;
        } catch (error) {
            console.error('Registration error:', error);
            toast.error(error.response?.data?.message || 'Registration failed');
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('city');
        setUser(null);
        navigate('/login');
        toast.success('Logged out successfully');
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
