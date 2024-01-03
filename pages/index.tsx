import { useState } from "react"
import axios from "axios";
import { useRouter } from "next/router";

interface GroupData {
  groupSize: number;
  groupName: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  group?: {
    name: string;
    members: number;
    _id: string
  }
}

export default function Home() {

  const router = useRouter()
  const [groupSize, setGroupSize] = useState<number>(2)
  const [groupName, setGroupName] = useState("")

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>){
    const value = parseInt(e.target.value, 10)
    if(!isNaN(value)){
      setGroupSize(value)
    }
  }

  function decrementSize(){
    setGroupSize(prevSize => Math.max(prevSize - 1, 2))
  }

  function encrementSize(){
    setGroupSize(prevSize => Math.min(prevSize + 1, 999))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>){
    event.preventDefault()
    const data: GroupData = {groupSize, groupName}
    
    try{
      const response = await axios.post<ApiResponse>('/api/groups', data)
      if(response.data.group && response.data.group._id){
        router.push(`/${response.data.group?._id}`)
      }else{
        console.error("Group data is missing in the response")
      }

    }catch(err){
      console.error('Error', err)
    }
  }

  return (
    <div className="flex flex-col justify-center items-center mx-[50px]">
      <h1 className="md:text-8xl text-7xl text-[#34495e] font-semibold">split<span className="text-[#3498db]">E</span>ase</h1>
      <p className="md:text-3xl text-2xl text-[#3498db] font-semibold mt-8">Easily split group bills.</p> 
      <p className="md:text-3xl text-2xl text-[#3498db] font-semibold text-center">We show who needs to pay who and make settling group debts simple.</p>
      <form onSubmit={handleSubmit}>
        <div className=" bg-[#ecf0f1] flex flex-col items-center mt-[100px] px-5 py-10 border-[1px]">
          <p className="text-xl">How many people are in your group?</p>
          <div className="flex justify-center mt-5">
            <button type="button" className="bg-[#3498db] text-white px-[24px] py-[10px] text-3xl rounded-[5px]" onClick={decrementSize}>-</button>
            <input className="h-[60px] w-[100px] mx-[20px] border-[1px] border-[#bdc3c7] text-[30px] px-[5px] outline-none" type="number" value={groupSize} onChange={handleInputChange} min="2" max="999"/>
            <button type="button" className="bg-[#3498db] text-white px-[20px] py-[10px] text-3xl rounded-[5px]" onClick={encrementSize}>+</button>
          </div>
          <p className="mt-10">Give your group a name!</p>
          <input className="h-[40px] outline-none border-[2px] border-[#bdc3c7] text-[20px] mt-2" placeholder="e.g. Roadtrip" value={groupName} onChange={e => setGroupName(e.target.value)}/>
          <button type="submit" className="bg-[#2ecc71] text-white w-[273px] h-[40px] text-[20px] mt-5 rounded-[5px]">GO!</button>
        </div>
      </form>
    </div>
  )
}
