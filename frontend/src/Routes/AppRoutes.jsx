import { Route, Routes } from 'react-router-dom';

import Can from '##/src/Components/can/Can.jsx';
import RedirectRoute from '##/src/Components/can/RedirectRoute.jsx';
import lazyLoad from '##/src/LazyLoader.jsx';
import { setComponentDisplayName } from '##/src/utility/utility.js';

const AdminDashboard = lazyLoad(
  () => import('##/src/Routes/AdminDashboard.jsx'),
);
const ViewerDashBoard = lazyLoad(
  () => import('##/src/Routes/ViewerDashBoard.jsx'),
);
const CreatorDashBoard = lazyLoad(
  () => import('##/src/Routes/CreatorDashBoard.jsx'),
);

const Signup = lazyLoad(() => import('##/src/Routes/Signup.jsx'));
const Login = lazyLoad(() => import('##/src/Routes/Login.jsx'));

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        loader={async () => ({ Component: Can })}
        element={Can({
          no: () => <RedirectRoute />,
          //initially yes:()=> <UserDashboard />
          yes: () => <ViewerDashBoard />,
          perform: 'viewer-dashboard-visit',
        })}
      />
      <Route
        path="/dashboard"
        loader={async () => ({ Component: Can })}
        element={Can({
          no: () => <RedirectRoute />,
          yes: () => <CreatorDashBoard />,
          perform: 'creator-dashboard-visit',
        })}
      />
      <Route
        path="/admin-dashboard"
        loader={async () => ({ Component: Can })}
        element={Can({
          no: () => <RedirectRoute />,
          yes: () => <AdminDashboard />,
          perform: 'admin-dashboard-visit',
        })}
      />
      <Route
        path="/signup"
        loader={async () => ({ Component: Can })}
        element={Can({
          no: () => <RedirectRoute />,
          yes: () => <Signup />,
          perform: 'sign-up:visit',
        })}
      />
      <Route
        path="/login"
        loader={async () => ({ Component: Can })}
        element={Can({
          no: () => <RedirectRoute />,
          yes: () => <Login />,
          perform: 'sign-in:visit',
        })}
      />
    </Routes>
  );
}

setComponentDisplayName(AppRoutes, 'Alert');
export default AppRoutes;
