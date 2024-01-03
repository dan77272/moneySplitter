import {TailSpin} from 'react-loader-spinner'

export default function LoadingIcon(){
    return (
        <div className='fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] z-[1000]'>
            <TailSpin color="#00BFFF" height={100} width={100}/>
        </div>
    )
}