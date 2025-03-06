import { Link } from 'react-router-dom'

const About: React.FC = () => {
  return (
    <div className='flex flex-col justify-center items-center h-screen'>
      <h1 className='text-2xl font-bold mb-4'>About</h1>
      <Link to='/'>Home</Link>
    </div>
  )
}

export default About
