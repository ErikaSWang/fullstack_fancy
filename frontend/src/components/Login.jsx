// NEW HOOK!!
// Looks like this is similar to useState()
// But useState() causes a re-render (which cause a lag time)
// useRef() is immediate
import { useRef } from 'react';

// This is the legacy 'silent' score version (no user test)
// See: https://developers.google.com/recaptcha
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { GoogleLoginButton, FacebookLoginButton } from "react-social-login-buttons";

// I learned about Yup and Formik from React Bootstrap
// See: https://react-bootstrap.netlify.app/docs/forms/validation/
import * as formik from 'formik';
import * as yup from 'yup';
// Claude found this package that adds password helpers to yup, so we don't have to write regexes for all the different character types
// See: https://www.npmjs.com/package/yup-password?activeTab=readme
import YupPassword from 'yup-password';

import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';


// USERS ENTERING/SENDING DATA TO THE BACKEND REQUIRES A *LOT* OF SECURITY!

// Google recaptcha prevents bot hackers from brute force attacks - is both frontend and backend
  // (frontend runs the test and gets a token, which it sends to the backend)
  // (backend handles verification)

// Formik & Yup are mostly for enhancing the user experience, by providing feedback on input formats
// (actual validation happens in the backend)

const Login = ({formMessage, setFormMessage, user, setUser}) => {
    const { executeRecaptcha } = useGoogleReCaptcha()

    const { Formik } = formik;
    YupPassword(yup);

    // TWO-BUTTON TRICK: a ref remembers which button was clicked
    // before Formik's onSubmit fires — refs don't cause re-renders
    // (useState would cause a re-render and might not update in time)
    const submitButton = useRef('login') // The default setting

  
    // This is yup-password
    const schema = yup.object().shape({
      username: yup.string().required('Username is required'),
      password: yup.string()
        .password()
        .min(8, 'Password must be at least 8 characters')
        .minLowercase(1, 'Password must contain at least one lowercase letter')
        .minUppercase(1, 'Password must contain at least one uppercase letter')
        .minNumbers(1, 'Password must contain at least one number')
        .minSymbols(1, 'Password must contain at least one special character')
        .required('Password is required'),
    });

    // NOTE: Avoid using handleSubmit (conflicts with Formik's own handleSubmit)
    // 'values' passes in:
        //  { username: '...', password: '...' }
    const submitToBackend = async (values, { resetForm }) => {
        try {
            let body = { username: values.username, password: values.password }

            // Google runs recaptcha to prevent bot hackers
            // v2 (the old one) uses the checkbox and/or clicking on the picture test
            // v3 (this one) is invisible/silent, and score-based

            
            
            // HERE IS THE useRef() IN ACTION - submitButton is the useRef()!
            // (so endpoint will come from an update of useRef() when the user chooses a submit button)
            const endpoint = submitButton.current

            // 2 SUBMIT BUTTON CHOICES:
                // 1. 'signup'
                // 2. 'login' (see below)

            // 1. 'signup'
            // STEP FOR 'signup' ONLY: RECAPTCHA
            if (endpoint === 'signup') {
                // This is if the Recaptcha fails to load for some reason (e.g. network error, or user has an adblocker that blocks it)
                if (!executeRecaptcha) {
                    setFormMessage('reCAPTCHA not ready yet — please try again')
                    return
                }
                // Otherwise it should be good to go
                // (executeRecaptcha runs the test and returns a token
                // RECAPTCHA TOKEN ISSUED BY GOOGLE GETS ADDED TO THE BODY
                // (along with the USERNAME & BODY, which we SEND TO THE BACKEND)
                const recaptchaToken = await executeRecaptcha('signup')
                body = { ...body, recaptchaToken }
            }

            // 1&2: BACK TO HANDLING BOTH

            // HELPER FUNCTION - WE USE THE SAME CODE FOR BOTH THE SIGNUP AND LOGIN
            // (SENDS EVERYTHING TO THE BACKEND)

            // POST FUNCTION (attachment is especially large here, and uses a template literal ... CAREFUL!!)
                // await fetch('route', PLUS ADDITIONAL INFO ... 
                // METHOD
                // HEADERS:
                    // CONTENT-TYPE
                    // SECURITY HEADER TO PREVENT CSRF ATTACKS
                // CREDENTIALS (NEEDED TO RECEIVE THE JWT TOKEN?)
                // BODY (WITH:
                    // RECAPTCHA TOKEN (if signup)
                    // USERNAME
                    // PASSWORD

            const res = await fetch(`/api/users/${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'  // CSRF: proves this came from our app (attackers can't forge custom headers cross-site)
                },
                credentials: 'include',   // tells the browser to send/receive cookies
                body: JSON.stringify(body)
            })

            // THIS IS THE STANDARD PART OF THE TRY THAT WE ARE USED TO
            // CONVERSION OF THE RESPONSE TO JSON
            
            // FOR EVERY REQUEST/RESPONSE CYCLE, WE HAVE INCLUDED A FORM MESSAGE THAT UPDATES THE USER ON THE STATUS
            // (this is the message we see that changes)
            // (IF USERNAME AND PASSWORD GET SENT AND DON'T MATCH, WILL SEE A CUSTOM MESSAGE HERE, NOT AN ERROR MESSAGE)
            const data = await res.json()
            setFormMessage(data.message)

            // 2. 'login'
            // IF THE USER SELECTED THE LOGIN BUTTON, THE RESPONSE WILL ALSO INCLUDE A COOKIE (WITH THE JWT)THAT WE DON'T SEE
            // AND ALSO THE USERNAME, WHICH WE SAVE AS WELL 
            if (endpoint === 'login' && data.username) {
                setUser(data.username)
            }
            // Form resets
            resetForm()

        } catch (err) {
            // THIS IS WHAT THE USER WILL SEE IF THE RECAPTCHA FAILS ON THE BACKEND?
            setFormMessage('Server error')
        }
    }

    

    // NB. Code is BASICALLY identical to the sample on the React Bootstrap website
    // (except EVERY input has isValid & isInvalid)

    // BUTTON IS VERY DIFFERENT - CAUTION!!
    return (
      <>
        <h3 className="mb-4">Signup / Login</h3>
          <Formik
          validationSchema={schema}
          onSubmit={submitToBackend}  // FIXED: was saveInput (undefined)
          initialValues={{
            username: '',
            password: ''
          }}
        >
          {({ handleSubmit, handleChange, values, touched, errors }) => (
            // CAREFUL: You cannot use handleSubmit() because Formik needs it (and will cause errors if you try to use it)
            <Form noValidate onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="formBasicUsername">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  type="text"
                  name="username"
                  placeholder="Enter username"
                  value={values.username}
                  onChange={handleChange}
                  isValid={touched.username && !errors.username}
                  isInvalid={touched.username && !!errors.username}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.username}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={values.password}
                  onChange={handleChange}
                  isValid={touched.password && !errors.password}
                  isInvalid={touched.password && !!errors.password}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.password}
                </Form.Control.Feedback>
              </Form.Group>

              <div className="d-flex m-2 justify-content-end">
                {/* TWO-BUTTON TRICK: type="button" prevents default form submit.
                    We set the ref first, then manually trigger Formik's handleSubmit. */}
                <Button
                  variant="primary"
                  type="button"
                  onClick={() => { submitAction.current = 'signup'; handleSubmit() }}
                >
                  Sign Up
                </Button>
                <Button
                  variant="success"
                  type="button"
                  className="ms-2"
                  onClick={() => { submitAction.current = 'login'; handleSubmit() }}
                >
                  Log In
                </Button>
              </div>

              <hr />

              <div className="d-flex flex-column m-1 justify-content-center align-items-center">
                <GoogleLoginButton
                  className='h-100 w-75 p-2'
                  onClick={() => window.location.href = '/api/oauth/google'}
                />
                <FacebookLoginButton
                  className='h-100 w-75 p-2'
                  onClick={() => window.location.href = '/api/oauth/facebook'}
                />
              </div>

            </Form>
          )}
          </Formik>
      </>
    )
}

export default Login;
