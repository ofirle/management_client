import ProjectsList from "../components/projects/ProjectsList";
import {useContext, useEffect, useState} from "react";
import {AuthContext} from "../../shared/context/auth-context";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import {useHttpClient} from "../../shared/hooks/http-hook";

const Projects = () => {
    const auth = useContext(AuthContext);
    const [projectsList, setProjectsList] = useState(null);
    const { isLoading, error, sendRequest, clearError } = useHttpClient();

    useEffect(async () => {
        try {
            const responseData = await sendRequest('http://localhost:3000/transactions', 'GET', null, {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
                    'Authorization': 'Bearer ' + auth.token
                }
            )
            console.log(responseData)
            setProjectsList(responseData);
        }
        catch ( err ) {

        }}, []);

    if(projectsList === null){
        return <LoadingSpinner asOverlay/>;
    }
    if(projectsList.length === 0){
        return <h1>There is no projects...</h1>;
    }else{
        return <ProjectsList items={projectsList}/>
    }
}

export default Projects;