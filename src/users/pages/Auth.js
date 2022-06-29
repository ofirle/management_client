import React, { useContext, useState } from 'react';

import Card from '../../shared/components/UIElements/Card';
import Input from '../../shared/components/FormElements/Input';
import Button from '../../shared/components/FormElements/Button';
import {
  VALIDATOR_MINLENGTH,
  VALIDATOR_REQUIRE,
  VALIDATOR_EMAIL
} from '../../shared/util/validators';
import { useForm } from '../../shared/hooks/form-hook';
import './Auth.css';
import { AuthContext } from '../../shared/context/auth-context';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import { useHttpClient } from '../../shared/hooks/http-hook';
import ImageUpload from '../../shared/components/FormElements/ImageUpload';
import { httpMethods } from '../../shared/hooks/enum';

const Auth = () => {
  const auth = useContext(AuthContext);

  const [isLoginMode, setIsLoginMode] = useState(true);
  const { isLoading, error, sendRequest, clearError } = useHttpClient();

  const [formState, inputHandler, setFormData] = useForm(
    {
      username: {
        value: '',
        isValid: false
      },
      password: {
        value: '',
        isValid: false
      }
    },
    false
  );

  const switchModeHandler = () => {
    if (!isLoginMode) {
      setFormData(
        {
          ...formState.inputs,
          name: undefined,
          image: undefined
        },
        formState.inputs.username.isValid && formState.inputs.password.isValid
      );
    } else {
      setFormData(
        {
          ...formState.inputs,
          name: {
            value: '',
            isValid: false
          },
          image: {
            value: null,
            isValid: false
          }
        },
        false
      );
    }
    setIsLoginMode((prevMode) => !prevMode);
  };

  const authSubmitHandler = async (event) => {
    event.preventDefault();
    if (isLoginMode) {
      try {
        const responseData = await sendRequest(
          `${process.env.REACT_APP_SERVER_URL}/auth/signin`,
          httpMethods.Post,
          null,
          JSON.stringify({
            username: formState.inputs.username.value,
            password: formState.inputs.password.value
          })
        );
        const authUser = responseData.data;
        auth.login(authUser.id, authUser.accessToken);
      } catch (err) {
        console.log(err);
      }
    } else {
      try {
        console.log(formState.inputs);
        const formData = new FormData();
        formData.append('name', formState.inputs.name.value);
        formData.append('email', formState.inputs.email.value);
        formData.append('username', formState.inputs.username.value);
        formData.append('password', formState.inputs.password.value);
        formData.append('image', formState.inputs.image.value);
        const responseData = await sendRequest(
          `${process.env.REACT_APP_SERVER_URL}/auth/signup`,
          httpMethods.Post,
          formData
        );
        console.log(responseData);
        setIsLoginMode(true);
      } catch (err) {
        console.log(err);
      }
    }
  };

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      <Card className="authentication">
        {isLoading && <LoadingSpinner asOverlay />}
        {isLoginMode && <h2>Login</h2>}
        {!isLoginMode && <h2>Signup</h2>}
        <hr />
        <form onSubmit={authSubmitHandler}>
          {!isLoginMode && (
            <span>
              <ImageUpload center id="image" onInput={inputHandler} />
              <Input
                element="input"
                id="name"
                type="text"
                label="Full Name"
                validators={[VALIDATOR_REQUIRE()]}
                onInput={inputHandler}
              />
              <Input
                element="input"
                id="email"
                type="email"
                label="Email"
                validators={[VALIDATOR_EMAIL()]}
                onInput={inputHandler}
              />
            </span>
          )}
          <Input
            element="input"
            id="username"
            type="username"
            label="Username"
            validators={[]}
            errorText="Please enter username"
            onInput={inputHandler}
          />
          <Input
            element="input"
            id="password"
            type="password"
            label="Password"
            validators={[VALIDATOR_MINLENGTH(5)]}
            errorText="Please enter a valid password, at least 5 characters."
            onInput={inputHandler}
          />
          <Button type="submit" disabled={!formState.isValid}>
            {isLoginMode ? 'LOGIN' : 'SIGNUP'}
          </Button>
        </form>
        <Button inverse onClick={switchModeHandler}>
          SWITCH TO {isLoginMode ? 'SIGNUP' : 'LOGIN'}
        </Button>
      </Card>
    </React.Fragment>
  );
};

export default Auth;
