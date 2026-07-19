import React, { useEffect, useState } from 'react'
import { dummyAccountsData, PLATFORMS } from '../assets/assets'
import { PlusIcon } from 'lucide-react'
import AccountList from '../components/AccountList'
import PlatformPickerModal from '../components/PlatformPickerModal'
import toast from 'react-hot-toast'
import api from '../api/axios'


const Accounts = () => {
  const [accounts, setAccounts] = useState<any[]>([])
  const [connecting, setConnecting] = useState<string | null>(null)
  const [showPlatformPicker,setShowPlatformPicker] =useState(false)


  const fetchAccounts=async(isSync=false,platform?:string | null, successMsg?:string   )=>{
    try{
      if(isSync){
        const label= platform? platform[0].toUpperCase() + platform.slice(1) :"Social Media"
        toast.loading(`Syncing ${label} account `,{id:"sync"})
        await api.get("/api/oauth/sync")
        toast.success(successMsg || "Accounts synced successfully", { id: "sync" })
        
      }
      const {data}= await api.get("/api/accounts")
      setAccounts(data)
      console.log("(******",data)
    }catch(error:any){
      // toast.error("error :", error?.response?.data?.message || error?.message || "Failed to load acounts")
      toast.error(error?.response?.data?.message || error?.message )
    }
     console.log(isSync,platform,successMsg)
  }
  
  useEffect(()=>{

    // UrlSeachParams is used to get values from url in frontend

    const params= new URLSearchParams(window.location.search)
    const connectedPlatform=params.get("connected")
    const connectedUsername=params.get("username")
    const errorMsg =params.get('error')
    const syncNeeded = params.get("sync") === "true";

    //This line is used to remove the parameters and just show /accounts inorder to 
  // Imagine you didn't remove them. If the user refreshes the page,React runs useEffect again,  and they would see LinkedIn connected! every single refresh.
    window.history.replaceState({},document.title, window.location.pathname)
    console.log("connected Platform " ,connectedPlatform)
    if(connectedPlatform){
      const label= connectedPlatform[0].toUpperCase() + connectedPlatform.slice(1)
      const handle= connectedUsername? `(@${connectedUsername})`:""
      fetchAccounts(true,connectedPlatform,`${label}${handle} connected!`)
    }
    else if(errorMsg){

      //decodedURICompenent is used to decode the params
      toast.error(`Connection failed: ${decodeURIComponent(errorMsg)}`)
    }
    else if(syncNeeded){
      fetchAccounts(true,null,"Accounts synced")
    }
    else{fetchAccounts()}

  },[])

  const handleConnect = async ( platformId:string )=>{
    setConnecting(platformId);
    try {
      const {data} = await api.get(`/api/oauth/${platformId}/url`)
      console.log("**********",data)
      window.location.href=data.url;
    } catch (error:any) {
      toast.error( error?.response?.data?.message ||error?.message ||`Failed to connect ${platformId}`)
      setConnecting(null)
    }


  }
  const handleDisconnect= async (accountId:string)=>{
    try {
      await api.get(`/api/accounts/${accountId}`)
      await fetchAccounts()
      toast.success('Account disconnected')
    } catch (error:any) {
      toast.error(error?.message || 'Error while disconnecting account')
    }
  }

  const connectedIds= accounts.map((a)=>a.platform)
  return (
    <div className="space-y-8 max-w-4xl ">
      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
        <div>
          <h2 className='text-xl text-slate-900'>Connected Accounts</h2>
          <p className='text-slate-500 text-sm mt-0.5'>{accounts.length} of {PLATFORMS.length} platforms connected</p>
        </div>
        <button className="text-white flex items-center gap-2 px-5 py-2.5 bg-red-500 hover:bg-red-600 rounded-full font-medium transition-all w-full sm:w-auto justify-center shadow-sm sm-wauto "
      onClick={()=>{
        setShowPlatformPicker(true)
      }}>
        <PlusIcon className='size-4'/>Connect Account
      </button>
      </div>
      {/* Platform Picker Model  */}
      {showPlatformPicker && <PlatformPickerModal connectedIds={connectedIds} connecting={connecting} onClose={()=> setShowPlatformPicker(false)} onConnect={handleConnect} />}


      {/* Connected Accounts List */}
      
      <AccountList accounts={accounts} onDisconnect={handleDisconnect}/>


    </div>
  )
}

export default Accounts
