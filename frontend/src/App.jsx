import { Navigate, Route, Routes } from 'react-router-dom';
import PublicLayout from './components/PublicLayout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import ServiceDetail from './pages/ServiceDetail';
import Gallery from './pages/Gallery';
import Contact from './pages/Contact';
import BookAppointment from './pages/BookAppointment';
import RequestQuotation from './pages/RequestQuotation';
import Rentals from './pages/Rentals';
import Signup from './pages/Signup';
import Signin from './pages/Signin';
import DashboardOverview from './pages/dashboard/DashboardOverview';
import MyProfile from './pages/dashboard/MyProfile';
import AppointmentDetails from './pages/dashboard/AppointmentDetails';
import RentedItems from './pages/dashboard/RentedItems';
import QuotationsRequested from './pages/dashboard/QuotationsRequested';
import ProfileDetails from './pages/dashboard/ProfileDetails';
import DeleteAccount from './pages/dashboard/DeleteAccount';
import Logout from './pages/dashboard/Logout';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminInventory from './pages/admin/AdminInventory';
import AdminOrders from './pages/admin/AdminOrders';
import AdminGallery from './pages/admin/AdminGallery';
import AdminBookings from './pages/admin/AdminBookings';
import AdminUsers from './pages/admin/AdminUsers';
import AdminQuotations from './pages/admin/AdminQuotations';
import ChatbotWidget from './components/ChatbotWidget';

const withPublic = (element) => <PublicLayout>{element}</PublicLayout>;

const withDashboard = (element, title) => (
  <ProtectedRoute>
    <DashboardLayout title={title}>{element}</DashboardLayout>
  </ProtectedRoute>
);

const withAdmin = (element) => (
  <AdminProtectedRoute>
    {element}
  </AdminProtectedRoute>
);

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={withPublic(<Home />)} />
        <Route path="/about" element={withPublic(<About />)} />
        <Route path="/services" element={withPublic(<Services />)} />
        <Route path="/services/:slug" element={withPublic(<ServiceDetail />)} />
        <Route path="/gallery" element={withPublic(<Gallery />)} />
        <Route path="/contact" element={withPublic(<Contact />)} />
        <Route path="/rentals" element={withPublic(<Rentals />)} />
        <Route path="/book-appointment" element={withPublic(<BookAppointment />)} />
        <Route path="/request-quotation" element={withPublic(<RequestQuotation />)} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={withAdmin(<AdminDashboard />)} />
        <Route path="/admin/dashboard/inventory" element={withAdmin(<AdminInventory />)} />
        <Route path="/admin/dashboard/orders" element={withAdmin(<AdminOrders />)} />
        <Route path="/admin/dashboard/gallery" element={withAdmin(<AdminGallery />)} />
        <Route path="/admin/dashboard/bookings" element={withAdmin(<AdminBookings />)} />
        <Route path="/admin/dashboard/quotations" element={withAdmin(<AdminQuotations />)} />
        <Route path="/admin/dashboard/users" element={withAdmin(<AdminUsers />)} />
        <Route path="/dashboard" element={withDashboard(<DashboardOverview />, 'Overview')} />
        <Route path="/dashboard/profile" element={withDashboard(<MyProfile />, 'My Profile')} />
        <Route path="/dashboard/appointments" element={withDashboard(<AppointmentDetails />, 'My Appointments')} />
        <Route path="/dashboard/rentals" element={withDashboard(<RentedItems />, 'Rented Items')} />
        <Route path="/dashboard/quotations" element={withDashboard(<QuotationsRequested />, 'Quotations')} />
        <Route path="/dashboard/account" element={withDashboard(<ProfileDetails />, 'Account & Profile')} />
        <Route path="/dashboard/delete" element={withDashboard(<DeleteAccount />, 'Delete Account')} />
        <Route path="/dashboard/logout" element={withDashboard(<Logout />, 'Logout')} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ChatbotWidget />
    </>
  );
}

export default App;
