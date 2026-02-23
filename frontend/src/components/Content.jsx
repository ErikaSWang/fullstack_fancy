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
  // (it's like the user's driver's license)
  // Body - don't forget JSON needs to be sent as a string, and put back together on the other end

  const saveContent = async () => {
    try {
      const res = await fetch(`/api/saveContent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content })
      })
      const data = await res.json()
      setFormMessage(data.message)

    } catch (err) {
      setFormMessage('Please try again')
    }
  }


  const getContent = async () => {
    try {
      const res = await fetch(`/api/getSavedContent`, {
        method: 'GET',
        credentials: 'include'
      })
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