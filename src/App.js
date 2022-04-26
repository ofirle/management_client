import logo from './logo.svg';
import {BrowserRouter as Router, Route, Redirect, Switch} from 'react-router-dom';
import Users from "./users/pages/Users";
import MainNavigation from "./shared/components/Navigations/MainNavigation";
import Projects from "./users/pages/Projects";
import ProjectInfo from "./users/components/projects/ProjectInfo";
import Auth from "./users/pages/Auth";
import {AuthContext} from "./shared/context/auth-context";
import {useAuth} from "./shared/hooks/auth-hook";
import NewProject from "./users/pages/NewProject";
import Profile from "./users/pages/Profile";
import Transactions from "./users/pages/Transactions";

const App = () => {
    const { token, login, logout, userId } = useAuth();

    let routes;

    if (token) {
        routes = (
            <Switch>
                <Route path="/" exact>
                    <Transactions/>
                </Route>
                <Route path="/profile" exact>
                    <Profile/>
                </Route>
                <Route path="/new" exact>
                    <NewProject/>
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
              <main>
                  {routes}
              </main>
          </Router>
      </AuthContext.Provider>
  );
}

export default App;
