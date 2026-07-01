import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import useSettings from '../../hooks/useSettings';
import Logo from '../../components/Logo';
import toast from 'react-hot-toast';
import './Admin.css';

export default function AdminLogin() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { settings } = useSettings();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      localStorage.setItem('admin_token', data.token);
      toast.success('Добро пожаловать!');
      navigate('/admin');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login">
      <form className="admin-login__form card" onSubmit={handleSubmit}>
        <div className="admin-login__logo">
          <Logo settings={settings} to={null} size="large" />
        </div>
        <h2>Вход в админ-панель</h2>

        <div className="form-group">
          <label>Логин</label>
          <input
            type="text"
            value={form.username}
            onChange={e => setForm({ ...form, username: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label>Пароль</label>
          <input
            type="password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary btn--lg" disabled={loading}>
          {loading ? 'Вход...' : 'Войти'}
        </button>
      </form>
    </div>
  );
}