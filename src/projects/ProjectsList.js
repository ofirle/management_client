import React from 'react';

import ProjectItem from './ProjectItem';
import Card from '../shared/components/UIElements/Card';
import './ProjectsList.css';

const ProjectsList = props => {
    console.log(props);
    if (props.items.length === 0) {
        return (
            <div className="center">
                <Card>
                    <h2>No users found.</h2>
                </Card>
            </div>
        );
    }

    return (
        <ul className="users-list">
            {props.items.map(project => (
                <ProjectItem
                    key={project.id}
                    id={project.id}
                    status={project.status}
                    city={project.city}
                    street={project.street}
                    title={project.title}
                    image={project.image}
                />
            ))}
        </ul>
    );
};

export default ProjectsList;
