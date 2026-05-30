import AppointmentsManager from '../../components/appointments/AppointmentsManager';
import { DOCTOR_NAV } from '../../constants/doctorNav';

export default function DoctorAppointments() {
  return (
    <AppointmentsManager
      view="doctor"
      title="My Appointments"
      subtitle="Review pending bookings and open full details when needed"
      links={DOCTOR_NAV}
      defaultSort="pending_first"
    />
  );
}
