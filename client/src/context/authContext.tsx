import { createContext, useContext, useEffect, useState } from "react";

import api from "../api/axios";
import React from "react";
interface User{
    _id:string,
    name:string,
    email:string
}

interface AuthContextType{
    user:User | null,
    token:string | null,
    isLoading:boolean,
    login:(userData:User,token:string)=>void,
    logout:()=> void,
    isAuthenticated:boolean
}

export const authContext= createContext<AuthContextType | undefined>(undefined)

export const  AuthContextProvider: React.FC<{children:React.ReactNode}>=
/////***************Yaha pe abhi add karna hai************* */
({children})=>{
    const [user, setUser] = useState<User | null>(null)
    const [token,setToken]=useState<string | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(true)

    useEffect(()=>{
        const storedUser= localStorage.getItem('user')
        const storedToken = localStorage.getItem('token')

        if(storedToken && storedUser){
            
            setUser(JSON.parse(storedUser))
            setToken(storedToken)
            api.defaults.headers.common["Authorization"]= `Bearer ${storedToken}`

        }
        setIsLoading(false)
    },[])

    const login= (userData:User, newToken:string)=>{
        console.log("newToken:", newToken);
    console.log("typeof:", typeof newToken);
        setUser(userData)
        setToken(newToken)
        localStorage.setItem('user',JSON.stringify(userData))
        localStorage.setItem("token",newToken)
        api.defaults.headers.common["Authorization"]= `Bearer ${newToken}`
    }
    const logout= ()=>{
        setUser(null)
        setToken(null) 
        localStorage.removeItem("user")
        localStorage.removeItem('token')
        delete api.defaults.headers.common["Authorization"]
    }
    return (<authContext.Provider value={{ user,token,isLoading,login, logout, isAuthenticated: !! token}} >{children}</authContext.Provider>)

}

export const useAuthContext=()=>{
    const context= useContext(authContext)
    if(context===undefined){
        throw new Error("UserAuthContext must be defined")
    }
    return context
}        