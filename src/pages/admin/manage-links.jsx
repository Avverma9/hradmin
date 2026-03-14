import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Eye,
  Link2,
  PencilLine,
  Plus,
  Save,
  Search,
  Settings2,
  ShieldCheck,
  Trash2,
  UserCog,
  Users,
  X,
  Filter,
  ChevronDown
} from 'lucide-react'
import Breadcrumb from '../../components/breadcrumb'
import { refreshSidebarLinks, selectAuth } from '../../../redux/slices/authSlice'
import {
  changeSidebarLinkStatus,
  clearSidebarAdminFeedback,
  clearSidebarPermissionState,
  createSidebarLink,
  deleteSidebarLink,
  getDashboardUsers,
  getGroupedSidebarLinks,
  getSidebarLinks,
  getSidebarPermissions,
  getUserSidebarPreview,
  selectAdminSidebar,
  updateSidebarLink,
  updateSidebarPermissions,
} from '../../../redux/slices/admin/sidebar'

const ROLE_OPTIONS = ['Admin', 'Developer', 'PMS', 'TMS', 'CA', 'Rider', 'SuperAdmin']

const getInitialFormState = (link) => ({
  parentLink: link?.parentLink || '',
  route: link?.route || link?.childLink || '',
  childLink: link?.childLink || link?.route || '',
  icon: link?.icon || '',
  status: link?.status || 'active',
  role: Array.isArray(link?.role) ? link.role : [],
  order: String(link?.order ?? ''),
  isParentOnly: Boolean(link?.isParentOnly),
})

const normalizePermissionState = (config) => ({
  mode: config?.sidebarPermissions?.mode || 'role_based',
  allowedLinkIds: config?.sidebarPermissions?.allowedLinkIds || [],
  blockedLinkIds: config?.sidebarPermissions?.blockedLinkIds || [],
})

const getGroupedLinksFromFlatList = (links) =>
  links.reduce((groups, link) => {
    const groupKey = link.parentLink || 'Ungrouped'
    groups[groupKey] = groups[groupKey] || []
    groups[groupKey].push(link)
    return groups
  }, {})

// Minimalist Status Dot
const StatusDot = ({ status = '' }) => {
  const isActive = status.toLowerCase() === 'active'
  return (
    <div className="flex items-center gap-2">
      <span className={`h-2 w-2 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
      <span className="text-sm font-medium text-gray-700 capitalize">{status}</span>
    </div>
  )
}

function SidebarLinkModal({ open, mode, formState, saving, onChange, onRoleToggle, onClose, onSubmit }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 p-4 backdrop-blur-sm transition-opacity">
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-gray-200">
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {mode === 'create' ? 'Create Sidebar Link' : 'Edit Sidebar Link'}
            </h2>
            <p className="mt-0.5 text-sm text-gray-500">Configure grouping, route details, and roles.</p>
          </div>
          <button onClick={onClose} className="rounded-md p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Parent Group</label>
              <input required type="text" name="parentLink" value={formState.parentLink} onChange={onChange} placeholder="e.g. User Management" className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900" />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Icon Component</label>
              <input required type="text" name="icon" value={formState.icon} onChange={onChange} placeholder="e.g. Users" className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900" />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-sm font-semibold text-gray-700">Child Link / Route</label>
              <input type="text" name="route" value={formState.route} onChange={onChange} placeholder="e.g. /dashboard/users" disabled={formState.isParentOnly} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900" />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Display Order</label>
              <input required min="1" type="number" name="order" value={formState.order} onChange={onChange} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900" />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Status</label>
              <select name="status" value={formState.status} onChange={onChange} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <label className="flex items-start gap-3 rounded-md border border-gray-200 bg-gray-50 p-4 sm:col-span-2 cursor-pointer hover:bg-gray-100">
              <input type="checkbox" name="isParentOnly" checked={formState.isParentOnly} onChange={onChange} className="mt-0.5 h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900 cursor-pointer" />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-900">Parent-only Grouping</span>
                <span className="text-sm text-gray-500">Acts only as a dropdown header, no page route.</span>
              </div>
            </label>
          </div>

          <div className="mt-6 border-t border-gray-100 pt-6">
            <label className="text-sm font-semibold text-gray-700">Applicable Roles</label>
            <div className="mt-3 flex flex-wrap gap-2">
              {ROLE_OPTIONS.map((role) => {
                const isSelected = formState.role.includes(role)
                return (
                  <button
                    key={role} type="button" onClick={() => onRoleToggle(role)}
                    className={`inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                      isSelected ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {role}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="mt-8 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 border-t border-gray-100 pt-5">
            <button type="button" onClick={onClose} className="w-full sm:w-auto rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="w-full sm:w-auto inline-flex items-center justify-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-70">
              {saving ? 'Saving...' : mode === 'create' ? 'Create Link' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ManageLinks() {
  const dispatch = useDispatch()
  const { user: loggedInUser } = useSelector(selectAuth)
  const {
    links,
    groupedLinks,
    users,
    preview,
    loadingLinks,
    loadingUsers,
    loadingPermissions,
    loadingPreview,
    savingLink,
    savingPermissions,
    error,
    successMessage,
  } = useSelector(selectAdminSidebar)
  
  const [activeTab, setActiveTab] = useState('master') // 'master' | 'permissions'
  const [searchValue, setSearchValue] = useState('')
  const [masterRoleFilter, setMasterRoleFilter] = useState('All')
  const [masterStatusFilter, setMasterStatusFilter] = useState('All')
  const [modalState, setModalState] = useState({ open: false, mode: 'create', linkId: null })
  const [linkForm, setLinkForm] = useState(getInitialFormState())
  const [selectedUserId, setSelectedUserId] = useState('')
  const [permissionForm, setPermissionForm] = useState(normalizePermissionState())

  useEffect(() => {
    dispatch(getSidebarLinks())
    dispatch(getGroupedSidebarLinks())
    dispatch(getDashboardUsers())
  }, [dispatch])

  useEffect(() => {
    return () => {
      dispatch(clearSidebarAdminFeedback())
      dispatch(clearSidebarPermissionState())
    }
  }, [dispatch])

  const filteredLinks = useMemo(() => {
    const query = searchValue.trim().toLowerCase()
    return links
      .filter((link) => {
        const matchesSearch = !query || [link.parentLink, link.route, link.childLink, link.icon, ...(link.role || [])].join(' ').toLowerCase().includes(query)
        const matchesRole = masterRoleFilter === 'All' || (link.role || []).includes(masterRoleFilter)
        const matchesStatus = masterStatusFilter === 'All' || link.status === masterStatusFilter
        return matchesSearch && matchesRole && matchesStatus
      })
      .sort((first, second) => (first.order ?? 0) - (second.order ?? 0))
  }, [links, masterRoleFilter, masterStatusFilter, searchValue])

  const groupedPermissionLinks = useMemo(
    () => (Object.keys(groupedLinks || {}).length ? groupedLinks : getGroupedLinksFromFlatList(links)),
    [groupedLinks, links],
  )
  const selectedUser = useMemo(() => users.find((user) => (user._id || user.id) === selectedUserId) || null, [selectedUserId, users])

  const handleUserChange = async (event) => {
    const userId = event.target.value
    setSelectedUserId(userId)
    if (!userId) {
      dispatch(clearSidebarPermissionState())
      setPermissionForm(normalizePermissionState())
      return
    }
    const permissionResponse = await dispatch(getSidebarPermissions(userId)).unwrap()
    setPermissionForm(normalizePermissionState(permissionResponse))
    await dispatch(getUserSidebarPreview(userId))
  }

  const openCreateModal = () => { setModalState({ open: true, mode: 'create', linkId: null }); setLinkForm(getInitialFormState()) }
  const openEditModal = (link) => { setModalState({ open: true, mode: 'edit', linkId: link._id || link.id }); setLinkForm(getInitialFormState(link)) }
  const closeModal = () => { setModalState({ open: false, mode: 'create', linkId: null }); setLinkForm(getInitialFormState()) }

  const handleFormChange = (event) => {
    const { name, value, type, checked } = event.target
    setLinkForm((currentForm) => {
      const nextForm = { ...currentForm, [name]: type === 'checkbox' ? checked : value }
      if (name === 'route') nextForm.childLink = value
      if (name === 'isParentOnly' && checked) { nextForm.route = ''; nextForm.childLink = '' }
      return nextForm
    })
  }

  const handleRoleToggle = (role) => {
    setLinkForm((currentForm) => ({
      ...currentForm,
      role: currentForm.role.includes(role) ? currentForm.role.filter((item) => item !== role) : [...currentForm.role, role],
    }))
  }

  const buildLinkPayload = () => {
    const routeValue = linkForm.isParentOnly ? '' : linkForm.route.trim()
    if (!linkForm.parentLink.trim()) throw new Error('Parent group is required.')
    if (linkForm.role.length === 0) throw new Error('At least one role is required.')
    if (!linkForm.isParentOnly && !routeValue) throw new Error('Route path is required for non-parent-only links.')

    return {
      parentLink: linkForm.parentLink.trim(),
      childLink: routeValue,
      route: routeValue,
      icon: linkForm.icon.trim(),
      status: linkForm.status,
      role: linkForm.role,
      order: Number(linkForm.order),
      isParentOnly: linkForm.isParentOnly,
    }
  }

  const handleLinkSubmit = async (event) => {
    event.preventDefault()
    try {
      const payload = buildLinkPayload()
      if (modalState.mode === 'create') await dispatch(createSidebarLink(payload)).unwrap()
      else await dispatch(updateSidebarLink({ id: modalState.linkId, data: payload })).unwrap()
      closeModal()
      dispatch(getSidebarLinks())
      dispatch(getGroupedSidebarLinks())
    } catch (submitError) {
      if (submitError instanceof Error) window.alert(submitError.message)
    }
  }

  const handleStatusToggle = async (link) => {
    await dispatch(changeSidebarLinkStatus({ id: link._id || link.id, status: link.status === 'active' ? 'inactive' : 'active' }))
    dispatch(getSidebarLinks())
  }

  const handleDeleteLink = async (link) => {
    if (!window.confirm(`Delete ${link.route || link.childLink || link.parentLink}? This action cannot be undone.`)) return
    await dispatch(deleteSidebarLink(link._id || link.id))
    dispatch(getSidebarLinks())
    dispatch(getGroupedSidebarLinks())
  }

  const togglePermissionId = (type, linkId) => {
    setPermissionForm((currentForm) => {
      const targetList = currentForm[type]
      const oppositeType = type === 'allowedLinkIds' ? 'blockedLinkIds' : 'allowedLinkIds'
      const nextTargetList = targetList.includes(linkId) ? targetList.filter((id) => id !== linkId) : [...targetList, linkId]
      return { ...currentForm, [type]: nextTargetList, [oppositeType]: currentForm[oppositeType].filter((id) => id !== linkId) }
    })
  }

  const handlePermissionSave = async () => {
    if (!selectedUserId) return
    await dispatch(updateSidebarPermissions({
      userId: selectedUserId,
      data: { mode: permissionForm.mode, allowedLinkIds: permissionForm.allowedLinkIds, blockedLinkIds: permissionForm.blockedLinkIds },
    })).unwrap()
    dispatch(getUserSidebarPreview(selectedUserId))

    if (loggedInUser?.id === selectedUserId) {
      dispatch(refreshSidebarLinks(selectedUserId))
    }
  }

  return (
    <div className="bg-white px-4 py-8 font-sans text-gray-900 selection:bg-gray-200 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="sticky top-0 z-20 -mx-4 bg-white/95 px-4 pb-4 backdrop-blur-sm sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <Breadcrumb />

              <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Navigation</h1>
                  <p className="mt-2 text-sm text-gray-500">Manage master sidebar routes and user-specific rules.</p>
                </div>
                <button onClick={openCreateModal} className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800">
                  <Plus size={16} /> New Item
                </button>
              </div>

              {/* Custom Tab Navigation */}
              <div className="mt-8 border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveTab('master')}
                    className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors ${
                      activeTab === 'master' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    Master Directory
                  </button>
                  <button
                    onClick={() => setActiveTab('permissions')}
                    className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors ${
                      activeTab === 'permissions' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    Access & Permissions
                  </button>
                </nav>
              </div>
            </div>

        {(error || successMessage) && (
          <div className={`mt-6 rounded-md border p-4 text-sm font-medium ${error ? 'border-red-200 bg-red-50 text-red-800' : 'border-emerald-200 bg-emerald-50 text-emerald-800'}`}>
            {error || successMessage}
          </div>
        )}

            {/* TAB 1: MASTER DIRECTORY */}
            {activeTab === 'master' && (
              <div className="mt-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                
                {/* Minimalist Stats */}
                <dl className="mb-8 grid grid-cols-2 gap-px bg-gray-200 sm:grid-cols-4 rounded-xl overflow-hidden shadow-sm border border-gray-200">
                  {[
                    { label: 'Total Links', value: links.length },
                    { label: 'Active Links', value: links.filter((l) => l.status === 'active').length },
                    { label: 'Registered Users', value: users.length },
                    { label: 'Menu Groups', value: new Set(links.map((l) => l.parentLink).filter(Boolean)).size },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-white px-6 py-6">
                      <dt className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</dt>
                      <dd className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900">{stat.value}</dd>
                    </div>
                  ))}
                </dl>

                {/* Inline Filters */}
                <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl bg-gray-50 p-2 border border-gray-200">
                  <div className="flex flex-col sm:flex-row flex-1 w-full gap-2">
                    <div className="relative flex-1">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type="text" value={searchValue} onChange={(e) => setSearchValue(e.target.value)} placeholder="Search routes..." className="w-full appearance-none rounded-lg border-transparent bg-transparent py-2 pl-9 pr-4 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:bg-white focus:ring-2 focus:ring-gray-900 transition-colors" />
                    </div>
                    <div className="hidden sm:block w-px bg-gray-300 my-1"></div>
                    <div className="relative flex-1">
                      <select value={masterRoleFilter} onChange={(e) => setMasterRoleFilter(e.target.value)} className="w-full appearance-none rounded-lg border-transparent bg-transparent py-2 pl-4 pr-8 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:bg-white focus:ring-2 focus:ring-gray-900 transition-colors cursor-pointer">
                        <option value="All">All Roles</option>
                        {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                    <div className="hidden sm:block w-px bg-gray-300 my-1"></div>
                    <div className="relative flex-1">
                      <select value={masterStatusFilter} onChange={(e) => setMasterStatusFilter(e.target.value)} className="w-full appearance-none rounded-lg border-transparent bg-transparent py-2 pl-4 pr-8 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:bg-white focus:ring-2 focus:ring-gray-900 transition-colors cursor-pointer">
                        <option value="All">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-hidden border border-gray-200 rounded-xl">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        {['Group / Route', 'Roles', 'Status', 'Order', 'Actions'].map((head) => (
                          <th key={head} className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{head}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {loadingLinks && filteredLinks.length === 0 && (
                        <tr><td colSpan="5" className="px-6 py-12 text-center text-sm text-gray-500">Loading directory...</td></tr>
                      )}
                      {!loadingLinks && filteredLinks.length === 0 && (
                        <tr><td colSpan="5" className="px-6 py-12 text-center text-sm text-gray-500">No links found matching your criteria.</td></tr>
                      )}
                      {filteredLinks.map((link) => (
                        <tr key={link._id || link.id} className="hover:bg-gray-50/50 transition-colors group">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <p className="text-sm font-semibold text-gray-900">{link.parentLink}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{link.isParentOnly ? 'Parent Header' : link.route || link.childLink}</p>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                              {(link.role || []).map((role) => (
                                <span key={role} className="inline-flex items-center rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 border border-gray-200">{role}</span>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button onClick={() => handleStatusToggle(link)} className="focus:outline-none">
                              <StatusDot status={link.status} />
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-600">{link.order}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <button onClick={() => openEditModal(link)} className="p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-900 rounded-md transition-colors"><PencilLine size={16} /></button>
                              <button onClick={() => handleDeleteLink(link)} className="p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors"><Trash2 size={16} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 2: ACCESS & PERMISSIONS */}
            {activeTab === 'permissions' && (
              <div className="mt-8 animate-in fade-in slide-in-from-bottom-2 duration-500 grid grid-cols-1 gap-8 lg:grid-cols-12">
                
                {/* Left Side: Controls */}
                <div className="lg:col-span-6 flex flex-col space-y-6">
                  <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <UserCog size={18} className="text-gray-400"/> Overrides
                    </h2>
                    
                    <div className="space-y-5">
                      <div>
                        <label className="mb-1.5 block text-sm font-semibold text-gray-700">Target User</label>
                        <select value={selectedUserId} onChange={handleUserChange} className="w-full rounded-md border border-gray-300 py-2.5 pl-3 pr-10 text-sm text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900">
                          <option value="">{loadingUsers ? 'Loading users...' : '-- Choose User --'}</option>
                          {users.map((u) => <option key={u._id || u.id} value={u._id || u.id}>{u.name} ({u.role})</option>)}
                        </select>
                      </div>

                      {selectedUser && (
                        <div className="rounded-md bg-gray-50 p-3 border border-gray-200">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-sm font-bold text-gray-900">{selectedUser.name}</p>
                              <p className="text-xs font-medium text-gray-500">{selectedUser.email}</p>
                            </div>
                            <span className="inline-flex rounded border border-gray-200 bg-white px-2 py-1 text-xs font-bold text-gray-700">{selectedUser.role}</span>
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-700">Permission Mode</label>
                        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg border border-gray-200">
                          {['role_based', 'custom'].map((mode) => (
                            <button
                              key={mode} type="button" onClick={() => setPermissionForm((prev) => ({ ...prev, mode }))}
                              className={`flex-1 rounded-md px-3 py-2 text-sm font-bold transition-all ${
                                permissionForm.mode === mode ? 'bg-white text-gray-900 shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-700'
                              }`}
                            >
                              {mode === 'role_based' ? 'Role Default' : 'Custom Manual'}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col rounded-xl border border-gray-200 bg-gray-50 p-4">
                          <span className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Force Allow</span>
                          <div className="max-h-[250px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                            {Object.entries(groupedPermissionLinks).map(([group, links]) => (
                              <div key={group} className="space-y-1">
                                {links.map((l) => (
                                  <label key={l._id || l.id} className="flex items-center gap-2.5 text-sm p-1.5 hover:bg-gray-200 rounded-md cursor-pointer transition-colors">
                                    <input type="checkbox" checked={permissionForm.allowedLinkIds.includes(l._id || l.id)} onChange={() => togglePermissionId('allowedLinkIds', l._id || l.id)} className="h-4 w-4 shrink-0 rounded border-gray-300 text-gray-900 focus:ring-gray-900 cursor-pointer" />
                                    <span className="truncate font-medium text-gray-700">{l.route || l.parentLink}</span>
                                  </label>
                                ))}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex flex-col rounded-xl border border-gray-200 bg-gray-50 p-4">
                          <span className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Force Block</span>
                          <div className="max-h-[250px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                            {Object.entries(groupedPermissionLinks).map(([group, links]) => (
                              <div key={group} className="space-y-1">
                                {links.map((l) => (
                                  <label key={l._id || l.id} className="flex items-center gap-2.5 text-sm p-1.5 hover:bg-gray-200 rounded-md cursor-pointer transition-colors">
                                    <input type="checkbox" checked={permissionForm.blockedLinkIds.includes(l._id || l.id)} onChange={() => togglePermissionId('blockedLinkIds', l._id || l.id)} className="h-4 w-4 shrink-0 rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer" />
                                    <span className="truncate font-medium text-gray-700">{l.route || l.parentLink}</span>
                                  </label>
                                ))}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <button type="button" onClick={handlePermissionSave} disabled={!selectedUserId || savingPermissions || loadingPermissions} className="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-gray-900 px-4 py-3 text-sm font-bold text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:opacity-60 transition-colors">
                        <Save size={16} /> {savingPermissions ? 'Saving...' : 'Save Configuration'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Side: Live Preview */}
                <div className="lg:col-span-6">
                  <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sticky top-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Eye size={18} className="text-gray-400"/> Live Sidebar Preview
                    </h2>

                    {!selectedUserId ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-gray-200 rounded-xl">
                        <Filter size={24} className="text-gray-300 mb-2" />
                        <p className="text-sm font-medium text-gray-500">Select a user to preview.</p>
                      </div>
                    ) : loadingPreview ? (
                       <div className="flex justify-center py-12">
                         <p className="text-sm font-medium text-gray-500 animate-pulse">Building preview...</p>
                       </div>
                    ) : (
                      <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                        {Object.keys(preview).length === 0 ? (
                          <p className="text-sm font-medium text-gray-500 text-center py-8">No accessible links for this user.</p>
                        ) : (
                          Object.entries(preview).map(([group, groupLinks]) => (
                            <div key={group}>
                              <p className="mb-2 text-xs font-bold uppercase text-gray-400 tracking-widest">{group}</p>
                              <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                                {groupLinks.map((link, idx) => (
                                  <div key={link.id || link._id} className={`px-4 py-3 text-sm flex justify-between items-center ${idx !== groupLinks.length - 1 ? 'border-b border-gray-100' : ''}`}>
                                    <span className="font-semibold text-gray-700">{link.route || link.childLink || 'Header'}</span>
                                    <span className="text-gray-400 text-xs font-mono bg-gray-50 px-2 py-0.5 rounded border border-gray-200">{link.icon}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}
            
      </div>

      <SidebarLinkModal open={modalState.open} mode={modalState.mode} formState={linkForm} saving={savingLink} onChange={handleFormChange} onRoleToggle={handleRoleToggle} onClose={closeModal} onSubmit={handleLinkSubmit} />
    </div>
  )
}

export default ManageLinks
