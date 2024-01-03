import { useRouter } from "next/router"
import { useEffect, useRef, useState } from "react"
import axios from "axios"

let inputCounter = 0;


export default function Main(){

    interface Member{
        additionalInputs: { id: string; value: string }[];
    }

    interface People{
        name: string;
    }

    interface MemberSummary {
        total: number
        name: string;
    }

    const router = useRouter()
    const [groupName, setGroupName] = useState<string>('')
    const [people, setPeople] = useState<People[]>([{ name: '' }, { name: '' }]);
    const [members, setMembers] = useState<Member[]>([])
    const [payment, setPayment] = useState<{ [key: string]: string }[]>([]);
    const [reason, setReason] = useState<{ [key: string]: string }[]>([]);
    const [showResult, setShowResult] = useState(false)
    const [transactions, setTransactions] = useState<string[]>([])
    const [error, setError] = useState('')
    const [link, setLink] = useState<string>('')
    const [showLink, setShowLink] = useState(false)
    const [pageId, setPageId] = useState<string>('')
    const [count, setCount] = useState<number>(0)
    const {id} = router.query

    
    useEffect(() => {
        if (id) {
            // First, try to fetch from getPageData
            axios.get(`/api/getPageData?id=${id}`)
                .then(response => {
                    if (response.data) { // Check if the response has data
                        setPageId(response.data._id)
                        setGroupName(response.data.groupName);
                        setMembers(response.data.members);
                        setPeople(response.data.people);
                        setPayment(response.data.payment);
                        setReason(response.data.reason)
                        setTransactions(response.data.transactions);
                        setCount(response.data.count)
                    } else {
                        // If getPageData returns no data, fetch from groups
                        fetchGroupsData();
                    }
                })
                .catch(error => {
                    console.error('Error fetching page data:', error);
                    // In case of error, also try to fetch from groups
                    fetchGroupsData();
                });
        }
    }, [id]); // Dependency array
    
    // Function to fetch data from groups
    const fetchGroupsData = () => {
        axios.get(`/api/groups?id=${id}`).then(response => {
            setGroupName(response.data.name);
            setMembers(Array.from({ length: response.data.members }, () => ({ additionalInputs: [] })));
            setPeople(Array.from({ length: response.data.members }, () => ({ name: '' })));
            const initialPayments = Array.from({length: response.data.members}, (_, index) => ({[`main-${index}`]: ''}));
            setPayment(initialPayments);
        }).catch(error => console.error('Error fetching groups data:', error));
    };
    


    function handlePaymentChange(memberIndex: number, inputKey: string, inputValue: string) {
        setPayment(prevPayment => {
            const newPayment = [...prevPayment];
            const memberPayments = newPayment[memberIndex] || {};
            memberPayments[inputKey] = inputValue;
            newPayment[memberIndex] = memberPayments;
            return newPayment;
        });
        setMembers(prevMembers => {
            const newMembers = prevMembers.map((member, index) => {
                if (index === memberIndex) {
    
                    // Update the target input in additionalInputs
                    const updatedInputs = member.additionalInputs.map((input, idx) => {
                        if (input.id === inputKey) { // Use the ID to find the correct input
                            return { ...input, value: inputValue };
                        }
                        return input;
                    });
    
                    return { ...member, additionalInputs: updatedInputs };
                }
                return member;
            });
    
            return newMembers;
        });
        console.log(members)
        console.log(payment)
    }
    

    function handleNameChange(value: string, memberIndex: number){
        if(error) setError('')
        const updatedPeople = people.map((person, index) => 
            index === memberIndex ? {...person, name: value} : person
        )
        setPeople(updatedPeople)
    }

    function handleReasonChange(memberIndex: number, inputKey: string, inputValue: string){
        setReason(prevReason => {
            const newReason = [...prevReason];
            const memberReasons = newReason[memberIndex] || {};
            memberReasons[inputKey] = inputValue;
            newReason[memberIndex] = memberReasons;
            return newReason;
        });
        setMembers(prevMembers => {
            const newMembers = prevMembers.map((member, index) => {
                if (index === memberIndex) {
    
                    // Update the target input in additionalInputs
                    const updatedInputs = member.additionalInputs.map((input, idx) => {
                        if (input.id === inputKey) { // Use the ID to find the correct input
                            return { ...input, value: inputValue };
                        }
                        return input;
                    });
    
                    return { ...member, additionalInputs: updatedInputs };
                }
                return member;
            });
    
            return newMembers;
        });
        console.log(reason)
        console.log(members)
    }

    function deleteInput(uniqueId: string) {
        console.log(uniqueId)
        // Update members state
        setMembers(prevMembers => {
            return prevMembers.map(member => ({
                ...member,
                additionalInputs: member.additionalInputs.filter(input => input.id !== uniqueId)
            }));
        });
    
        // Update payment state
        setPayment(prevPayment => {
            return prevPayment.map(paymentObj => {
                const newPaymentObj = { ...paymentObj };
                console.log({ ...newPaymentObj }); // Log a copy
                delete newPaymentObj[uniqueId];
                return newPaymentObj;
            });
        });
        console.log(members)
        console.log(payment)
    }
    
    
    
    
    
    
    

    function createDivs(){
        return members.map((member, memberIndex) => (
            <div key={memberIndex} className="bg-[#ecf0f1] p-3 my-10 flex flex-col justify-center border-[1px]">
            <input placeholder="Name" className="mb-2 border-[1px] border-[#bdc3c7] h-[50px] pl-2" value={people[memberIndex]?.name} onChange={(e) => handleNameChange(e.target.value, memberIndex)}/>
            {!people[memberIndex].name && error ? <p className="text-[red]">{error}</p> : ''}
            <div className="flex gap-2 items-center">
                <input className="border-[1px] border-[#bdc3c7] h-[50px] pl-2 lg:w-[200px] w-[150px]" placeholder="what?" key={`reason-input-${memberIndex}`} value={reason[memberIndex]?.[`reason-${memberIndex}`] || ''} onChange={(e) => handleReasonChange(memberIndex, `reason-${memberIndex}`, e.target.value)}/>
                <input className="border-[1px] border-[#bdc3c7] h-[50px] pl-2 lg:w-[200px] w-[150px]" placeholder="how much?" type="number" key={`main-input-${memberIndex}`} value={payment[memberIndex]?.[`main-${memberIndex}`] || ''} onChange={(e) => handlePaymentChange(memberIndex, `main-${memberIndex}`, e.target.value)}/>
            </div>
            <div>
                {member.additionalInputs.map((input, inputIndex) => (
                    <div key={input.id} className="flex gap-2 items-center mt-1">
                        <input className="border-[1px] border-[#bdc3c7] h-[50px] pl-2 lg:w-[200px] w-[150px]" placeholder="what?" value={reason[memberIndex]?.[input.id] || ''} onChange={(e) => handleReasonChange(memberIndex, input.id, e.target.value)}/>
                        <input className="border-[1px] border-[#bdc3c7] h-[50px] pl-2 lg:w-[200px] w-[150px]" placeholder="how much?" type="number" value={payment[memberIndex]?.[input.id] || ''} onChange={(e) => handlePaymentChange(memberIndex, input.id, e.target.value)}/>
                        <button onClick={() => deleteInput(input.id)}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </button>
                    </div>

                ))}
            </div>
            <button className="border-[2px] flex items-center justify-center mt-2 bg-white py-3" onClick={() => addInput(memberIndex)}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    more
            </button>
        </div>
        ))

    }

    

    const addInput = (memberIndex: number) => {
        if(count){
            inputCounter = count
        }
        const newId = `${memberIndex}-${inputCounter++}`;
        setMembers(members.map((member, index) => {
            if (index === memberIndex) {
                return {
                    ...member,
                    additionalInputs: [
                        ...member.additionalInputs,
                        { id: newId, value: '' }
                    ]
                };
            }
            return member;
        }));
        setPayment(prevPayment => {
            const newPayment = [...prevPayment];
    
            // Check if the member already has a payment object, if not create one
            if (!newPayment[memberIndex]) {
                newPayment[memberIndex] = {};
            }
    
            // Now it's safe to add the new payment entry
            newPayment[memberIndex][newId] = '';
    
            return newPayment;
        });
        setCount(inputCounter)
    };
    
    
    
    

    function calculate() {

        for(const p of people){
            if(p.name === ''){
                setError('Please enter a name.')
                return
            }
        }


        let count = 0
        const debtors:MemberSummary[] = []
        const creditors:MemberSummary[] = []
        const newTransactions:string[] = [];



        const totals = payment.map(p => {
            let total = 0;
            Object.values(p).forEach(value => {
                const num = parseFloat(value);
                if (!isNaN(num)) {
                    total += num;
                }
            });
            return total;
        });

        const newSet = new Set(totals)
        if(newSet.size === 1){
            newTransactions.push('No one owes anyone anything.')
            setTransactions(newTransactions)
            setShowResult(true)
            return
        }

        var mainTotal = 0
        totals.map(t => {
            mainTotal += t
        })
        const mainAverage = parseFloat((mainTotal / totals.length).toFixed(2))

        totals.forEach(total => {
            if(total > mainAverage){
                creditors.push({total: total, name: people[count].name})
            }else if(total < mainAverage){
                debtors.push({total: total, name: people[count].name})
            }
            count += 1
        })

        debtors.forEach(debtor => {
            creditors.forEach(creditor => {
                if(mainAverage - debtor.total !== 0 && creditor.total - mainAverage !== 0){
                    let amount = Math.min(mainAverage - debtor.total, creditor.total - mainAverage)
                    console.log(people)
                    newTransactions.push(`${debtor.name} pays ${creditor.name} $${amount.toFixed(2)}`)
                    debtor.total += amount
                    creditor.total -= amount
                }
            })
        })
        setTransactions(newTransactions)
    setShowResult(true)
    }

    async function save(){
        setCount(inputCounter)
        if(pageId){
            const data = {id, groupName, people, members, payment, reason, transactions, pageId, count}
            await axios.put(`/api/savePageData`, data).then(response => {
                console.log('Data saved:', response.data);
            }).catch(error => {
                console.error('Error saving data:', error)
            })
        }else{
            const data = {id, groupName, people, members, payment, reason, transactions, count}
            await axios.post('/api/savePageData', data).then(response => {
                console.log('Data saved:', response.data);
            }).catch(error => {
                console.error('Error saving data:', error)
            })
        }

        setLink(window.location.href)
        setShowLink(true)
    }
    

    return (
        <div className="flex flex-col justify-center items-center pb-[100px]">
          <h1 className="text-8xl text-[#34495e] font-semibold mb-5">split<span className="text-[#3498db]">E</span>ase</h1>
          <p className="text-2xl">{groupName}</p>
          <hr className="w-[100%] mt-[30px]"/>
          <div className="grid lg:grid-flow-col rid-flow-row items-start lg:gap-[300px]">
            <div>
                {createDivs()}
            </div>
            <div className="mt-10 flex flex-col items-center">
                <button className="bg-[#3498db] text-white py-3 px-10 rounded-md text-[20px]" onClick={calculate}>Calculate</button>
                {showResult && (
                    transactions.map(t => (
                        <div className="mt-5">
                            <p className="bg-[#d9f6e5] text-[24px] px-3 py-2 border-[2px]">{t}</p>
                        </div>
                    ))
                )}
                {showResult && <button onClick={save}>
                    <svg className="mt-5" fill="#000000" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" 
                        width="50px" height="50px" viewBox="0 0 407.096 407.096" xmlSpace="preserve">
                            <g><g>
                                <path d="M402.115,84.008L323.088,4.981C319.899,1.792,315.574,0,311.063,0H17.005C7.613,0,0,7.614,0,17.005v373.086
                                    c0,9.392,7.613,17.005,17.005,17.005h373.086c9.392,0,17.005-7.613,17.005-17.005V96.032
                                    C407.096,91.523,405.305,87.197,402.115,84.008z M300.664,163.567H67.129V38.862h233.535V163.567z"/>
                                <path d="M214.051,148.16h43.08c3.131,0,5.668-2.538,5.668-5.669V59.584c0-3.13-2.537-5.668-5.668-5.668h-43.08
                                    c-3.131,0-5.668,2.538-5.668,5.668v82.907C208.383,145.622,210.92,148.16,214.051,148.16z"/>
                                </g>
                            </g>
                    </svg>
                </button>}
                {showLink && <p>{link}</p>}
            </div>
        </div>
    </div>
      )
}
