
import { useCallback, useEffect, useMemo, useState } from 'react';

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
    archiveCategory,
    archiveWorkshop,
    createCategory,
    createWorkshop,
    getCategories,
    getWorkshops,
    updateCategory,
    updateWorkshop,
} from '../services/workshop-Service';

import './WorkshopCatalog.css';

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
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
  });

  // CARREGAMENTO DO FIRESTORE
  const loadCatalog = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const [workshopsData, categoriesData] = await Promise.all([
        getWorkshops(),
        getCategories(),
      ]);

      setWorkshops(workshopsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Erro ao carregar catálogo:', error);
      setError('Não foi possível carregar o catálogo de oficinas.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  // OFICINAS FILTRADAS
  const filteredWorkshops = useMemo(() => {
    return workshops.filter((workshop) => {
      const matchesSearch = (workshop.name || '')
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesCategory =
        selectedCategory === 'Todas' ||
        workshop.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [workshops, search, selectedCategory]);

  // FORMULÁRIO DE OFICINA
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
    setError('');
  }

  function openEditForm(workshop) {
    setIsNewCategory(false);
    setEditingId(workshop.id);

    setFormData({
      name: workshop.name || '',
      description: workshop.description || '',
      category: workshop.category || '',
    });

    setShowForm(true);
    setMenuId(null);
    setError('');
  }

  function closeForm() {
    if (saving) return;

    setShowForm(false);
    setEditingId(null);
    setIsNewCategory(false);
  }

  // SALVAR OFICINA NO FIRESTORE
  async function handleSubmit(event) {
    event.preventDefault();

    if (saving) return;

    const workshopData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      category: formData.category.trim(),
    };

    if (!workshopData.name) {
      setError('Informe o nome da oficina.');
      return;
    }

    try {
      setSaving(true);
      setError('');

      // Se for uma categoria nova, verifica se já existe
      if (isNewCategory && workshopData.category) {
        const existingCategory = categories.find(
          (category) =>
            category.name.toLowerCase() ===
            workshopData.category.toLowerCase()
        );

        if (!existingCategory) {
          await createCategory(workshopData.category);
        } else {
          workshopData.category = existingCategory.name;
        }
      }

      // Atualiza ou cadastra a oficina
      if (editingId) {
        await updateWorkshop(editingId, workshopData);
      } else {
        await createWorkshop(workshopData);
      }

      // Busca novamente os dados persistidos
      await loadCatalog();

      setSelectedCategory('Todas');
      setShowForm(false);
      setEditingId(null);
      setIsNewCategory(false);
    } catch (error) {
      console.error('Erro ao salvar oficina:', error);
      setError('Não foi possível salvar a oficina. Tente novamente.');
    } finally {
      setSaving(false);
    }
  }

  // ARQUIVAR OFICINA
  async function deleteWorkshop(id) {
    const confirmed = window.confirm(
      'Deseja arquivar esta oficina? Ela deixará de aparecer no catálogo, mas continuará armazenada no banco de dados.'
    );

    if (!confirmed) return;

    try {
      setError('');

      await archiveWorkshop(id);

      setMenuId(null);
      await loadCatalog();
    } catch (error) {
      console.error('Erro ao arquivar oficina:', error);
      setError('Não foi possível arquivar a oficina.');
    }
  }

  // EDIÇÃO DE CATEGORIAS
  function startCategoryEdit(category) {
    setEditingCategory(category.id);
    setCategoryName(category.name);
  }

  function cancelCategoryEdit() {
    setEditingCategory(null);
    setCategoryName('');
  }

  async function saveCategoryEdit(category) {
    const newName = categoryName.trim();

    if (!newName) {
      alert('Informe o nome da categoria.');
      return;
    }

    const alreadyExists = categories.some(
      (item) =>
        item.name.toLowerCase() === newName.toLowerCase() &&
        item.id !== category.id
    );

    if (alreadyExists) {
      alert('Essa categoria já existe.');
      return;
    }

    try {
      setError('');

      await updateCategory(category.id, newName);

      if (selectedCategory === category.name) {
        setSelectedCategory(newName);
      }

      cancelCategoryEdit();
      await loadCatalog();
    } catch (error) {
      console.error('Erro ao renomear categoria:', error);
      setError('Não foi possível renomear a categoria.');
    }
  }

  // ARQUIVAR CATEGORIA
  async function deleteCategory(category) {
    const confirmed = window.confirm(
      `Deseja arquivar a categoria "${category.name}"? As oficinas vinculadas continuarão no banco, mas ficarão sem categoria.`
    );

    if (!confirmed) return;

    try {
      setError('');

      await archiveCategory(category.id);

      if (selectedCategory === category.name) {
        setSelectedCategory('Todas');
      }

      if (editingCategory === category.id) {
        cancelCategoryEdit();
      }

      await loadCatalog();
    } catch (error) {
      console.error('Erro ao arquivar categoria:', error);
      setError('Não foi possível arquivar a categoria.');
    }
  }

  // RENDERIZAÇÃO
  return (
    <div className="workshop-catalog">

      {/* BARRA DE PESQUISA E CADASTRO */}
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

      {/* CATEGORIAS */}
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
            className={`catalog-category-filter ${
              selectedCategory === category.name ? 'active' : ''
            }`}
            key={category.id}
          >
            {editingCategory === category.id ? (
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
                onClick={() => setSelectedCategory(category.name)}
                onDoubleClick={() => startCategoryEdit(category)}
                title="Clique duas vezes para renomear"
              >
                {category.name}
              </button>
            )}

            {editingCategory === category.id ? (
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
                aria-label={`Arquivar categoria ${category.name}`}
                title="Arquivar categoria"
              >
                <X size={13} />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* MENSAGENS */}
      {error && (
        <div className="catalog-error" role="alert">
          {error}
        </div>
      )}

      {/* CARREGAMENTO */}
      {loading ? (
        <div className="catalog-empty">
          <p>Carregando catálogo...</p>
        </div>
      ) : (
        <>
          {/* LISTA DE OFICINAS */}
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
                          Arquivar
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
        </>
      )}

      {/* MODAL DE CADASTRO E EDIÇÃO */}
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

                <option value="__new__">
                  + Adicionar nova categoria
                </option>
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
                disabled={saving}
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="catalog-save-button"
                disabled={saving}
              >
                {saving
                  ? 'Salvando...'
                  : editingId
                    ? 'Salvar alterações'
                    : 'Cadastrar oficina'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
