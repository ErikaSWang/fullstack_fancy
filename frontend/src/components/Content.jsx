import { useState, useEffect } from 'react';

// I learned about Yup and Formik from React Bootstrap
// See: https://react-bootstrap.netlify.app/docs/forms/validation/
// Formik & Yup are mostly for enhancing the user experience, by providing feedback on input formats
// (actual validation happens in the backend)
import * as formik from 'formik';
import * as yup from 'yup';

import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';


// 2 ROUTES:
    // 1. Get content
    // 2. Save content

// NB. THIS ROUTE IS ONLY AVAILABLE IF YOU HAVE A VALID TOKEN
// (Token is included in the headers - more below)

// (it's like having a valid pool pass - if you are a guest at the hotel, you can use your key to get one)
// (otherwise you have to check into the hotel, to get a key, to get a poolpass)
// Body - don't forget JSON needs to be sent as a string, and put back together on the other end

const Content = ({ formMessage, setFormMessage }) => {
  const [pastContent, setPastContent] = useState([])

  // FRONTEND INPUT VALIDATORS (Formik & Yup)
  const { Formik } = formik;

  const schema = yup.object().shape({
    content: yup.string().required('Please enter some content'),
  });

  // 1. Save content
      // (See Login for notes on formik, and why we're passing in values, and { resetForm })
      // (See Login for notes on all the JSON options we are passing in)

      // NOTE: THIS IS A PROTECTED ROUTE!!
      // THE TRY INCLUDES 3 OPTIONS:
          // i. VALID TOKEN
                // content is saved, success message is returned)
          // ii. 401: EXPIRED TOKEN IS PRESENT
                // An expired token means the user is logged in, but just needs a new token
                    // (we refresh the token
                    // then try the save again)
          // iii. 401: NO TOKEN
                // No token means the user is not logged in
                // (This really shouldn't happen, because the user shouldn't be seeing the content page)
                
  const saveContent = async (values, { resetForm }) => {
    try {
      let res;

      // (Helper function)
      // (See Login for notes about all the options we need to add to our fetch)
      const postContent = async () => {
          res = await fetch('/api/saveContent', {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify({ content: values.content })
          })
          return res;
      };

      // i. START OFF ASSUMING USER HAS A VALID PERMISSION TOKEN, so we try to save content
      await postContent()
      
      // ii. IF THE TOKEN HAS EXPIRED, WE TRY REFRESHING THE TOKEN
             // (Then try saving the content again)
      if (res.status === 401) {
        // (See Login for notes about all the options we need to add to our fetch)
        const refreshResponse = await fetch('/api/auth/checkUUID', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'X-Requested-With': 'XMLHttpRequest'
          }
        })

        // iii. USER IS NOT LOGGED IN
                // (Shouldn't happen, but just in case)
        if (!refreshResponse.ok) {
          setFormMessage('Session expired — please log in again');
          return
        }

        // ii. (cont'd)
        // TOKEN WAS REFRESHED, TRY TO POST CONTENT AGAIN
        await postContent()

      }

      // RESPONSE PROCESSING
      const data = await res.json()
      setFormMessage(data.message)
      resetForm()

    } catch (err) {
      setFormMessage('Please try again')
    }
  }


  // 2. Get content
      // THIS ROUTE IS ALSO A PROTECTED ROUTE
      // (credentials include is the access token)

      // 3 OPTIONS ONCE AGAIN:
          // i. VALID TOKEN
                // content is returned, and set in state
          // ii. 401: EXPIRED TOKEN
                // fresh token is issued behind the scenes
                // and attempt to get content is tried again
          // iii. NO TOKEN
                // user is not logged in, and is prompted to log in
  const getContent = async () => {
    try {

      // i. START OFF ASSUMING USER HAS A VALID PERMISSION TOKEN, so we try to get content
      let res;
      
      // (Helper function)
      // NOTE THAT GET ROUTES ARE MUCH SIMPLER, AND REQUIRE FAR FEWER OPTIONS
      // (Just the token, if it exists)
      const fetchContent = async () => {
        res = await fetch('/api/getSavedContent', {
          credentials: 'include'
        })
      }

      await fetchContent()

      // ii. IF THE TOKEN HAS EXPIRED, WE TRY REFRESHING THE TOKEN
             // (Then try getting the content again)
      if (res.status === 401) {
        const refreshResponse = await fetch('/api/auth/checkUUID', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'X-Requested-With': 'XMLHttpRequest'
          }
        })

        // iii. IF REFRESHING TOKEN ISN'T POSSIBLE, USER IS NOT LOGGED IN
                // (Shouldn't happen because the user shouldn't be seeing the content form if not logged in)
                // (But we add this just in case)
        if (!refreshResponse.ok) {
          setFormMessage('Session expired — please log in again');
          return
        }

        // ii. (cont'd)
        // TOKEN WAS REFRESHED, TRY TO GET CONTENT AGAIN
        await fetchContent()

      }

      const data = await res.json()
      setFormMessage(data.message)
      setPastContent(data.content)

    } catch (err) {
      setFormMessage('Please try again')
    }
  }

    return (
      <>
        <Formik
          initialValues={{ content: '' }}
          validationSchema={schema}
          onSubmit={saveContent}
        >
          {({ handleSubmit, handleChange, values, touched, errors }) => (
            <Form noValidate onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formContent">
                    <Form.Label>Content</Form.Label>
                    <Form.Control
                      name="content"
                      as="textarea"
                      rows={3}
                      placeholder="Enter your thoughts here ..."
                      value={values.content}
                      onChange={handleChange}
                      isValid={touched.content && !errors.content}
                      isInvalid={touched.content && !!errors.content}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.content}
                    </Form.Control.Feedback>
                </Form.Group>
                <div className="d-flex mb-3 justify-content-end">
                    <Button variant="primary" type="button" onClick={getContent}>
                      Load My Content
                    </Button>
                    <Button variant="info" type="submit" className="ms-2">
                      Submit
                    </Button>
                </div>
            </Form>
          )}
        </Formik>
        {pastContent.map((item) => (
            <Card key={item.id} className="m-2 bg-light shadow-sm">
                <Card.Body>{item.content}</Card.Body>
            </Card>
        ))}
      </>
    )
}

export default Content;