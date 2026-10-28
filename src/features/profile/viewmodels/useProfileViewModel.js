
import { useCallback, useEffect, useState } from 'react';
import { buscarPerfilUsuario } from '../services/profileService';

export default function useProfileViewModel() {
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  const carregarPerfil = useCallback(async () => {
    setLoading(true);
    setErro('');

    try {
      const dados = await buscarPerfilUsuario();
      setPerfil(dados);
    } catch (error) {
      setErro(error.message || 'Não foi possível carregar o perfil.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarPerfil();
  }, [carregarPerfil]);

  return {
    perfil,
    loading,
    erro,
    carregarPerfil,
  };
}
