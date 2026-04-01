import { useRef } from 'react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { GoogleLoginButton, FacebookLoginButton, TwitterLoginButton } from "react-social-login-buttons";
import * as formik from 'formik';
import * as yup from 'yup';
import YupPassword from 'yup-password';
YupPassword(yup); // FIXED: was Yup (undefined) — must match the import name 'yup'
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';


const Login = ({formMessage, setFormMessage, user, setUser}) => {
    const { executeRecaptcha } = useGoogleReCaptcha()

    const { Formik } = formik;

    // FIXED: removed confirmPassword — there's no confirm field in this form
    // Using yup-password helpers (.password(), .minLowercase() etc.) to keep it concise
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

    // FIXED: renamed from handleSubmit to submitToBackend
    // (avoids conflict with Formik's own handleSubmit in the render prop below)
    // Now receives 'values' from Formik so username/password are available
    const submitToBackend = async (values, { resetForm }) => {
        try {
            // FIXED: values.username and values.password (previously referenced undefined variables)
            let body = { username: values.username, password: values.password }

            // Google runs recaptcha to prevent bot hackers
            // v2 (the old one) uses the checkbox and/or clicking on the picture test
            // v3 (this one) is invisible/silent, and score-based

            // FIXED: endpoint comes from the ref set by whichever button was clicked (see below)
            const endpoint = submitAction.current

            if (endpoint === 'signup') {
                if (!executeRecaptcha) {
                    setFormMessage('reCAPTCHA not ready yet — please try again')
                    return
                }
                const recaptchaToken = await executeRecaptcha('signup')
                body = { ...body, recaptchaToken }
            }

            const res = await fetch(`/api/users/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',   // tells the browser to send/receive cookies
                body: JSON.stringify(body)
            })

            const data = await res.json()
            setFormMessage(data.message)

            // On login the backend sets the httpOnly cookie — we just grab the username
            if (endpoint === 'login' && data.username) {
                setUser(data.username)
            }

            resetForm()
        } catch (err) {
            setFormMessage('Server error')
        }
    }

    // TWO-BUTTON TRICK: a ref remembers which button was clicked
    // before Formik's onSubmit fires — refs don't cause re-renders
    // (useState would cause a re-render and might not update in time)
    const submitAction = useRef('login')

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
            // FIXED: handleSubmit here is Formik's own — no longer conflicts with our renamed function
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
                <TwitterLoginButton
                  className='h-100 w-75 p-2'
                  onClick={() => window.location.href = '/api/oauth/twitter'}
                />
              </div>

            </Form>
          )}
          </Formik>
      </>
    )
}

export default Login;
