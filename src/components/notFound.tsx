import { Link } from 'react-router-dom'

const NotFound: React.FC = () => {
  return (
    <div className='flex flex-col items-center justify-center h-screen'>
      <h1 className='text-2xl font-bold'>404 - Page Not Found</h1>
      <Link to='/' className='text-blue-500 underline'>
        Go back to the home page
      </Link>
    </div>
  )
}

export default NotFound
