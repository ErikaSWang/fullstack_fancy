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
      let res = await fetch('/api/saveContent', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({ content: values.content })
      })

      if (res.status === 401) {
        const refreshResponse = await fetch('/api/auth/checkUUID', { method: 'POST', credentials: 'include', headers: { 'X-Requested-With': 'XMLHttpRequest' } })
        if (!refreshResponse.ok) { setFormMessage('Session expired — please log in again'); return }

        res = await fetch('/api/saveContent', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          },
          body: JSON.stringify({ content: values.content })
        })
      }

      const data = await res.json()
      setFormMessage(data.message)
      resetForm()

    } catch (err) {
      setFormMessage('Please try again')
    }
  }


  const getContent = async () => {
    try {
      let res = await fetch('/api/getSavedContent', { credentials: 'include' })

      if (res.status === 401) {
        const refreshResponse = await fetch('/api/auth/checkUUID', { method: 'POST', credentials: 'include', headers: { 'X-Requested-With': 'XMLHttpRequest' } })
        if (!refreshResponse.ok) { setFormMessage('Session expired — please log in again'); return }
        res = await fetch('/api/getSavedContent', { credentials: 'include' })
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