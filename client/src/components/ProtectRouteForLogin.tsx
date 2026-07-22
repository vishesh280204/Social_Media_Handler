import { useAuthContext } from '../context/authContext'
import { Navigate, Outlet } from 'react-router-dom'

const ProtectRouteForLogin = () => {
    const {isAuthenticated}=useAuthContext()
    if(isAuthenticated) return (<Navigate to={"/dashboard"}/>)
  return (
     <Outlet/>
  )
}

export default ProtectRouteForLogin
