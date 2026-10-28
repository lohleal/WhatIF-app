
import { useState } from 'react';

import {
    cadastrarUsuario,
    entrar,
    sair,
} from '../services/authService';

export default function useAuthViewModel() {
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState('');

    async function executar(operacao) {
        setLoading(true);
        setErro('');

        try {
            return await operacao();
        } catch (error) {
            console.log('Erro Firebase:', error.code, error.message);

            let mensagem = 'Não foi possível concluir a operação.';

            switch (error.code) {
                case 'auth/email-already-in-use':
                    mensagem = 'Este e-mail já está cadastrado.';
                    break;

                case 'auth/invalid-email':
                    mensagem = 'Informe um e-mail válido.';
                    break;

                case 'auth/weak-password':
                    mensagem = 'Escolha uma senha mais forte.';
                    break;

                case 'auth/invalid-credential':
                    mensagem = 'E-mail ou senha incorretos.';
                    break;

                case 'permission-denied':
                case 'firestore/permission-denied':
                    mensagem = 'Você não tem permissão para esta operação.';
                    break;
            }

            setErro(mensagem);
            throw error;
        } finally {
            setLoading(false);
        }
    }

    function login(email, senha) {
        if (!email?.trim()) {
            setErro('Informe seu e-mail.');
            return Promise.reject(new Error('E-mail obrigatório'));
        }

        if (!senha?.trim()) {
            setErro('Informe sua senha.');
            return Promise.reject(new Error('Senha obrigatória'));
        }

        return executar(() => entrar(email, senha));
    }

    function cadastro(nome, sobrenome, email, telefone, senha) {
        if (!nome?.trim()) {
            setErro('Informe seu nome.');
            return Promise.reject(new Error('Nome obrigatório'));
        }

        if (!sobrenome?.trim()) {
            setErro('Informe seu sobrenome.');
            return Promise.reject(new Error('Sobrenome obrigatório'));
        }

        if (!email?.trim()) {
            setErro('Informe seu e-mail.');
            return Promise.reject(new Error('E-mail obrigatório'));
        }

        if (!telefone?.trim()) {
            setErro('Informe seu telefone.');
            return Promise.reject(new Error('Telefone obrigatório'));
        }

        if (!senha) {
            setErro('Informe sua senha.');
            return Promise.reject(new Error('Senha obrigatória'));
        }

        return executar(() =>
            cadastrarUsuario(nome, sobrenome, email, telefone, senha)
        );
    }

    function logout() {
        return executar(() => sair());
    }

    return {
        loading,
        erro,
        login,
        cadastro,
        logout,
    };
}
