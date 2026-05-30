import AppointmentsManager from '../../components/appointments/AppointmentsManager';
import { ADMIN_NAV } from '../../constants/adminNav';

export default function AdminAppointments() {
  return (
    <AppointmentsManager
      view="admin"
      title="All Appointments"
      subtitle="Search, filter and manage every booking"
      links={ADMIN_NAV}
      defaultSort="newest"
    />
  );
}
