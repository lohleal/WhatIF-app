
import { useState } from 'react';

import {
    EmailAuthProvider,
    reauthenticateWithCredential,
    sendPasswordResetEmail,
    updatePassword,
    updateProfile,
} from 'firebase/auth';

import { auth } from '../../../services/firebase/firebaseConfig';

import {
    Eye,
    EyeOff,
    LockKeyhole,
    Mail,
    Pencil,
    Save,
    ShieldCheck,
    UserRound,
    X,
} from 'lucide-react';

import { useAuth } from '../../auth/contexts/AuthContext';

import './ProfileScreen.css';

export default function ProfileScreen() {
    const { user } = useAuth();

    // INFORMAÇÕES PESSOAIS
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState(
        user?.displayName || 'Administrador'
    );
    const [editedName, setEditedName] = useState(name);
    const [saving, setSaving] = useState(false);

    // ALTERAÇÃO DE SENHA
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPasswords, setShowPasswords] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);

    // CANCELAR EDIÇÃO DO NOME
    function handleCancel() {
        setEditedName(name);
        setEditing(false);
    }

    // SALVAR NOME NO FIREBASE
    async function handleSave() {
        const newName = editedName.trim();

        if (!newName) {
            alert('Digite um nome válido.');
            return;
        }

        if (!user) {
            alert('Não foi possível identificar o administrador.');
            return;
        }

        try {
            setSaving(true);

            await updateProfile(user, {
                displayName: newName,
            });

            setName(newName);
            setEditedName(newName);
            setEditing(false);

            alert('Nome atualizado com sucesso!');
        } catch (error) {
            console.error('Erro ao atualizar nome:', error);
            alert('Não foi possível atualizar o nome. Tente novamente.');
        } finally {
            setSaving(false);
        }
    }

    // ALTERAR SENHA NO FIREBASE
    async function handlePasswordChange() {
        if (!currentPassword || !newPassword || !confirmPassword) {
            alert('Preencha todos os campos.');
            return;
        }

        if (newPassword.length < 6) {
            alert('A nova senha precisa ter pelo menos 6 caracteres.');
            return;
        }

        if (newPassword !== confirmPassword) {
            alert('As senhas não coincidem.');
            return;
        }

        if (currentPassword === newPassword) {
            alert('A nova senha deve ser diferente da senha atual.');
            return;
        }

        if (!user || !user.email) {
            alert('Não foi possível identificar a conta administrativa.');
            return;
        }

        try {
            setSavingPassword(true);

            const credential = EmailAuthProvider.credential(
                user.email,
                currentPassword
            );

            await reauthenticateWithCredential(user, credential);

            await updatePassword(user, newPassword);

            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setShowPasswords(false);
            setShowPasswordForm(false);

            alert('Senha alterada com sucesso!');
        } catch (error) {
            console.error('Erro ao alterar senha:', error);

            if (
                error.code === 'auth/invalid-credential' ||
                error.code === 'auth/wrong-password' ||
                error.code === 'auth/invalid-login-credentials'
            ) {
                alert('A senha atual está incorreta.');
            } else if (error.code === 'auth/weak-password') {
                alert('A nova senha é muito fraca.');
            } else if (error.code === 'auth/too-many-requests') {
                alert('Muitas tentativas. Tente novamente mais tarde.');
            } else if (error.code === 'auth/requires-recent-login') {
                alert('Sua sessão expirou. Entre novamente e tente alterar a senha.');
            } else {
                alert('Não foi possível alterar a senha. Tente novamente.');
            }
        } finally {
            setSavingPassword(false);
        }
    }

    // RECUPERAR SENHA POR E-MAIL
    async function handlePasswordRecovery() {
        if (!user?.email) {
            alert('Não foi possível identificar o e-mail da conta.');
            return;
        }

        const confirmed = window.confirm(
            `Deseja enviar um link de recuperação de senha para ${user.email}?`
        );

        if (!confirmed) return;

        try {
            auth.languageCode = 'pt-BR';

            await sendPasswordResetEmail(auth, user.email);

            alert(
                `E-mail de recuperação enviado para ${user.email}. Verifique sua caixa de entrada e também a pasta de spam.`
            );
        } catch (error) {
            console.error('Erro ao enviar recuperação de senha:', error);

            if (error.code === 'auth/too-many-requests') {
                alert('Muitas solicitações. Aguarde um pouco antes de tentar novamente.');
            } else if (error.code === 'auth/invalid-email') {
                alert('O endereço de e-mail cadastrado é inválido.');
            } else {
                alert('Não foi possível enviar o e-mail de recuperação. Tente novamente.');
            }
        }
    }

    // CANCELAR ALTERAÇÃO DE SENHA
    function handleCancelPassword() {
        setShowPasswordForm(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setShowPasswords(false);
    }

    return (
        <div className="profile-page">
            <div className="profile-heading">
                <div>
                    <h1>Meu perfil</h1>
                    <p>Gerencie suas informações e configurações de conta.</p>
                </div>
            </div>

            <section className="profile-card">

                {/* IDENTIFICAÇÃO DO ADMINISTRADOR */}
                <div className="profile-main">
                    <div className="profile-avatar">
                        <UserRound size={38} />
                    </div>

                    <div className="profile-identity">
                        <h2>{name}</h2>

                        <span className="profile-role">
                            <ShieldCheck size={15} />
                            Administrador
                        </span>
                    </div>
                </div>

                <div className="profile-divider" />

                {/* INFORMAÇÕES PESSOAIS */}
                <div className="profile-section">
                    <div className="profile-section-heading">
                        <div>
                            <h3>Informações pessoais</h3>
                            <p>Seus dados de identificação na plataforma.</p>
                        </div>

                        {!editing && (
                            <button
                                className="profile-edit-button"
                                type="button"
                                onClick={() => {
                                    setEditedName(name);
                                    setEditing(true);
                                }}
                            >
                                <Pencil size={16} />
                                Editar
                            </button>
                        )}
                    </div>

                    <div className="profile-fields">
                        <div className="profile-field">
                            <label>Nome completo</label>

                            {editing ? (
                                <input
                                    value={editedName}
                                    onChange={(event) =>
                                        setEditedName(event.target.value)
                                    }
                                    placeholder="Digite seu nome"
                                />
                            ) : (
                                <div className="profile-field-value">
                                    <UserRound size={18} />
                                    <span>{name}</span>
                                </div>
                            )}
                        </div>

                        <div className="profile-field">
                            <label>E-mail</label>

                            <div className="profile-field-value">
                                <Mail size={18} />
                                <span>
                                    {user?.email || 'E-mail não disponível'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {editing && (
                        <div className="profile-form-actions">
                            <button
                                className="profile-cancel-button"
                                type="button"
                                onClick={handleCancel}
                            >
                                <X size={16} />
                                Cancelar
                            </button>

                            <button
                                className="profile-save-button"
                                type="button"
                                onClick={handleSave}
                                disabled={!editedName.trim() || saving}
                            >
                                <Save size={16} />
                                {saving ? 'Salvando...' : 'Salvar'}
                            </button>
                        </div>
                    )}
                </div>

                <div className="profile-divider" />

                {/* SEGURANÇA DA CONTA */}
                <div className="profile-section">
                    <div className="profile-section-heading">
                        <div>
                            <h3>Segurança da conta</h3>
                            <p>Gerencie a segurança do seu acesso.</p>
                        </div>
                    </div>

                    <div className="profile-security-item">
                        <div className="profile-security-icon">
                            <LockKeyhole size={20} />
                        </div>

                        <div className="profile-security-info">
                            <strong>Senha</strong>
                            <span>Altere sua senha de acesso.</span>
                        </div>

                        <button
                            className="profile-edit-button"
                            type="button"
                            onClick={() =>
                                setShowPasswordForm(!showPasswordForm)
                            }
                        >
                            {showPasswordForm ? 'Cancelar' : 'Alterar senha'}
                        </button>
                    </div>

                    {/* RECUPERAÇÃO POR E-MAIL */}
                    <button
                        className="profile-recovery-button"
                        type="button"
                        onClick={handlePasswordRecovery}
                    >
                        Esqueci minha senha
                    </button>

                    {/* FORMULÁRIO DE ALTERAÇÃO DE SENHA */}
                    {showPasswordForm && (
                        <div className="profile-password-form">
                            <div className="profile-password-heading">
                                <h4>Alterar senha</h4>
                                <p>
                                    Informe sua senha atual e escolha uma nova senha.
                                </p>
                            </div>

                            {[
                                {
                                    label: 'Senha atual',
                                    value: currentPassword,
                                    setter: setCurrentPassword,
                                },
                                {
                                    label: 'Nova senha',
                                    value: newPassword,
                                    setter: setNewPassword,
                                },
                                {
                                    label: 'Confirmar nova senha',
                                    value: confirmPassword,
                                    setter: setConfirmPassword,
                                },
                            ].map((field) => (
                                <div className="profile-field" key={field.label}>
                                    <label>{field.label}</label>

                                    <div className="profile-password-input">
                                        <input
                                            type={showPasswords ? 'text' : 'password'}
                                            value={field.value}
                                            onChange={(event) =>
                                                field.setter(event.target.value)
                                            }
                                            placeholder={`Digite ${field.label.toLowerCase()}`}
                                            autoComplete="off"
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPasswords(!showPasswords)
                                            }
                                            aria-label={
                                                showPasswords
                                                    ? 'Ocultar senhas'
                                                    : 'Mostrar senhas'
                                            }
                                        >
                                            {showPasswords ? (
                                                <EyeOff size={19} />
                                            ) : (
                                                <Eye size={19} />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ))}

                            <div className="profile-form-actions">
                                <button
                                    className="profile-cancel-button"
                                    type="button"
                                    onClick={handleCancelPassword}
                                    disabled={savingPassword}
                                >
                                    Cancelar
                                </button>

                                <button
                                    className="profile-save-button"
                                    type="button"
                                    onClick={handlePasswordChange}
                                    disabled={savingPassword}
                                >
                                    <Save size={16} />
                                    {savingPassword
                                        ? 'Alterando...'
                                        : 'Salvar nova senha'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="profile-divider" />

                {/* INFORMAÇÕES DA CONTA */}
                <div className="profile-section">
                    <h3>Informações da conta</h3>

                    <div className="profile-account-info">
                        <span>Situação da conta</span>

                        <span className="profile-status">
                            <span />
                            Ativa
                        </span>
                    </div>

                    <div className="profile-account-info">
                        <span>Tipo de acesso</span>
                        <strong>Administrador</strong>
                    </div>
                </div>

            </section>
        </div>
    );
}
