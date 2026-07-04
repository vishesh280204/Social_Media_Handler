import React, { useEffect, useState } from 'react'
import { dummyAccountsData, PLATFORMS } from '../assets/assets'
import { PlusIcon } from 'lucide-react'
import AccountList from '../components/AccountList'
import PlatformPickerModal from '../components/PlatformPickerModal'

const Accounts = () => {
  const [accounts, setAccounts] = useState<any[]>([])
  const [connecting, setConnecting] = useState<string | null>(null)
  const [showPlatformPicker,setShowPlatformPicker] =useState(false)


  const fetchAccounts=async(isSync=false,platform?:string | null, successMsg?:string   )=>{
     setAccounts(dummyAccountsData)
     console.log(isSync,platform,successMsg)
  }
  
  useEffect(()=>{
    fetchAccounts()
  },[])

  const handleConnect = async ( platformId:string )=>{
    setConnecting(platformId);
    setTimeout(()=>{
      setConnecting(null)
      setAccounts((prev)=>[...prev,dummyAccountsData[0]])
      setShowPlatformPicker(false)
    },1000)

  }
  const handleDisconnect= async (accountId:string)=>{
    setAccounts(accounts.filter((a)=>a._id !== accountId))
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
