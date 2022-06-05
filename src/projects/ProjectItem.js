import React from 'react';
import { Link, useLocation } from 'react-router-dom';

import Avatar from '../shared/components/UIElements/Avatar';
import Card from '../shared/components/UIElements/Card';
import './ProjectItem.css';

const ProjectItem = props => {
    let image_url = 'https://us.123rf.com/450wm/pavelstasevich/pavelstasevich1811/pavelstasevich181101027/112815900-no-image-available-icon-flat-vector.jpg?ver=6';
    if(props.image){
        image_url = props.image;
    }
    const location = useLocation();
    return (
        <li className="project-item">
            <Card className="project-item__content">
                <Link to={`${location.pathname}/${props.id}`}>
                    <div className="project-item__image">
                        <Avatar image={image_url} alt={props.id} />
                    </div>
                    <div className="project-item__info">
                        <h2>{props.title}</h2>
                        <h4>{props.city}</h4>
                        <h5>{props.street}</h5>
                        <h5 className="project-item__status">{props.status}</h5>
                    </div>
                </Link>
            </Card>
        </li>
    );
};

export default ProjectItem;
