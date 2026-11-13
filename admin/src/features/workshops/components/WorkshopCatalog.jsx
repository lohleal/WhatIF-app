import { getIdTokenResult } from 'firebase/auth';
import { useEffect, useMemo, useState } from 'react';
import { auth } from '../../../services/firebase/firebaseConfig';
import './WorkshopCatalog.css';

import {
    BookOpen,
    Check,
    MoreVertical,
    Pencil,
    Plus,
    Search,
    Trash2,
    X,
} from 'lucide-react';

import {
    getCategories,
    getWorkshops,
} from '../services/workshop-Service';

export default function WorkshopCatalog() {
    const [workshops, setWorkshops] = useState([]);
    const [categories, setCategories] = useState([]);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Todas');
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [menuId, setMenuId] = useState(null);
    const [isNewCategory, setIsNewCategory] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [categoryName, setCategoryName] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: '',
    });



    useEffect(() => {
        async function loadCatalog() {
            try {
                setLoading(true);
                setError('');

                const [workshopsData, categoriesData] = await Promise.all([
                    getWorkshops(),
                    getCategories(),
                ]);
                const user = auth.currentUser;
                const token = user ? await getIdTokenResult(user, true) : null;

                console.log('Usuário conectado:', user?.email);
                console.log('Permissões da conta:', token?.claims);

                setWorkshops(workshopsData);
                setCategories(categoriesData);
            } catch (error) {
                console.error('Erro ao carregar catálogo:', error);
                setError('Não foi possível carregar o catálogo de oficinas.');
            } finally {
                setLoading(false);
            }
        }

        loadCatalog();
    }, []);



    const filteredWorkshops = useMemo(() => {
        return workshops.filter((workshop) => {
            const matchesSearch = workshop.name
                .toLowerCase()
                .includes(search.toLowerCase());

            const matchesCategory =
                selectedCategory === 'Todas' ||
                workshop.category === selectedCategory;

            return matchesSearch && matchesCategory;
        });
    }, [workshops, search, selectedCategory]);

    function openCreateForm() {
        setIsNewCategory(false);
        setEditingId(null);
        setFormData({
            name: '',
            description: '',
            category: '',
        });
        setShowForm(true);
        setMenuId(null);
    }

    function openEditForm(workshop) {
        setIsNewCategory(false);
        setEditingId(workshop.id);
        setFormData({
            name: workshop.name,
            description: workshop.description,
            category: workshop.category,
        });
        setShowForm(true);
        setMenuId(null);
    }

    function closeForm() {
        setShowForm(false);
        setEditingId(null);
    }

    function handleSubmit(event) {
        event.preventDefault();

        const workshopData = {
            name: formData.name.trim(),
            description: formData.description.trim(),
            category: formData.category.trim(),
        };

        if (!workshopData.name) {
            return;
        }

        // Mantém categorias cadastradas independentemente das oficinas
        if (
            workshopData.category &&
            !categories.some(
                (category) =>
                    category.toLowerCase() ===
                    workshopData.category.toLowerCase()
            )
        ) {
            setCategories((previous) => [
                ...previous,
                workshopData.category,
            ]);
        }

        if (editingId) {
            setWorkshops((previous) =>
                previous.map((workshop) =>
                    workshop.id === editingId
                        ? { ...workshop, ...workshopData }
                        : workshop
                )
            );
        } else {
            setWorkshops((previous) => [
                ...previous,
                {
                    id: crypto.randomUUID(),
                    ...workshopData,
                },
            ]);
        }

        setSelectedCategory('Todas');
        closeForm();
    }

    function deleteWorkshop(id) {
        const confirmed = window.confirm(
            'Deseja realmente excluir esta oficina?'
        );

        if (!confirmed) return;

        setWorkshops((previous) =>
            previous.filter((workshop) => workshop.id !== id)
        );

        setMenuId(null);
    }


    function startCategoryEdit(category) {
        setEditingCategory(category);
        setCategoryName(category);
    }

    function cancelCategoryEdit() {
        setEditingCategory(null);
        setCategoryName('');
    }

    function saveCategoryEdit(oldName) {
        const newName = categoryName.trim();

        if (!newName) return;

        const alreadyExists = categories.some(
            (category) =>
                category.toLowerCase() === newName.toLowerCase() &&
                category !== oldName
        );

        if (alreadyExists) {
            alert('Essa categoria já existe.');
            return;
        }

        setCategories((previous) =>
            previous.map((category) =>
                category === oldName ? newName : category
            )
        );

        setWorkshops((previous) =>
            previous.map((workshop) =>
                workshop.category === oldName
                    ? { ...workshop, category: newName }
                    : workshop
            )
        );

        if (selectedCategory === oldName) {
            setSelectedCategory(newName);
        }

        cancelCategoryEdit();
    }

    function deleteCategory(categoryToDelete) {
        const confirmed = window.confirm(
            `Deseja excluir a categoria "${categoryToDelete}"? As oficinas vinculadas ficarão sem categoria.`
        );

        if (!confirmed) return;

        setCategories((previous) =>
            previous.filter((category) => category !== categoryToDelete)
        );

        setWorkshops((previous) =>
            previous.map((workshop) =>
                workshop.category === categoryToDelete
                    ? { ...workshop, category: '' }
                    : workshop
            )
        );

        if (selectedCategory === categoryToDelete) {
            setSelectedCategory('Todas');
        }
    }


    return (
        <div className="workshop-catalog">
            <div className="catalog-toolbar">
                <div className="catalog-search">
                    <Search size={18} />
                    <input
                        type="search"
                        placeholder="Buscar oficina pelo nome..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                    />
                </div>

                <button
                    type="button"
                    className="catalog-add-button"
                    onClick={openCreateForm}
                >
                    <Plus size={18} />
                    Nova oficina
                </button>
            </div>


            <div className="catalog-filters">
                <button
                    type="button"
                    className={selectedCategory === 'Todas' ? 'active' : ''}
                    onClick={() => setSelectedCategory('Todas')}
                >
                    Todas
                </button>

                {categories.map((category) => (
                    <div
                        className={`catalog-category-filter ${selectedCategory === category ? 'active' : ''
                            }`}
                        key={category}
                    >
                        {editingCategory === category ? (
                            <input
                                autoFocus
                                value={categoryName}
                                onChange={(event) => setCategoryName(event.target.value)}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter') {
                                        saveCategoryEdit(category);
                                    }

                                    if (event.key === 'Escape') {
                                        cancelCategoryEdit();
                                    }
                                }}
                                onBlur={cancelCategoryEdit}
                                onDoubleClick={(event) => event.stopPropagation()}
                                onClick={(event) => event.stopPropagation()}
                            />
                        ) : (
                            <button
                                type="button"
                                className="catalog-category-name"
                                onClick={() => setSelectedCategory(category)}
                                onDoubleClick={() => startCategoryEdit(category)}
                                title="Clique duas vezes para renomear"
                            >
                                {category}
                            </button>
                        )}

                        {editingCategory === category ? (
                            <button
                                type="button"
                                className="catalog-category-action save"
                                onMouseDown={(event) => event.preventDefault()}
                                onClick={() => saveCategoryEdit(category)}
                                aria-label="Salvar categoria"
                            >
                                <Check size={13} />
                            </button>
                        ) : (
                            <button
                                type="button"
                                className="catalog-category-action delete"
                                onClick={() => deleteCategory(category)}
                                aria-label={`Excluir categoria ${category}`}
                                title="Excluir categoria"
                            >
                                <X size={13} />
                            </button>
                        )}
                    </div>
                ))}
            </div>


            {filteredWorkshops.length > 0 ? (
                <div className="catalog-list">
                    {filteredWorkshops.map((workshop) => (
                        <article className="catalog-card" key={workshop.id}>
                            <div className="catalog-card-icon">
                                <BookOpen size={21} />
                            </div>

                            <div className="catalog-card-info">
                                <div className="catalog-card-heading">
                                    <h3>{workshop.name}</h3>

                                    {workshop.category && (
                                        <span className="catalog-category">
                                            {workshop.category}
                                        </span>
                                    )}
                                </div>

                                <p>
                                    {workshop.description ||
                                        'Nenhuma descrição informada.'}
                                </p>
                            </div>

                            <div className="catalog-card-actions">
                                <button
                                    type="button"
                                    aria-label="Opções da oficina"
                                    onClick={() =>
                                        setMenuId(
                                            menuId === workshop.id ? null : workshop.id
                                        )
                                    }
                                >
                                    <MoreVertical size={20} />
                                </button>

                                {menuId === workshop.id && (
                                    <div className="catalog-action-menu">
                                        <button
                                            type="button"
                                            onClick={() => openEditForm(workshop)}
                                        >
                                            <Pencil size={15} />
                                            Editar
                                        </button>

                                        <button
                                            type="button"
                                            className="delete"
                                            onClick={() => deleteWorkshop(workshop.id)}
                                        >
                                            <Trash2 size={15} />
                                            Excluir
                                        </button>
                                    </div>
                                )}
                            </div>
                        </article>
                    ))}
                </div>
            ) : (
                <div className="catalog-empty">
                    <div className="catalog-empty-icon">
                        <BookOpen size={28} />
                    </div>

                    <h3>
                        {search || selectedCategory !== 'Todas'
                            ? 'Nenhuma oficina encontrada'
                            : 'Seu catálogo está vazio'}
                    </h3>

                    <p>
                        {search || selectedCategory !== 'Todas'
                            ? 'Tente mudar a busca ou selecionar outra categoria.'
                            : 'Cadastre sua primeira oficina para começar a organizar as atividades.'}
                    </p>

                    {!search && selectedCategory === 'Todas' && (
                        <button
                            type="button"
                            className="catalog-add-button"
                            onClick={openCreateForm}
                        >
                            <Plus size={17} />
                            Cadastrar oficina
                        </button>
                    )}
                </div>
            )}

            {showForm && (
                <div
                    className="catalog-modal-overlay"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) closeForm();
                    }}
                >
                    <form
                        className="catalog-modal"
                        onSubmit={handleSubmit}
                    >
                        <div className="catalog-modal-header">
                            <div>
                                <h2>
                                    {editingId ? 'Editar oficina' : 'Nova oficina'}
                                </h2>
                                <p>Preencha as informações da oficina.</p>
                            </div>

                            <button
                                type="button"
                                className="catalog-modal-close"
                                onClick={closeForm}
                                aria-label="Fechar"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="catalog-form-field">
                            <label htmlFor="workshop-name">
                                Nome da oficina *
                            </label>
                            <input
                                id="workshop-name"
                                type="text"
                                value={formData.name}
                                onChange={(event) =>
                                    setFormData((previous) => ({
                                        ...previous,
                                        name: event.target.value,
                                    }))
                                }
                                placeholder="Ex.: Oficina de alimentação saudável"
                                maxLength={100}
                                required
                            />
                        </div>

                        <div className="catalog-form-field">
                            <label htmlFor="workshop-description">
                                Descrição
                            </label>
                            <textarea
                                id="workshop-description"
                                value={formData.description}
                                onChange={(event) =>
                                    setFormData((previous) => ({
                                        ...previous,
                                        description: event.target.value,
                                    }))
                                }
                                placeholder="Descreva brevemente o conteúdo da oficina..."
                                rows={4}
                                maxLength={500}
                            />
                        </div>



                        <div className="catalog-form-field">
                            <label htmlFor="workshop-category">
                                Categoria <span>(opcional)</span>
                            </label>

                            <select
                                id="workshop-category"
                                value={isNewCategory ? '__new__' : formData.category}
                                onChange={(event) => {
                                    const value = event.target.value;

                                    if (value === '__new__') {
                                        setIsNewCategory(true);
                                        setFormData((previous) => ({
                                            ...previous,
                                            category: '',
                                        }));
                                    } else {
                                        setIsNewCategory(false);
                                        setFormData((previous) => ({
                                            ...previous,
                                            category: value,
                                        }));
                                    }
                                }}
                            >
                                <option value="">Sem categoria</option>

                                {categories.map((category) => (
                                    <option key={category.id} value={category.name}>
                                        {category.name}
                                    </option>
                                ))}

                                <option value="__new__">+ Adicionar nova categoria</option>
                            </select>

                            {isNewCategory && (
                                <input
                                    type="text"
                                    value={formData.category}
                                    onChange={(event) =>
                                        setFormData((previous) => ({
                                            ...previous,
                                            category: event.target.value,
                                        }))
                                    }
                                    placeholder="Digite o nome da nova categoria..."
                                    maxLength={50}
                                    autoFocus
                                />
                            )}

                            <small>
                                Selecione uma categoria existente ou adicione uma nova.
                            </small>
                        </div>



                        <div className="catalog-modal-actions">
                            <button
                                type="button"
                                className="catalog-cancel-button"
                                onClick={closeForm}
                            >
                                Cancelar
                            </button>

                            <button
                                type="submit"
                                className="catalog-save-button"
                            >
                                {editingId ? 'Salvar alterações' : 'Cadastrar oficina'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
