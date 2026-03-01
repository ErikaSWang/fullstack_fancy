import { useState, useEffect } from 'react';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

const Updates = ({ formMessage, setFormMessage }) => {
  const [content, setContent] = useState('')
  const [pastContent, setPastContent] = useState([])

  // SAVE USER CONTENT TO THE BACKEND
  // NB. THIS ROUTE IS ONLY AVAILABLE IF YOU HAVE A VALID TOKEN
  // SO THE TOKEN IS INCLUDED IN THE HEADERS
  // (it's like having a valid pool pass - if you are a guest at the hotel, you can use your key to get one)
  // (otherwise you have to check into the hotel, to get a key, to get a poolpass)
  // Body - don't forget JSON needs to be sent as a string, and put back together on the other end


  // ALTERNATIVE WOULD BE TO USE checkJWT FIRST??
  const saveContent = async () => {
    try {
      let res = await fetch('/api/saveContent', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      })

      if (res.status === 401) {
        const refreshResponse = await fetch('/api/auth/checkUUID', { method: 'POST', credentials: 'include' })
        if (!refreshResponse.ok) { setFormMessage('Session expired — please log in again'); return }
        
        res = await fetch('/api/saveContent', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content })
        })
      }

      const data = await res.json()
      setFormMessage(data.message)

    } catch (err) {
      setFormMessage('Please try again')
    }
  }


  const getContent = async () => {
    try {
      let res = await fetch('/api/getSavedContent', { credentials: 'include' })

      if (res.status === 401) {
        const refreshResponse = await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' })
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
            <Form>
                <Form.Group className="mb-3" controlId="formContent">
                    <Form.Label>Content</Form.Label>
                    <Form.Control
                    type="text"
                    as="textarea"
                    rows={3}
                    placeholder="Enter your thoughts here ..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    />
                </Form.Group>
                <div className="d-flex mb-3 justify-content-end">
                    <Button variant="primary" onClick={getContent}>
                      Load My Content
                    </Button>
                    <Button variant="info" type="button" className="ms-2" onClick={saveContent}>
                    Submit
                    </Button>
                </div>
            </Form>

            {pastContent.map((item) => ( 
                <Card key={item.id} className="m-2 bg-light shadow-sm">
                    <Card.Body>{item.content}</Card.Body>
                </Card>
            ))}
        </>
    )
}

export default Updates;