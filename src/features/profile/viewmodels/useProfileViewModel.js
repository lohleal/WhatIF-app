import { useCallback, useEffect, useState } from 'react';

import {
    atualizarPerfilUsuario,
    buscarPerfilUsuario,
} from '../services/profileService';

export default function useProfileViewModel() {
    const [perfil, setPerfil] = useState(null);
    const [loading, setLoading] = useState(true);
    const [salvando, setSalvando] = useState(false);
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

    const salvarPerfil = useCallback(async (dados) => {
        setSalvando(true);
        setErro('');

        try {
            const dadosAtualizados = await atualizarPerfilUsuario(dados);

            setPerfil((perfilAtual) => ({
                ...perfilAtual,
                ...dadosAtualizados,
            }));

            return true;
        } catch (error) {
            console.error('Erro ao atualizar perfil:', error);
            setErro(error.message || 'Não foi possível atualizar o perfil.');
            return false;
        } finally {
            setSalvando(false);
        }
    }, []);

    useEffect(() => {
        carregarPerfil();
    }, [carregarPerfil]);

    return {
        perfil,
        loading,
        salvando,
        erro,
        carregarPerfil,
        salvarPerfil,
    };
}