// import React, { useState } from 'react';
// import { Outlet } from 'react-router-dom';
// import Header from './Header';
// import Sidebar from './Sidebar';
// import { useAuth } from '../../hooks/useAuth';

// const Layout = () => {
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const { user } = useAuth();

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Mobile sidebar overlay */}
//       {sidebarOpen && (
//         <div 
//           className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
//           onClick={() => setSidebarOpen(false)}
//         />
//       )}

//       {/* Sidebar */}
//       <Sidebar 
//         open={sidebarOpen} 
//         onClose={() => setSidebarOpen(false)}
//         userRole={user?.role}
//       />

//       {/* Main content */}
//       <div className="lg:pl-64">


//         {/* Header */}
//         <Header 
//           onMenuClick={() => setSidebarOpen(true)}
//           user={user}
//         />

//         {/* Page content */}
//         <main className="py-6">
//           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//             <Outlet />
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// };

// export default Layout;

import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import { useAuth } from '../../hooks/useAuth';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar Component */}
      <Sidebar 
        open={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        userRole={user?.role}
        userId={user?.id} 
      />

      {/* Main content area - Adjusted for fixed sidebar */}
      <div className="lg:pl-64">
        {/* Header */}
        <Header 
          onMenuClick={() => setSidebarOpen(true)}
          user={user}
        />

        {/* Page content */}
        <main className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;