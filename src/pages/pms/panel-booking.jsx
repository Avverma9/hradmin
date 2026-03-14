import PmsBooking from './pms-booking'

const PANEL_FILTERS = {
  bookingSource: 'Panel',
}

const PANEL_EXTRA_FILTERS = [
  { key: 'email', placeholder: 'Filter by User Email', label: 'User Email' },
]

function PanelBooking() {
  return (
    <PmsBooking
      title="Panel Bookings"
      fetchMode="query"
      fixedFilters={PANEL_FILTERS}
      extraFilterFields={PANEL_EXTRA_FILTERS}
      hideSourceFilter
      hideGuestContactForNonPrivileged
      showCreatedBy
    />
  )
}

export default PanelBooking
