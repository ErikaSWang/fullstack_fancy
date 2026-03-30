import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { currentPage, changePage } from '../features/currentSlice';
import { Button } from '@mui/material';

function Dashboard() {
    const navigate = useNavigate();
    const dispatch = useDispatch();


    useEffect(() => {
        dispatch(changePage('dashboard'));
    }, []);

    
   const current = useSelector(currentPage);

    return (
        <div>
            <h1>Dashboard</h1>
            <NavLink to={`/`}>
              <Button variant="contained">Home</Button>
            </NavLink>
            <div>{ current }</div>
        </div>
    )
}

export default Dashboard;