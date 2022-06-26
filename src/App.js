import { BrowserRouter as Router, Route, Redirect, Switch } from 'react-router-dom';
import MainNavigation from './shared/components/Navigations/MainNavigation';
import Auth from './users/pages/Auth';
import { AuthContext } from './shared/context/auth-context';
import { useAuth } from './shared/hooks/auth-hook';
import Profile from './users/pages/Profile';
import Transactions from './transactions/pages/Transactions';
import Rules from './rules/pages/Rules';
import Roles from './roles/pages/Roles';

const App = () => {
  const { token, login, logout, userId } = useAuth();

  let routes;

  if (token) {
    routes = (
      <Switch>
        <Route path="/" exact>
          <Transactions />
        </Route>
        <Route path="/rules" exact>
          <Rules />
        </Route>
        <Route path="/profile" exact>
          <Profile />
        </Route>
        <Route path="/roles" exact>
          <Roles />
        </Route>
        <Redirect to="/" />
      </Switch>
    );
  } else {
    routes = (
      <Switch>
        <Route path="/auth" exact>
          <Auth />
        </Route>
        <Redirect to="/auth" />
      </Switch>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: !!token,
        token: token,
        userId: userId,
        login: login,
        logout: logout
      }}>
      <Router>
        <MainNavigation />
        <main>{routes}</main>
      </Router>
    </AuthContext.Provider>
  );
};

export default App;
