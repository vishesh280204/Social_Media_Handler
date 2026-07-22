import React from 'react'
import { useAuthContext } from '../context/authContext'
import { Navigate } from 'react-router-dom'

const ProtectRouteForLogin = () => {
    const {isAuthenticated}=useAuthContext()
    if(isAuthenticated) return (<Navigate to={"/dashboard"}/>)
  return (
     <Navigate to={"/login"}/>
  )
}

export default ProtectRouteForLogin
