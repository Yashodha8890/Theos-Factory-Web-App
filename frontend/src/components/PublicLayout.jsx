import Footer from './Footer';
import Navbar from './Navbar';

const PublicLayout = ({ children }) => (
  <div className="page flex min-h-screen flex-col">
    <Navbar />
    <main className="flex-1">{children}</main>
    <Footer />
  </div>
);

export default PublicLayout;
