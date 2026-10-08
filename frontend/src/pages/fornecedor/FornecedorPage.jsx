import {
  useCallback,
  useEffect,
  useState,
} from 'react'

import authService
  from '../../services/authService'

import fornecedorService
  from '../../services/fornecedorService'

import './fornecedorPage.css'

const MANAGE_ROLES = [
  'OWNER',
  'ADMIN',
  'MANAGER',
]

const EMPTY_FORM = {
  name: '',
  document: '',
  email: '',
  phone: '',
  address: '',
  notes: '',
}

function fornecedorPage() {
  const user = authService.getUser()

  const canManage =
    MANAGE_ROLES.includes(
      user?.role
    )

  const [
    fornecedors,
    setfornecedors,
  ] = useState([])

  const [
    loading,
    setLoading,
  ] = useState(true)

  const [
    error,
    setError,
  ] = useState('')

  const [
    search,
    setSearch,
  ] = useState('')

  const [
    appliedSearch,
    setAppliedSearch,
  ] = useState('')

  const [
    statusFilter,
    setStatusFilter,
  ] = useState('ACTIVE')

  const [
    page,
    setPage,
  ] = useState(0)

  const [
    totalPages,
    setTotalPages,
  ] = useState(0)

  const [
    totalElements,
    setTotalElements,
  ] = useState(0)

  const [
    modalMode,
    setModalMode,
  ] = useState(null)

  const [
    selectedfornecedor,
    setSelectedfornecedor,
  ] = useState(null)

  const [
    form,
    setForm,
  ] = useState({
    ...EMPTY_FORM,
  })

  const [
    formError,
    setFormError,
  ] = useState('')

  const [
    saving,
    setSaving,
  ] = useState(false)

  const [
    confirmation,
    setConfirmation,
  ] = useState(null)

  const [
    statusChanging,
    setStatusChanging,
  ] = useState(false)

  const [
    toast,
    setToast,
  ] = useState(null)

  const loadfornecedors =
    useCallback(
      async () => {
        try {
          setLoading(true)
          setError('')

          const response =
            await fornecedorService.list({
              search:
                appliedSearch,

              active:
                getActiveFilter(
                  statusFilter
                ),

              page,
              size: 20,
            })

          setfornecedors(
            response.content
            || []
          )

          setTotalPages(
            response.totalPages
            || 0
          )

          setTotalElements(
            response.totalElements
            || 0
          )
        } catch (err) {
          console.error(
            'Erro ao carregar fornecedores:',
            err
          )

          setError(
            getErrorMessage(err)
          )
        } finally {
          setLoading(false)
        }
      },
      [
        appliedSearch,
        statusFilter,
        page,
      ]
    )

  useEffect(() => {
    loadfornecedors()
  }, [loadfornecedors])

  useEffect(() => {
    if (!toast) {
      return
    }

    const timer =
      setTimeout(
        () => {
          setToast(null)
        },
        3500
      )

    return () =>
      clearTimeout(timer)
  }, [toast])

  const showToast = (
    message
  ) => {
    setToast({
      message,
    })
  }

  const handleSearchSubmit =
    (event) => {
      event.preventDefault()

      setPage(0)

      setAppliedSearch(
        search.trim()
      )
    }

  const clearSearch = () => {
    setSearch('')
    setAppliedSearch('')
    setPage(0)
  }

  const handleStatusFilter =
    (event) => {
      setStatusFilter(
        event.target.value
      )

      setPage(0)
    }

  const openCreateModal =
    () => {
      setSelectedfornecedor(null)

      setForm({
        ...EMPTY_FORM,
      })

      setFormError('')
      setModalMode('create')
    }

  const openEditModal =
    (fornecedor) => {
      setSelectedfornecedor(
        fornecedor
      )

      setForm(
        fornecedorToForm(
          fornecedor
        )
      )

      setFormError('')
      setModalMode('edit')
    }

  const openDetailsModal =
    async (fornecedor) => {
      try {
        setSelectedfornecedor(
          fornecedor
        )

        setModalMode(
          'details'
        )

        const completefornecedor =
          await fornecedorService
            .getById(
              fornecedor.id
            )

        setSelectedfornecedor(
          completefornecedor
        )
      } catch (err) {
        setModalMode(null)

        setError(
          getErrorMessage(err)
        )
      }
    }

  const closeModal = () => {
    if (saving) {
      return
    }

    setModalMode(null)
    setSelectedfornecedor(null)

    setForm({
      ...EMPTY_FORM,
    })

    setFormError('')
  }

  const handleFormChange =
    (event) => {
      const {
        name,
        value,
      } = event.target

      let newValue = value

      if (
        name === 'document'
      ) {
        newValue =
          formatDocument(value)
      }

      if (
        name === 'phone'
      ) {
        newValue =
          formatPhone(value)
      }

      setForm(
        (current) => ({
          ...current,
          [name]: newValue,
        })
      )
    }

  const handleFormSubmit =
    async (event) => {
      event.preventDefault()

      const validation =
        validatefornecedor(form)

      if (validation) {
        setFormError(
          validation
        )

        return
      }

      try {
        setSaving(true)
        setFormError('')

        if (
          modalMode
          === 'create'
        ) {
          await fornecedorService
            .create(
              normalizeForm(form)
            )

          showToast(
            'Fornecedor cadastrado com sucesso.'
          )
        }

        if (
          modalMode
          === 'edit'
        ) {
          await fornecedorService
            .update(
              selectedfornecedor.id,
              normalizeForm(form)
            )

          showToast(
            'Fornecedor atualizado com sucesso.'
          )
        }

        setModalMode(null)
        setSelectedfornecedor(null)

        setForm({
          ...EMPTY_FORM,
        })

        await loadfornecedors()
      } catch (err) {
        console.error(
          'Erro ao salvar fornecedor:',
          err
        )

        setFormError(
          getErrorMessage(err)
        )
      } finally {
        setSaving(false)
      }
    }

  const askStatusChange =
    (fornecedor) => {
      const activating =
        !fornecedor.active

      setConfirmation({
        fornecedor,
        activating,

        title:
          activating
            ? 'Reativar fornecedor?'
            : 'Desativar fornecedor?',

        message:
          activating
            ? `O fornecedor "${fornecedor.name}" voltará a ficar ativo no sistema.`
            : `O fornecedor "${fornecedor.name}" ficará inativo, mas seu histórico continuará preservado.`,

        confirmText:
          activating
            ? 'Reativar'
            : 'Desativar',
      })
    }

  const confirmStatusChange =
    async () => {
      if (!confirmation) {
        return
      }

      try {
        setStatusChanging(true)

        const {
          fornecedor,
          activating,
        } = confirmation

        await fornecedorService
          .changeStatus(
            fornecedor.id,
            activating
          )

        setConfirmation(null)

        showToast(
          activating
            ? 'Fornecedor reativado com sucesso.'
            : 'Fornecedor desativado com sucesso.'
        )

        await loadfornecedors()
      } catch (err) {
        setConfirmation(null)

        setError(
          getErrorMessage(err)
        )
      } finally {
        setStatusChanging(false)
      }
    }

  const activeOnPage =
    fornecedors.filter(
      (fornecedor) =>
        fornecedor.active
    ).length

  const inactiveOnPage =
    fornecedors.filter(
      (fornecedor) =>
        !fornecedor.active
    ).length

  const withContactOnPage =
    fornecedors.filter(
      (fornecedor) =>
        fornecedor.email
        || fornecedor.phone
    ).length

  return (
    <div className="fornecedor-page">
      {toast && (
        <SuccessToast
          message={
            toast.message
          }
          onClose={() =>
            setToast(null)
          }
        />
      )}

      <section className="fornecedor-header">
        <div>
          <span className="fornecedor-header-label">
            CADASTROS
          </span>

          <h1>
            Fornecedores
          </h1>

          <p>
            Organize fornecedores,
            contatos e informações
            comerciais do seu negócio.
          </p>
        </div>

        {canManage && (
          <button
            type="button"
            className="fornecedor-primary-button"
            onClick={
              openCreateModal
            }
          >
            <PlusIcon />

            Novo fornecedor
          </button>
        )}
      </section>

      <section className="fornecedor-summary-grid">
        <SummaryCard
          title="Fornecedores encontrados"
          value={
            totalElements
          }
          icon={
            <fornecedorIcon />
          }
        />

        <SummaryCard
          title="Ativos nesta página"
          value={
            activeOnPage
          }
          icon={
            <CheckIcon />
          }
        />

        <SummaryCard
          title="Inativos nesta página"
          value={
            inactiveOnPage
          }
          icon={
            <PauseIcon />
          }
        />

        <SummaryCard
          title="Com contato nesta página"
          value={
            withContactOnPage
          }
          icon={
            <PhoneIcon />
          }
        />
      </section>

      <section className="fornecedor-content">
        <div className="fornecedor-toolbar">
          <form
            className="fornecedor-search"
            onSubmit={
              handleSearchSubmit
            }
          >
            <SearchIcon />

            <input
              type="text"
              value={
                search
              }
              onChange={(
                event
              ) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Buscar por nome, CPF/CNPJ, e-mail ou telefone"
            />

            {search && (
              <button
                type="button"
                className="fornecedor-search-clear"
                onClick={
                  clearSearch
                }
              >
                ×
              </button>
            )}

            <button
              type="submit"
              className="fornecedor-search-button"
            >
              Buscar
            </button>
          </form>

          <select
            className="fornecedor-filter-select"
            value={
              statusFilter
            }
            onChange={
              handleStatusFilter
            }
          >
            <option value="ACTIVE">
              Fornecedores ativos
            </option>

            <option value="ALL">
              Todos os fornecedores
            </option>

            <option value="INACTIVE">
              Fornecedores inativos
            </option>
          </select>
        </div>

        {appliedSearch && (
          <div className="fornecedor-applied-filter">
            Resultados para:

            <strong>
              {' '}
              "{appliedSearch}"
            </strong>

            <button
              type="button"
              onClick={
                clearSearch
              }
            >
              Limpar
            </button>
          </div>
        )}

        {error && (
          <ErrorMessage
            message={error}
            onClose={() =>
              setError('')
            }
          />
        )}

        {loading ? (
          <Loading />
        ) : fornecedors.length
          === 0 ? (
          <EmptyState
            canManage={
              canManage
            }
            onCreate={
              openCreateModal
            }
          />
        ) : (
          <>
            <div className="fornecedor-table-wrapper">
              <table className="fornecedor-table">
                <thead>
                  <tr>
                    <th>
                      Fornecedor
                    </th>

                    <th>
                      CPF/CNPJ
                    </th>

                    <th>
                      Contato
                    </th>

                    <th>
                      Endereço
                    </th>

                    <th>
                      Status
                    </th>

                    <th>
                      Atualizado em
                    </th>

                    <th className="fornecedor-actions-heading">
                      Ações
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {fornecedors.map(
                    (fornecedor) => (
                      <fornecedorRow
                        key={
                          fornecedor.id
                        }
                        fornecedor={
                          fornecedor
                        }
                        canManage={
                          canManage
                        }
                        onView={() =>
                          openDetailsModal(
                            fornecedor
                          )
                        }
                        onEdit={() =>
                          openEditModal(
                            fornecedor
                          )
                        }
                        onStatus={() =>
                          askStatusChange(
                            fornecedor
                          )
                        }
                      />
                    )
                  )}
                </tbody>
              </table>
            </div>

            <Pagination
              page={page}
              totalPages={
                totalPages
              }
              totalElements={
                totalElements
              }
              onPageChange={
                setPage
              }
            />
          </>
        )}
      </section>

      {modalMode === 'create'
        && (
        <fornecedorFormModal
          title="Novo fornecedor"
          subtitle="Cadastre um novo fornecedor para sua organização."
          form={form}
          error={formError}
          saving={saving}
          onChange={
            handleFormChange
          }
          onSubmit={
            handleFormSubmit
          }
          onClose={
            closeModal
          }
          submitText="Cadastrar fornecedor"
        />
      )}

      {modalMode === 'edit'
        && (
        <fornecedorFormModal
          title="Editar fornecedor"
          subtitle="Atualize as informações cadastrais do fornecedor."
          form={form}
          error={formError}
          saving={saving}
          onChange={
            handleFormChange
          }
          onSubmit={
            handleFormSubmit
          }
          onClose={
            closeModal
          }
          submitText="Salvar alterações"
        />
      )}

      {modalMode === 'details'
        && selectedfornecedor && (
        <fornecedorDetailsModal
          fornecedor={
            selectedfornecedor
          }
          canManage={
            canManage
          }
          onClose={
            closeModal
          }
          onEdit={() => {
            setForm(
              fornecedorToForm(
                selectedfornecedor
              )
            )

            setFormError('')
            setModalMode('edit')
          }}
        />
      )}

      {confirmation && (
        <ConfirmationModal
          title={
            confirmation.title
          }
          message={
            confirmation.message
          }
          confirmText={
            confirmation.confirmText
          }
          loading={
            statusChanging
          }
          danger={
            !confirmation
              .activating
          }
          onCancel={() =>
            setConfirmation(null)
          }
          onConfirm={
            confirmStatusChange
          }
        />
      )}
    </div>
  )
}

function fornecedorRow({
  fornecedor,
  canManage,
  onView,
  onEdit,
  onStatus,
}) {
  return (
    <tr>
      <td>
        <div className="fornecedor-name-cell">
          <div className="fornecedor-avatar">
            {getInitials(
              fornecedor.name
            )}
          </div>

          <div>
            <strong>
              {fornecedor.name}
            </strong>

            <span>
              Fornecedor #{fornecedor.id}
            </span>
          </div>
        </div>
      </td>

      <td>
        {fornecedor.document
          ? (
            <span className="fornecedor-document">
              {formatDocument(
                fornecedor.document
              )}
            </span>
          )
          : (
            <span className="fornecedor-empty-value">
              Não informado
            </span>
          )}
      </td>

      <td>
        <div className="fornecedor-contact-cell">
          {fornecedor.email && (
            <span>
              <MailIcon />

              {fornecedor.email}
            </span>
          )}

          {fornecedor.phone && (
            <span>
              <PhoneIcon />

              {formatPhone(
                fornecedor.phone
              )}
            </span>
          )}

          {!fornecedor.email
            && !fornecedor.phone && (
            <span className="fornecedor-empty-value">
              Não informado
            </span>
          )}
        </div>
      </td>

      <td>
        <span className="fornecedor-address">
          {fornecedor.address
            || 'Não informado'}
        </span>
      </td>

      <td>
        <StatusBadge
          active={
            fornecedor.active
          }
        />
      </td>

      <td>
        {formatDateTime(
          fornecedor.updatedAt
        )}
      </td>

      <td>
        <div className="fornecedor-row-actions">
          <button
            type="button"
            title="Visualizar"
            onClick={
              onView
            }
          >
            <EyeIcon />
          </button>

          {canManage && (
            <>
              <button
                type="button"
                title="Editar"
                onClick={
                  onEdit
                }
              >
                <EditIcon />
              </button>

              <button
                type="button"
                className={
                  fornecedor.active
                    ? 'fornecedor-action-danger'
                    : 'fornecedor-action-success'
                }
                title={
                  fornecedor.active
                    ? 'Desativar'
                    : 'Reativar'
                }
                onClick={
                  onStatus
                }
              >
                {fornecedor.active
                  ? <PauseIcon />
                  : <PlayIcon />}
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  )
}

function fornecedorFormModal({
  title,
  subtitle,
  form,
  error,
  saving,
  onChange,
  onSubmit,
  onClose,
  submitText,
}) {
  return (
    <div
      className="fornecedor-modal-overlay"
      onMouseDown={
        onClose
      }
    >
      <div
        className="fornecedor-modal"
        onMouseDown={(
          event
        ) =>
          event.stopPropagation()
        }
      >
        <div className="fornecedor-modal-header">
          <div>
            <span>
              FORNECEDORES
            </span>

            <h2>
              {title}
            </h2>

            <p>
              {subtitle}
            </p>
          </div>

          <button
            type="button"
            className="fornecedor-modal-close"
            disabled={
              saving
            }
            onClick={
              onClose
            }
          >
            ×
          </button>
        </div>

        <form
          onSubmit={
            onSubmit
          }
        >
          <div className="fornecedor-modal-body">
            <div className="fornecedor-form-grid">
              <FormGroup
                label="Nome do fornecedor *"
                name="name"
                value={
                  form.name
                }
                maxLength={150}
                disabled={
                  saving
                }
                onChange={
                  onChange
                }
                placeholder="Ex.: Distribuidora Central"
                full
              />

              <FormGroup
                label="CPF/CNPJ"
                name="document"
                value={
                  form.document
                }
                maxLength={18}
                disabled={
                  saving
                }
                onChange={
                  onChange
                }
                placeholder="00.000.000/0000-00"
              />

              <FormGroup
                label="Telefone"
                name="phone"
                value={
                  form.phone
                }
                maxLength={15}
                disabled={
                  saving
                }
                onChange={
                  onChange
                }
                placeholder="(41) 99999-9999"
              />

              <FormGroup
                label="E-mail"
                name="email"
                type="email"
                value={
                  form.email
                }
                maxLength={150}
                disabled={
                  saving
                }
                onChange={
                  onChange
                }
                placeholder="contato@empresa.com"
                full
              />

              <FormGroup
                label="Endereço"
                name="address"
                value={
                  form.address
                }
                maxLength={250}
                disabled={
                  saving
                }
                onChange={
                  onChange
                }
                placeholder="Rua, número, bairro, cidade..."
                full
              />
            </div>

            <div className="fornecedor-form-group">
              <label htmlFor="fornecedor-notes">
                Observações
              </label>

              <textarea
                id="fornecedor-notes"
                name="notes"
                rows="5"
                maxLength="2000"
                value={
                  form.notes
                }
                disabled={
                  saving
                }
                onChange={
                  onChange
                }
                placeholder="Informações adicionais sobre o fornecedor..."
              />

              <span className="fornecedor-character-count">
                {form.notes.length}
                /2000
              </span>
            </div>

            {error && (
              <div className="fornecedor-form-error">
                <WarningIcon />

                <span>
                  {error}
                </span>
              </div>
            )}
          </div>

          <div className="fornecedor-modal-footer">
            <button
              type="button"
              className="fornecedor-secondary-button"
              disabled={
                saving
              }
              onClick={
                onClose
              }
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="fornecedor-primary-button"
              disabled={
                saving
              }
            >
              {saving
                ? 'Salvando...'
                : submitText}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function FormGroup({
  label,
  name,
  value,
  type = 'text',
  maxLength,
  disabled,
  onChange,
  placeholder,
  full = false,
}) {
  return (
    <div
      className={
        full
          ? 'fornecedor-form-group fornecedor-form-full'
          : 'fornecedor-form-group'
      }
    >
      <label
        htmlFor={
          `fornecedor-${name}`
        }
      >
        {label}
      </label>

      <input
        id={
          `fornecedor-${name}`
        }
        type={type}
        name={name}
        value={value}
        maxLength={
          maxLength
        }
        disabled={
          disabled
        }
        onChange={
          onChange
        }
        placeholder={
          placeholder
        }
      />
    </div>
  )
}

function fornecedorDetailsModal({
  fornecedor,
  canManage,
  onClose,
  onEdit,
}) {
  return (
    <div
      className="fornecedor-modal-overlay"
      onMouseDown={
        onClose
      }
    >
      <div
        className="fornecedor-modal fornecedor-details-modal"
        onMouseDown={(
          event
        ) =>
          event.stopPropagation()
        }
      >
        <div className="fornecedor-modal-header">
          <div>
            <span>
              FORNECEDOR
            </span>

            <h2>
              Detalhes do fornecedor
            </h2>

            <p>
              Informações cadastrais
              e de contato.
            </p>
          </div>

          <button
            type="button"
            className="fornecedor-modal-close"
            onClick={
              onClose
            }
          >
            ×
          </button>
        </div>

        <div className="fornecedor-details-body">
          <div className="fornecedor-details-main">
            <div className="fornecedor-details-avatar">
              {getInitials(
                fornecedor.name
              )}
            </div>

            <div>
              <h3>
                {fornecedor.name}
              </h3>

              <span>
                Fornecedor #{fornecedor.id}
              </span>
            </div>

            <StatusBadge
              active={
                fornecedor.active
              }
            />
          </div>

          <div className="fornecedor-details-grid">
            <DetailItem
              label="CPF/CNPJ"
              value={
                fornecedor.document
                  ? formatDocument(
                      fornecedor.document
                    )
                  : 'Não informado'
              }
            />

            <DetailItem
              label="Telefone"
              value={
                fornecedor.phone
                  ? formatPhone(
                      fornecedor.phone
                    )
                  : 'Não informado'
              }
            />

            <DetailItem
              label="E-mail"
              value={
                fornecedor.email
                || 'Não informado'
              }
            />

            <DetailItem
              label="Endereço"
              value={
                fornecedor.address
                || 'Não informado'
              }
            />

            <DetailItem
              label="Cadastrado em"
              value={
                formatDateTime(
                  fornecedor.createdAt
                )
              }
            />

            <DetailItem
              label="Atualizado em"
              value={
                formatDateTime(
                  fornecedor.updatedAt
                )
              }
            />
          </div>

          <div className="fornecedor-details-notes">
            <span>
              Observações
            </span>

            <p>
              {fornecedor.notes
                || 'Nenhuma observação informada.'}
            </p>
          </div>
        </div>

        <div className="fornecedor-modal-footer">
          <button
            type="button"
            className="fornecedor-secondary-button"
            onClick={
              onClose
            }
          >
            Fechar
          </button>

          {canManage && (
            <button
              type="button"
              className="fornecedor-primary-button"
              onClick={
                onEdit
              }
            >
              <EditIcon />

              Editar fornecedor
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function ConfirmationModal({
  title,
  message,
  confirmText,
  loading,
  danger,
  onCancel,
  onConfirm,
}) {
  return (
    <div
      className="fornecedor-modal-overlay fornecedor-confirmation-overlay"
      onMouseDown={
        onCancel
      }
    >
      <div
        className="fornecedor-confirmation-modal"
        onMouseDown={(
          event
        ) =>
          event.stopPropagation()
        }
      >
        <div
          className={
            danger
              ? 'fornecedor-confirmation-icon fornecedor-confirmation-danger'
              : 'fornecedor-confirmation-icon fornecedor-confirmation-success'
          }
        >
          {danger
            ? <PauseIcon />
            : <PlayIcon />}
        </div>

        <h3>
          {title}
        </h3>

        <p>
          {message}
        </p>

        <div className="fornecedor-confirmation-actions">
          <button
            type="button"
            className="fornecedor-secondary-button"
            disabled={
              loading
            }
            onClick={
              onCancel
            }
          >
            Cancelar
          </button>

          <button
            type="button"
            className={
              danger
                ? 'fornecedor-danger-button'
                : 'fornecedor-primary-button'
            }
            disabled={
              loading
            }
            onClick={
              onConfirm
            }
          >
            {loading
              ? 'Aguarde...'
              : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

function SummaryCard({
  title,
  value,
  icon,
}) {
  return (
    <div className="fornecedor-summary-card">
      <div className="fornecedor-summary-icon">
        {icon}
      </div>

      <div>
        <span>
          {title}
        </span>

        <strong>
          {value}
        </strong>
      </div>
    </div>
  )
}

function StatusBadge({
  active,
}) {
  return (
    <span
      className={
        active
          ? 'fornecedor-status fornecedor-status-active'
          : 'fornecedor-status fornecedor-status-inactive'
      }
    >
      <span />

      {active
        ? 'Ativo'
        : 'Inativo'}
    </span>
  )
}

function DetailItem({
  label,
  value,
}) {
  return (
    <div className="fornecedor-detail-item">
      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>
    </div>
  )
}

function Pagination({
  page,
  totalPages,
  totalElements,
  onPageChange,
}) {
  return (
    <div className="fornecedor-pagination">
      <span>
        {totalElements}
        {' '}
        {totalElements === 1
          ? 'fornecedor'
          : 'fornecedores'}
      </span>

      {totalPages > 1 && (
        <div>
          <button
            type="button"
            disabled={
              page === 0
            }
            onClick={() =>
              onPageChange(
                page - 1
              )
            }
          >
            <ChevronLeftIcon />

            Anterior
          </button>

          <span>
            {page + 1}
            {' / '}
            {totalPages}
          </span>

          <button
            type="button"
            disabled={
              page
              >= totalPages - 1
            }
            onClick={() =>
              onPageChange(
                page + 1
              )
            }
          >
            Próxima

            <ChevronRightIcon />
          </button>
        </div>
      )}
    </div>
  )
}

function Loading() {
  return (
    <div className="fornecedor-loading">
      <div className="fornecedor-spinner" />

      <span>
        Carregando fornecedores...
      </span>
    </div>
  )
}

function EmptyState({
  canManage,
  onCreate,
}) {
  return (
    <div className="fornecedor-empty">
      <div className="fornecedor-empty-icon">
        <fornecedorIcon />
      </div>

      <strong>
        Nenhum fornecedor encontrado
      </strong>

      <p>
        Nenhum fornecedor corresponde
        aos filtros selecionados.
      </p>

      {canManage && (
        <button
          type="button"
          className="fornecedor-primary-button"
          onClick={
            onCreate
          }
        >
          <PlusIcon />

          Novo fornecedor
        </button>
      )}
    </div>
  )
}

function ErrorMessage({
  message,
  onClose,
}) {
  return (
    <div className="fornecedor-error-message">
      <WarningIcon />

      <span>
        {message}
      </span>

      <button
        type="button"
        onClick={
          onClose
        }
      >
        ×
      </button>
    </div>
  )
}

function SuccessToast({
  message,
  onClose,
}) {
  return (
    <div className="fornecedor-toast">
      <div className="fornecedor-toast-icon">
        <CheckIcon />
      </div>

      <div className="fornecedor-toast-content">
        <strong>
          Operação concluída
        </strong>

        <span>
          {message}
        </span>
      </div>

      <button
        type="button"
        onClick={
          onClose
        }
      >
        ×
      </button>

      <div className="fornecedor-toast-progress" />
    </div>
  )
}

function validatefornecedor(
  form
) {
  const name =
    form.name.trim()

  if (!name) {
    return 'O nome do fornecedor é obrigatório.'
  }

  if (
    name.length > 150
  ) {
    return 'O nome deve possuir no máximo 150 caracteres.'
  }

  const document =
    onlyDigits(
      form.document
    )

  if (
    form.document.trim()
    && ![
      11,
      14,
    ].includes(
      document.length
    )
  ) {
    return 'Informe um CPF com 11 dígitos ou CNPJ com 14 dígitos.'
  }

  if (
    form.email.trim()
    && !isValidEmail(
      form.email
    )
  ) {
    return 'Informe um e-mail válido.'
  }

  if (
    form.email.trim()
      .length > 150
  ) {
    return 'O e-mail deve possuir no máximo 150 caracteres.'
  }

  if (
    form.address.trim()
      .length > 250
  ) {
    return 'O endereço deve possuir no máximo 250 caracteres.'
  }

  if (
    form.notes.length > 2000
  ) {
    return 'As observações devem possuir no máximo 2000 caracteres.'
  }

  return ''
}

function normalizeForm(
  form
) {
  return {
    name:
      form.name.trim(),

    document:
      form.document.trim()
      || '',

    email:
      form.email.trim()
      || '',

    phone:
      form.phone.trim()
      || '',

    address:
      form.address.trim()
      || '',

    notes:
      form.notes.trim()
      || '',
  }
}

function fornecedorToForm(
  fornecedor
) {
  return {
    name:
      fornecedor.name
      || '',

    document:
      formatDocument(
        fornecedor.document
        || ''
      ),

    email:
      fornecedor.email
      || '',

    phone:
      formatPhone(
        fornecedor.phone
        || ''
      ),

    address:
      fornecedor.address
      || '',

    notes:
      fornecedor.notes
      || '',
  }
}

function getActiveFilter(
  value
) {
  if (
    value === 'ACTIVE'
  ) {
    return true
  }

  if (
    value === 'INACTIVE'
  ) {
    return false
  }

  return null
}

function onlyDigits(
  value
) {
  return String(
    value || ''
  ).replace(
    /\D/g,
    ''
  )
}

function formatDocument(
  value
) {
  const digits =
    onlyDigits(value)
      .slice(0, 14)

  if (
    digits.length <= 11
  ) {
    return digits
      .replace(
        /^(\d{3})(\d)/,
        '$1.$2'
      )
      .replace(
        /^(\d{3})\.(\d{3})(\d)/,
        '$1.$2.$3'
      )
      .replace(
        /\.(\d{3})(\d)/,
        '.$1-$2'
      )
  }

  return digits
    .replace(
      /^(\d{2})(\d)/,
      '$1.$2'
    )
    .replace(
      /^(\d{2})\.(\d{3})(\d)/,
      '$1.$2.$3'
    )
    .replace(
      /\.(\d{3})(\d)/,
      '.$1/$2'
    )
    .replace(
      /(\d{4})(\d)/,
      '$1-$2'
    )
}

function formatPhone(
  value
) {
  const digits =
    onlyDigits(value)
      .slice(0, 11)

  if (
    digits.length <= 10
  ) {
    return digits
      .replace(
        /^(\d{2})(\d)/,
        '($1) $2'
      )
      .replace(
        /(\d{4})(\d)/,
        '$1-$2'
      )
  }

  return digits
    .replace(
      /^(\d{2})(\d)/,
      '($1) $2'
    )
    .replace(
      /(\d{5})(\d)/,
      '$1-$2'
    )
}

function isValidEmail(
  value
) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    .test(
      value.trim()
    )
}

function getInitials(
  name
) {
  if (!name) {
    return 'F'
  }

  const parts =
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)

  if (
    parts.length === 1
  ) {
    return parts[0]
      .substring(0, 2)
      .toUpperCase()
  }

  return (
    parts[0][0]
    + parts[
      parts.length - 1
    ][0]
  ).toUpperCase()
}

function formatDateTime(
  value
) {
  if (!value) {
    return '-'
  }

  const date =
    new Date(value)

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value
  }

  return new Intl
    .DateTimeFormat(
      'pt-BR',
      {
        dateStyle: 'short',
        timeStyle: 'short',
      }
    )
    .format(date)
}

function getErrorMessage(
  error
) {
  const data =
    error.response?.data

  if (data?.message) {
    return data.message
  }

  if (data?.errors) {
    if (
      Array.isArray(
        data.errors
      )
    ) {
      return data.errors
        .map(
          (item) =>
            item.message
            || item.defaultMessage
            || item
        )
        .join(' ')
    }

    if (
      typeof data.errors
      === 'object'
    ) {
      return Object
        .values(
          data.errors
        )
        .join(' ')
    }
  }

  if (
    error.response
      ?.status === 403
  ) {
    return 'Seu usuário não possui permissão para realizar esta ação.'
  }

  if (
    error.response
      ?.status === 401
  ) {
    return 'Sua sessão expirou. Faça login novamente.'
  }

  return 'Não foi possível concluir a operação.'
}

function fornecedorIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M3 21V8l6-4 6 4v13" />
      <path d="M15 11h6v10" />
      <path d="M7 11h4M7 15h4M7 19h4" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M5 12.5 10 17l9-10" />
    </svg>
  )
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M9 6v12M15 6v12" />
    </svg>
  )
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="m8 5 11 7-11 7V5Z" />
    </svg>
  )
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M5 4h4l2 5-3 2a16 16 0 0 0 5 5l2-3 5 2v4c0 1-1 2-2 2C9 21 3 15 3 6c0-1 1-2 2-2Z" />
    </svg>
  )
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2"
      />
      <path d="m3 7 9 6 9-6" />
    </svg>
  )
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
      <circle
        cx="12"
        cy="12"
        r="2.5"
      />
    </svg>
  )
}

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="m4 20 4-1 10-10-3-3L5 16l-1 4Z" />
      <path d="m14 7 3 3" />
    </svg>
  )
}

function WarningIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M12 3 2.5 20h19L12 3Z" />
      <path d="M12 9v5M12 17h.01" />
    </svg>
  )
}

function ChevronLeftIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="m15 18-6-6 6-6" />
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}

export default FornecedorPage