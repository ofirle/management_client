import './NavLinks.css';
import {NavLink} from "react-router-dom";
import { AuthContext } from "../../context/auth-context";
import {useContext} from "react";

const NavLinks = props => {
    const auth = useContext(AuthContext);
    let links;
    if(auth.isLoggedIn){
        links = (<ul className="nav-links">
            <li>
                <NavLink to="/profile">Profile</NavLink>
            </li>
            <li>
                <NavLink to="/">Transactions</NavLink>
            </li>
            <li>
                <NavLink to="/rules">Rules</NavLink>
            </li>
            <li>
                <NavLink to="/new">Add Project</NavLink>
            </li>
            <li>
                <NavLink to="/roles">Roles</NavLink>
            </li>
            <li>
                <button onClick={auth.logout}>LOGOUT</button>
            </li>
        </ul>)
    } else {
        links = <ul className="nav-links">
            <li>
                <NavLink to="/auth">Login</NavLink>
            </li>
        </ul>
    }
    return links;
}

export default NavLinks;