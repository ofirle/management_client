import {useParams} from "react-router-dom";
import {useEffect, useState} from "react";

const ProjectInfo = props => {
    const [projectData, setProjectData] = useState(null);

    const { projectId } = useParams();
    useEffect(() => {
        fetch(`http://localhost:3000/projects/${projectId}`, {
            method: 'GET',
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
                // 'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Im9maXJsZSIsImlhdCI6MTY0MTk4Mzg3OCwiZXhwIjoxNjQxOTg3NDc4fQ.dvq2ZwFzoZdR-G7PMjV3-ylSIY3W6KJtDvELcmK5U3Y'
            }
        })
            .then(response => response.json())
            .then(response =>  {
                console.log(response);
                setProjectData(response);
            })
            .catch(err => { console.log(err)
            });
    }, []);

    if(projectData === null){
        return 'Loading...';
    }
    else{
        return (
            <div>
                <img src={projectData.image}/>
                <h1>{projectData.title}</h1>
                <h2>{projectData.city}</h2>
                <h2>{projectData.street}</h2>
                <h3>{projectData.status}</h3>
            </div>
        );
    }
}

export default ProjectInfo;