import React, {useContext, useEffect, useState} from "react";
import {AuthContext} from "../../shared/context/auth-context";
import {useHttpClient} from "../../shared/hooks/http-hook";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";

const Profile = () => {

    const auth = useContext(AuthContext);

    const [userData, setUserData] = useState(null);
    const { isLoading, error, sendRequest, clearError } = useHttpClient();

    useEffect(async () => {
        try {
            const responseData = await sendRequest('http://localhost:3000/auth/' + auth.userId, 'GET');
            // console.log(responseData)
            setUserData(responseData);
        }
        catch ( err ) {

        }}, []);

    if(userData === null){
        return <LoadingSpinner asOverlay/>;
    } else {
        return ( <div>
            <h2>Hello {`${userData.name}`}</h2>
            <b>username:</b> {`${userData.username}`}<br/>
            <b>email:</b> {`${userData.email}`}
            </div>
        )
    }
}

export default Profile;