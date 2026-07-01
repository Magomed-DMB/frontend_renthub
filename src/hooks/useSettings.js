import { useState, useEffect } from 'react';
import api from '../services/api';

export default function useSettings() {
  const [settings, setSettings] = useState({
    site_name: '',
    site_logo: '',
    hero_tag: '',
    hero_title: '',
    hero_subtitle: '',
    hero_button_text: '',
    hero_button_link: '',
    hero_secondary_button_text: '',
    hero_secondary_button_link: '',
    hero_image: '',
    rent_conditions: '',
    delivery_info: '',
    contact_phone: '',
    contact_email: '',
    contact_address: '',
    footer_description: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/settings')
      .then(r => {
        // ✅ ИСПРАВЛЕНО: Используем именно то, что пришло с сервера
        setSettings(prev => ({
          ...prev,
          ...r.data
        }));
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  return { settings, loading };
}