const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <main className='flex flex-col items-center'>{children}</main>
}

export default Layout
