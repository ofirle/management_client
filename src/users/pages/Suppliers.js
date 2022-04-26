import {useContext, useEffect, useState} from "react";
import {AuthContext} from "../../shared/context/auth-context";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import {useHttpClient} from "../../shared/hooks/http-hook";

const Suppliers = () => {
    const auth = useContext(AuthContext);
    const [suppliersList, setSuppliersList] = useState(null);
    const { isLoading, error, sendRequest, clearError } = useHttpClient();

    useEffect(async () => {
        try {
            const responseData = await sendRequest('http://localhost:3000/suppliers', 'GET', null, {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
                    'Authorization': 'Bearer ' + auth.token
                }
            )
            setSuppliersList(responseData);
        }
        catch ( err ) {

        }}, []);

    if(suppliersList === null){
        return <LoadingSpinner asOverlay/>;
    }
    if(suppliersList.length === 0){
        return <h1>There is no suppliers...</h1>;
    }else{
        return <SuppliersList items={suppliersList}/>
    }
}

export default Suppliers;