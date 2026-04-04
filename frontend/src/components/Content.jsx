import { useState, useEffect } from 'react';
import * as formik from 'formik';
import * as yup from 'yup';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';


const Updates = ({ formMessage, setFormMessage }) => {
  const [pastContent, setPastContent] = useState([])

  const { Formik } = formik;

  const schema = yup.object().shape({
    content: yup.string().required('Please enter some content'),
  });

  // SAVE USER CONTENT TO THE BACKEND
  // NB. THIS ROUTE IS ONLY AVAILABLE IF YOU HAVE A VALID TOKEN
  // SO THE TOKEN IS INCLUDED IN THE HEADERS
  // (it's like having a valid pool pass - if you are a guest at the hotel, you can use your key to get one)
  // (otherwise you have to check into the hotel, to get a key, to get a poolpass)
  // Body - don't forget JSON needs to be sent as a string, and put back together on the other end


  // ALTERNATIVE WOULD BE TO USE checkJWT FIRST??
  const saveContent = async (values, { resetForm }) => {
    try {
      let res = await fetch('/api/saveContent', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        body: JSON.stringify({ content: values.content })
      })

      if (res.status === 401) {
        const refreshResponse = await fetch('/api/auth/checkUUID', { method: 'POST', credentials: 'include', headers: { 'X-Requested-With': 'XMLHttpRequest' } })
        if (!refreshResponse.ok) { setFormMessage('Session expired — please log in again'); return }

        res = await fetch('/api/saveContent', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
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

export default Updates;